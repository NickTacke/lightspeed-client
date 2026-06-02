import { type LightspeedClientOptions, resolveConfig } from "./config";
import { Transport } from "./core/http";
import type { HttpMethod, Query } from "./core/types";
import { ProductResource } from "./resources/catalog/product";

export class LightspeedClient {
  protected readonly transport: Transport;
  readonly products: ProductResource;
  constructor(options: LightspeedClientOptions) {
    this.transport = new Transport(resolveConfig(options));
    this.products = new ProductResource(this.transport);
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
