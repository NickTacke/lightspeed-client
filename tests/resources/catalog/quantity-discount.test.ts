import { expect, test } from "bun:test";
import { LightspeedClient } from "../../../src/index";
import {
  QuantityDiscountResource,
  quantityDiscountInputSchema,
  quantityDiscountSchema,
} from "../../../src/resources/catalog/quantity-discount";

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

test("quantityDiscountSchema parses the live shape (product/variant as numbers)", () => {
  const qd = quantityDiscountSchema.parse({
    id: 4107909,
    createdAt: "2026-06-02T10:24:43+02:00",
    updatedAt: "2026-06-02T10:24:44+02:00",
    product: 163090479,
    variant: 0,
    quantity: 10,
    price: 1.5,
    percentage: 0,
    isPercentage: false,
    customerGroup: 0,
    startDate: "2026-06-02T00:00:00+02:00",
    endDate: "2026-07-02T00:00:00+02:00",
  });
  expect(qd.id).toBe(4107909);
  expect(qd.product).toBe(163090479);
  expect(qd.isPercentage).toBe(false);
});

test("quantityDiscountInputSchema requires product and quantity", () => {
  expect(quantityDiscountInputSchema.safeParse({ product: 1 }).success).toBe(false);
  expect(quantityDiscountInputSchema.safeParse({ product: 1, quantity: 10 }).success).toBe(true);
});

test("client.quantityDiscounts is a top-level QuantityDiscountResource", () => {
  const c = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  expect(c.quantityDiscounts).toBeInstanceOf(QuantityDiscountResource);
});

test("quantityDiscounts.create POSTs quantity_discounts.json with quantityDiscount envelope", async () => {
  const t = new FakeTransport(() => ({
    quantityDiscount: { id: 1, createdAt: "x", updatedAt: "x", product: 1, quantity: 10 },
  }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new QuantityDiscountResource(t as any);
  await r.create({ product: 1, quantity: 10 });
  expect(t.calls[0]).toMatchObject({
    method: "POST",
    path: "quantity_discounts.json",
    body: { quantityDiscount: { product: 1, quantity: 10 } },
  });
});

test("quantityDiscounts.list GETs quantity_discounts.json reading quantityDiscounts", async () => {
  const t = new FakeTransport(() => ({ quantityDiscounts: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new QuantityDiscountResource(t as any);
  const list = await r.list({ product: 1 });
  expect(list).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "quantity_discounts.json" });
  expect(t.calls[0].query).toMatchObject({ product: 1 });
});
