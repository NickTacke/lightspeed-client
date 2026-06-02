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

// orders (likely empty on test shop)
maybe("live: orders.list returns an array", async () => {
  const items = await makeClient().orders.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
});

maybe("live: orders.count returns a number", async () => {
  const count = await makeClient().orders.count();
  expect(typeof count).toBe("number");
});

maybe("live: orderEvents.list returns an array", async () => {
  const items = await makeClient().orderEvents.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
});

maybe("live: orderEvents.count returns a number", async () => {
  const count = await makeClient().orderEvents.count();
  expect(typeof count).toBe("number");
});

// quotes (likely empty on test shop)
maybe("live: quotes.list returns an array", async () => {
  const items = await makeClient().quotes.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
});

maybe("live: quotes.count returns a number", async () => {
  const count = await makeClient().quotes.count();
  expect(typeof count).toBe("number");
});

// invoices (likely empty on test shop)
maybe("live: invoices.list returns an array", async () => {
  const items = await makeClient().invoices.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
});

maybe("live: invoices.count returns a number", async () => {
  const count = await makeClient().invoices.count();
  expect(typeof count).toBe("number");
});

// shipments (likely empty on test shop)
maybe("live: shipments.list returns an array", async () => {
  const items = await makeClient().shipments.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
});

maybe("live: shipments.count returns a number", async () => {
  const count = await makeClient().shipments.count();
  expect(typeof count).toBe("number");
});

// returns (likely empty on test shop)
maybe("live: returns.list returns an array", async () => {
  const items = await makeClient().returns.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
});

maybe("live: returns.count returns a number", async () => {
  const count = await makeClient().returns.count();
  expect(typeof count).toBe("number");
});
