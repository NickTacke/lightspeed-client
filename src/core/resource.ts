import type { z } from "zod";
import { derivePath } from "./endpoints";
import { LightspeedValidationError } from "./errors";
import type { Transport } from "./http";
import { paginate } from "./paginate";
import type { ListQuery, Query } from "./types";

// generic crud base. subclasses set base/schema/singular/plural and expose
// thin one-line methods (omit mutators for read-only resources).
export abstract class Resource<T> {
  protected abstract base: string;
  protected abstract schema: z.ZodType<T>;
  protected abstract singular: string;
  protected abstract plural: string;
  constructor(protected readonly transport: Transport) {}

  // scalar filters only; array-valued filters need per-resource handling
  protected toQuery(q?: ListQuery & Record<string, unknown>): Query | undefined {
    if (!q) return undefined;
    const out: Query = {};
    for (const [k, v] of Object.entries(q)) {
      if (v === undefined || v === null) continue;
      out[k] = typeof v === "object" ? JSON.stringify(v) : (v as string | number | boolean);
    }
    return out;
  }

  protected async list_(q?: ListQuery & Record<string, unknown>): Promise<T[]> {
    const raw = await this.transport.send<Record<string, unknown>>({
      method: "GET",
      path: derivePath(this.base, "list"),
      query: this.toQuery(q),
    });
    const arr = raw?.[this.plural];
    // missing plural key -> empty list (treated as no results)
    const parsed = this.schema.array().safeParse(arr ?? []);
    if (!parsed.success)
      throw new LightspeedValidationError("invalid list response", parsed.error.issues);
    return parsed.data;
  }

  // auto-paginate; cursor (since_id) mode by default — safe for deep paging
  protected paginate_(q?: ListQuery & Record<string, unknown>): AsyncGenerator<T, void, unknown> {
    const opts = q?.limit !== undefined ? { limit: q.limit } : {};
    return paginate<T>((cursor, limit) => this.list_({ ...(q ?? {}), ...cursor, limit }), opts);
  }

  protected async count_(q?: Record<string, unknown>): Promise<number> {
    const raw = await this.transport.send<{ count?: number }>({
      method: "GET",
      path: derivePath(this.base, "count"),
      query: this.toQuery(q),
    });
    return raw?.count ?? 0;
  }

  protected async get_(id: number | string): Promise<T> {
    const raw = await this.transport.send<Record<string, unknown>>({
      method: "GET",
      path: derivePath(this.base, "get", id),
    });
    return this.unwrap_(raw);
  }

  protected async create_<I>(
    inputSchema: z.ZodType<unknown, z.ZodTypeDef, I>,
    input: I,
  ): Promise<T> {
    const body = this.validateInput_(inputSchema, input);
    const raw = await this.transport.send<Record<string, unknown>>({
      method: "POST",
      path: derivePath(this.base, "create"),
      body: { [this.singular]: body },
    });
    return this.unwrap_(raw);
  }

  protected async update_<I>(
    id: number | string,
    inputSchema: z.ZodType<unknown, z.ZodTypeDef, I>,
    input: I,
  ): Promise<T> {
    const body = this.validateInput_(inputSchema, input);
    const raw = await this.transport.send<Record<string, unknown>>({
      method: "PUT",
      path: derivePath(this.base, "update", id),
      body: { [this.singular]: body },
    });
    return this.unwrap_(raw);
  }

  protected async delete_(id: number | string): Promise<void> {
    await this.transport.send({ method: "DELETE", path: derivePath(this.base, "delete", id) });
  }

  private validateInput_<I>(inputSchema: z.ZodType<unknown, z.ZodTypeDef, I>, input: I): unknown {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success)
      throw new LightspeedValidationError("invalid request", parsed.error.issues);
    return parsed.data;
  }

  private unwrap_(raw: Record<string, unknown>): T {
    const parsed = this.schema.safeParse(raw?.[this.singular]);
    if (!parsed.success)
      throw new LightspeedValidationError("invalid response", parsed.error.issues);
    return parsed.data;
  }
}

// singletons (account, shop): one object at `${base}.json`, no id, no list
export abstract class SingletonResource<T> {
  protected abstract base: string; // "account"
  protected abstract schema: z.ZodType<T>;
  protected abstract key: string; // envelope key, e.g. "account"
  constructor(protected readonly transport: Transport) {}

  protected async get_(): Promise<T> {
    const raw = await this.transport.send<Record<string, unknown>>({
      method: "GET",
      path: `${this.base}.json`,
    });
    const parsed = this.schema.safeParse(raw?.[this.key]);
    if (!parsed.success)
      throw new LightspeedValidationError("invalid response", parsed.error.issues);
    return parsed.data;
  }

  protected async create_<I>(
    inputSchema: z.ZodType<unknown, z.ZodTypeDef, I>,
    input: I,
  ): Promise<T> {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success)
      throw new LightspeedValidationError("invalid request", parsed.error.issues);
    const raw = await this.transport.send<Record<string, unknown>>({
      method: "POST",
      path: `${this.base}.json`,
      body: { [this.key]: parsed.data },
    });
    const out = this.schema.safeParse(raw?.[this.key]);
    if (!out.success) throw new LightspeedValidationError("invalid response", out.error.issues);
    return out.data;
  }

  protected async delete_(): Promise<void> {
    await this.transport.send({ method: "DELETE", path: `${this.base}.json` });
  }
}
