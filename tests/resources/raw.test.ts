import { expect, mock, test } from "bun:test";
import { z } from "zod";
import { LightspeedClient } from "../../src/index";

function client(fetchImpl: typeof fetch) {
  return new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl", fetch: fetchImpl });
}

const res = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

test("request builds the url/method and returns the raw body without a schema", async () => {
  const f = mock(async (url: string, init: RequestInit) => {
    expect(url).toBe("https://api.webshopapp.com/nl/anything.json?foo=1");
    expect(init.method).toBe("GET");
    return res({ hello: "world" });
  });
  const c = client(f as unknown as typeof fetch);
  const out = await c.request<{ hello: string }>({
    method: "GET",
    path: "anything.json",
    query: { foo: 1 },
  });
  expect(out).toEqual({ hello: "world" });
});

test("request validates the response when a schema is given", async () => {
  const f = mock(async () => res({ id: 7, name: "x" }));
  const c = client(f as unknown as typeof fetch);
  const schema = z.object({ id: z.number(), name: z.string() });
  const out = await c.request({ method: "GET", path: "x.json", schema });
  expect(out).toEqual({ id: 7, name: "x" });
});

test("request throws when the response fails the schema", async () => {
  const f = mock(async () => res({ id: "not-a-number" }));
  const c = client(f as unknown as typeof fetch);
  const schema = z.object({ id: z.number() });
  await expect(c.request({ method: "GET", path: "x.json", schema })).rejects.toThrow();
});

test("request sends a body on POST", async () => {
  const f = mock(async (_url: string, init: RequestInit) => {
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ a: 1 });
    return res({ ok: true });
  });
  const c = client(f as unknown as typeof fetch);
  const out = await c.request({ method: "POST", path: "x.json", body: { a: 1 } });
  expect(f).toHaveBeenCalledTimes(1);
  expect(out).toEqual({ ok: true });
});
