import { z } from "zod";
import { resourceRef } from "../../core/fragments";
import { SingletonResource } from "../../core/resource";
import { MetafieldResource } from "../shared/metafield";

const countrySchema = z
  .object({
    id: z.number(),
    code: z.string(),
    code3: z.string(),
    title: z.string(),
  })
  .passthrough();

const currencySchema = z
  .object({
    shortcode: z.string(),
    symbol: z.string(),
    title: z.string(),
    isDefault: z.boolean(),
    currencyRate: z.string(),
  })
  .passthrough();

export const shopSchema = z
  .object({
    id: z.number(),
    createdAt: z.string(),
    status: z.string(),
    isB2b: z.boolean(),
    isRetail: z.boolean(),
    subDomain: z.string(),
    mainDomain: z.string(),
    email: z.string(),
    phone: z.string(),
    fax: z.string(),
    street: z.string(),
    street2: z.string(),
    zipcode: z.string(),
    city: z.string(),
    region: z.string(),
    country: countrySchema,
    vatNumber: z.string(),
    cocNumber: z.string(),
    industry: z.string(),
    currency: currencySchema,
    company: resourceRef,
    limits: resourceRef,
  })
  .passthrough();
export type Shop = z.infer<typeof shopSchema>;

export class ShopResource extends SingletonResource<Shop> {
  protected base = "shop";
  protected schema = shopSchema;
  protected key = "shop";

  get = () => this.get_();

  metafields = () => new MetafieldResource(this.transport, this.base, "shop");
}

export { ShopResource as default };
