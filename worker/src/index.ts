import type { ProductImage, ProductRecord } from "../../src/types/product";
import { hashPassword, randomToken, sha256, verifyPassword } from "./security";

interface D1PreparedStatement { bind(...values: unknown[]): D1PreparedStatement; first<T>(): Promise<T | null>; run(): Promise<unknown>; all<T>(): Promise<{ results: T[] }>; }
interface D1Database { prepare(query: string): D1PreparedStatement; }
interface R2Object { body: ReadableStream; httpMetadata?: { contentType?: string }; }
interface R2Bucket { put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType: string } }): Promise<unknown>; get(key: string): Promise<R2Object | null>; delete(key: string): Promise<void>; }
interface Env { DB: D1Database; IMAGES: R2Bucket; ALLOWED_ORIGINS: string; }
interface UserRow { id: string; email: string; password_hash: string; password_salt: string; }
interface SessionRow { user_id: string; email: string; expires_at: string; }
interface ProductRow { id: string; document_json: string; image_key: string; }

const jsonHeaders = { "content-type": "application/json; charset=UTF-8", "cache-control": "no-store" };
const sessionSeconds = 60 * 60 * 24;
const maxImageBytes = 1_000_000;
const imagePattern = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/u;
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const response = (body: unknown, status = 200, headers: HeadersInit = {}) => Response.json(body, { status, headers: { ...jsonHeaders, ...headers } });
const error = (message: string, status: number) => response({ error: message }, status);

function cors(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get("origin");
  const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((value) => value.trim()).filter(Boolean);
  return origin && allowedOrigins.includes(origin) ? { "access-control-allow-origin": origin, "access-control-allow-credentials": "true", vary: "Origin" } : {};
}
function withCors(request: Request, env: Env, value: Response): Response {
  const headers = new Headers(value.headers);
  for (const [key, entry] of Object.entries(cors(request, env))) headers.set(key, entry);
  return new Response(value.body, { status: value.status, headers });
}
async function body(request: Request): Promise<Record<string, unknown> | null> {
  if (!request.headers.get("content-type")?.includes("application/json")) return null;
  try { const value: unknown = await request.json(); return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null; } catch { return null; }
}
function email(value: unknown): string | null { if (typeof value !== "string") return null; const normalized = value.trim().toLowerCase(); return normalized.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(normalized) ? normalized : null; }
function password(value: unknown): string | null { return typeof value === "string" && value.length >= 12 && value.length <= 128 ? value : null; }
function cookie(token: string, expires: Date): string { return `bought_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${sessionSeconds}; Expires=${expires.toUTCString()}`; }
function sessionToken(request: Request): string | null { const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/iu)?.[1]; return bearer ?? request.headers.get("cookie")?.match(/(?:^|;\s*)bought_session=([^;]+)/u)?.[1] ?? null; }
async function authenticatedUser(request: Request, env: Env): Promise<SessionRow | null> { const token = sessionToken(request); if (!token) return null; return env.DB.prepare("SELECT sessions.user_id, users.email, sessions.expires_at FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > ?").bind(await sha256(token), now()).first<SessionRow>(); }
async function createSession(env: Env, user: Pick<UserRow, "id" | "email">): Promise<{ token: string; expiresAt: string }> { const token = randomToken(); const expiresAt = new Date(Date.now() + sessionSeconds * 1000).toISOString(); await env.DB.prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)").bind(id(), user.id, await sha256(token), expiresAt, now()).run(); return { token, expiresAt }; }
function imageFromProduct(product: ProductRecord, imageUrl: string): ProductRecord { return { ...product, image: { ...product.image, dataUrl: imageUrl } }; }
function decodeImage(product: ProductRecord): { bytes: ArrayBuffer; mimeType: ProductImage["mimeType"] } | null { const match = product.image.dataUrl.match(imagePattern); if (!match || match[1] !== product.image.mimeType) return null; const binary = atob(match[2]); if (binary.length === 0 || binary.length > maxImageBytes) return null; const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0)); return { bytes: bytes.buffer, mimeType: product.image.mimeType }; }
function product(value: unknown): ProductRecord | null { if (typeof value !== "object" || value === null || Array.isArray(value)) return null; const item = value as ProductRecord; if (!item.id || !item.name?.trim() || !item.image?.dataUrl || !item.image.mimeType || !Number.isFinite(item.image.width) || !Number.isFinite(item.image.height)) return null; return item; }

