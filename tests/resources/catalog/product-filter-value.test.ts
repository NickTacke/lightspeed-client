import { expect, test } from "bun:test";
import { ProductResource } from "../../../src/resources/catalog/product";
import {
  ProductFilterValueResource,
  productFilterValueSchema,
} from "../../../src/resources/catalog/product-filter-value";

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

test("productFilterValueSchema parses the live shape", () => {
  const fv = productFilterValueSchema.parse({
    id: 1,
    filter: { resource: { id: 1, url: "filters/1", link: "https://x" } },
    filtervalue: { resource: { id: 2, url: "filtervalues/2", link: "https://x" } },
  });
  expect(fv.filter?.resource.id).toBe(1);
  expect(fv.filtervalue?.resource.id).toBe(2);
});

test("products.filterValues(5).create POSTs with productFiltervalue envelope", async () => {
  const t = new FakeTransport(() => ({ productFiltervalue: { id: 1 } }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ProductResource(t as any);
  const fvs = r.filterValues(5);
  expect(fvs).toBeInstanceOf(ProductFilterValueResource);
  expect(typeof fvs.paginate).toBe("function");
  await fvs.create({ filter: 1, filtervalue: 2 });
  expect(t.calls[0]).toMatchObject({
    method: "POST",
    path: "products/5/filtervalues.json",
    body: { productFiltervalue: { filter: 1, filtervalue: 2 } },
  });
});

test("products.filterValues(5).list reads the productFiltervalue (non-pluralized) key", async () => {
  const t = new FakeTransport(() => ({ productFiltervalue: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ProductResource(t as any);
  const list = await r.filterValues(5).list();
  expect(list).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "products/5/filtervalues.json" });
});

test("products.filterValues(5) has no update method", () => {
  const t = new FakeTransport(() => ({}));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ProductResource(t as any);
  expect((r.filterValues(5) as unknown as Record<string, unknown>).update).toBeUndefined();
});
