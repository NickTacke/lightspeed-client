import { z } from "zod";
import { orFalse, resourceRef, timestamps } from "../../core/fragments";
import type { Transport } from "../../core/http";
import { Resource } from "../../core/resource";
import { SingleImageResource } from "../shared/image";

export const brandSchema = timestamps
  .extend({
    id: z.number(),
    isVisible: z.boolean(),
    url: z.string(),
    title: z.string(),
    // live: content is false when no content set
    content: orFalse(z.string()),
    // live: image is false when no image assigned
    image: orFalse(
      z.object({
        createdAt: z.string(),
        updatedAt: z.string(),
        extension: z.string(),
        size: z.number(),
        title: z.string(),
        thumb: z.string(),
        src: z.string(),
      }),
    ),
    products: resourceRef,
  })
  .passthrough();
export type Brand = z.infer<typeof brandSchema>;

export const brandInputSchema = z.object({
  title: z.string(),
  url: z.string().optional(),
  content: z.string().optional(),
  isVisible: z.boolean().optional(),
});
export type BrandInput = z.input<typeof brandInputSchema>;

export const brandUpdateSchema = brandInputSchema.partial();
export type BrandUpdate = z.input<typeof brandUpdateSchema>;

export interface BrandFilters {
  isVisible?: boolean;
  title?: string;
}

export class BrandResource extends Resource<Brand> {
  protected base = "brands";
  protected schema = brandSchema;
  protected singular = "brand";
  protected plural = "brands";

  list = (q?: BrandFilters & Parameters<BrandResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: BrandFilters & Parameters<BrandResource["list_"]>[0]) => this.paginate_(q);
  count = (q?: BrandFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
  create = (input: BrandInput) => this.create_(brandInputSchema, input);
  update = (id: number, input: BrandUpdate) => this.update_(id, brandUpdateSchema, input);
  delete = (id: number) => this.delete_(id);

  image = (id: number) => new SingleImageResource(this.transport, `${this.base}/${id}`);
}

export { BrandResource as default };
