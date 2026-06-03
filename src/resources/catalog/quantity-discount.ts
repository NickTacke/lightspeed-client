import { z } from "zod";
import { timestamps } from "../../core/fragments";
import { Resource } from "../../core/resource";

// live: product/variant/customerGroup are plain numbers, not resource refs.
export const quantityDiscountSchema = timestamps
  .extend({
    id: z.number(),
    product: z.number().optional(),
    variant: z.number().optional(),
    quantity: z.number().optional(),
    price: z.number().optional(),
    percentage: z.number().optional(),
    isPercentage: z.boolean().optional(),
    customerGroup: z.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .passthrough();
export type QuantityDiscount = z.infer<typeof quantityDiscountSchema>;

export const quantityDiscountInputSchema = z.object({
  product: z.number(),
  variant: z.number().optional(),
  quantity: z.number(),
  price: z.number().optional(),
  percentage: z.number().optional(),
  isPercentage: z.boolean().optional(),
  customerGroup: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export type QuantityDiscountInput = z.input<typeof quantityDiscountInputSchema>;

export const quantityDiscountUpdateSchema = quantityDiscountInputSchema.partial();
export type QuantityDiscountUpdate = z.input<typeof quantityDiscountUpdateSchema>;

export interface QuantityDiscountFilters {
  product?: number;
  variant?: number;
}

// top-level resource at quantity_discounts.json, filtered by product/variant.
export class QuantityDiscountResource extends Resource<QuantityDiscount> {
  protected base = "quantity_discounts";
  protected schema = quantityDiscountSchema;
  protected singular = "quantityDiscount";
  protected plural = "quantityDiscounts";

  list = (q?: QuantityDiscountFilters & Parameters<QuantityDiscountResource["list_"]>[0]) =>
    this.list_(q);
  paginate = (q?: QuantityDiscountFilters & Parameters<QuantityDiscountResource["list_"]>[0]) =>
    this.paginate_(q);
  count = (q?: QuantityDiscountFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
  create = (input: QuantityDiscountInput) => this.create_(quantityDiscountInputSchema, input);
  update = (id: number, input: QuantityDiscountUpdate) =>
    this.update_(id, quantityDiscountUpdateSchema, input);
  delete = (id: number) => this.delete_(id);
}
