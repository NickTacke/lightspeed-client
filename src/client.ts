import { type LightspeedClientOptions, resolveConfig } from "./config";
import { Transport } from "./core/http";
import type { HttpMethod, Query } from "./core/types";
import { AttributeResource } from "./resources/catalog/attribute";
import { BrandResource } from "./resources/catalog/brand";
import { CategoryResource } from "./resources/catalog/category";
import { ProductResource } from "./resources/catalog/product";
import { TagResource } from "./resources/catalog/tag";
import { TypeResource } from "./resources/catalog/type";
import { VariantMovementResource, VariantResource } from "./resources/catalog/variant";

export class LightspeedClient {
  protected readonly transport: Transport;
  readonly products: ProductResource;
  readonly variants: VariantResource;
  readonly variantMovements: VariantMovementResource;
  readonly categories: CategoryResource;
  readonly brands: BrandResource;
  readonly types: TypeResource;
  readonly attributes: AttributeResource;
  readonly tags: TagResource;
  constructor(options: LightspeedClientOptions) {
    this.transport = new Transport(resolveConfig(options));
    this.products = new ProductResource(this.transport);
    this.variants = new VariantResource(this.transport);
    this.variantMovements = new VariantMovementResource(this.transport);
    this.categories = new CategoryResource(this.transport);
    this.brands = new BrandResource(this.transport);
    this.types = new TypeResource(this.transport);
    this.attributes = new AttributeResource(this.transport);
    this.tags = new TagResource(this.transport);
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
