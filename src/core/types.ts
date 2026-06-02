export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type Cluster = "eu1" | "us1";

export interface RetryOptions {
  maxRetries: number;
  backoffFactor: number;
  retryStatuses: number[];
  retryMethods: HttpMethod[];
}

export interface RequestContext {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}
export interface ResponseContext {
  request: RequestContext;
  status: number;
  body: unknown;
}

export interface Hooks {
  onRequest?: (req: RequestContext) => void | Promise<void>;
  onResponse?: (res: ResponseContext) => void | Promise<void>;
  onError?: (err: unknown) => void | Promise<void>;
}

// shared list query (intersected with per-resource filters)
export interface ListQuery {
  page?: number;
  limit?: number; // <= 250
  since_id?: number;
  created_at_min?: string; // "YYYY-MM-DD HH:MM:SS"
  created_at_max?: string;
  updated_at_min?: string;
  updated_at_max?: string;
  fields?: string; // comma-separated
}

export type QueryValue = string | number | boolean | undefined;
export type Query = Record<string, QueryValue>;
