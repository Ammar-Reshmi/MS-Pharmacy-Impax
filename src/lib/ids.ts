export function publicReference(prefix: "QR" | "Q") {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const entropy = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `${prefix}-${date}-${entropy}`;
}

