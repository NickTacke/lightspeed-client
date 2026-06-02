import { expect, test } from "bun:test";
import { LightspeedClient } from "../../src/index";

const key = process.env.LS_KEY;
const secret = process.env.LS_SECRET;
const maybe = key && secret ? test : test.skip;

// only called inside `maybe` tests, so key/secret are guaranteed non-empty here
function makeClient() {
  return new LightspeedClient({
    apiKey: key as string,
    apiSecret: secret as string,
    language: "nl",
  });
}

maybe("live: products.list returns typed products", async () => {
  const products = await makeClient().products.list({ limit: 1 });
  expect(Array.isArray(products)).toBe(true);
  expect(products.length).toBeGreaterThan(0);
  const p = products[0];
  if (!p) throw new Error("empty list");
  expect(typeof p.id).toBe("number");
  expect(typeof p.title).toBe("string");
  expect(["hidden", "visible", "auto"]).toContain(p.visibility);
});

maybe("live: products.get returns a single typed product", async () => {
  const [first] = await makeClient().products.list({ limit: 1 });
  if (!first) throw new Error("no products in live shop");
  const p = await makeClient().products.get(first.id);
  expect(p.id).toBe(first.id);
});

maybe("live: products.count returns a number", async () => {
  const count = await makeClient().products.count();
  expect(typeof count).toBe("number");
  expect(count).toBeGreaterThan(0);
});

maybe("live: products.images(id).list returns product images", async () => {
  const c = makeClient();
  const [first] = await c.products.list({ limit: 1 });
  if (!first) throw new Error("no products in live shop");
  const images = await c.products.images(first.id).list();
  expect(Array.isArray(images)).toBe(true);
});

maybe("live: products.metafields(id).list returns metafields", async () => {
  const c = makeClient();
  const [first] = await c.products.list({ limit: 1 });
  if (!first) throw new Error("no products in live shop");
  const mfs = await c.products.metafields(first.id).list();
  expect(Array.isArray(mfs)).toBe(true);
});
