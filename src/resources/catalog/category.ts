import { z } from "zod";
import { fileObject, orFalse, resourceRef, timestamps } from "../../core/fragments";
import { Resource } from "../../core/resource";
import { SingleImageResource } from "../shared/image";

export const categorySchema = timestamps
  .extend({
    id: z.number(),
    isVisible: z.boolean(),
    // live: depth is number
    depth: z.number(),
    // live: path is array of string IDs
    path: z.array(z.string()),
    // live: type is a string ("category")
    type: z.string(),
    sortOrder: z.number(),
    // live: sorting is a string ("popular", "name", etc)
    sorting: z.string(),
    url: z.string(),
    title: z.string(),
    fulltitle: z.string(),
    description: z.string(),
    content: z.string(),
    // live: image is false when no image assigned
    image: orFalse(fileObject),
    parent: orFalse(resourceRef),
    children: resourceRef,
    products: resourceRef,
  })
  .passthrough();
export type Category = z.infer<typeof categorySchema>;

export const categoryInputSchema = z.object({
  title: z.string(),
  fulltitle: z.string().optional(),
  url: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  isVisible: z.boolean().optional(),
  sortOrder: z.number().optional(),
  sorting: z.string().optional(),
  // FK relation
  parent: z.number().optional(),
});
export type CategoryInput = z.input<typeof categoryInputSchema>;

export const categoryUpdateSchema = categoryInputSchema.partial();
export type CategoryUpdate = z.input<typeof categoryUpdateSchema>;

export interface CategoryFilters {
  parent?: number;
  isVisible?: boolean;
}

export class CategoryResource extends Resource<Category> {
  protected base = "categories";
  protected schema = categorySchema;
  protected singular = "category";
  protected plural = "categories";

  list = (q?: CategoryFilters & Parameters<CategoryResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: CategoryFilters & Parameters<CategoryResource["list_"]>[0]) => this.paginate_(q);
  count = (q?: CategoryFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
  create = (input: CategoryInput) => this.create_(categoryInputSchema, input);
  update = (id: number, input: CategoryUpdate) => this.update_(id, categoryUpdateSchema, input);
  delete = (id: number) => this.delete_(id);

  image = (id: number) => new SingleImageResource(this.transport, `${this.base}/${id}`);
}

export { CategoryResource as default };
