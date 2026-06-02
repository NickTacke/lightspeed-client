import { expect, test } from "bun:test";
import { LightspeedValidationError } from "../../../src/core/errors";
import { LightspeedClient } from "../../../src/index";
import {
  OrderEventResource,
  OrderProductResource,
  OrderResource,
  orderSchema,
  orderUpdateSchema,
} from "../../../src/resources/sales/order";

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

// docs-derived sample (no live orders in test shop)
const sample = {
  id: 1001,
  createdAt: "2026-01-01T00:00:00+00:00",
  updatedAt: "2026-01-01T00:00:00+00:00",
  number: 1001,
  status: "processing_awaiting_shipment",
  paymentStatus: "paid",
  shipmentStatus: "not_shipped",
  firstname: "John",
  lastname: "Doe",
  email: "john@example.com",
  priceIncl: 49.99,
  customer: false,
};

test("orderSchema parses a docs-derived order sample", () => {
  const o = orderSchema.parse(sample);
  expect(o.id).toBe(1001);
  expect(o.status).toBe("processing_awaiting_shipment");
  expect(o.paymentStatus).toBe("paid");
  expect(o.shipmentStatus).toBe("not_shipped");
  expect(o.customer).toBe(false);
});

test("orderSchema preserves unknown fields via passthrough", () => {
  const o = orderSchema.parse({ ...sample, extraField: "x" });
  expect((o as Record<string, unknown>).extraField).toBe("x");
});

test("orderUpdateSchema allows partial status update", () => {
  const r = orderUpdateSchema.parse({ status: "completed" });
  expect(r.status).toBe("completed");
});

test("orderUpdateSchema rejects invalid status enum", () => {
  expect(orderUpdateSchema.safeParse({ status: "invalid_status" }).success).toBe(false);
});

test("OrderResource hits orders.json with orders envelope on list", async () => {
  const t = new FakeTransport(() => ({ orders: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new OrderResource(t as any);
  const result = await r.list();
  expect(result).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "orders.json" });
});

test("OrderResource.get hits orders/{id}.json", async () => {
  const t = new FakeTransport(() => ({ order: sample }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new OrderResource(t as any);
  const o = await r.get(1001);
  expect(o.id).toBe(1001);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "orders/1001.json" });
});

test("OrderResource.products(id) returns OrderProductResource scoped to orders/{id}/products", async () => {
  const t = new FakeTransport(() => ({ orderProducts: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new OrderResource(t as any);
  const prods = r.products(5);
  expect(prods).toBeInstanceOf(OrderProductResource);
  const list = await prods.list();
  expect(list).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "orders/5/products.json" });
});

test("OrderResource.products(id).count hits orders/{id}/products/count.json", async () => {
  const t = new FakeTransport(() => ({ count: 3 }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new OrderResource(t as any);
  const count = await r.products(5).count();
  expect(count).toBe(3);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "orders/5/products/count.json" });
});

test("OrderResource.metafields(id) returns MetafieldResource scoped to orders/{id}/metafields", async () => {
  const t = new FakeTransport(() => ({ orderMetafields: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new OrderResource(t as any);
  const mf = r.metafields(5);
  expect(typeof mf.list).toBe("function");
  const list = await mf.list();
  expect(list).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "orders/5/metafields.json" });
});

test("OrderResource.credit(id) POSTs to orders/{id}/credit.json with credit envelope", async () => {
  const t = new FakeTransport(() => ({ credit: {} }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new OrderResource(t as any);
  await r.credit(5, { creditPayment: true, creditShipment: false });
  expect(t.calls[0]).toMatchObject({
    method: "POST",
    path: "orders/5/credit.json",
    body: { credit: { creditPayment: true, creditShipment: false } },
  });
});

test("OrderResource.credit throws LightspeedValidationError on invalid input", async () => {
  const t = new FakeTransport(() => ({}));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new OrderResource(t as any);
  // orderProducts items require id+quantity; passing a string triggers validation failure
  await expect(
    r.credit(5, { orderProducts: [{ id: "bad" } as unknown as { id: number; quantity: number }] }),
  ).rejects.toBeInstanceOf(LightspeedValidationError);
});

test("client.orders is an OrderResource", () => {
  const c = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  expect(c.orders).toBeInstanceOf(OrderResource);
  expect(typeof c.orders.list).toBe("function");
  expect(typeof c.orders.count).toBe("function");
  expect(typeof c.orders.get).toBe("function");
  expect(typeof c.orders.update).toBe("function");
  // no create/delete
  expect((c.orders as unknown as Record<string, unknown>).create).toBeUndefined();
  expect((c.orders as unknown as Record<string, unknown>).delete).toBeUndefined();
});

test("client.orderEvents is a top-level OrderEventResource (orders/events)", async () => {
  const c = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  expect(c.orderEvents).toBeInstanceOf(OrderEventResource);
  expect(typeof c.orderEvents.list).toBe("function");
  expect(typeof c.orderEvents.count).toBe("function");
  expect(typeof c.orderEvents.get).toBe("function");
});

test("OrderEventResource hits orders/events.json", async () => {
  const t = new FakeTransport(() => ({ orderEvents: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new OrderEventResource(t as any);
  const result = await r.list();
  expect(result).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "orders/events.json" });
});
