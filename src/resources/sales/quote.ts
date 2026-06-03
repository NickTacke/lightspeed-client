import { z } from "zod";
import { countryObject, orFalse, resourceRef, timestamps } from "../../core/fragments";
import type { Transport } from "../../core/http";
import { Resource } from "../../core/resource";

// docs-derived schema (test shop has no quotes — unvalidated live)
export const quoteProductSchema = timestamps
  .extend({
    id: z.number(),
    quantity: z.number().optional(),
    price: z.number().optional(),
    priceExcl: z.number().optional(),
    discountExcl: z.number().optional(),
    discountIncl: z.number().optional(),
    taxRate: z.number().optional(),
    title: z.string().optional(),
    articleCode: z.string().optional(),
    sku: z.string().optional(),
    variant: orFalse(resourceRef).optional(),
    quote: resourceRef.optional(),
  })
  .passthrough();
export type QuoteProduct = z.infer<typeof quoteProductSchema>;

export const quoteProductInputSchema = z.object({
  variant: z.number(),
  quantity: z.number(),
});
export type QuoteProductInput = z.input<typeof quoteProductInputSchema>;

export const quoteProductUpdateSchema = z.object({
  quantity: z.number().optional(),
});
export type QuoteProductUpdate = z.input<typeof quoteProductUpdateSchema>;

export class QuoteProductResource extends Resource<QuoteProduct> {
  protected schema = quoteProductSchema;
  protected singular = "quoteProduct";
  protected plural = "quoteProducts";
  protected base: string;

  constructor(transport: Transport, parentPrefix: string) {
    super(transport);
    this.base = `${parentPrefix}/products`;
  }

  list = (q?: Parameters<QuoteProductResource["list_"]>[0]) => this.list_(q);
  count = (q?: Record<string, unknown>) => this.count_(q);
  get = (id: number) => this.get_(id);
  create = (input: QuoteProductInput) => this.create_(quoteProductInputSchema, input);
  update = (id: number, input: QuoteProductUpdate) =>
    this.update_(id, quoteProductUpdateSchema, input);
  delete = (id: number) => this.delete_(id);
}

// docs-derived: minimal schema for shipping/payment methods (read-only, no CRUD)
export const quoteShippingMethodSchema = timestamps
  .extend({
    id: z.number(),
    title: z.string().optional(),
    price: z.number().optional(),
  })
  .passthrough();
export type QuoteShippingMethod = z.infer<typeof quoteShippingMethodSchema>;

export class QuoteShippingMethodResource extends Resource<QuoteShippingMethod> {
  protected schema = quoteShippingMethodSchema;
  protected singular = "quoteShippingmethod";
  protected plural = "quoteShippingmethods";
  protected base: string;

  constructor(transport: Transport, parentPrefix: string) {
    super(transport);
    this.base = `${parentPrefix}/shippingmethods`;
  }

  list = (q?: Parameters<QuoteShippingMethodResource["list_"]>[0]) => this.list_(q);
  count = (q?: Record<string, unknown>) => this.count_(q);
}

export const quotePaymentMethodSchema = timestamps
  .extend({
    id: z.number(),
    title: z.string().optional(),
    price: z.number().optional(),
  })
  .passthrough();
export type QuotePaymentMethod = z.infer<typeof quotePaymentMethodSchema>;

export class QuotePaymentMethodResource extends Resource<QuotePaymentMethod> {
  protected schema = quotePaymentMethodSchema;
  protected singular = "quotePaymentmethod";
  protected plural = "quotePaymentmethods";
  protected base: string;

  constructor(transport: Transport, parentPrefix: string) {
    super(transport);
    this.base = `${parentPrefix}/paymentmethods`;
  }

  list = (q?: Parameters<QuotePaymentMethodResource["list_"]>[0]) => this.list_(q);
  count = (q?: Record<string, unknown>) => this.count_(q);
}

