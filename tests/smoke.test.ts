import { expect, test } from "bun:test";
import { LightspeedClient } from "../src/index";

const stubFetch = (async () => new Response("{}")) as unknown as typeof fetch;

test("constructs with required options", () => {
  const c = new LightspeedClient({
    apiKey: "k",
    apiSecret: "s",
    language: "nl",
    fetch: stubFetch,
  });
  expect(c).toBeInstanceOf(LightspeedClient);
});
