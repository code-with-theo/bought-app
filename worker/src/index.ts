import type { ProductImage, ProductRecord } from "../../src/types/product";
import { hashPassword, randomToken, sha256, verifyPassword } from "./security";

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T>(): Promise<T | null>;
  run(): Promise<unknown>;
  all<T>(): Promise<{ results: T[] }>;
}
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}
interface Env {
  DB: D1Database;
  ALLOWED_ORIGINS: string;
  SESSION_SECRET: string;
}
interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  password_salt: string;
}
interface SessionRow {
  user_id: string;
  email: string;
  expires_at: string;
}
interface ProductRow {
  id: string;
  document_json: string;
  image_blob: ArrayBuffer | null;
  image_mime_type: string | null;
}
interface DeletedProductRow {
  id: string;
  deleted_at: string;
}

const jsonHeaders = {
  "content-type": "application/json; charset=UTF-8",
  "cache-control": "no-store",
};
const sessionSeconds = 60 * 60 * 24;
const maxImageBytes = 1_000_000;
const imagePattern =
  /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/u;
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const response = (body: unknown, status = 200, headers: HeadersInit = {}) =>
  Response.json(body, { status, headers: { ...jsonHeaders, ...headers } });
const error = (message: string, status: number) =>
  response({ error: message }, status);

