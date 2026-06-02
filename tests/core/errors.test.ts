import { expect, test } from "bun:test";
import {
  LightspeedApiError,
  LightspeedAuthError,
  LightspeedNotFoundError,
  LightspeedRateLimitError,
  LightspeedServerError,
  parseError,
} from "../../src/core/errors";

test("401 -> LightspeedAuthError with message from error envelope", () => {
  const e = parseError(401, { error: { code: 401, message: "Access denied." } });
  expect(e).toBeInstanceOf(LightspeedAuthError);
  expect(e.status).toBe(401);
  expect(e.message).toBe("Access denied.");
});

test("404 -> LightspeedNotFoundError", () => {
  const e = parseError(404, { error: { code: 404, message: "Unknown or inactive language." } });
  expect(e).toBeInstanceOf(LightspeedNotFoundError);
});

test("429 -> LightspeedRateLimitError with retryAfter from header", () => {
  const e = parseError(429, { error: { message: "rate limited" } }, { "retry-after": "12" });
  expect(e).toBeInstanceOf(LightspeedRateLimitError);
  expect((e as LightspeedRateLimitError).retryAfter).toBe(12);
});

test("500 -> LightspeedServerError; raw preserved", () => {
  const body = { error: { code: 500, message: "boom" } };
  const e = parseError(500, body);
  expect(e).toBeInstanceOf(LightspeedServerError);
  expect(e.raw).toEqual(body);
});

test("falls back gracefully on unknown body", () => {
  const e = parseError(418, "teapot");
  expect(e).toBeInstanceOf(LightspeedApiError);
  expect(e.status).toBe(418);
});
