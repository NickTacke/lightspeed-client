import { z } from "zod";
import { type FieldMap, fromWire, toWire } from "../../core/casing";
import { EXCEPTIONS } from "../../core/endpoints";
import { LightspeedValidationError } from "../../core/errors";
import type { Transport } from "../../core/http";
import type { ListQuery } from "../../core/types";

// checkout api is a v2-style api: snake_case fields on the wire, no envelopes,
// bare arrays. this client normalizes the typed surface to camelCase using the
// explicit, shallow toWire/fromWire helpers in core/casing. unmodeled snake
// fields pass through verbatim (.passthrough()); the TYPED surface is camelCase.
// mapping is deliberately NOT recursive — nested objects (validate errors,
// nested products) keep their wire keys, which is intentional.

// the product add endpoint returns money/discount fields as strings while the
// same fields embedded in a checkout get come back as numbers — tolerate both.
const numericLike = z.union([z.number(), z.string()]);

// camelCase -> wire (snake) field maps
const CHECKOUT_MAP = {
  createdAt: "created_at",
  updatedAt: "updated_at",
  orderId: "order_id",
  billingAddress: "billing_address",
  shippingAddress: "shipping_address",
  shipmentMethod: "shipment_method",
  paymentMethod: "payment_method",
  discountCode: "discount_code",
  giftCards: "gift_cards",
} as const satisfies FieldMap;

const CHECKOUT_PRODUCT_MAP = {
  cartId: "cart_id",
  createdAt: "created_at",
  updatedAt: "updated_at",
  productId: "product_id",
  variantId: "variant_id",
  isCustom: "is_custom",
  customChecksum: "custom_checksum",
  customData: "custom_data",
  hasDiscount: "has_discount",
  discountPercentage: "discount_percentage",
  taxRate: "tax_rate",
  basePriceExcl: "base_price_excl",
  basePriceIncl: "base_price_incl",
  basePriceCost: "base_price_cost",
  priceExcl: "price_excl",
  priceIncl: "price_incl",
  priceCost: "price_cost",
  priceTax: "price_tax",
  discountExcl: "discount_excl",
  discountIncl: "discount_incl",
  brandName: "brand_name",
  articleCode: "article_code",
  imageId: "image_id",
  imageThumb: "image_thumb",
  imageSrc: "image_src",
  stockLevel: "stock_level",
  stockAvailable: "stock_available",
  stockOnStock: "stock_on_stock",
} as const satisfies FieldMap;

const SHIPMENT_METHOD_MAP = {
  taxRate: "tax_rate",
  priceExcl: "price_excl",
  priceIncl: "price_incl",
  basePriceIncl: "base_price_incl",
  basePriceExcl: "base_price_excl",
  isServicePoint: "is_service_point",
} as const satisfies FieldMap;

const PAYMENT_METHOD_MAP = {
  postPayment: "post_payment",
  invoiceExternal: "invoice_external",
  taxRate: "tax_rate",
  priceExcl: "price_excl",
  priceIncl: "price_incl",
} as const satisfies FieldMap;

const ORDER_RESULT_MAP = {
  orderId: "order_id",
  paymentUrl: "payment_url",
  paymentProvider: "payment_provider",
} as const satisfies FieldMap;

// the checkout object embeds sub-objects that fromWire (shallow) would leave
// snake_case; re-case the known nested structures so the typed camelCase
// surface is fully populated.
function normalizeCheckout(raw: unknown): Record<string, unknown> {
  const o = fromWire(raw as Record<string, unknown>, CHECKOUT_MAP);
  if (o.shipmentMethod && typeof o.shipmentMethod === "object")
    o.shipmentMethod = fromWire(o.shipmentMethod as Record<string, unknown>, SHIPMENT_METHOD_MAP);
  if (o.paymentMethod && typeof o.paymentMethod === "object")
    o.paymentMethod = fromWire(o.paymentMethod as Record<string, unknown>, PAYMENT_METHOD_MAP);
  if (Array.isArray(o.products))
    o.products = o.products.map((p) =>
      fromWire(p as Record<string, unknown>, CHECKOUT_PRODUCT_MAP),
    );
  return o;
}

