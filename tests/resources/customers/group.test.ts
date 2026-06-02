import { expect, test } from "bun:test";
import { LightspeedClient } from "../../../src/index";
import {
  GroupResource,
  groupInputSchema,
  groupSchema,
  groupUpdateSchema,
} from "../../../src/resources/customers/group";

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

// docs-derived sample (live shop has no groups — unvalidated live)
const sample = {
  id: 7,
  createdAt: "2026-01-01T00:00:00+00:00",
  updatedAt: "2026-01-01T00:00:00+00:00",
  title: "Newsletter",
};

test("groupSchema parses a docs-derived group sample", () => {
  const g = groupSchema.parse(sample);
  expect(g.id).toBe(7);
  expect(g.title).toBe("Newsletter");
});

test("groupSchema preserves unknown fields via passthrough", () => {
  const g = groupSchema.parse({ ...sample, extraField: "x" });
  expect((g as Record<string, unknown>).extraField).toBe("x");
});

test("groupInputSchema requires title", () => {
  expect(groupInputSchema.safeParse({}).success).toBe(false);
  expect(groupInputSchema.safeParse({ title: "VIP" }).success).toBe(true);
});

test("groupUpdateSchema allows partial update without title", () => {
  const r = groupUpdateSchema.parse({});
  expect(r).toEqual({});
});

test("GroupResource.list hits groups.json with groups envelope", async () => {
  const t = new FakeTransport(() => ({ groups: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new GroupResource(t as any);
  const result = await r.list();
  expect(result).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "groups.json" });
});

test("GroupResource.get hits groups/{id}.json", async () => {
  const t = new FakeTransport(() => ({ group: sample }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new GroupResource(t as any);
  const g = await r.get(7);
  expect(g.id).toBe(7);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "groups/7.json" });
});

test("GroupResource.create POSTs to groups.json with group envelope", async () => {
  const t = new FakeTransport(() => ({ group: sample }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new GroupResource(t as any);
  await r.create({ title: "Newsletter" });
  expect(t.calls[0]).toMatchObject({
    method: "POST",
    path: "groups.json",
    body: { group: { title: "Newsletter" } },
  });
});

test("GroupResource.update PUTs to groups/{id}.json with group envelope", async () => {
  const t = new FakeTransport(() => ({ group: sample }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new GroupResource(t as any);
  await r.update(7, { title: "VIP" });
  expect(t.calls[0]).toMatchObject({
    method: "PUT",
    path: "groups/7.json",
    body: { group: { title: "VIP" } },
  });
});

test("GroupResource.delete DELETEs groups/{id}.json", async () => {
  const t = new FakeTransport(() => undefined);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new GroupResource(t as any);
  await r.delete(7);
  expect(t.calls[0]).toMatchObject({ method: "DELETE", path: "groups/7.json" });
});

test("client.groups is a GroupResource", () => {
  const c = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  expect(c.groups).toBeInstanceOf(GroupResource);
  expect(typeof c.groups.list).toBe("function");
  expect(typeof c.groups.count).toBe("function");
  expect(typeof c.groups.get).toBe("function");
  expect(typeof c.groups.create).toBe("function");
  expect(typeof c.groups.update).toBe("function");
  expect(typeof c.groups.delete).toBe("function");
});
