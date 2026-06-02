import { expect, test } from "bun:test";
import { basicAuthHeader } from "../../src/core/base64";

test("basicAuthHeader encodes key:secret as base64 Basic", () => {
  // "key:secret" -> base64
  expect(basicAuthHeader("key", "secret")).toBe("Basic a2V5OnNlY3JldA==");
});
