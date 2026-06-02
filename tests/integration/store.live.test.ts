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

maybe("live: account.get returns account with id 389694", async () => {
  const a = await makeClient().account.get();
  expect(a.id).toBe(389694);
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

maybe("live: shop.get returns shop with id 356891", async () => {
  const s = await makeClient().shop.get();
  expect(s.id).toBe(356891);
  expect(s.country.code).toBe("nl");
  expect(s.currency.shortcode).toBe("EUR");
});

maybe("live: webhooks.list returns an array", async () => {
  const ws = await makeClient().webhooks.list();
  expect(Array.isArray(ws)).toBe(true);
});
