import { z } from "zod";
import { resourceRef, timestamps } from "../../core/fragments";
import type { Transport } from "../../core/http";
import { Resource } from "../../core/resource";

export const tagSchema = timestamps
  .extend({
    id: z.number(),
    isVisible: z.boolean(),
    url: z.string(),
    title: z.string(),
    products: resourceRef,
  })
  .passthrough();
export type Tag = z.infer<typeof tagSchema>;

export const tagInputSchema = z.object({
  title: z.string(),
  url: z.string().optional(),
  isVisible: z.boolean().optional(),
});
export type TagInput = z.input<typeof tagInputSchema>;

export const tagUpdateSchema = tagInputSchema.partial();
export type TagUpdate = z.input<typeof tagUpdateSchema>;

export interface TagFilters {
  isVisible?: boolean;
  title?: string;
}

export class TagResource extends Resource<Tag> {
  protected base = "tags";
  protected schema = tagSchema;
  protected singular = "tag";
  protected plural = "tags";

  list = (q?: TagFilters & Parameters<TagResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: TagFilters & Parameters<TagResource["list_"]>[0]) => this.paginate_(q);
  count = (q?: TagFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
  create = (input: TagInput) => this.create_(tagInputSchema, input);
  update = (id: number, input: TagUpdate) => this.update_(id, tagUpdateSchema, input);
  delete = (id: number) => this.delete_(id);
}

export { TagResource as default };
