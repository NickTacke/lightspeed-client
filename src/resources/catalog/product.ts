import { z } from "zod";
import { ProductVisibility } from "../../constants/enums";
import { fileObject, orFalse, resourceRef, timestamps } from "../../core/fragments";
import type { Transport } from "../../core/http";
import { Resource } from "../../core/resource";
import { ImageCollectionResource } from "../shared/image";
import { MetafieldResource } from "../shared/metafield";

export const productSchema = timestamps
  .extend({
    id: z.number(),
    isVisible: z.boolean(),
    // live: visibility values match ProductVisibility enum
    visibility: z.nativeEnum(ProductVisibility),
    hasMatrix: z.boolean(),
    data01: z.string(),
    data02: z.string(),
    data03: z.string(),
    url: z.string(),
    title: z.string(),
    fulltitle: z.string(),
    description: z.string(),
    content: z.string(),
    set: orFalse(resourceRef),
    brand: orFalse(resourceRef),
    categories: resourceRef,
    deliverydate: orFalse(resourceRef),
    image: orFalse(fileObject),
    images: resourceRef,
    relations: resourceRef,
    metafields: resourceRef,
    reviews: resourceRef,
    type: orFalse(resourceRef),
    attributes: resourceRef,
    // live: supplier is false (plan assumed resourceRef; live shape wins)
    supplier: orFalse(resourceRef),
    tags: resourceRef,
    variants: resourceRef,
    movements: resourceRef,
    templateDataFields: z.record(z.unknown()),
  })
  .passthrough();
export type Product = z.infer<typeof productSchema>;

export const productInputSchema = z.object({
  isVisible: z.boolean().optional(),
  visibility: z.nativeEnum(ProductVisibility).optional(),
  url: z.string().optional(),
  title: z.string(),
  fulltitle: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  data01: z.string().optional(),
  data02: z.string().optional(),
  data03: z.string().optional(),
  brand: z.number().optional(),
  supplier: z.number().optional(),
  type: z.number().optional(),
});
export type ProductInput = z.input<typeof productInputSchema>;

export interface ProductFilters {
  brand?: number;
  supplier?: number;
  type?: number;
  isVisible?: boolean;
  title?: string;
}

export class ProductResource extends Resource<Product> {
  protected base = "products";
  protected schema = productSchema;
  protected singular = "product";
  protected plural = "products";

  list = (q?: ProductFilters & Parameters<ProductResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: ProductFilters & Parameters<ProductResource["list_"]>[0]) => this.paginate_(q);
  count = (q?: ProductFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
  create = (input: ProductInput) => this.create_(productInputSchema, input);
  update = (id: number, input: ProductInput) => this.update_(id, productInputSchema, input);
  delete = (id: number) => this.delete_(id);

  images = (id: number) =>
    new ImageCollectionResource(this.transport, `${this.base}/${id}`, this.singular);
  metafields = (id: number) =>
    new MetafieldResource(this.transport, `${this.base}/${id}`, this.singular);
}

export { ProductResource as default };
