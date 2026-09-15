import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function createAccessToken() {
  return randomBytes(18).toString("hex");
}

export function hashAccessToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function accessTokenMatches(token: string, hash: string | null | undefined) {
  if (!hash) return false;
  const incoming = Buffer.from(hashAccessToken(token), "hex");
  const stored = Buffer.from(hash, "hex");
  return incoming.length === stored.length && timingSafeEqual(incoming, stored);
}
