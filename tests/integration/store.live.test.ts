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

maybe("live: account.get returns account shape", async () => {
  const a = await makeClient().account.get();
  expect(typeof a.id).toBe("number");
  expect(typeof a.apiKey).toBe("string");
});

maybe("live: account.permissions returns permissions object", async () => {
  const p = await makeClient().account.permissions();
  expect(typeof p).toBe("object");
  expect(p).not.toBeNull();
});

maybe("live: account.rateLimit returns rate limit object", async () => {
  const r = await makeClient().account.rateLimit();
  expect(typeof r).toBe("object");
  expect(r).not.toBeNull();
});

maybe("live: shop.get returns shop shape", async () => {
  const s = await makeClient().shop.get();
  expect(typeof s.id).toBe("number");
  expect(typeof s.country.code).toBe("string");
  expect(typeof s.currency.shortcode).toBe("string");
});

maybe("live: webhooks.list returns an array", async () => {
  const ws = await makeClient().webhooks.list();
  expect(Array.isArray(ws)).toBe(true);
});

maybe("live: webhooks.get parses the seeded webhook", async () => {
  const w = await makeClient().webhooks.get(4745101);
  expect(w.itemGroup).toBe("products");
});
