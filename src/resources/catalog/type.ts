import { z } from "zod";
import { resourceRef, timestamps } from "../../core/fragments";
import { Resource } from "../../core/resource";

// live shop has no types; schema inferred from docs
// passthrough preserves any undocumented fields
export const typeSchema = timestamps
  .extend({
    id: z.number(),
    title: z.string(),
    // products sub-resource link appears on most catalog entities
    products: resourceRef.optional(),
  })
  .passthrough();
export type Type = z.infer<typeof typeSchema>;

export const typeInputSchema = z.object({
  title: z.string(),
});
export type TypeInput = z.input<typeof typeInputSchema>;

export const typeUpdateSchema = typeInputSchema.partial();
export type TypeUpdate = z.input<typeof typeUpdateSchema>;

export interface TypeFilters {
  title?: string;
}

export class TypeResource extends Resource<Type> {
  protected base = "types";
  protected schema = typeSchema;
  protected singular = "type";
  protected plural = "types";

  list = (q?: TypeFilters & Parameters<TypeResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: TypeFilters & Parameters<TypeResource["list_"]>[0]) => this.paginate_(q);
  count = (q?: TypeFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
  create = (input: TypeInput) => this.create_(typeInputSchema, input);
  update = (id: number, input: TypeUpdate) => this.update_(id, typeUpdateSchema, input);
  delete = (id: number) => this.delete_(id);
}

export { TypeResource as default };
