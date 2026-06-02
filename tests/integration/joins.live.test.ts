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

maybe("live: categoriesProducts.list returns an array", async () => {
  const items = await makeClient().categoriesProducts.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
});

maybe("live: categoriesProducts.list returns typed records", async () => {
  const items = await makeClient().categoriesProducts.list({ limit: 5 });
  expect(Array.isArray(items)).toBe(true);
  expect(items.length).toBeGreaterThan(0);
  const r = items[0];
  if (!r) throw new Error("empty list");
  expect(typeof r.id).toBe("number");
  expect(typeof r.sortOrder).toBe("number");
});

maybe("live: categoriesProducts.get returns a single record", async () => {
  const [first] = await makeClient().categoriesProducts.list({ limit: 1 });
  if (!first) throw new Error("no records");
  const r = await makeClient().categoriesProducts.get(first.id);
  expect(r.id).toBe(first.id);
});

maybe("live: categoriesProducts.count returns a number", async () => {
  const count = await makeClient().categoriesProducts.count();
  expect(typeof count).toBe("number");
  expect(count).toBeGreaterThan(0);
});

maybe("live: categoriesProducts.list with product filter returns an array", async () => {
  const [first] = await makeClient().categoriesProducts.list({ limit: 1 });
  if (!first) throw new Error("no records");
  const productId = first.product.resource.id;
  if (typeof productId !== "number") throw new Error("product id is false");
  const items = await makeClient().categoriesProducts.list({ product: productId });
  expect(Array.isArray(items)).toBe(true);
  expect(items.length).toBeGreaterThan(0);
});

maybe("live: tagsProducts.list returns an array", async () => {
  const items = await makeClient().tagsProducts.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
});

maybe("live: tagsProducts.count returns a number", async () => {
  const count = await makeClient().tagsProducts.count();
  expect(typeof count).toBe("number");
});

maybe("live: groupsCustomers.list returns an array", async () => {
  const items = await makeClient().groupsCustomers.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
});

maybe("live: groupsCustomers.count returns a number", async () => {
  const count = await makeClient().groupsCustomers.count();
  expect(typeof count).toBe("number");
});
