import { z } from "zod";
import { resourceRef } from "../../core/fragments";
import { Resource } from "../../core/resource";

// attributes describe product options (e.g. color, size)
// live responses (create + list) omit createdAt/updatedAt
export const attributeSchema = z
  .object({
    id: z.number(),
    title: z.string().optional(),
    defaultValue: z.string().nullable().optional(),
    types: resourceRef.optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();
export type Attribute = z.infer<typeof attributeSchema>;

export const attributeInputSchema = z.object({
  title: z.string(),
  type: z.string().optional(),
  isRequired: z.boolean().optional(),
  position: z.number().optional(),
});
export type AttributeInput = z.input<typeof attributeInputSchema>;

export const attributeUpdateSchema = attributeInputSchema.partial();
export type AttributeUpdate = z.input<typeof attributeUpdateSchema>;

export class AttributeResource extends Resource<Attribute> {
  protected base = "attributes";
  protected schema = attributeSchema;
  protected singular = "attribute";
  protected plural = "attributes";

  list = (q?: Parameters<AttributeResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: Parameters<AttributeResource["list_"]>[0]) => this.paginate_(q);
  // attributes have no documented list filters
  count = (q?: Record<string, unknown>) => this.count_(q);
  get = (id: number) => this.get_(id);
  create = (input: AttributeInput) => this.create_(attributeInputSchema, input);
  update = (id: number, input: AttributeUpdate) => this.update_(id, attributeUpdateSchema, input);
  delete = (id: number) => this.delete_(id);
}

export { AttributeResource as default };
