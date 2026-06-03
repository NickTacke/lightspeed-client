import { expect, test } from "bun:test";
import { LightspeedClient } from "../../../src/index";
import {
  TypeAttributeResource,
  typeAttributeSchema,
} from "../../../src/resources/catalog/type-attribute";

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
  id: 5,
  sortOrder: null,
  type: { resource: { id: 252474, url: "types/252474", link: "x" } },
  attribute: { resource: { id: 2, url: "attributes/2", link: "x" } },
};

test("typeAttributeSchema parses the live shape", () => {
  const ta = typeAttributeSchema.parse(sample);
  expect(ta.id).toBe(5);
  expect(ta.sortOrder).toBeNull();
  expect(ta.type?.resource.id).toBe(252474);
  expect(ta.attribute?.resource.id).toBe(2);
});

test("TypeAttributeResource.list hits types/attributes.json with typesAttributes envelope", async () => {
  const t = new FakeTransport(() => ({ typesAttributes: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new TypeAttributeResource(t as any);
  const result = await r.list();
  expect(result).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "types/attributes.json" });
});

test("TypeAttributeResource.get reads singular typesAttribute envelope", async () => {
  const t = new FakeTransport(() => ({ typesAttribute: sample }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new TypeAttributeResource(t as any);
  const ta = await r.get(5);
  expect(ta.id).toBe(5);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "types/attributes/5.json" });
});

test("TypeAttributeResource.create POSTs singular wrapper and unwraps pluralized response", async () => {
  // key asymmetry: request body wrapper is singular, but create response is pluralized
  const t = new FakeTransport(() => ({ typesAttributes: { ...sample, id: 5 } }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new TypeAttributeResource(t as any);
  const created = await r.create({ type: 1, attribute: 2 });
  expect(created.id).toBe(5);
  expect(t.calls[0]).toMatchObject({
    method: "POST",
    path: "types/attributes.json",
    body: { typesAttribute: { type: 1, attribute: 2 } },
  });
});

test("TypeAttributeResource has no update method", () => {
  const c = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  expect((c.typeAttributes as unknown as Record<string, unknown>).update).toBeUndefined();
});

test("client.typeAttributes is a TypeAttributeResource", () => {
  const c = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  expect(c.typeAttributes).toBeInstanceOf(TypeAttributeResource);
  expect(typeof c.typeAttributes.list).toBe("function");
  expect(typeof c.typeAttributes.get).toBe("function");
  expect(typeof c.typeAttributes.create).toBe("function");
  expect(typeof c.typeAttributes.delete).toBe("function");
});
