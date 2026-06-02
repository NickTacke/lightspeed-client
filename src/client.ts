import { type LightspeedClientOptions, resolveConfig } from "./config";
import { Transport } from "./core/http";
import type { HttpMethod, Query } from "./core/types";

export class LightspeedClient {
  protected readonly transport: Transport;
  constructor(options: LightspeedClientOptions) {
    this.transport = new Transport(resolveConfig(options));
  }
  // raw escape hatch (fleshed out in slice 10)
  request<T>(args: {
    method: HttpMethod;
    path: string;
    query?: Query;
    body?: unknown;
  }): Promise<T> {
    return this.transport.send<T>(args);
  }
}
