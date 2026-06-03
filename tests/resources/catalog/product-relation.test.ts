import { expect, test } from "bun:test";
import { ProductResource } from "../../../src/resources/catalog/product";
import {
  ProductRelationResource,
  productRelationSchema,
} from "../../../src/resources/catalog/product-relation";

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

test("productRelationSchema parses the live shape", () => {
  const r = productRelationSchema.parse({
    id: 1,
    sortOrder: 0,
    relatedProduct: { resource: { id: 9, url: "products/9", link: "https://x" } },
  });
  expect(r.id).toBe(1);
  expect(r.relatedProduct?.resource.id).toBe(9);
});

test("products.relations(5).create POSTs products/5/relations.json with productRelation envelope", async () => {
  const t = new FakeTransport(() => ({ productRelation: { id: 1 } }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ProductResource(t as any);
  const rels = r.relations(5);
  expect(rels).toBeInstanceOf(ProductRelationResource);
  expect(typeof rels.paginate).toBe("function");
  await rels.create({ relatedProduct: 9 });
  expect(t.calls[0]).toMatchObject({
    method: "POST",
    path: "products/5/relations.json",
    body: { productRelation: { relatedProduct: 9 } },
  });
});

test("products.relations(5).list GETs products/5/relations.json reading productRelations", async () => {
  const t = new FakeTransport(() => ({ productRelations: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ProductResource(t as any);
  const list = await r.relations(5).list();
  expect(list).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "products/5/relations.json" });
});

test("products.relations(5).update PUTs with sortOrder", async () => {
  const t = new FakeTransport(() => ({ productRelation: { id: 7 } }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ProductResource(t as any);
  await r.relations(5).update(7, { sortOrder: 3 });
  expect(t.calls[0]).toMatchObject({
    method: "PUT",
    path: "products/5/relations/7.json",
    body: { productRelation: { sortOrder: 3 } },
  });
});
