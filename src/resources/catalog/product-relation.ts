import { z } from "zod";
import { resourceRef } from "../../core/fragments";
import type { Transport } from "../../core/http";
import { Resource } from "../../core/resource";

export const productRelationSchema = z
  .object({
    id: z.number(),
    sortOrder: z.number().optional(),
    relatedProduct: resourceRef.optional(),
  })
  .passthrough();
export type ProductRelation = z.infer<typeof productRelationSchema>;

export const productRelationInputSchema = z.object({ relatedProduct: z.number() });
export type ProductRelationInput = z.input<typeof productRelationInputSchema>;

export const productRelationUpdateSchema = z.object({ sortOrder: z.number().optional() });
export type ProductRelationUpdate = z.input<typeof productRelationUpdateSchema>;

// parent-bound: products/{id}/relations; envelope productRelation/productRelations
export class ProductRelationResource extends Resource<ProductRelation> {
  protected schema = productRelationSchema;
  protected singular = "productRelation";
  protected plural = "productRelations";
  protected base: string;

  constructor(transport: Transport, parentPrefix: string) {
    super(transport);
    this.base = `${parentPrefix}/relations`;
  }

  list = (q?: Parameters<ProductRelationResource["list_"]>[0]) => this.list_(q);
  count = (q?: Record<string, unknown>) => this.count_(q);
  get = (id: number) => this.get_(id);
  create = (input: ProductRelationInput) => this.create_(productRelationInputSchema, input);
  update = (id: number, input: ProductRelationUpdate) =>
    this.update_(id, productRelationUpdateSchema, input);
  delete = (id: number) => this.delete_(id);
}