export const checkoutProductSchema = z
  .object({
    id: z.number(),
    cartId: z.number().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    productId: z.number().optional(),
    variantId: z.number().optional(),
    isCustom: z.boolean().nullable().optional(),
    customChecksum: z.string().nullable().optional(),
    customData: z.unknown().optional(),
    quantity: z.number().optional(),
    hasDiscount: z.boolean().optional(),
    discountPercentage: numericLike.optional(),
    taxRate: numericLike.optional(),
    basePriceExcl: numericLike.optional(),
    basePriceIncl: numericLike.optional(),
    basePriceCost: numericLike.optional(),
    priceExcl: numericLike.optional(),
    priceIncl: numericLike.optional(),
    priceCost: numericLike.optional(),
    priceTax: numericLike.optional(),
    discountExcl: numericLike.optional(),
    discountIncl: numericLike.optional(),
    title: z.string().nullable().optional(),
    fulltitle: z.string().nullable().optional(),
    variant: z.string().nullable().optional(),
    brandName: z.string().nullable().optional(),
    articleCode: z.string().nullable().optional(),
    ean: z.string().nullable().optional(),
    sku: z.string().nullable().optional(),
    imageId: z.number().optional(),
    imageThumb: z.string().nullable().optional(),
    imageSrc: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    stockAvailable: z.boolean().optional(),
    stockOnStock: z.boolean().optional(),
    stockLevel: numericLike.optional(),
  })
  .passthrough();
export type CheckoutProduct = z.infer<typeof checkoutProductSchema>;

export const checkoutProductInputSchema = z.object({
  variantId: z.number(),
  quantity: z.number(),
});
export type CheckoutProductInput = z.input<typeof checkoutProductInputSchema>;

export const checkoutProductUpdateSchema = z.object({
  quantity: z.number().optional(),
});
export type CheckoutProductUpdate = z.input<typeof checkoutProductUpdateSchema>;

// read-only sub-resource: GET checkouts/{id}/shipment_methods.json
// returns an array directly (no envelope)
export const checkoutShipmentMethodSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    title: z.string().optional(),
    taxRate: z.number().optional(),
    priceExcl: z.number().optional(),
    priceIncl: z.number().optional(),
    basePriceIncl: z.number().optional(),
    basePriceExcl: z.number().optional(),
    isServicePoint: z.boolean().optional(),
    discount: z.union([z.boolean(), z.record(z.unknown())]).optional(),
    data: z.record(z.unknown()).optional(),
  })
  .passthrough();
export type CheckoutShipmentMethod = z.infer<typeof checkoutShipmentMethodSchema>;

// read-only sub-resource: GET checkouts/{id}/payment_methods.json
// returns an array directly (no envelope)
export const checkoutPaymentMethodSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    method: z.union([z.string(), z.literal(false)]).optional(),
    postPayment: z.boolean().optional(),
    invoiceExternal: z.boolean().optional(),
    title: z.string().optional(),
    taxRate: z.number().optional(),
    priceExcl: z.number().optional(),
    priceIncl: z.number().optional(),
    data: z.record(z.unknown()).nullable().optional(),
  })
  .passthrough();
export type CheckoutPaymentMethod = z.infer<typeof checkoutPaymentMethodSchema>;

