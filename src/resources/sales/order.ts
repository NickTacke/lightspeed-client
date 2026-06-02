import { z } from "zod";
import { OrderPaymentStatus, OrderShipmentStatus, OrderStatus } from "../../constants/enums";
import { orFalse, resourceRef, timestamps } from "../../core/fragments";
import type { Transport } from "../../core/http";
import { Resource } from "../../core/resource";
import { MetafieldResource } from "../shared/metafield";

// docs-derived schema (test shop has no orders — unvalidated live)
export const orderProductSchema = timestamps
  .extend({
    id: z.number(),
    quantity: z.number(),
    quantityShipped: z.number().optional(),
    quantityInvoiced: z.number().optional(),
    quantityRefunded: z.number().optional(),
    quantityReturned: z.number().optional(),
    price: z.number(),
    priceExcl: z.number().optional(),
    discountExcl: z.number().optional(),
    discountIncl: z.number().optional(),
    taxRate: z.number().optional(),
    title: z.string().optional(),
    articleCode: z.string().optional(),
    sku: z.string().optional(),
    ean: z.string().optional(),
    variant: orFalse(resourceRef).optional(),
    order: resourceRef.optional(),
  })
  .passthrough();
export type OrderProduct = z.infer<typeof orderProductSchema>;

export class OrderProductResource extends Resource<OrderProduct> {
  protected schema = orderProductSchema;
  protected singular = "orderProduct";
  protected plural = "orderProducts";
  protected base: string;

  constructor(transport: Transport, parentPrefix: string) {
    super(transport);
    this.base = `${parentPrefix}/products`;
  }

  list = (q?: Parameters<OrderProductResource["list_"]>[0]) => this.list_(q);
  count = (q?: Record<string, unknown>) => this.count_(q);
  get = (id: number) => this.get_(id);
}

// docs-derived schema (unvalidated live)
export const orderEventSchema = timestamps
  .extend({
    id: z.number(),
    // type and message are the primary fields per docs
    action: z.string().optional(),
    message: z.string().optional(),
    order: resourceRef.optional(),
  })
  .passthrough();
export type OrderEvent = z.infer<typeof orderEventSchema>;

// order events are top-level: GET /orders/events.json (not parent-scoped)
export class OrderEventResource extends Resource<OrderEvent> {
  protected base = "orders/events";
  protected schema = orderEventSchema;
  protected singular = "orderEvent";
  protected plural = "orderEvents";

  list = (q?: Parameters<OrderEventResource["list_"]>[0]) => this.list_(q);
  count = (q?: Record<string, unknown>) => this.count_(q);
  get = (id: number) => this.get_(id);
}

// credit input: POST /orders/{id}/credit.json — docs + Postman-confirmed body shape
export const orderCreditInputSchema = z.object({
  creditPayment: z.boolean().optional(),
  creditShipment: z.boolean().optional(),
  notifyNew: z.boolean().optional(),
  updateStock: z.boolean().optional(),
  orderProducts: z
    .array(
      z.object({
        id: z.number(),
        quantity: z.number(),
      }),
    )
    .optional(),
});
export type OrderCreditInput = z.input<typeof orderCreditInputSchema>;

// docs-derived schema (unvalidated live)
export const orderSchema = timestamps
  .extend({
    id: z.number(),
    number: z.number().optional(),
    status: z.nativeEnum(OrderStatus).optional(),
    paymentStatus: z.nativeEnum(OrderPaymentStatus).optional(),
    shipmentStatus: z.nativeEnum(OrderShipmentStatus).optional(),
    customerId: z.number().nullable().optional(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    company: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    gender: z.string().optional(),
    birthDate: z.string().nullable().optional(),
    nationalId: z.string().optional(),
    remark: z.string().optional(),
    memo: z.string().optional(),
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
    priceExcl: z.number().optional(),
    priceIncl: z.number().optional(),
    weightValue: z.number().optional(),
    weightUnit: z.string().optional(),
    colli: z.number().optional(),
    deliverydateId: z.number().nullable().optional(),
    channel: z.string().optional(),
    referral: z.string().optional(),
    referralUrl: z.string().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    doNotify: z.boolean().optional(),
    isCompany: z.boolean().optional(),
    customer: orFalse(resourceRef).optional(),
    payment: resourceRef.optional(),
    shipments: resourceRef.optional(),
    invoices: resourceRef.optional(),
    products: resourceRef.optional(),
    metafields: resourceRef.optional(),
    events: resourceRef.optional(),
  })
  .passthrough();
export type Order = z.infer<typeof orderSchema>;

export const orderUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(OrderPaymentStatus).optional(),
  shipmentStatus: z.nativeEnum(OrderShipmentStatus).optional(),
  memo: z.string().optional(),
  remark: z.string().optional(),
  doNotify: z.boolean().optional(),
});
export type OrderUpdate = z.input<typeof orderUpdateSchema>;

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
  shipmentStatus?: OrderShipmentStatus;
  customerId?: number;
  email?: string;
  number?: number;
}

export class OrderResource extends Resource<Order> {
  protected base = "orders";
  protected schema = orderSchema;
  protected singular = "order";
  protected plural = "orders";

  list = (q?: OrderFilters & Parameters<OrderResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: OrderFilters & Parameters<OrderResource["list_"]>[0]) => this.paginate_(q);
  count = (q?: OrderFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
  update = (id: number, input: OrderUpdate) => this.update_(id, orderUpdateSchema, input);

  products = (id: number) => new OrderProductResource(this.transport, `${this.base}/${id}`);
  metafields = (id: number) =>
    new MetafieldResource(this.transport, `${this.base}/${id}`, this.singular);

  // POST /orders/{id}/credit.json — envelope key "credit" per Postman
  credit = async (id: number, input: OrderCreditInput): Promise<unknown> => {
    const parsed = orderCreditInputSchema.safeParse(input);
    if (!parsed.success) throw new Error("invalid credit input");
    return this.transport.send({
      method: "POST",
      path: `${this.base}/${id}/credit.json`,
      body: { credit: parsed.data },
    });
  };
}

export { OrderResource as default };
