import { z } from "zod";
import { fileObject, orFalse, resourceRef, timestamps } from "../../core/fragments";
import { Resource } from "../../core/resource";
import { MetafieldResource } from "../shared/metafield";

// live: variant movements have createdAt but no updatedAt
export const variantMovementSchema = z
  .object({
    id: z.number(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    type: z.string().optional(),
    amount: z.number().optional(),
    description: z.string().optional(),
    variant: resourceRef.optional(),
  })
  .passthrough();
export type VariantMovement = z.infer<typeof variantMovementSchema>;

export interface VariantMovementFilters {
  variant?: number;
}

// live: plural envelope "variantsMovements" (confirmed); singular "variantMovement" (unconfirmed — no records in test shop)
export class VariantMovementResource extends Resource<VariantMovement> {
  protected base = "variants/movements";
  protected schema = variantMovementSchema;
  protected singular = "variantMovement";
  protected plural = "variantsMovements";

  list = (q?: VariantMovementFilters & Parameters<VariantMovementResource["list_"]>[0]) =>
    this.list_(q);
  paginate = (q?: VariantMovementFilters & Parameters<VariantMovementResource["list_"]>[0]) =>
    this.paginate_(q);
  count = (q?: VariantMovementFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
}

export const variantSchema = timestamps
  .extend({
    id: z.number(),
    isDefault: z.boolean(),
    sortOrder: z.number(),
    articleCode: z.string(),
    ean: z.string(),
    sku: z.string(),
    // live: hs is null
    hs: z.string().nullable(),
    unitPrice: z.number(),
    unitUnit: z.string(),
    priceExcl: z.number(),
    priceIncl: z.number(),
    priceCost: z.number(),
    oldPriceExcl: z.number(),
    oldPriceIncl: z.number(),
    // live: stockTracking is a string enum ("enabled"/"disabled")
    stockTracking: z.string(),
    stockLevel: z.number(),
    stockAlert: z.number(),
    stockMinimum: z.number(),
    stockSold: z.number(),
    stockBuyMininum: z.number(),
    stockBuyMinimum: z.number(),
    stockBuyMaximum: z.number(),
    weight: z.number(),
    weightValue: z.string(),
    weightUnit: z.string(),
    volume: z.number(),
    volumeValue: z.number(),
    volumeUnit: z.string(),
    colli: z.number(),
    sizeX: z.number(),
    sizeY: z.number(),
    sizeZ: z.number(),
    sizeXValue: z.string(),
    sizeYValue: z.string(),
    sizeZValue: z.string(),
    sizeUnit: z.string(),
    // live: matrix is false (not a resourceRef)
    matrix: orFalse(resourceRef),
    title: z.string(),
    // live: taxType is null
    taxType: z.string().nullable(),
    // live: image is false
    image: orFalse(fileObject),
    tax: resourceRef,
    product: resourceRef,
    movements: resourceRef,
    metafields: resourceRef,
    // live: additionalcost is false
    additionalcost: orFalse(resourceRef),
    // live: options is an array (empty in test shop)
    options: z.array(z.unknown()),
  })
  .passthrough();
export type Variant = z.infer<typeof variantSchema>;

export const variantInputSchema = z.object({
  title: z.string().optional(),
  articleCode: z.string().optional(),
  ean: z.string().optional(),
  sku: z.string().optional(),
  priceExcl: z.number().optional(),
  priceIncl: z.number().optional(),
  priceCost: z.number().optional(),
  oldPriceExcl: z.number().optional(),
  oldPriceIncl: z.number().optional(),
  stockTracking: z.string().optional(),
  stockLevel: z.number().optional(),
  stockAlert: z.number().optional(),
  stockMinimum: z.number().optional(),
  stockBuyMinimum: z.number().optional(),
  stockBuyMaximum: z.number().optional(),
  weight: z.number().optional(),
  weightUnit: z.string().optional(),
  volume: z.number().optional(),
  volumeUnit: z.string().optional(),
  sizeX: z.number().optional(),
  sizeY: z.number().optional(),
  sizeZ: z.number().optional(),
  sizeUnit: z.string().optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number().optional(),
  // FK relations
  product: z.number().optional(),
  tax: z.number().optional(),
});
export type VariantInput = z.input<typeof variantInputSchema>;

export const variantUpdateSchema = variantInputSchema.partial();
export type VariantUpdate = z.input<typeof variantUpdateSchema>;

export interface VariantFilters {
  product?: number;
  articleCode?: string;
  ean?: string;
  sku?: string;
}

export class VariantResource extends Resource<Variant> {
  protected base = "variants";
  protected schema = variantSchema;
  protected singular = "variant";
  protected plural = "variants";

  list = (q?: VariantFilters & Parameters<VariantResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: VariantFilters & Parameters<VariantResource["list_"]>[0]) => this.paginate_(q);
  count = (q?: VariantFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
  create = (input: VariantInput) => this.create_(variantInputSchema, input);
  update = (id: number, input: VariantUpdate) => this.update_(id, variantUpdateSchema, input);
  delete = (id: number) => this.delete_(id);

  metafields = (id: number) =>
    new MetafieldResource(this.transport, `${this.base}/${id}`, this.singular);
}

export { VariantResource as default };
