import { z } from "zod";
import type { Transport } from "../../core/http";
import { Resource } from "../../core/resource";

// docs-derived: the seeded product has no attributes (list returns []), so the
// response shape is modeled conservatively with passthrough.
export const productAttributeSchema = z
  .object({ id: z.number(), value: z.string().optional() })
  .passthrough();
export type ProductAttribute = z.infer<typeof productAttributeSchema>;

export const productAttributeUpdateSchema = z.object({ value: z.string() });
export type ProductAttributeUpdate = z.input<typeof productAttributeUpdateSchema>;

// parent-bound: products/{id}/attributes; envelope productAttribute/productAttributes.
// no create: the API returns 405 on POST (attributes derive from the product's type).
export class ProductAttributeResource extends Resource<ProductAttribute> {
  protected schema = productAttributeSchema;
  protected singular = "productAttribute";
  protected plural = "productAttributes";
  protected base: string;

  constructor(transport: Transport, parentPrefix: string) {
    super(transport);
    this.base = `${parentPrefix}/attributes`;
  }

  list = (q?: Parameters<ProductAttributeResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: Parameters<ProductAttributeResource["list_"]>[0]) => this.paginate_(q);
  count = (q?: Record<string, unknown>) => this.count_(q);
  get = (id: number) => this.get_(id);
  update = (id: number, input: ProductAttributeUpdate) =>
    this.update_(id, productAttributeUpdateSchema, input);
  delete = (id: number) => this.delete_(id);
}
