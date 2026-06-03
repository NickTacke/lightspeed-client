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

const sample = {
  id: 315967958,
  createdAt: "2026-06-03T00:56:12+02:00",
  updatedAt: "2026-06-03T00:56:15+02:00",
  number: "ORD00001",
  status: "processing_awaiting_pickup",
  paymentStatus: "not_paid",
  shipmentStatus: "not_shipped",
  customStatusId: null,
  channel: "api",
  priceCost: 1.25,
  priceExcl: 2.88,
  priceIncl: 3.49,
  weight: 0,
  email: "buyer1@example.com",
  firstname: "Test",
  lastname: "Buyer",
  addressBillingCountry: { id: 150, code: "nl", code3: "nld", title: "Netherlands, The" },
  addressShippingCompany: false,
  paymentId: "pickup",
  shipmentId: "core|747283|3298308",
  customer: { resource: { id: 226983112, url: "customers/226983112", link: "x" } },
};

test("orderSchema parses the live order shape", () => {
  const o = orderSchema.parse(sample);
  expect(o.number).toBe("ORD00001");
  expect(o.status).toBe("processing_awaiting_pickup");
  expect((o.addressBillingCountry as { code: string }).code).toBe("nl");
  expect(o.shipmentId).toBe("core|747283|3298308");
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
  const o = await r.get(315967958);
  expect(o.id).toBe(315967958);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "orders/315967958.json" });
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
  const t = new FakeTransport(() => ({ ordersEvents: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new OrderEventResource(t as any);
  const result = await r.list();
  expect(result).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "orders/events.json" });
});
