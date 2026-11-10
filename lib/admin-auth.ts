import { cookies } from "next/headers";
import { env } from "cloudflare:workers";

export const ADMIN_COOKIE = "site-admin";

function adminPassword(): string {
  return ((env as unknown as { ADMIN_PASSWORD?: string }).ADMIN_PASSWORD ?? "").trim();
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sign(value: string): Promise<string> {
  const secret = adminPassword();
  if (!secret) return "";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

export function verifyAdminPassword(candidate: string): boolean {
  const expected = adminPassword();
  return Boolean(expected) && safeEqual(candidate, expected);
}

export async function createAdminSession(): Promise<string> {
  const expires = Date.now() + 30 * 24 * 60 * 60 * 1000;
  return `${expires}.${await sign(String(expires))}`;
}

export async function hasAdminSession(): Promise<boolean> {
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const [expiresText, signature] = value.split(".");
  const expires = Number(expiresText);
  if (!Number.isFinite(expires) || expires < Date.now() || !signature) return false;
  return safeEqual(signature, await sign(expiresText));
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: true,
  path: "/",
  maxAge: 30 * 24 * 60 * 60,
};
