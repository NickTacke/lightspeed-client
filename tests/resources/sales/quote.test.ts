import { expect, test } from "bun:test";
import { LightspeedClient } from "../../../src/index";
import {
  QuotePaymentMethodResource,
  QuoteProductResource,
  QuoteResource,
  QuoteShippingMethodResource,
  quoteSchema,
} from "../../../src/resources/sales/quote";

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
  id: 1501464656,
  createdAt: "2026-01-01T00:00:00+00:00",
  updatedAt: "2026-01-02T00:00:00+00:00",
  productsQuantity: 1,
  paymentCountry: { id: 150, code: "nl", code3: "nld", title: "Netherlands, The" },
  shipmentId: "core|747283|3298308",
  customer: { resource: { id: 226983112, url: "x", link: "y" } },
};

test("quoteSchema parses the live-shaped fixture", () => {
  const q = quoteSchema.parse(sample);
  expect(q.id).toBe(1501464656);
  expect(q.productsQuantity).toBe(1);
  expect(
    (q.paymentCountry as { code: string } | false | undefined) !== false &&
      (q.paymentCountry as { code: string })?.code,
  ).toBe("nl");
});

test("quoteSchema: customer false still accepted", () => {
  const q = quoteSchema.parse({ ...sample, customer: false });
  expect(q.customer).toBe(false);
});

test("quoteSchema preserves unknown fields via passthrough", () => {
  const q = quoteSchema.parse({ ...sample, extra: "x" });
  expect((q as Record<string, unknown>).extra).toBe("x");
});

test("quoteSchema: country code parses correctly", () => {
  const q = quoteSchema.parse(sample);
  const country = q.paymentCountry as { id: number; code: string; code3: string; title: string };
  expect(country.code).toBe("nl");
  expect(country.id).toBe(150);
});

test("QuoteResource hits quotes.json with quotes envelope on list", async () => {
  const t = new FakeTransport(() => ({ quotes: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new QuoteResource(t as any);
  const result = await r.list();
  expect(result).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "quotes.json" });
});

test("QuoteResource.products(id) scoped to quotes/{id}/products", async () => {
  const t = new FakeTransport(() => ({ quoteProducts: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new QuoteResource(t as any);
  const prods = r.products(2001);
  expect(prods).toBeInstanceOf(QuoteProductResource);
  await prods.list();
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "quotes/2001/products.json" });
});

test("QuoteResource.shippingmethods(id) scoped to quotes/{id}/shippingmethods", async () => {
  const t = new FakeTransport(() => ({ quoteShippingmethods: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new QuoteResource(t as any);
  const sm = r.shippingmethods(2001);
  expect(sm).toBeInstanceOf(QuoteShippingMethodResource);
  await sm.list();
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "quotes/2001/shippingmethods.json" });
});

test("QuoteResource.paymentmethods(id) scoped to quotes/{id}/paymentmethods", async () => {
  const t = new FakeTransport(() => ({ quotePaymentmethods: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new QuoteResource(t as any);
  const pm = r.paymentmethods(2001);
  expect(pm).toBeInstanceOf(QuotePaymentMethodResource);
  await pm.list();
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "quotes/2001/paymentmethods.json" });
});

test("QuoteProductResource.create POSTs to quotes/{id}/products.json", async () => {
  const t = new FakeTransport(() => ({
    quoteProduct: {
      id: 1,
      createdAt: "2026-01-01T00:00:00+00:00",
      updatedAt: "2026-01-01T00:00:00+00:00",
    },
  }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new QuoteProductResource(t as any, "quotes/2001");
  await r.create({ variant: 999, quantity: 2 });
  expect(t.calls[0]).toMatchObject({
    method: "POST",
    path: "quotes/2001/products.json",
  });
});

test("client.quotes is a QuoteResource with create+update", () => {
  const c = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  expect(c.quotes).toBeInstanceOf(QuoteResource);
  expect(typeof c.quotes.list).toBe("function");
  expect(typeof c.quotes.create).toBe("function");
  expect(typeof c.quotes.update).toBe("function");
  // no delete confirmed in Postman
  expect((c.quotes as unknown as Record<string, unknown>).delete).toBeUndefined();
});
