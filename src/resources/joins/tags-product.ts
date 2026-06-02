import { z } from "zod";
import { resourceRef } from "../../core/fragments";
import { Resource } from "../../core/resource";

export const tagsProductSchema = z
  .object({
    id: z.number(),
    tag: resourceRef,
    product: resourceRef,
  })
  .passthrough();
export type TagsProduct = z.infer<typeof tagsProductSchema>;

export const tagsProductInputSchema = z.object({
  tag: z.number(),
  product: z.number(),
  sortOrder: z.number().optional(),
});
export type TagsProductInput = z.input<typeof tagsProductInputSchema>;

export interface TagsProductFilters {
  tag?: number;
  product?: number;
}

export class TagsProductResource extends Resource<TagsProduct> {
  protected base = "tags/products";
  protected schema = tagsProductSchema;
  protected singular = "tagsProduct";
  protected plural = "tagsProducts";

  list = (q?: TagsProductFilters & Parameters<TagsProductResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: TagsProductFilters & Parameters<TagsProductResource["list_"]>[0]) =>
    this.paginate_(q);
  count = (q?: TagsProductFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
  create = (input: TagsProductInput) => this.create_(tagsProductInputSchema, input);
  delete = (id: number) => this.delete_(id);
}

export { TagsProductResource as default };
