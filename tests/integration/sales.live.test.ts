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

maybe("live: orderCustomStatuses.list parses", async () => {
  expect(Array.isArray(await makeClient().orderCustomStatuses.list())).toBe(true);
});

maybe("live: orderCustomStatuses.get parses", async () => {
  const cs = await makeClient().orderCustomStatuses.get(85508);
  expect(cs.id).toBe(85508);
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

// checkouts (likely empty on test shop — api returns bare array, no envelope)
maybe("live: checkouts.list returns an array", async () => {
  const items = await makeClient().checkouts.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
});

maybe("live: checkouts.count returns a number", async () => {
  const count = await makeClient().checkouts.count();
  expect(typeof count).toBe("number");
});

maybe("live: checkouts.list returns camelCase checkouts", async () => {
  const items = await makeClient().checkouts.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
  if (items[0]) {
    expect(items[0]).not.toHaveProperty("created_at");
    expect(items[0]).toHaveProperty("createdAt");
  }
});

maybe("live: orders.get parses the seeded order (ORD00001)", async () => {
  const order = await makeClient().orders.get(315967958);
  expect(order.number).toBe("ORD00001");
  expect(order.id).toBe(315967958);
});

maybe("live: orders.products(id).list parses order products", async () => {
  const items = await makeClient().orders.products(315967958).list();
  expect(items.length).toBeGreaterThan(0);
  expect(typeof items[0]?.quantityOrdered).toBe("number");
});

maybe("live: orderEvents.list parses real events for the order", async () => {
  const events = await makeClient().orderEvents.list({ order: 315967958 });
  expect(events.length).toBeGreaterThan(0);
  expect(typeof events[0]?.type).toBe("string");
});

maybe("live: invoices.get parses the seeded invoice", async () => {
  const inv = await makeClient().invoices.get(332615050);
  expect(inv.number).toBe("INV00001");
});

maybe("live: shipments.get parses the seeded shipment", async () => {
  const sh = await makeClient().shipments.get(305761114);
  expect(sh.number).toBe("SHIP00001");
});

maybe("live: quotes.get parses the seeded quote", async () => {
  const q = await makeClient().quotes.get(1501464656);
  expect(q.id).toBe(1501464656);
  expect(typeof q.productsQuantity).toBe("number");
});
