import { z } from "zod";
import { resourceRef } from "../../core/fragments";
import type { Transport } from "../../core/http";
import { Resource } from "../../core/resource";

export const productFilterValueSchema = z
  .object({
    id: z.number(),
    filter: resourceRef.optional(),
    filtervalue: resourceRef.optional(),
  })
  .passthrough();
export type ProductFilterValue = z.infer<typeof productFilterValueSchema>;

export const productFilterValueInputSchema = z.object({
  filter: z.number(),
  filtervalue: z.number(),
});
export type ProductFilterValueInput = z.input<typeof productFilterValueInputSchema>;

// parent-bound: products/{id}/filtervalues. live envelope key for both list and
// single is "productFiltervalue" (lowercase v, not pluralized). no update on the API.
export class ProductFilterValueResource extends Resource<ProductFilterValue> {
  protected schema = productFilterValueSchema;
  protected singular = "productFiltervalue";
  protected plural = "productFiltervalue";
  protected base: string;

  constructor(transport: Transport, parentPrefix: string) {
    super(transport);
    this.base = `${parentPrefix}/filtervalues`;
  }

  list = (q?: Parameters<ProductFilterValueResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: Parameters<ProductFilterValueResource["list_"]>[0]) => this.paginate_(q);
  count = (q?: Record<string, unknown>) => this.count_(q);
  get = (id: number) => this.get_(id);
  create = (input: ProductFilterValueInput) => this.create_(productFilterValueInputSchema, input);
  delete = (id: number) => this.delete_(id);
}