// main checkout schema — camelCase typed surface (wire is snake_case)
export const checkoutSchema = z
  .object({
    id: z.number(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    orderId: z.number().nullable().optional(),
    theme: z.string().nullable().optional(),
    step: z.string().optional(),
    mode: z.string().optional(),
    info: z.record(z.unknown()).optional(),
    customer: z.record(z.unknown()).nullable().optional(),
    billingAddress: z.record(z.unknown()).nullable().optional(),
    shippingAddress: z.record(z.unknown()).nullable().optional(),
    quote: z.record(z.unknown()).optional(),
    giftCards: z.unknown().optional(),
    shipmentMethod: z.union([checkoutShipmentMethodSchema, z.null()]).optional(),
    paymentMethod: z.union([checkoutPaymentMethodSchema, z.null()]).optional(),
    discount: z.union([z.boolean(), z.record(z.unknown())]).optional(),
    comment: z.string().nullable().optional(),
    newsletter: z.boolean().nullable().optional(),
    terms: z.boolean().nullable().optional(),
    notifications: z.boolean().nullable().optional(),
    memo: z.unknown().optional(),
    products: z.array(checkoutProductSchema).optional(),
    discountCode: z.union([z.string(), z.record(z.unknown()), z.null()]).optional(),
  })
  .passthrough();
export type Checkout = z.infer<typeof checkoutSchema>;

// validate result: { validated, errors: [] | { "dotted.snake.key": "message" } }
// the errors object has dynamic snake/dotted keys — never run fromWire on it.
export const checkoutValidateSchema = z
  .object({
    validated: z.boolean(),
    errors: z.union([z.array(z.unknown()), z.record(z.string())]),
  })
  .passthrough();
export type CheckoutValidation = z.infer<typeof checkoutValidateSchema>;

// order (finish) result: { order_id, payment_url, payment_provider }
export const checkoutOrderResultSchema = z
  .object({
    orderId: z.number(),
    paymentUrl: z.string().optional(),
    paymentProvider: z.string().optional(),
  })
  .passthrough();
export type CheckoutOrderResult = z.infer<typeof checkoutOrderResultSchema>;

// input schema for create (camelCase — what users pass)
export const checkoutInputSchema = z.object({
  mode: z.string().optional(),
  customer: z.record(z.unknown()).optional(),
  billingAddress: z.record(z.unknown()).optional(),
  shippingAddress: z.record(z.unknown()).optional(),
  shipmentMethod: z.string().optional(),
  paymentMethod: z
    .object({ id: z.union([z.string(), z.number()]) })
    .passthrough()
    .optional(),
  comment: z.string().optional(),
  newsletter: z.boolean().optional(),
  terms: z.union([z.boolean(), z.number()]).optional(),
  notifications: z.boolean().optional(),
  discountCode: z.string().optional(),
});
export type CheckoutInput = z.input<typeof checkoutInputSchema>;

export const checkoutUpdateSchema = checkoutInputSchema.partial();
export type CheckoutUpdate = z.input<typeof checkoutUpdateSchema>;

// checkout-product sub-resource (POST/PUT/DELETE only — no list per Postman)
export class CheckoutProductResource {
  private readonly base: string;

  constructor(
    private readonly transport: Transport,
    parentBase: string,
  ) {
    this.base = `${parentBase}/products`;
  }

  add = async (input: CheckoutProductInput): Promise<CheckoutProduct> => {
    const parsed = checkoutProductInputSchema.safeParse(input);
    if (!parsed.success)
      throw new LightspeedValidationError("invalid checkout product input", parsed.error.issues);
    const raw = await this.transport.send<unknown>({
      method: "POST",
      path: `${this.base}.json`,
      body: toWire(parsed.data, CHECKOUT_PRODUCT_MAP),
    });
    const result = checkoutProductSchema.safeParse(
      fromWire(raw as Record<string, unknown>, CHECKOUT_PRODUCT_MAP),
    );
    if (!result.success)
      throw new LightspeedValidationError("invalid checkout product response", result.error.issues);
    return result.data;
  };

  update = async (productId: number, input: CheckoutProductUpdate): Promise<CheckoutProduct> => {
    const parsed = checkoutProductUpdateSchema.safeParse(input);
    if (!parsed.success)
      throw new LightspeedValidationError(
        "invalid checkout product update input",
        parsed.error.issues,
      );
    const raw = await this.transport.send<unknown>({
      method: "PUT",
      path: `${this.base}/${productId}.json`,
      body: toWire(parsed.data, CHECKOUT_PRODUCT_MAP),
    });
    const result = checkoutProductSchema.safeParse(
      fromWire(raw as Record<string, unknown>, CHECKOUT_PRODUCT_MAP),
    );
    if (!result.success)
      throw new LightspeedValidationError(
        "invalid checkout product update response",
        result.error.issues,
      );
    return result.data;
  };

  remove = (productId: number): Promise<unknown> =>
    this.transport.send({
      method: "DELETE",
      path: `${this.base}/${productId}.json`,
    });
}

// main checkout resource — does NOT extend Resource<T> because the api uses
// no envelopes; all methods use direct transport calls + explicit casing maps
export class CheckoutResource {
  protected readonly base = "checkouts";

  constructor(protected readonly transport: Transport) {}

  list = async (q?: ListQuery): Promise<Checkout[]> => {
    const raw = await this.transport.send<unknown>({
      method: "GET",
      path: `${this.base}.json`,
      query: q as Record<string, string | number | boolean | undefined>,
    });
    // api returns bare array (no envelope)
    const mapped = (raw as unknown[]).map((o) => normalizeCheckout(o));
    const parsed = checkoutSchema.array().safeParse(mapped);
    if (!parsed.success)
      throw new LightspeedValidationError("invalid checkout list response", parsed.error.issues);
    return parsed.data;
  };

  count = async (q?: Record<string, unknown>): Promise<number> => {
    const raw = await this.transport.send<{ count?: number }>({
      method: "GET",
      path: `${this.base}/count.json`,
      query: q as Record<string, string | number | boolean | undefined>,
    });
    return raw?.count ?? 0;
  };

  get = async (id: number): Promise<Checkout> => {
    const raw = await this.transport.send<unknown>({
      method: "GET",
      path: `${this.base}/${id}.json`,
    });
    // api returns direct object (no envelope)
    const parsed = checkoutSchema.safeParse(normalizeCheckout(raw));
    if (!parsed.success)
      throw new LightspeedValidationError("invalid checkout response", parsed.error.issues);
    return parsed.data;
  };

  create = async (input: CheckoutInput): Promise<Checkout> => {
    const parsed = checkoutInputSchema.safeParse(input);
    if (!parsed.success)
      throw new LightspeedValidationError("invalid checkout input", parsed.error.issues);
    const raw = await this.transport.send<unknown>({
      method: "POST",
      path: `${this.base}.json`,
      body: toWire(parsed.data, CHECKOUT_MAP),
    });
    const result = checkoutSchema.safeParse(normalizeCheckout(raw));
    if (!result.success)
      throw new LightspeedValidationError("invalid checkout create response", result.error.issues);
    return result.data;
  };

  update = async (id: number, input: CheckoutUpdate): Promise<Checkout> => {
    const parsed = checkoutUpdateSchema.safeParse(input);
    if (!parsed.success)
      throw new LightspeedValidationError("invalid checkout update input", parsed.error.issues);
    const raw = await this.transport.send<unknown>({
      method: "PUT",
      path: `${this.base}/${id}.json`,
      body: toWire(parsed.data, CHECKOUT_MAP),
    });
    const result = checkoutSchema.safeParse(normalizeCheckout(raw));
    if (!result.success)
      throw new LightspeedValidationError("invalid checkout update response", result.error.issues);
    return result.data;
  };

  products = (id: number): CheckoutProductResource =>
    new CheckoutProductResource(this.transport, `${this.base}/${id}`);

  // GET checkouts/{id}/shipment_methods.json — returns array directly
  shipmentMethods = async (id: number): Promise<CheckoutShipmentMethod[]> => {
    const raw = await this.transport.send<unknown>({
      method: "GET",
      path: EXCEPTIONS.checkoutShipmentMethods(id),
    });
    const mapped = (raw as unknown[]).map((o) =>
      fromWire(o as Record<string, unknown>, SHIPMENT_METHOD_MAP),
    );
    const parsed = checkoutShipmentMethodSchema.array().safeParse(mapped);
    if (!parsed.success)
      throw new LightspeedValidationError(
        "invalid checkout shipment methods response",
        parsed.error.issues,
      );
    return parsed.data;
  };

  // GET checkouts/{id}/payment_methods.json — returns array directly
  paymentMethods = async (id: number): Promise<CheckoutPaymentMethod[]> => {
    const raw = await this.transport.send<unknown>({
      method: "GET",
      path: EXCEPTIONS.checkoutPaymentMethods(id),
    });
    const mapped = (raw as unknown[]).map((o) =>
      fromWire(o as Record<string, unknown>, PAYMENT_METHOD_MAP),
    );
    const parsed = checkoutPaymentMethodSchema.array().safeParse(mapped);
    if (!parsed.success)
      throw new LightspeedValidationError(
        "invalid checkout payment methods response",
        parsed.error.issues,
      );
    return parsed.data;
  };

  // GET checkouts/{id}/validate.json — { validated, errors }
  // NOTE: do NOT fromWire the response; the errors map has dynamic dotted/snake
  // keys (e.g. "shipping_address.address1.required") that must be preserved.
  validate = async (id: number): Promise<CheckoutValidation> => {
    const raw = await this.transport.send<unknown>({
      method: "GET",
      path: EXCEPTIONS.checkoutValidate(id),
    });
    const parsed = checkoutValidateSchema.safeParse(raw);
    if (!parsed.success)
      throw new LightspeedValidationError(
        "invalid checkout validate response",
        parsed.error.issues,
      );
    return parsed.data;
  };

  // POST checkouts/{id}/order.json — converts checkout to an order
  order = async (id: number, input?: Record<string, unknown>): Promise<CheckoutOrderResult> => {
    const raw = await this.transport.send<unknown>({
      method: "POST",
      path: EXCEPTIONS.checkoutOrder(id),
      body: input,
    });
    const parsed = checkoutOrderResultSchema.safeParse(
      fromWire(raw as Record<string, unknown>, ORDER_RESULT_MAP),
    );
    if (!parsed.success)
      throw new LightspeedValidationError("invalid checkout order response", parsed.error.issues);
    return parsed.data;
  };
}
