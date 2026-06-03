import { z } from "zod";
import { derivePath } from "../../core/endpoints";
import { LightspeedValidationError } from "../../core/errors";
import { resourceRef } from "../../core/fragments";
import { Resource } from "../../core/resource";

export const typeAttributeSchema = z
  .object({
    id: z.number(),
    sortOrder: z.number().nullable().optional(),
    type: resourceRef.optional(),
    attribute: resourceRef.optional(),
  })
  .passthrough();
export type TypeAttribute = z.infer<typeof typeAttributeSchema>;

export const typeAttributeInputSchema = z.object({
  type: z.number(),
  attribute: z.number(),
  sortOrder: z.number().optional(),
});
export type TypeAttributeInput = z.input<typeof typeAttributeInputSchema>;

export interface TypeAttributeFilters {
  type?: number;
}

export class TypeAttributeResource extends Resource<TypeAttribute> {
  protected base = "types/attributes";
  protected schema = typeAttributeSchema;
  protected singular = "typesAttribute";
  protected plural = "typesAttributes";

  list = (q?: TypeAttributeFilters & Parameters<TypeAttributeResource["list_"]>[0]) =>
    this.list_(q);
  paginate = (q?: TypeAttributeFilters & Parameters<TypeAttributeResource["list_"]>[0]) =>
    this.paginate_(q);
  count = (q?: TypeAttributeFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
  delete = (id: number) => this.delete_(id);

  // custom create: request wrapper is singular `typesAttribute`, but the create
  // response is pluralized `typesAttributes` (unlike get), so unwrap tolerantly.
  create = async (input: TypeAttributeInput): Promise<TypeAttribute> => {
    const parsed = typeAttributeInputSchema.safeParse(input);
    if (!parsed.success)
      throw new LightspeedValidationError("invalid request", parsed.error.issues);
    const raw = await this.transport.send<Record<string, unknown>>({
      method: "POST",
      path: derivePath(this.base, "create"),
      body: { typesAttribute: parsed.data },
    });
    const obj = raw?.typesAttributes ?? raw?.typesAttribute;
    const out = typeAttributeSchema.safeParse(obj);
    if (!out.success) throw new LightspeedValidationError("invalid response", out.error.issues);
    return out.data;
  };
}

export { TypeAttributeResource as default };
