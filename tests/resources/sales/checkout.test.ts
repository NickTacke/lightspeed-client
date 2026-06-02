import { expect, test } from "bun:test";
import { LightspeedClient } from "../../../src/index";
import {
  CheckoutProductResource,
  CheckoutResource,
  checkoutProductSchema,
  checkoutSchema,
} from "../../../src/resources/sales/checkout";

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

// docs-derived sample using snake_case (checkout api v2 shape)
const sampleCheckout = {
  id: 3628565,
  created_at: "2019-09-13T17:57:36+00:00",
  updated_at: "2019-09-13T18:16:20+00:00",
  order_id: null,
  step: "shipment",
  mode: "guest",
  shipment_method: null,
  payment_method: null,
  discount: false,
  comment: "Checkout Comment",
  newsletter: true,
  terms: true,
  notifications: true,
  memo: null,
};

const sampleCheckoutProduct = {
  id: 101,
  cart_id: 42,
  product_id: 200,
  variant_id: 300,
  quantity: 2,
  price_excl: 19.95,
  price_incl: 24.14,
  tax_rate: 0.21,
  title: "Test Product",
  fulltitle: "Test Product - Blue",
  stock_available: true,
};

test("checkoutSchema parses a docs-derived snake_case checkout", () => {
  const c = checkoutSchema.parse(sampleCheckout);
  expect(c.id).toBe(3628565);
  expect(c.step).toBe("shipment");
  expect(c.mode).toBe("guest");
  expect(c.discount).toBe(false);
  expect(c.order_id).toBeNull();
});

test("checkoutSchema preserves unknown fields via passthrough", () => {
  const c = checkoutSchema.parse({ ...sampleCheckout, extra_field: "x" });
  expect((c as Record<string, unknown>).extra_field).toBe("x");
});

test("checkoutProductSchema parses a docs-derived product", () => {
  const p = checkoutProductSchema.parse(sampleCheckoutProduct);
  expect(p.id).toBe(101);
  expect(p.quantity).toBe(2);
  expect(p.title).toBe("Test Product");
});

test("CheckoutResource.list GETs checkouts.json (no envelope — bare array)", async () => {
  const t = new FakeTransport(() => []);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  const result = await r.list();
  expect(Array.isArray(result)).toBe(true);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "checkouts.json" });
});

test("CheckoutResource.list returns parsed checkouts from bare array", async () => {
  const t = new FakeTransport(() => [sampleCheckout]);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  const result = await r.list();
  expect(result).toHaveLength(1);
  expect(result[0]?.id).toBe(3628565);
  expect(result[0]?.step).toBe("shipment");
});

test("CheckoutResource.count GETs checkouts/count.json", async () => {
  const t = new FakeTransport(() => ({ count: 0 }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  const count = await r.count();
  expect(count).toBe(0);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "checkouts/count.json" });
});

test("CheckoutResource.get GETs checkouts/{id}.json (no envelope — direct object)", async () => {
  const t = new FakeTransport(() => sampleCheckout);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  const c = await r.get(3628565);
  expect(c.id).toBe(3628565);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "checkouts/3628565.json" });
});

test("CheckoutResource.create POSTs to checkouts.json", async () => {
  const t = new FakeTransport(() => sampleCheckout);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  await r.create({ mode: "guest" });
  expect(t.calls[0]).toMatchObject({ method: "POST", path: "checkouts.json" });
});

test("CheckoutResource.update PUTs to checkouts/{id}.json", async () => {
  const t = new FakeTransport(() => sampleCheckout);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  await r.update(3628565, { comment: "updated" });
  expect(t.calls[0]).toMatchObject({ method: "PUT", path: "checkouts/3628565.json" });
});

test("CheckoutResource.products(id) returns CheckoutProductResource scoped to checkouts/{id}/products", () => {
  const t = new FakeTransport(() => ({}));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  const prods = r.products(3628565);
  expect(prods).toBeInstanceOf(CheckoutProductResource);
});

test("CheckoutProductResource.add POSTs to checkouts/{id}/products.json", async () => {
  const t = new FakeTransport(() => sampleCheckoutProduct);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutProductResource(t as any, "checkouts/3628565");
  await r.add({ variant_id: 300, quantity: 2 });
  expect(t.calls[0]).toMatchObject({ method: "POST", path: "checkouts/3628565/products.json" });
});

test("CheckoutProductResource.update PUTs to checkouts/{id}/products/{product_id}.json", async () => {
  const t = new FakeTransport(() => sampleCheckoutProduct);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutProductResource(t as any, "checkouts/3628565");
  await r.update(101, { quantity: 3 });
  expect(t.calls[0]).toMatchObject({
    method: "PUT",
    path: "checkouts/3628565/products/101.json",
  });
});

test("CheckoutProductResource.remove DELETEs checkouts/{id}/products/{product_id}.json", async () => {
  const t = new FakeTransport(() => undefined);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutProductResource(t as any, "checkouts/3628565");
  await r.remove(101);
  expect(t.calls[0]).toMatchObject({
    method: "DELETE",
    path: "checkouts/3628565/products/101.json",
  });
});

test("CheckoutResource.shipmentMethods GETs checkouts/{id}/shipment_methods.json", async () => {
  const t = new FakeTransport(() => []);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  const methods = await r.shipmentMethods(3628565);
  expect(Array.isArray(methods)).toBe(true);
  expect(t.calls[0]).toMatchObject({
    method: "GET",
    path: "checkouts/3628565/shipment_methods.json",
  });
});

test("CheckoutResource.paymentMethods GETs checkouts/{id}/payment_methods.json", async () => {
  const t = new FakeTransport(() => []);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  const methods = await r.paymentMethods(3628565);
  expect(Array.isArray(methods)).toBe(true);
  expect(t.calls[0]).toMatchObject({
    method: "GET",
    path: "checkouts/3628565/payment_methods.json",
  });
});

test("CheckoutResource.validate GETs checkouts/{id}/validate.json", async () => {
  const t = new FakeTransport(() => ({ valid: true }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  const result = await r.validate(3628565);
  expect(result).toEqual({ valid: true });
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "checkouts/3628565/validate.json" });
});

test("CheckoutResource.order POSTs to checkouts/{id}/order.json", async () => {
  const t = new FakeTransport(() => ({ id: 9999 }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  await r.order(3628565);
  expect(t.calls[0]).toMatchObject({ method: "POST", path: "checkouts/3628565/order.json" });
});

test("client.checkouts is a CheckoutResource", () => {
  const c = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  expect(c.checkouts).toBeInstanceOf(CheckoutResource);
  expect(typeof c.checkouts.list).toBe("function");
  expect(typeof c.checkouts.count).toBe("function");
  expect(typeof c.checkouts.get).toBe("function");
  expect(typeof c.checkouts.create).toBe("function");
  expect(typeof c.checkouts.update).toBe("function");
  expect(typeof c.checkouts.products).toBe("function");
  expect(typeof c.checkouts.shipmentMethods).toBe("function");
  expect(typeof c.checkouts.paymentMethods).toBe("function");
  expect(typeof c.checkouts.validate).toBe("function");
  expect(typeof c.checkouts.order).toBe("function");
});
