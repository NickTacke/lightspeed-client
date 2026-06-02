import { expect, test } from "bun:test";
import { VariantMovementResource } from "../../../src/resources/catalog/variant";

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

test("VariantMovementResource.list hits variants/movements.json with variantsMovements envelope", async () => {
  const t = new FakeTransport(() => ({ variantsMovements: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new VariantMovementResource(t as any);
  const result = await r.list();
  expect(result).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "variants/movements.json" });
});

test("VariantMovementResource.list serializes variant filter to ?variant=...", async () => {
  const t = new FakeTransport(() => ({ variantsMovements: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new VariantMovementResource(t as any);
  await r.list({ variant: 322925834 });
  expect(t.calls[0]).toMatchObject({
    method: "GET",
    path: "variants/movements.json",
    query: { variant: 322925834 },
  });
});

test("VariantMovementResource.count hits variants/movements/count.json", async () => {
  const t = new FakeTransport(() => ({ count: 5 }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new VariantMovementResource(t as any);
  const count = await r.count();
  expect(count).toBe(5);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "variants/movements/count.json" });
});

test("VariantMovementResource.get hits variants/movements/{id}.json", async () => {
  const t = new FakeTransport(() => ({
    variantMovement: {
      id: 99,
      createdAt: "2026-01-01T00:00:00+00:00",
      updatedAt: "2026-01-01T00:00:00+00:00",
    },
  }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new VariantMovementResource(t as any);
  const mv = await r.get(99);
  expect(mv.id).toBe(99);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "variants/movements/99.json" });
});
