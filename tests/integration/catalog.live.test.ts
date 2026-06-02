import { expect, test } from "bun:test";
import { LightspeedClient } from "../../src/index";

const key = process.env.LS_KEY;
const secret = process.env.LS_SECRET;
const maybe = key && secret ? test : test.skip;

function makeClient() {
  return new LightspeedClient({
    apiKey: key as string,
    apiSecret: secret as string,
    language: "nl",
  });
}

// variants
maybe("live: variants.list returns typed variants", async () => {
  const items = await makeClient().variants.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
  expect(items.length).toBeGreaterThan(0);
  const v = items[0];
  if (!v) throw new Error("empty list");
  expect(typeof v.id).toBe("number");
  expect(typeof v.priceIncl).toBe("number");
});

maybe("live: variants.get returns a single variant", async () => {
  const [first] = await makeClient().variants.list({ limit: 1 });
  if (!first) throw new Error("no variants");
  const v = await makeClient().variants.get(first.id);
  expect(v.id).toBe(first.id);
});

maybe("live: variants.count returns a number", async () => {
  const count = await makeClient().variants.count();
  expect(typeof count).toBe("number");
  expect(count).toBeGreaterThan(0);
});

maybe("live: variants.metafields(id).list returns variant metafields", async () => {
  const [first] = await makeClient().variants.list({ limit: 1 });
  if (!first) throw new Error("no variants");
  const mfs = await makeClient().variants.metafields(first.id).list();
  expect(Array.isArray(mfs)).toBe(true);
});

maybe("live: variants.movements(id).list returns variant movements", async () => {
  const [first] = await makeClient().variants.list({ limit: 1 });
  if (!first) throw new Error("no variants");
  const mvs = await makeClient().variants.movements(first.id).list();
  expect(Array.isArray(mvs)).toBe(true);
});

// categories
maybe("live: categories.list returns typed categories", async () => {
  const items = await makeClient().categories.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
  expect(items.length).toBeGreaterThan(0);
  const c = items[0];
  if (!c) throw new Error("empty list");
  expect(typeof c.id).toBe("number");
  expect(typeof c.title).toBe("string");
});

maybe("live: categories.get returns a single category", async () => {
  const [first] = await makeClient().categories.list({ limit: 1 });
  if (!first) throw new Error("no categories");
  const c = await makeClient().categories.get(first.id);
  expect(c.id).toBe(first.id);
});

maybe("live: categories.count returns a number", async () => {
  const count = await makeClient().categories.count();
  expect(typeof count).toBe("number");
});

// brands
maybe("live: brands.list returns typed brands", async () => {
  const items = await makeClient().brands.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
  expect(items.length).toBeGreaterThan(0);
  const b = items[0];
  if (!b) throw new Error("empty list");
  expect(typeof b.id).toBe("number");
  expect(typeof b.title).toBe("string");
});

maybe("live: brands.get returns a single brand", async () => {
  const [first] = await makeClient().brands.list({ limit: 1 });
  if (!first) throw new Error("no brands");
  const b = await makeClient().brands.get(first.id);
  expect(b.id).toBe(first.id);
});

maybe("live: brands.count returns a number", async () => {
  const count = await makeClient().brands.count();
  expect(typeof count).toBe("number");
});

// types (empty on test shop, but count should work)
maybe("live: types.list returns an array", async () => {
  const items = await makeClient().types.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
});

maybe("live: types.count returns a number", async () => {
  const count = await makeClient().types.count();
  expect(typeof count).toBe("number");
});

// attributes (empty on test shop)
maybe("live: attributes.list returns an array", async () => {
  const items = await makeClient().attributes.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
});

maybe("live: attributes.count returns a number", async () => {
  const count = await makeClient().attributes.count();
  expect(typeof count).toBe("number");
});

// tags
maybe("live: tags.list returns typed tags", async () => {
  const items = await makeClient().tags.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
  expect(items.length).toBeGreaterThan(0);
  const t = items[0];
  if (!t) throw new Error("empty list");
  expect(typeof t.id).toBe("number");
  expect(typeof t.title).toBe("string");
});

maybe("live: tags.get returns a single tag", async () => {
  const [first] = await makeClient().tags.list({ limit: 1 });
  if (!first) throw new Error("no tags");
  const t = await makeClient().tags.get(first.id);
  expect(t.id).toBe(first.id);
});

maybe("live: tags.count returns a number", async () => {
  const count = await makeClient().tags.count();
  expect(typeof count).toBe("number");
});
