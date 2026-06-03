import { expect, test } from "bun:test";
import { LightspeedClient } from "../../../src/index";
import {
  CheckoutProductResource,
  CheckoutResource,
  checkoutOrderResultSchema,
  checkoutProductInputSchema,
  checkoutProductSchema,
  checkoutSchema,
  checkoutValidateSchema,
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

// wire sample (snake_case) as the api would return it
const wireCheckout = {
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

const wireCheckoutProduct = {
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

test("checkoutSchema parses a camelCase checkout", () => {
  const c = checkoutSchema.parse({ id: 1, createdAt: "x", orderId: null });
  expect(c.id).toBe(1);
  expect(c.createdAt).toBe("x");
  expect(c.orderId).toBeNull();
});

test("checkoutSchema preserves unknown snake fields via passthrough", () => {
  const c = checkoutSchema.parse({ id: 1, extra_field: "x" });
  expect((c as Record<string, unknown>).extra_field).toBe("x");
});

test("checkoutProductSchema parses a camelCase product", () => {
  const p = checkoutProductSchema.parse({ id: 101, variantId: 300, quantity: 2 });
  expect(p.id).toBe(101);
  expect(p.variantId).toBe(300);
  expect(p.quantity).toBe(2);
});

test("checkoutProductInputSchema requires variantId + quantity", () => {
  expect(checkoutProductInputSchema.parse({ variantId: 1, quantity: 1 })).toEqual({
    variantId: 1,
    quantity: 1,
  });
  expect(checkoutProductInputSchema.safeParse({ variant_id: 1, quantity: 1 }).success).toBe(false);
});

test("CheckoutResource.list GETs checkouts.json and returns camelCase from snake array", async () => {
  const t = new FakeTransport(() => [wireCheckout]);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  const result = await r.list();
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "checkouts.json" });
  expect(result).toHaveLength(1);
  expect(result[0]?.createdAt).toBe("2019-09-13T17:57:36+00:00");
  expect(result[0]?.orderId).toBeNull();
  expect((result[0] as Record<string, unknown>).created_at).toBeUndefined();
  expect((result[0] as Record<string, unknown>).order_id).toBeUndefined();
});

test("CheckoutResource.count GETs checkouts/count.json", async () => {
  const t = new FakeTransport(() => ({ count: 0 }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  const count = await r.count();
  expect(count).toBe(0);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "checkouts/count.json" });
});

test("CheckoutResource.get GETs checkouts/{id}.json and returns camelCase", async () => {
  const t = new FakeTransport(() => wireCheckout);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  const c = await r.get(3628565);
  expect(c.id).toBe(3628565);
  expect(c.createdAt).toBe("2019-09-13T17:57:36+00:00");
  expect((c as Record<string, unknown>).created_at).toBeUndefined();
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "checkouts/3628565.json" });
});

test("get re-cases nested shipment/payment method and products to camelCase", async () => {
  const wire = {
    id: 1,
    created_at: "x",
    order_id: null,
    shipment_method: { id: "core|1|1", price_incl: 5, tax_rate: 0.21, is_service_point: false },
    payment_method: { id: "pickup", post_payment: true, price_incl: 0 },
    products: [{ id: 9, variant_id: 7, price_incl: 5, article_code: "A1" }],
  };
  const t = new FakeTransport(() => wire);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  const co = await r.get(1);
  expect(co.shipmentMethod?.priceIncl).toBe(5);
  expect(co.shipmentMethod?.isServicePoint).toBe(false);
  expect(co.paymentMethod?.postPayment).toBe(true);
  expect(co.products?.[0]?.variantId).toBe(7);
  expect(co.products?.[0]?.priceIncl).toBe(5);
  // snake keys must be gone from the nested objects
  expect(co.shipmentMethod).not.toHaveProperty("price_incl");
  expect(co.products?.[0]).not.toHaveProperty("variant_id");
});

test("CheckoutResource.create POSTs camelCase input as snake wire body", async () => {
  const t = new FakeTransport(() => wireCheckout);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  await r.create({ mode: "guest", shipmentMethod: "core|1|2" });
  expect(t.calls[0]).toMatchObject({
    method: "POST",
    path: "checkouts.json",
    body: { mode: "guest", shipment_method: "core|1|2" },
  });
  expect((t.calls[0].body as Record<string, unknown>).shipmentMethod).toBeUndefined();
});

test("CheckoutResource.update PUTs snake wire body (shipmentMethod -> shipment_method)", async () => {
  const t = new FakeTransport(() => wireCheckout);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  await r.update(3628565, { shipmentMethod: "core|1|2", paymentMethod: { id: "pickup" } });
  expect(t.calls[0]).toMatchObject({
    method: "PUT",
    path: "checkouts/3628565.json",
    body: { shipment_method: "core|1|2", payment_method: { id: "pickup" } },
  });
});

