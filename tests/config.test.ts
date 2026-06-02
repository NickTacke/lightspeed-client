import { expect, test } from "bun:test";
import { resolveConfig } from "../src/config";

test("resolves eu1 base url + defaults", () => {
  const c = resolveConfig({ apiKey: "k", apiSecret: "s", language: "nl" });
  expect(c.baseUrl).toBe("https://api.webshopapp.com");
  expect(c.language).toBe("nl");
  expect(c.timeoutMs).toBe(60_000);
  expect(c.retry.retryMethods).toEqual(["GET", "PUT", "DELETE"]);
  expect(c.proactive).toBe(true);
});

test("us1 cluster maps to shoplightspeed", () => {
  const c = resolveConfig({ apiKey: "k", apiSecret: "s", language: "en", cluster: "us1" });
  expect(c.baseUrl).toBe("https://api.shoplightspeed.com");
});

test("throws without credentials or language", () => {
  // @ts-expect-error missing fields
  expect(() => resolveConfig({ apiKey: "k" })).toThrow();
});
