import type { ResolvedConfig } from "../config";
import { basicAuthHeader } from "./base64";
import { LightspeedApiError, LightspeedTimeoutError, parseError } from "./errors";
import { RateLimitTracker } from "./rate-limit";
import type { HttpMethod, Query, RequestContext } from "./types";

export interface SendArgs {
  method: HttpMethod;
  path: string; // e.g. "products.json" (already derived; no language/base)
  query?: Query | undefined;
  body?: unknown;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class Transport {
  private readonly limiter = new RateLimitTracker();
  constructor(private readonly cfg: ResolvedConfig) {}

  private buildUrl(args: SendArgs): string {
    const url = new URL(`${this.cfg.baseUrl}/${this.cfg.language}/${args.path}`);
    for (const [k, v] of Object.entries(args.query ?? {})) {
      if (v === undefined) continue;
      url.searchParams.append(k, String(v));
    }
    return url.toString();
  }

  async send<T = unknown>(args: SendArgs): Promise<T> {
    const url = this.buildUrl(args);
    const headers: Record<string, string> = {
      Authorization: basicAuthHeader(this.cfg.apiKey, this.cfg.apiSecret),
      Accept: "application/json",
    };
    if (args.body !== undefined) headers["Content-Type"] = "application/json";
    const ctx: RequestContext = { method: args.method, url, headers, body: args.body };

    const canRetry = this.cfg.retry.retryMethods.includes(args.method);
    let attempt = 0;
    let skipThrottle = false;
    while (true) {
      if (this.cfg.proactive && !skipThrottle) {
        const wait = this.limiter.delayMs();
        if (wait > 0) await sleep(wait);
      }
      skipThrottle = false;
      await this.cfg.hooks.onRequest?.(ctx);
      const controller = new AbortController();
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, this.cfg.timeoutMs);
      try {
        const res = await this.cfg.fetch(url, {
          method: args.method,
          headers,
          body: args.body !== undefined ? JSON.stringify(args.body) : undefined,
          signal: controller.signal,
        });
        clearTimeout(timer);
        this.limiter.update(res.headers);
        const text = await res.text();
        const headerObj = Object.fromEntries(res.headers.entries());
        let body: unknown;
        try {
          body = text ? JSON.parse(text) : undefined;
        } catch {
          if (!res.ok) {
            if (
              canRetry &&
              this.cfg.retry.retryStatuses.includes(res.status) &&
              attempt < this.cfg.retry.maxRetries
            ) {
              attempt++;
              await sleep(this.retryDelay(attempt, res.status, headerObj));
              skipThrottle = true;
              continue;
            }
            const err = parseError(res.status, text, headerObj);
            await this.cfg.hooks.onError?.(err);
            throw err;
          }
          const e = new LightspeedApiError(
            res.status,
            "invalid json response",
            undefined,
            undefined,
            text,
          );
          await this.cfg.hooks.onError?.(e);
          throw e;
        }
        if (res.ok) {
          await this.cfg.hooks.onResponse?.({ request: ctx, status: res.status, body });
          return body as T;
        }
        if (
          canRetry &&
          this.cfg.retry.retryStatuses.includes(res.status) &&
          attempt < this.cfg.retry.maxRetries
        ) {
          attempt++;
          await sleep(this.retryDelay(attempt, res.status, headerObj));
          skipThrottle = true;
          continue;
        }
        const e = parseError(res.status, body, headerObj);
        await this.cfg.hooks.onError?.(e);
        throw e;
      } catch (e) {
        clearTimeout(timer);
        if (e instanceof LightspeedApiError) throw e;
        if (canRetry && this.isRetryable(e) && attempt < this.cfg.retry.maxRetries) {
          attempt++;
          await sleep(this.cfg.retry.backoffFactor * 2 ** (attempt - 1) * 100);
          skipThrottle = true;
          continue;
        }
        const surfaced = timedOut ? new LightspeedTimeoutError(this.cfg.timeoutMs) : e;
        await this.cfg.hooks.onError?.(surfaced);
        throw surfaced;
      }
    }
  }

  private retryDelay(attempt: number, status: number, headers: Record<string, string>): number {
    if (status === 429) {
      const ra = Number(headers["retry-after"]);
      if (Number.isFinite(ra)) return ra * 1000;
    }
    return this.cfg.retry.backoffFactor * 2 ** (attempt - 1) * 100;
  }

  private isRetryable(e: unknown): boolean {
    if ((e as { name?: string })?.name === "AbortError") return true;
    if (!(e instanceof TypeError)) return false;
    const msg = `${e.message} ${String((e as { cause?: unknown }).cause ?? "")}`.toLowerCase();
    return /fetch|network|connect|econn|enotfound|socket|timeout|terminated/.test(msg);
  }
}