test("CheckoutResource.products(id) returns CheckoutProductResource", () => {
  const t = new FakeTransport(() => ({}));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  expect(r.products(3628565)).toBeInstanceOf(CheckoutProductResource);
});

test("CheckoutProductResource.add POSTs snake wire body {variant_id, quantity}", async () => {
  const t = new FakeTransport(() => wireCheckoutProduct);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutProductResource(t as any, "checkouts/3628565");
  const p = await r.add({ variantId: 300, quantity: 2 });
  expect(t.calls[0]).toMatchObject({
    method: "POST",
    path: "checkouts/3628565/products.json",
    body: { variant_id: 300, quantity: 2 },
  });
  expect((t.calls[0].body as Record<string, unknown>).variantId).toBeUndefined();
  // response mapped back to camelCase
  expect(p.variantId).toBe(300);
  expect((p as Record<string, unknown>).variant_id).toBeUndefined();
});

test("CheckoutProductResource.update PUTs {id}.json and maps response", async () => {
  const t = new FakeTransport(() => wireCheckoutProduct);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutProductResource(t as any, "checkouts/3628565");
  const p = await r.update(101, { quantity: 3 });
  expect(t.calls[0]).toMatchObject({
    method: "PUT",
    path: "checkouts/3628565/products/101.json",
    body: { quantity: 3 },
  });
  expect(p.cartId).toBe(42);
});

test("CheckoutProductResource.remove DELETEs {id}.json", async () => {
  const t = new FakeTransport(() => undefined);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutProductResource(t as any, "checkouts/3628565");
  await r.remove(101);
  expect(t.calls[0]).toMatchObject({
    method: "DELETE",
    path: "checkouts/3628565/products/101.json",
  });
});

test("CheckoutResource.shipmentMethods GETs and maps elements to camelCase", async () => {
  const t = new FakeTransport(() => [
    { id: "core|1|2", title: "PostNL", price_incl: 4.95, is_service_point: false },
  ]);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  const methods = await r.shipmentMethods(3628565);
  expect(t.calls[0]).toMatchObject({
    method: "GET",
    path: "checkouts/3628565/shipment_methods.json",
  });
  expect(methods[0]?.priceIncl).toBe(4.95);
  expect(methods[0]?.isServicePoint).toBe(false);
  expect((methods[0] as Record<string, unknown>).price_incl).toBeUndefined();
});

test("CheckoutResource.paymentMethods GETs and maps elements (method:false tolerated)", async () => {
  const t = new FakeTransport(() => [
    { id: "pickup", method: false, post_payment: false, price_incl: 0 },
  ]);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  const methods = await r.paymentMethods(3628565);
  expect(t.calls[0]).toMatchObject({
    method: "GET",
    path: "checkouts/3628565/payment_methods.json",
  });
  expect(methods[0]?.method).toBe(false);
  expect(methods[0]?.postPayment).toBe(false);
  expect((methods[0] as Record<string, unknown>).post_payment).toBeUndefined();
});

test("CheckoutResource.validate parses and preserves dynamic error keys verbatim", async () => {
  const t = new FakeTransport(() => ({
    validated: false,
    errors: { "shipping_address.address1.required": "x" },
  }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  const result = await r.validate(3628565);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "checkouts/3628565/validate.json" });
  expect(result.validated).toBe(false);
  expect((result.errors as Record<string, string>)["shipping_address.address1.required"]).toBe("x");
});

test("checkoutValidateSchema accepts empty errors array", () => {
  const v = checkoutValidateSchema.parse({ validated: true, errors: [] });
  expect(v.validated).toBe(true);
  expect(v.errors).toEqual([]);
});

test("CheckoutResource.order POSTs and maps order_id -> orderId", async () => {
  const t = new FakeTransport(() => ({
    order_id: 9999,
    payment_url: "https://pay",
    payment_provider: "mollie",
  }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CheckoutResource(t as any);
  const result = await r.order(3628565);
  expect(t.calls[0]).toMatchObject({ method: "POST", path: "checkouts/3628565/order.json" });
  expect(result.orderId).toBe(9999);
  expect(result.paymentUrl).toBe("https://pay");
  expect(result.paymentProvider).toBe("mollie");
  expect((result as Record<string, unknown>).order_id).toBeUndefined();
});

test("checkoutOrderResultSchema requires orderId", () => {
  expect(checkoutOrderResultSchema.safeParse({ paymentUrl: "x" }).success).toBe(false);
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
