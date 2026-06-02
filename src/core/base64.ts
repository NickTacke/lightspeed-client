// basic-auth header; uses btoa where present, falls back to Buffer
export function basicAuthHeader(key: string, secret: string): string {
  const raw = `${key}:${secret}`;
  const b64 = typeof btoa === "function" ? btoa(raw) : Buffer.from(raw, "utf8").toString("base64");
  return `Basic ${b64}`;
}
