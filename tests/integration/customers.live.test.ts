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

maybe("live: customers.list returns an array", async () => {
  const items = await makeClient().customers.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
});

maybe("live: customers.count returns a number", async () => {
  const count = await makeClient().customers.count();
  expect(typeof count).toBe("number");
});

maybe("live: groups.list returns an array", async () => {
  const items = await makeClient().groups.list({ limit: 1 });
  expect(Array.isArray(items)).toBe(true);
});

maybe("live: groups.count returns a number", async () => {
  const count = await makeClient().groups.count();
  expect(typeof count).toBe("number");
});

maybe("live: groups.get parses the seeded group", async () => {
  const g = await makeClient().groups.get(69094);
  expect(g.id).toBe(69094);
});