async function serve(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...cors(request, env), "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS", "access-control-allow-headers": "content-type,authorization", "access-control-max-age": "86400" } });
  if (url.pathname === "/health") return response({ ok: true });
  if (url.pathname === "/v1/auth/register" && request.method === "POST") { const input = await body(request); const userEmail = email(input?.email); const userPassword = password(input?.password); if (!userEmail || !userPassword) return error("请使用有效邮箱和至少 12 位密码。", 400); const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(userEmail).first<{ id: string }>(); if (existing) return error("该邮箱已注册，请直接登录。", 409); const user = { id: id(), email: userEmail }; const credentials = await hashPassword(userPassword); await env.DB.prepare("INSERT INTO users (id, email, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?)").bind(user.id, user.email, credentials.hash, credentials.salt, now()).run(); const session = await createSession(env, user); return response({ user, expiresAt: session.expiresAt }, 201, { "set-cookie": cookie(session.token, new Date(session.expiresAt)) }); }
  if (url.pathname === "/v1/auth/login" && request.method === "POST") { const input = await body(request); const userEmail = email(input?.email); const userPassword = password(input?.password); if (!userEmail || !userPassword) return error("邮箱或密码不正确。", 401); const user = await env.DB.prepare("SELECT id, email, password_hash, password_salt FROM users WHERE email = ?").bind(userEmail).first<UserRow>(); if (!user || !(await verifyPassword(userPassword, user.password_salt, user.password_hash))) return error("邮箱或密码不正确。", 401); const session = await createSession(env, user); return response({ user: { id: user.id, email: user.email }, expiresAt: session.expiresAt }, 200, { "set-cookie": cookie(session.token, new Date(session.expiresAt)) }); }
  if (url.pathname === "/v1/auth/logout" && request.method === "POST") { const token = sessionToken(request); if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run(); return response({ ok: true }, 200, { "set-cookie": "bought_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0" }); }
  const user = await authenticatedUser(request, env); if (!user) return error("请先登录。", 401);
  if (url.pathname === "/v1/me" && request.method === "GET") return response({ user: { id: user.user_id, email: user.email }, expiresAt: user.expires_at });
  if (url.pathname === "/v1/products" && request.method === "GET") { const rows = await env.DB.prepare("SELECT id, document_json, image_key FROM products WHERE user_id = ? ORDER BY updated_at DESC").bind(user.user_id).all<ProductRow>(); const products = rows.results.flatMap((row) => { try { return [imageFromProduct(JSON.parse(row.document_json) as ProductRecord, `${url.origin}/v1/images/${encodeURIComponent(row.id)}`)]; } catch { return []; } }); return response({ products }); }
  if (url.pathname === "/v1/products" && request.method === "POST") { const input = await body(request); const record = product(input?.product); const image = record && decodeImage(record); if (!record || !image) return error("商品或图片数据无效。", 400); const duplicate = await env.DB.prepare("SELECT id FROM products WHERE id = ?").bind(record.id).first<{ id: string }>(); if (duplicate) return error("该商品已经同步。", 409); const imageKey = `${user.user_id}/${record.id}`; const stored = { ...record, image: { ...record.image, dataUrl: "" } }; await env.IMAGES.put(imageKey, image.bytes, { httpMetadata: { contentType: image.mimeType } }); await env.DB.prepare("INSERT INTO products (id, user_id, document_json, image_key, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)").bind(record.id, user.user_id, JSON.stringify(stored), imageKey, record.createdAt, record.updatedAt).run(); return response({ product: imageFromProduct(stored, `${url.origin}/v1/images/${encodeURIComponent(record.id)}`) }, 201); }
  const productMatch = url.pathname.match(/^\/v1\/products\/([^/]+)$/u);
  if (productMatch && request.method === "DELETE") { const productId = decodeURIComponent(productMatch[1]); const existing = await env.DB.prepare("SELECT image_key FROM products WHERE id = ? AND user_id = ?").bind(productId, user.user_id).first<{ image_key: string }>(); if (!existing) return error("商品不存在。", 404); await env.DB.prepare("DELETE FROM products WHERE id = ? AND user_id = ?").bind(productId, user.user_id).run(); await env.IMAGES.delete(existing.image_key); return response({ ok: true }); }
  const imageMatch = url.pathname.match(/^\/v1\/images\/([^/]+)$/u);
  if (imageMatch && request.method === "GET") { const productId = decodeURIComponent(imageMatch[1]); const row = await env.DB.prepare("SELECT image_key FROM products WHERE id = ? AND user_id = ?").bind(productId, user.user_id).first<{ image_key: string }>(); if (!row) return error("图片不存在。", 404); const object = await env.IMAGES.get(row.image_key); if (!object) return error("图片不存在。", 404); return new Response(object.body, { headers: { "content-type": object.httpMetadata?.contentType ?? "application/octet-stream", "cache-control": "private, max-age=300", "x-content-type-options": "nosniff" } }); }
  return error("未找到接口。", 404);
}
const worker = { async fetch(request: Request, env: Env): Promise<Response> { return withCors(request, env, await serve(request, env)); } };

export default worker;
