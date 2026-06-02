import { z } from "zod";
import { resourceRef } from "../../core/fragments";
import { Resource } from "../../core/resource";

export const categoriesProductSchema = z
  .object({
    id: z.number(),
    sortOrder: z.number(),
    category: resourceRef,
    product: resourceRef,
  })
  .passthrough();
export type CategoriesProduct = z.infer<typeof categoriesProductSchema>;

export const categoriesProductInputSchema = z.object({
  category: z.number(),
  product: z.number(),
  sortOrder: z.number().optional(),
});
export type CategoriesProductInput = z.input<typeof categoriesProductInputSchema>;

export interface CategoriesProductFilters {
  category?: number;
  product?: number;
}

export class CategoriesProductResource extends Resource<CategoriesProduct> {
  protected base = "categories/products";
  protected schema = categoriesProductSchema;
  protected singular = "categoriesProduct";
  protected plural = "categoriesProducts";

  list = (q?: CategoriesProductFilters & Parameters<CategoriesProductResource["list_"]>[0]) =>
    this.list_(q);
  paginate = (q?: CategoriesProductFilters & Parameters<CategoriesProductResource["list_"]>[0]) =>
    this.paginate_(q);
  count = (q?: CategoriesProductFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
  create = (input: CategoriesProductInput) => this.create_(categoriesProductInputSchema, input);
  delete = (id: number) => this.delete_(id);
}

export { CategoriesProductResource as default };