function cors(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get("origin");
  const allowedOrigins = (env.ALLOWED_ORIGINS ?? "").split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return origin && allowedOrigins.includes(origin)
    ? {
        "access-control-allow-origin": origin,
        "access-control-allow-credentials": "true",
        vary: "Origin",
      }
    : {};
}
function withCors(request: Request, env: Env, value: Response): Response {
  const headers = new Headers(value.headers);
  for (const [key, entry] of Object.entries(cors(request, env)))
    headers.set(key, entry);
  return new Response(value.body, { status: value.status, headers });
}
async function body(request: Request): Promise<Record<string, unknown> | null> {
  if (!request.headers.get("content-type")?.includes("application/json"))
    return null;
  try {
    const value: unknown = await request.json();
    return typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
function email(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(normalized)
    ? normalized
    : null;
}
function password(value: unknown): string | null {
  return typeof value === "string" && value.length >= 12 && value.length <= 128
    ? value
    : null;
}
function cookie(token: string, expires: Date): string {
  return `bought_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${sessionSeconds}; Expires=${expires.toUTCString()}`;
}
function sessionToken(request: Request): string | null {
  const bearer = request.headers
    .get("authorization")
    ?.match(/^Bearer\s+(.+)$/iu)?.[1];
  return (
    bearer ??
    request.headers
      .get("cookie")
      ?.match(/(?:^|;\s*)bought_session=([^;]+)/u)?.[1] ??
    null
  );
}
async function sessionHash(token: string, env: Env): Promise<string> {
  return sha256(`${env.SESSION_SECRET}:${token}`);
}
async function authenticatedUser(
  request: Request,
  env: Env,
): Promise<SessionRow | null> {
  const token = sessionToken(request);
  if (!token) return null;
  return env.DB.prepare(
    "SELECT sessions.user_id, users.email, sessions.expires_at FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > ?",
  )
    .bind(await sessionHash(token, env), now())
    .first<SessionRow>();
}
async function createSession(
  env: Env,
  user: Pick<UserRow, "id" | "email">,
): Promise<{ token: string; expiresAt: string }> {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + sessionSeconds * 1000).toISOString();
  await env.DB.prepare(
    "INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(id(), user.id, await sessionHash(token, env), expiresAt, now())
    .run();
  return { token, expiresAt };
}
function imageFromProduct(
  product: ProductRecord,
  imageUrl: string,
): ProductRecord {
  return { ...product, image: { ...product.image, dataUrl: imageUrl } };
}
function decodeImage(
  product: ProductRecord,
): { bytes: ArrayBuffer; mimeType: ProductImage["mimeType"] } | null {
  const match = product.image.dataUrl.match(imagePattern);
  if (!match || match[1] !== product.image.mimeType) return null;
  const binary = atob(match[2]);
  if (binary.length === 0 || binary.length > maxImageBytes) return null;
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return { bytes: bytes.buffer, mimeType: product.image.mimeType };
}
function product(value: unknown): ProductRecord | null {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return null;
  const item = value as ProductRecord;
  if (
    !item.id ||
    !item.name?.trim() ||
    !item.image?.dataUrl ||
    !item.image.mimeType ||
    !Number.isFinite(item.image.width) ||
    !Number.isFinite(item.image.height)
  )
    return null;
  return item;
}

async function serve(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (request.method === "OPTIONS")
    return new Response(null, {
      status: 204,
      headers: {
        ...cors(request, env),
        "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
        "access-control-allow-headers": "content-type,authorization",
        "access-control-max-age": "86400",
      },
    });
  if (url.pathname === "/health") return response({ ok: true });
  if (url.pathname === "/v1/auth/register" && request.method === "POST") {
    const input = await body(request);
    const userEmail = email(input?.email);
    const userPassword = password(input?.password);
    if (!userEmail || !userPassword)
      return error("请使用有效邮箱和至少 12 位密码。", 400);
    const existing = await env.DB.prepare(
      "SELECT id FROM users WHERE email = ?",
    )
      .bind(userEmail)
      .first<{ id: string }>();
    if (existing) return error("该邮箱已注册，请直接登录。", 409);
    const user = { id: id(), email: userEmail };
    const credentials = await hashPassword(userPassword, env.SESSION_SECRET);
    await env.DB.prepare(
      "INSERT INTO users (id, email, password_hash, password_salt, created_at) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(user.id, user.email, credentials.hash, credentials.salt, now())
      .run();
    const session = await createSession(env, user);
    return response({ user, expiresAt: session.expiresAt }, 201, {
      "set-cookie": cookie(session.token, new Date(session.expiresAt)),
    });
  }
  if (url.pathname === "/v1/auth/login" && request.method === "POST") {
    const input = await body(request);
    const userEmail = email(input?.email);
    const userPassword = password(input?.password);
    if (!userEmail || !userPassword) return error("邮箱或密码不正确。", 401);
    const user = await env.DB.prepare(
      "SELECT id, email, password_hash, password_salt FROM users WHERE email = ?",
    )
      .bind(userEmail)
      .first<UserRow>();
    if (
      !user ||
      !(await verifyPassword(
        userPassword,
        env.SESSION_SECRET,
        user.password_salt,
        user.password_hash,
      ))
    )
      return error("邮箱或密码不正确。", 401);
    const session = await createSession(env, user);
    return response(
      {
        user: { id: user.id, email: user.email },
        expiresAt: session.expiresAt,
      },
      200,
      { "set-cookie": cookie(session.token, new Date(session.expiresAt)) },
    );
  }
  if (url.pathname === "/v1/auth/logout" && request.method === "POST") {
    const token = sessionToken(request);
    if (token)
      await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?")
        .bind(await sessionHash(token, env))
        .run();
    return response({ ok: true }, 200, {
      "set-cookie":
        "bought_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
    });
  }
  const user = await authenticatedUser(request, env);
  if (!user) return error("请先登录。", 401);
  if (url.pathname === "/v1/me" && request.method === "GET")
    return response({
      user: { id: user.user_id, email: user.email },
      expiresAt: user.expires_at,
    });
  if (url.pathname === "/v1/products" && request.method === "GET") {
    const rows = await env.DB.prepare(
      "SELECT id, document_json, image_blob, image_mime_type FROM products WHERE user_id = ? ORDER BY updated_at DESC",
    )
      .bind(user.user_id)
      .all<ProductRow>();
    const deleted = await env.DB.prepare(
      "SELECT id, deleted_at FROM deleted_products WHERE user_id = ? ORDER BY deleted_at DESC",
    )
      .bind(user.user_id)
      .all<DeletedProductRow>();
    const products = rows.results.flatMap((row) => {
      try {
        return [
          imageFromProduct(
            JSON.parse(row.document_json) as ProductRecord,
            `${url.origin}/v1/images/${encodeURIComponent(row.id)}`,
          ),
        ];
      } catch {
        return [];
      }
    });
    return response({
      products,
      deleted: deleted.results.map((item) => ({
        id: item.id,
        deletedAt: item.deleted_at,
      })),
    });
  }
  if (url.pathname === "/v1/products" && request.method === "POST") {
    const input = await body(request);
    const record = product(input?.product);
    const image = record && decodeImage(record);
    if (!record || !image) return error("商品或图片数据无效。", 400);
    const duplicate = await env.DB.prepare(
      "SELECT id FROM products WHERE id = ? AND user_id = ?",
    )
      .bind(record.id, user.user_id)
      .first<{ id: string }>();
    if (duplicate) return error("该商品已经同步。", 409);
    const tombstone = await env.DB.prepare(
      "SELECT deleted_at FROM deleted_products WHERE id = ? AND user_id = ?",
    )
      .bind(record.id, user.user_id)
      .first<DeletedProductRow>();
    if (tombstone && tombstone.deleted_at >= record.updatedAt)
      return error("云端已有更新的删除操作。", 409);
    const stored = {
      ...record,
      isDemo: false,
      image: { ...record.image, dataUrl: "" },
    };
    await env.DB.prepare(
      "INSERT INTO products (id, user_id, document_json, image_key, image_blob, image_mime_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(
        record.id,
        user.user_id,
        JSON.stringify(stored),
        `d1:${record.id}`,
        image.bytes,
        image.mimeType,
        record.createdAt,
        record.updatedAt,
      )
      .run();
    await env.DB.prepare(
      "DELETE FROM deleted_products WHERE id = ? AND user_id = ?",
    )
      .bind(record.id, user.user_id)
      .run();
    return response(
      {
        product: imageFromProduct(
          stored,
          `${url.origin}/v1/images/${encodeURIComponent(record.id)}`,
        ),
      },
      201,
    );
  }
  const productMatch = url.pathname.match(/^\/v1\/products\/([^/]+)$/u);
  if (productMatch && request.method === "PUT") {
    const input = await body(request);
    const record = product(input?.product);
    const image = record && decodeImage(record);
    const productId = decodeURIComponent(productMatch[1]);
    if (!record || !image || record.id !== productId)
      return error("商品或图片数据无效。", 400);
    const existing = await env.DB.prepare(
      "SELECT updated_at FROM products WHERE id = ? AND user_id = ?",
    )
      .bind(productId, user.user_id)
      .first<{ updated_at: string }>();
    if (!existing) return error("商品不存在。", 404);
    if (existing.updated_at >= record.updatedAt)
      return error("云端已有更新版本。", 409);
    const stored = {
      ...record,
      isDemo: false,
      image: { ...record.image, dataUrl: "" },
    };
    await env.DB.prepare(
      "UPDATE products SET document_json = ?, image_blob = ?, image_mime_type = ?, updated_at = ? WHERE id = ? AND user_id = ?",
    )
      .bind(
        JSON.stringify(stored),
        image.bytes,
        image.mimeType,
        record.updatedAt,
        productId,
        user.user_id,
      )
      .run();
    return response({
      product: imageFromProduct(
        stored,
        `${url.origin}/v1/images/${encodeURIComponent(record.id)}`,
      ),
    });
  }
  if (productMatch && request.method === "DELETE") {
    const productId = decodeURIComponent(productMatch[1]);
    const deletedAt = url.searchParams.get("deletedAt");
    if (!deletedAt || Number.isNaN(Date.parse(deletedAt)))
      return error("删除时间无效。", 400);
    const existing = await env.DB.prepare(
      "SELECT updated_at FROM products WHERE id = ? AND user_id = ?",
    )
      .bind(productId, user.user_id)
      .first<{ updated_at: string }>();
    if (existing && existing.updated_at > deletedAt)
      return error("云端已有更新版本。", 409);
    const tombstone = await env.DB.prepare(
      "SELECT deleted_at FROM deleted_products WHERE id = ? AND user_id = ?",
    )
      .bind(productId, user.user_id)
      .first<DeletedProductRow>();
    if (tombstone && tombstone.deleted_at > deletedAt)
      return error("云端已有更新的删除操作。", 409);
    if (existing) {
      await env.DB.prepare("DELETE FROM products WHERE id = ? AND user_id = ?")
        .bind(productId, user.user_id)
        .run();
    }
    await env.DB.prepare(
      "INSERT OR REPLACE INTO deleted_products (id, user_id, deleted_at) VALUES (?, ?, ?)",
    )
      .bind(productId, user.user_id, deletedAt)
      .run();
    return response({ ok: true });
  }
  const imageMatch = url.pathname.match(/^\/v1\/images\/([^/]+)$/u);
  if (imageMatch && request.method === "GET") {
    const productId = decodeURIComponent(imageMatch[1]);
    const row = await env.DB.prepare(
      "SELECT image_blob, image_mime_type FROM products WHERE id = ? AND user_id = ?",
    )
      .bind(productId, user.user_id)
      .first<ProductRow>();
    if (!row?.image_blob) return error("图片不存在。", 404);
    return new Response(row.image_blob, {
      headers: {
        "content-type": row.image_mime_type ?? "application/octet-stream",
        "cache-control": "private, max-age=300",
        "x-content-type-options": "nosniff",
      },
    });
  }
  return error("未找到接口。", 404);
}
const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    return withCors(request, env, await serve(request, env));
  },
};

export default worker;
