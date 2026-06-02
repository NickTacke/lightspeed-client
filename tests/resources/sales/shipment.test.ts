import { expect, test } from "bun:test";
import { LightspeedClient } from "../../../src/index";
import {
  ShipmentProductResource,
  ShipmentResource,
  shipmentSchema,
  shipmentUpdateSchema,
} from "../../../src/resources/sales/shipment";

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
  id: 4001,
  createdAt: "2026-01-01T00:00:00+00:00",
  updatedAt: "2026-01-01T00:00:00+00:00",
  number: 4001,
  status: "not_shipped",
  trackingCode: "TRACK123",
  carrier: "PostNL",
  customer: false,
};

test("shipmentSchema parses a docs-derived sample", () => {
  const s = shipmentSchema.parse(sample);
  expect(s.id).toBe(4001);
  expect(s.trackingCode).toBe("TRACK123");
  expect(s.customer).toBe(false);
});

test("shipmentSchema preserves unknown fields via passthrough", () => {
  const s = shipmentSchema.parse({ ...sample, extra: "x" });
  expect((s as Record<string, unknown>).extra).toBe("x");
});

test("shipmentUpdateSchema partial", () => {
  const r = shipmentUpdateSchema.parse({ trackingCode: "NEW123" });
  expect(r.trackingCode).toBe("NEW123");
});

test("ShipmentResource hits shipments.json with shipments envelope on list", async () => {
  const t = new FakeTransport(() => ({ shipments: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ShipmentResource(t as any);
  const result = await r.list();
  expect(result).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "shipments.json" });
});

test("ShipmentResource.products(id) scoped to shipments/{id}/products with shipmentProducts envelope", async () => {
  const t = new FakeTransport(() => ({ shipmentProducts: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ShipmentResource(t as any);
  const prods = r.products(4001);
  expect(prods).toBeInstanceOf(ShipmentProductResource);
  await prods.list();
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "shipments/4001/products.json" });
});

test("ShipmentResource.products(id).count hits shipments/{id}/products/count.json", async () => {
  const t = new FakeTransport(() => ({ count: 1 }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ShipmentResource(t as any);
  const count = await r.products(4001).count();
  expect(count).toBe(1);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "shipments/4001/products/count.json" });
});

test("ShipmentResource.metafields(id) scoped to shipments/{id}/metafields", async () => {
  const t = new FakeTransport(() => ({ shipmentMetafields: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ShipmentResource(t as any);
  const mf = r.metafields(4001);
  expect(typeof mf.list).toBe("function");
  await mf.list();
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "shipments/4001/metafields.json" });
});

test("client.shipments is a ShipmentResource with no create/delete", () => {
  const c = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  expect(c.shipments).toBeInstanceOf(ShipmentResource);
  expect(typeof c.shipments.list).toBe("function");
  expect(typeof c.shipments.update).toBe("function");
  expect((c.shipments as unknown as Record<string, unknown>).create).toBeUndefined();
  expect((c.shipments as unknown as Record<string, unknown>).delete).toBeUndefined();
});
