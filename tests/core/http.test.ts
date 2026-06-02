import { expect, mock, test } from "bun:test";
import { resolveConfig } from "../../src/config";
import { LightspeedAuthError, LightspeedTimeoutError } from "../../src/core/errors";
import { Transport } from "../../src/core/http";

const makeRes = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(typeof body === "string" ? body : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });

function transport(fetchImpl: typeof fetch, over = {}) {
  const cfg = resolveConfig({
    apiKey: "k",
    apiSecret: "s",
    language: "nl",
    fetch: fetchImpl,
    ...over,
  });
  return new Transport(cfg);
}

test("GET success returns parsed json and sends basic auth", async () => {
  const f = mock(async (url: string, init: RequestInit) => {
    expect(url).toBe("https://api.webshopapp.com/nl/products.json");
    expect((init.headers as Record<string, string>).Authorization).toMatch(/^Basic /);
    return makeRes(200, { products: [] });
  });
  const t = transport(f as unknown as typeof fetch);
  const body = await t.send({ method: "GET", path: "products.json" });
  expect(body).toEqual({ products: [] });
});

test("non-2xx throws typed error", async () => {
  const f = mock(async () => makeRes(401, { error: { code: 401, message: "denied" } }));
  const t = transport(f as unknown as typeof fetch);
  await expect(t.send({ method: "GET", path: "x.json" })).rejects.toBeInstanceOf(
    LightspeedAuthError,
  );
});

test("retries GET on 429 then succeeds", async () => {
  let n = 0;
  const f = mock(async () => {
    n++;
    return n === 1
      ? makeRes(429, { error: { message: "slow" } }, { "retry-after": "0" })
      : makeRes(200, { ok: true });
  });
  const t = transport(f as unknown as typeof fetch);
  const body = await t.send({ method: "GET", path: "x.json" });
  expect(body).toEqual({ ok: true });
  expect(n).toBe(2);
});

test("does NOT retry POST by default", async () => {
  let n = 0;
  const f = mock(async () => {
    n++;
    return makeRes(500, { error: { message: "boom" } });
  });
  const t = transport(f as unknown as typeof fetch);
  await expect(t.send({ method: "POST", path: "x.json", body: {} })).rejects.toThrow();
  expect(n).toBe(1);
});

test("timeout produces LightspeedTimeoutError", async () => {
  const f = mock(async (_url: string, init: RequestInit) => {
    // wait until the signal aborts, then reject
    return new Promise<Response>((_resolve, reject) => {
      init.signal?.addEventListener("abort", () => {
        const err = new Error("aborted");
        err.name = "AbortError";
        reject(err);
      });
    });
  });
  const t = transport(f as unknown as typeof fetch, { timeoutMs: 1, retry: { maxRetries: 0 } });
  await expect(t.send({ method: "GET", path: "x.json" })).rejects.toBeInstanceOf(
    LightspeedTimeoutError,
  );
});
