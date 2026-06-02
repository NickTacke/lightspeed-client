import type { Cluster, Hooks, HttpMethod, RetryOptions } from "./core/types";

export interface LightspeedClientOptions {
  apiKey: string;
  apiSecret: string;
  language: string;
  cluster?: Cluster;
  fetch?: typeof fetch;
  timeoutMs?: number;
  rateLimit?: { proactive?: boolean };
  retry?: Partial<RetryOptions>;
  hooks?: Hooks;
}

export interface ResolvedConfig {
  apiKey: string;
  apiSecret: string;
  language: string;
  cluster: Cluster;
  baseUrl: string;
  fetch: typeof fetch;
  timeoutMs: number;
  proactive: boolean;
  retry: RetryOptions;
  hooks: Hooks;
}

const BASE_URLS: Record<Cluster, string> = {
  eu1: "https://api.webshopapp.com",
  us1: "https://api.shoplightspeed.com",
};

const DEFAULT_RETRY: RetryOptions = {
  maxRetries: 3,
  backoffFactor: 2,
  retryStatuses: [429, 500, 502, 503, 504],
  retryMethods: ["GET", "PUT", "DELETE"] as HttpMethod[],
};

export function resolveConfig(opts: LightspeedClientOptions): ResolvedConfig {
  if (!opts?.apiKey || !opts?.apiSecret)
    throw new Error("lightspeed-client: apiKey and apiSecret are required");
  if (!opts?.language) throw new Error("lightspeed-client: language is required");
  const cluster = opts.cluster ?? "eu1";
  const f = opts.fetch ?? globalThis.fetch;
  if (!f) throw new Error("lightspeed-client: no fetch available; pass options.fetch");
  return {
    apiKey: opts.apiKey,
    apiSecret: opts.apiSecret,
    language: opts.language,
    cluster,
    baseUrl: BASE_URLS[cluster],
    fetch: f,
    timeoutMs: opts.timeoutMs ?? 60_000,
    proactive: opts.rateLimit?.proactive ?? true,
    retry: { ...DEFAULT_RETRY, ...opts.retry },
    hooks: opts.hooks ?? {},
  };
}
