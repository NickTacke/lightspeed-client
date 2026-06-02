// tracks lightspeed's triple rolling-window headers (last-5min/hour/day) and
// computes how long to wait before the next request
interface Bucket {
  remaining: number;
  resetSec: number;
}

export class RateLimitTracker {
  private buckets: Bucket[] = [];
  private lastUpdatedMs = 0;

  update(headers: Headers, nowMs: number = Date.now()): void {
    const rem = headers.get("x-ratelimit-remaining");
    const reset = headers.get("x-ratelimit-reset");
    if (!rem || !reset) return;
    const rs = rem.split("/").map(Number);
    const ts = reset.split("/").map(Number);
    if (rs.some(Number.isNaN) || ts.some(Number.isNaN)) return;
    if (rs.length !== ts.length) return;
    this.buckets = rs.map((r, i) => ({ remaining: r, resetSec: ts[i] ?? 0 }));
    this.lastUpdatedMs = nowMs;
  }

  // ms to wait when a bucket is empty; reset values are seconds-remaining (live: 263/2063/23663), minus elapsed since update
  delayMs(nowMs: number = Date.now()): number {
    const elapsed = nowMs - this.lastUpdatedMs;
    let wait = 0;
    for (const b of this.buckets) {
      if (b.remaining <= 0) wait = Math.max(wait, b.resetSec * 1000 - elapsed);
    }
    return Math.max(0, wait);
  }
}
