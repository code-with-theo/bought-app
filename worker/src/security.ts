const encoder = new TextEncoder();
// Workers Free allows 10 ms CPU per request. A server-only 600k-round PBKDF2
// cannot run reliably within that limit, so the stored verifier is also keyed
// with the Worker-only SESSION_SECRET pepper.
const iterations = 10_000;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToBase64(bytes).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return bytesToBase64(new Uint8Array(digest));
}

export async function hashPassword(password: string, pepper: string, salt = bytesToBase64(crypto.getRandomValues(new Uint8Array(16)))): Promise<{ hash: string; salt: string }> {
  const material = await crypto.subtle.importKey("raw", encoder.encode(`${password}:${pepper}`), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: base64ToBytes(salt), iterations }, material, 256);
  return { hash: bytesToBase64(new Uint8Array(bits)), salt };
}

export async function verifyPassword(password: string, pepper: string, salt: string, expectedHash: string): Promise<boolean> {
  const { hash } = await hashPassword(password, pepper, salt);
  const left = encoder.encode(hash);
  const right = encoder.encode(expectedHash);
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}
