import { z } from "zod";
import { EXCEPTIONS } from "../../core/endpoints";
import { LightspeedValidationError } from "../../core/errors";
import type { Transport } from "../../core/http";
import type { ListQuery } from "../../core/types";
import type { Order } from "./order";

// checkout api is a v2-style api: snake_case fields, no envelopes, bare arrays
// all schemas use .passthrough() — shapes are docs-derived and unvalidated live

export const checkoutProductSchema = z
  .object({
    id: z.number(),
    cart_id: z.number().optional(),
    product_id: z.number().optional(),
    variant_id: z.number().optional(),
    quantity: z.number().optional(),
    is_custom: z.boolean().optional(),
    has_discount: z.boolean().optional(),
    discount_percentage: z.number().optional(),
    tax_rate: z.number().optional(),
    base_price_excl: z.number().optional(),
    base_price_incl: z.number().optional(),
    price_excl: z.number().optional(),
    price_incl: z.number().optional(),
    price_tax: z.number().optional(),
    title: z.string().optional(),
    fulltitle: z.string().optional(),
    variant: z.string().optional(),
    brand_name: z.string().optional(),
    image_id: z.number().optional(),
    image_thumb: z.string().optional(),
    image_src: z.string().optional(),
    stock_level: z.number().optional(),
    stock_available: z.boolean().optional(),
    stock_on_stock: z.boolean().optional(),
  })
  .passthrough();
export type CheckoutProduct = z.infer<typeof checkoutProductSchema>;

export const checkoutProductInputSchema = z.object({
  variant_id: z.number(),
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
    tax_rate: z.number().optional(),
    price_excl: z.number().optional(),
    price_incl: z.number().optional(),
    base_price_incl: z.number().optional(),
    base_price_excl: z.number().optional(),
    discount: z.union([z.boolean(), z.object({}).passthrough()]).optional(),
    is_service_point: z.boolean().optional(),
    data: z.record(z.unknown()).optional(),
  })
  .passthrough();
export type CheckoutShipmentMethod = z.infer<typeof checkoutShipmentMethodSchema>;

// read-only sub-resource: GET checkouts/{id}/payment_methods.json
// returns an array directly (no envelope)
export const checkoutPaymentMethodSchema = z
  .object({
    id: z.union([z.string(), z.number()]),
    method: z.string().optional(),
    post_payment: z.boolean().optional(),
    invoice_external: z.boolean().optional(),
    title: z.string().optional(),
    tax_rate: z.number().optional(),
    price_excl: z.number().optional(),
    price_incl: z.number().optional(),
    data: z.record(z.unknown()).optional(),
  })
  .passthrough();
export type CheckoutPaymentMethod = z.infer<typeof checkoutPaymentMethodSchema>;

// main checkout schema — snake_case, no createdAt/updatedAt (uses created_at/updated_at)
export const checkoutSchema = z
  .object({
    id: z.number(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    order_id: z.number().nullable().optional(),
    theme: z.string().nullable().optional(),
    step: z.string().optional(),
    mode: z.string().optional(),
    comment: z.string().nullable().optional(),
    newsletter: z.boolean().nullable().optional(),
    terms: z.boolean().optional(),
    notifications: z.boolean().optional(),
    memo: z.unknown().optional(),
    info: z.record(z.unknown()).optional(),
    customer: z.record(z.unknown()).nullable().optional(),
    billing_address: z.record(z.unknown()).nullable().optional(),
    shipping_address: z.record(z.unknown()).nullable().optional(),
    quote: z.record(z.unknown()).optional(),
    shipment_method: z.record(z.unknown()).nullable().optional(),
    payment_method: z.record(z.unknown()).nullable().optional(),
    discount: z.union([z.boolean(), z.record(z.unknown())]).optional(),
    discount_code: z.record(z.unknown()).nullable().optional(),
    products: z.array(checkoutProductSchema).optional(),
  })
  .passthrough();
export type Checkout = z.infer<typeof checkoutSchema>;

// input schema for create/update (all fields optional for update)
export const checkoutInputSchema = z.object({
  // customer info
  customer: z.number().optional(), // customer id to associate
  email: z.string().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  mode: z.string().optional(),
  // billing address
  billing_address: z.record(z.unknown()).optional(),
  // shipping address
  shipping_address: z.record(z.unknown()).optional(),
  // shipment/payment method ids
  shipment_method_id: z.string().optional(),
  payment_method_id: z.string().optional(),
  // misc
  comment: z.string().optional(),
  newsletter: z.boolean().optional(),
  terms: z.boolean().optional(),
  notifications: z.boolean().optional(),
  discount_code: z.string().optional(),
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
      body: parsed.data,
    });
    const result = checkoutProductSchema.safeParse(raw);
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
      body: parsed.data,
    });
    const result = checkoutProductSchema.safeParse(raw);
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
// no envelopes and snake_case fields; all methods use direct transport calls
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
    const parsed = checkoutSchema.array().safeParse(raw);
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
    const parsed = checkoutSchema.safeParse(raw);
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
      body: parsed.data,
    });
    const result = checkoutSchema.safeParse(raw);
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
      body: parsed.data,
    });
    const result = checkoutSchema.safeParse(raw);
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
    const parsed = checkoutShipmentMethodSchema.array().safeParse(raw);
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
    const parsed = checkoutPaymentMethodSchema.array().safeParse(raw);
    if (!parsed.success)
      throw new LightspeedValidationError(
        "invalid checkout payment methods response",
        parsed.error.issues,
      );
    return parsed.data;
  };

  // GET checkouts/{id}/validate.json — response shape undocumented; passthrough
  validate = (id: number): Promise<unknown> =>
    this.transport.send({
      method: "GET",
      path: EXCEPTIONS.checkoutValidate(id),
    });

  // POST checkouts/{id}/order.json — converts checkout to order; returns Order
  // response is assumed to be the order object directly (unvalidated live — test shop has no checkouts)
  order = (id: number, input?: Record<string, unknown>): Promise<Order> =>
    this.transport.send<Order>({
      method: "POST",
      path: EXCEPTIONS.checkoutOrder(id),
      body: input,
    });
}

export { CheckoutResource as default };
