import { expect, test } from "bun:test";
import { ProductResource } from "../../../src/resources/catalog/product";
import {
  ProductAttributeResource,
  productAttributeSchema,
} from "../../../src/resources/catalog/product-attribute";

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

test("productAttributeSchema parses a conservative shape", () => {
  const a = productAttributeSchema.parse({ id: 1, value: "x" });
  expect(a.id).toBe(1);
  expect(a.value).toBe("x");
});

test("products.attributes(5).update PUTs products/5/attributes/7.json with productAttribute envelope", async () => {
  const t = new FakeTransport(() => ({ productAttribute: { id: 7 } }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ProductResource(t as any);
  const attrs = r.attributes(5);
  expect(attrs).toBeInstanceOf(ProductAttributeResource);
  expect(typeof attrs.paginate).toBe("function");
  await attrs.update(7, { value: "x" });
  expect(t.calls[0]).toMatchObject({
    method: "PUT",
    path: "products/5/attributes/7.json",
    body: { productAttribute: { value: "x" } },
  });
});

test("products.attributes(5).list reads productAttributes", async () => {
  const t = new FakeTransport(() => ({ productAttributes: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ProductResource(t as any);
  const list = await r.attributes(5).list();
  expect(list).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "products/5/attributes.json" });
});

test("products.attributes(5) has no create method (API returns 405 on POST)", () => {
  const t = new FakeTransport(() => ({}));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ProductResource(t as any);
  expect((r.attributes(5) as unknown as Record<string, unknown>).create).toBeUndefined();
});
