import { z } from "zod";
import { timestamps } from "../../core/fragments";
import type { Transport } from "../../core/http";
import { Resource } from "../../core/resource";

export const metafieldSchema = timestamps
  .extend({
    id: z.number(),
    // ownerId/owner/namespace absent on live shop but may appear in other contexts
    ownerId: z.number().optional(),
    owner: z.string().optional(),
    namespace: z.string().optional(),
    key: z.string(),
    value: z.string(),
    description: z.string().optional(),
    valueType: z.string().optional(),
  })
  .passthrough();
export type Metafield = z.infer<typeof metafieldSchema>;

export const metafieldInputSchema = z.object({
  namespace: z.string().optional(),
  key: z.string(),
  value: z.string(),
  description: z.string().optional(),
  valueType: z.string().optional(),
});
export type MetafieldInput = z.input<typeof metafieldInputSchema>;

// envelope keys are parent-qualified: e.g. "productMetafield"/"productMetafields"
// pass envelopePrefix = "product" -> singular "productMetafield", plural "productMetafields"
export class MetafieldResource extends Resource<Metafield> {
  protected schema = metafieldSchema;
  protected singular: string;
  protected plural: string;
  protected base: string;

  constructor(transport: Transport, parentPrefix: string, envelopePrefix: string) {
    super(transport);
    this.base = `${parentPrefix}/metafields`;
    this.singular = `${envelopePrefix}Metafield`;
    this.plural = `${envelopePrefix}Metafields`;
  }

  list = (q?: Parameters<MetafieldResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: Parameters<MetafieldResource["list_"]>[0]) => this.paginate_(q);
  count = (q?: Record<string, unknown>) => this.count_(q);
  get = (id: number) => this.get_(id);
  create = (input: MetafieldInput) => this.create_(metafieldInputSchema, input);
  update = (id: number, input: MetafieldInput) => this.update_(id, metafieldInputSchema, input);
  delete = (id: number) => this.delete_(id);
}
