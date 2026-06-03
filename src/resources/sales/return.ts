import { z } from "zod";
import { orFalse, resourceRef, timestamps } from "../../core/fragments";
import { Resource } from "../../core/resource";

// docs-derived: the test shop has no returns, so this schema is unvalidated against live data
export const returnSchema = timestamps
  .extend({
    id: z.number(),
    number: z.number().optional(),
    status: z.string().optional(),
    reason: z.string().optional(),
    remark: z.string().optional(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    company: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    gender: z.string().optional(),
    customer: orFalse(resourceRef).optional(),
    order: orFalse(resourceRef).optional(),
  })
  .passthrough();
export type Return = z.infer<typeof returnSchema>;

export const returnInputSchema = z.object({
  order: z.number().optional(),
  reason: z.string().optional(),
  remark: z.string().optional(),
  status: z.string().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  company: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  customer: z.number().optional(),
});
export type ReturnInput = z.input<typeof returnInputSchema>;

export const returnUpdateSchema = returnInputSchema.partial();
export type ReturnUpdate = z.input<typeof returnUpdateSchema>;

export interface ReturnFilters {
  status?: string;
  order?: number;
  email?: string;
}

export class ReturnResource extends Resource<Return> {
  protected base = "returns";
  protected schema = returnSchema;
  protected singular = "return";
  protected plural = "returns";

  list = (q?: ReturnFilters & Parameters<ReturnResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: ReturnFilters & Parameters<ReturnResource["list_"]>[0]) => this.paginate_(q);
  count = (q?: ReturnFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
  create = (input: ReturnInput) => this.create_(returnInputSchema, input);
  update = (id: number, input: ReturnUpdate) => this.update_(id, returnUpdateSchema, input);
}

export { ReturnResource as default };
