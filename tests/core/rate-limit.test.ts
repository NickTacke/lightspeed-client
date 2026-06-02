import { expect, test } from "bun:test";
import { RateLimitTracker } from "../../src/core/rate-limit";

const headers = (limit: string, remaining: string, reset: string) =>
  new Headers({
    "x-ratelimit-limit": limit,
    "x-ratelimit-remaining": remaining,
    "x-ratelimit-reset": reset,
  });

test("delayMs is 0 when buckets have headroom", () => {
  const t = new RateLimitTracker();
  t.update(headers("300/3000/12000", "299/2999/11999", "263/2063/23663"));
  expect(t.delayMs()).toBe(0);
});

test("delayMs waits on the most-constrained empty bucket", () => {
  const t = new RateLimitTracker();
  t.update(headers("300/3000/12000", "0/2999/11999", "5/2063/23663"));
  // 5-min bucket empty, frees in 5s
  expect(t.delayMs()).toBe(5000);
});

test("ignores missing/garbage headers (delay 0)", () => {
  const t = new RateLimitTracker();
  t.update(new Headers());
  expect(t.delayMs()).toBe(0);
});
