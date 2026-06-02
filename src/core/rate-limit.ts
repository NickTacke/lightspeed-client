// tracks lightspeed's triple rolling-window headers (last-5min/hour/day) and
// computes how long to wait before the next request
interface Bucket {
  remaining: number;
  resetSec: number;
}

export class RateLimitTracker {
  private buckets: Bucket[] = [];

  update(headers: Headers): void {
    const rem = headers.get("x-ratelimit-remaining");
    const reset = headers.get("x-ratelimit-reset");
    if (!rem || !reset) return;
    const rs = rem.split("/").map(Number);
    const ts = reset.split("/").map(Number);
    if (rs.some(Number.isNaN) || ts.some(Number.isNaN)) return;
    if (rs.length !== ts.length) return;
    this.buckets = rs.map((r, i) => ({ remaining: r, resetSec: ts[i] ?? 0 }));
  }

  // ms to wait: 0 unless a bucket is empty, then its reset window
  delayMs(): number {
    let wait = 0;
    for (const b of this.buckets) {
      if (b.remaining <= 0) wait = Math.max(wait, b.resetSec * 1000);
    }
    return wait;
  }
}
