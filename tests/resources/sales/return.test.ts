import { expect, test } from "bun:test";
import { LightspeedClient } from "../../../src/index";
import {
  ReturnResource,
  returnInputSchema,
  returnSchema,
  returnUpdateSchema,
} from "../../../src/resources/sales/return";

class FakeTransport {
  // biome-ignore lint/suspicious/noExplicitAny: test fake
  calls: any[] = [];
  // biome-ignore lint/suspicious/noExplicitAny: test fake
  constructor(private responder: (a: any) => any) {}
  // biome-ignore lint/suspicious/noExplicitAny: test fake
  async send(args: any) {
    this.calls.push(args);
    return this.responder(args);
  }
}

const sample = {
  id: 5001,
  createdAt: "2026-01-01T00:00:00+00:00",
  updatedAt: "2026-01-01T00:00:00+00:00",
  number: 5001,
  status: "open",
  reason: "broken",
  firstname: "Alice",
  lastname: "Brown",
  email: "alice@example.com",
  customer: false,
  order: false,
};

test("returnSchema parses a docs-derived sample", () => {
  const r = returnSchema.parse(sample);
  expect(r.id).toBe(5001);
  expect(r.reason).toBe("broken");
  expect(r.customer).toBe(false);
  expect(r.order).toBe(false);
});

test("returnSchema preserves unknown fields via passthrough", () => {
  const r = returnSchema.parse({ ...sample, extra: "x" });
  expect((r as Record<string, unknown>).extra).toBe("x");
});

test("returnInputSchema is fully optional (all fields optional)", () => {
  expect(returnInputSchema.safeParse({}).success).toBe(true);
});

test("returnUpdateSchema allows partial update", () => {
  const r = returnUpdateSchema.parse({ status: "closed" });
  expect(r.status).toBe("closed");
});

test("ReturnResource hits returns.json with returns envelope on list", async () => {
  const t = new FakeTransport(() => ({ returns: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ReturnResource(t as any);
  const result = await r.list();
  expect(result).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "returns.json" });
});

test("ReturnResource.get hits returns/{id}.json", async () => {
  const t = new FakeTransport(() => ({ return: sample }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ReturnResource(t as any);
  const ret = await r.get(5001);
  expect(ret.id).toBe(5001);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "returns/5001.json" });
});

test("ReturnResource.create POSTs to returns.json", async () => {
  const t = new FakeTransport(() => ({
    return: {
      ...sample,
      id: 5002,
      createdAt: "2026-01-01T00:00:00+00:00",
      updatedAt: "2026-01-01T00:00:00+00:00",
    },
  }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ReturnResource(t as any);
  await r.create({ reason: "wrong item", email: "b@example.com" });
  expect(t.calls[0]).toMatchObject({ method: "POST", path: "returns.json" });
});

test("client.returns is a ReturnResource with create/update", () => {
  const c = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  expect(c.returns).toBeInstanceOf(ReturnResource);
  expect(typeof c.returns.list).toBe("function");
  expect(typeof c.returns.create).toBe("function");
  expect(typeof c.returns.update).toBe("function");
  // no delete confirmed in Postman
  expect((c.returns as unknown as Record<string, unknown>).delete).toBeUndefined();
});