// live-validated: confirmed against quote 1501464656 (embedded in seeded order)
export const quoteSchema = timestamps
  .extend({
    id: z.number(),
    recalculatedAt: z.string().nullable().optional(),
    isLocked: z.boolean().optional(),
    channel: z.string().optional(),
    recoveryHash: z.string().optional(),
    remoteIp: z.string().optional(),
    userAgent: z.string().optional(),
    referralId: z.union([z.string(), z.literal(false)]).optional(),
    weight: z.number().optional(),
    volume: z.number().optional(),
    colli: z.number().optional(),
    paymentCountry: orFalse(countryObject).optional(),
    shipmentCountry: orFalse(countryObject).optional(),
    shipmentZipcode: z.string().optional(),
    shipmentSameAddress: z.boolean().optional(),
    priceCost: z.number().optional(),
    priceExcl: z.number().optional(),
    priceIncl: z.number().optional(),
    discountExcl: z.number().optional(),
    discountIncl: z.number().optional(),
    productsCount: z.number().optional(),
    productsQuantity: z.number().optional(),
    shipmentId: z.union([z.string(), z.literal(false)]).optional(),
    shipmentIsSet: z.boolean().optional(),
    shipmentTitle: z.string().optional(),
    paymentId: z.string().optional(),
    paymentIsSet: z.boolean().optional(),
    paymentTitle: z.string().optional(),
    discountIsSet: z.boolean().optional(),
    discountCouponCode: z.string().optional(),
    comment: z.string().nullable().optional(),
    allowNotifications: z.boolean().optional(),
    customer: orFalse(resourceRef).optional(),
    language: z.record(z.unknown()).optional(),
    products: resourceRef.optional(),
    shippingmethods: resourceRef.optional(),
    paymentmethods: resourceRef.optional(),
  })
  .passthrough();
export type Quote = z.infer<typeof quoteSchema>;

export const quoteInputSchema = z.object({
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  company: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  remark: z.string().optional(),
  addressBillingStreet: z.string().optional(),
  addressBillingStreet2: z.string().optional(),
  addressBillingNumber: z.string().optional(),
  addressBillingZipcode: z.string().optional(),
  addressBillingCity: z.string().optional(),
  addressBillingRegion: z.string().optional(),
  addressBillingCountry: z.string().optional(),
  addressShippingStreet: z.string().optional(),
  addressShippingStreet2: z.string().optional(),
  addressShippingNumber: z.string().optional(),
  addressShippingZipcode: z.string().optional(),
  addressShippingCity: z.string().optional(),
  addressShippingRegion: z.string().optional(),
  addressShippingCountry: z.string().optional(),
  customer: z.number().optional(),
});
export type QuoteInput = z.input<typeof quoteInputSchema>;

export const quoteUpdateSchema = quoteInputSchema.partial();
export type QuoteUpdate = z.input<typeof quoteUpdateSchema>;

export interface QuoteFilters {
  status?: string;
  email?: string;
}

export class QuoteResource extends Resource<Quote> {
  protected base = "quotes";
  protected schema = quoteSchema;
  protected singular = "quote";
  protected plural = "quotes";

  list = (q?: QuoteFilters & Parameters<QuoteResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: QuoteFilters & Parameters<QuoteResource["list_"]>[0]) => this.paginate_(q);
  count = (q?: QuoteFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
  create = (input: QuoteInput) => this.create_(quoteInputSchema, input);
  update = (id: number, input: QuoteUpdate) => this.update_(id, quoteUpdateSchema, input);

  products = (id: number) => new QuoteProductResource(this.transport, `${this.base}/${id}`);
  shippingmethods = (id: number) =>
    new QuoteShippingMethodResource(this.transport, `${this.base}/${id}`);
  paymentmethods = (id: number) =>
    new QuotePaymentMethodResource(this.transport, `${this.base}/${id}`);
}

export { QuoteResource as default };
