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
  t.update(headers("300/3000/12000", "299/2999/11999", "263/2063/23663"), 1000);
  expect(t.delayMs(1000)).toBe(0);
});

test("delayMs waits on the most-constrained empty bucket", () => {
  const t = new RateLimitTracker();
  t.update(headers("300/3000/12000", "0/2999/11999", "5/2063/23663"), 1000);
  // 5-min bucket empty, frees in 5s
  expect(t.delayMs(1000)).toBe(5000);
});

test("delayMs subtracts elapsed time", () => {
  const t = new RateLimitTracker();
  t.update(headers("300/3000/12000", "0/2999/11999", "5/2063/23663"), 1000);
  // 2s elapsed → 5000-2000
  expect(t.delayMs(3000)).toBe(3000);
  // past the window → clamped to 0
  expect(t.delayMs(7000)).toBe(0);
});

test("ignores missing/garbage headers (delay 0)", () => {
  const t = new RateLimitTracker();
  t.update(new Headers());
  expect(t.delayMs()).toBe(0);
});
