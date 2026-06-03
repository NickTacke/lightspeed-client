import { z } from "zod";
import { OrderPaymentStatus, OrderShipmentStatus, OrderStatus } from "../../constants/enums";
import { EXCEPTIONS } from "../../core/endpoints";
import { LightspeedValidationError } from "../../core/errors";
import { countryObject, orFalse, resourceRef, timestamps } from "../../core/fragments";
import type { Transport } from "../../core/http";
import { Resource } from "../../core/resource";
import { MetafieldResource } from "../shared/metafield";

const taxRate = z.object({ name: z.string(), rate: z.number(), amount: z.number() });

export const orderProductSchema = z
  .object({
    id: z.number(),
    supplierTitle: z.string().optional(),
    brandTitle: z.string().optional(),
    productTitle: z.string().optional(),
    variantTitle: z.string().optional(),
    taxRate: z.number().optional(),
    taxRates: z.array(taxRate).optional(),
    quantityOrdered: z.number().optional(),
    quantityInvoiced: z.number().optional(),
    quantityShipped: z.number().optional(),
    quantityRefunded: z.number().optional(),
    quantityReturned: z.number().optional(),
    articleCode: z.string().optional(),
    ean: z.string().optional(),
    sku: z.string().optional(),
    weight: z.number().optional(),
    volume: z.number().optional(),
    colli: z.number().optional(),
    sizeX: z.number().optional(),
    sizeY: z.number().optional(),
    sizeZ: z.number().optional(),
    priceCost: z.number().optional(),
    customExcl: z.number().optional(),
    customIncl: z.number().optional(),
    basePriceExcl: z.number().optional(),
    basePriceIncl: z.number().optional(),
    priceExcl: z.number().optional(),
    priceIncl: z.number().optional(),
    discountExcl: z.number().optional(),
    discountIncl: z.number().optional(),
    customFields: orFalse(z.record(z.unknown())).optional(),
    product: resourceRef.optional(),
    variant: orFalse(resourceRef).optional(),
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

export const orderEventSchema = z
  .object({
    id: z.number(),
    createdAt: z.string().optional(),
    channel: z.string().optional(),
    type: z.string().optional(),
    message: z.string().optional(),
    comment: z.string().nullable().optional(),
    order: resourceRef.optional(),
    invoice: orFalse(resourceRef).optional(),
    shipment: orFalse(resourceRef).optional(),
  })
  .passthrough();
export type OrderEvent = z.infer<typeof orderEventSchema>;

// order events are top-level: GET /orders/events.json (not parent-scoped)
export class OrderEventResource extends Resource<OrderEvent> {
  protected base = "orders/events";
  protected schema = orderEventSchema;
  protected singular = "ordersEvent";
  protected plural = "ordersEvents";

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

export const orderSchema = timestamps
  .extend({
    id: z.number(),
    number: z.string().optional(),
    status: z.nativeEnum(OrderStatus).optional(),
    customStatusId: z.number().nullable().optional(),
    channel: z.string().optional(),
    remoteIp: z.string().optional(),
    userAgent: z.string().optional(),
    referralId: z.union([z.string(), z.literal(false)]).optional(),
    priceCost: z.number().optional(),
    priceExcl: z.number().optional(),
    priceIncl: z.number().optional(),
    weight: z.number().optional(),
    volume: z.number().optional(),
    colli: z.number().optional(),
    gender: z.union([z.string(), z.literal(false)]).optional(),
    // live returns false ("not set"); null kept defensively for shops that send it
    birthDate: z
      .union([z.string(), z.literal(false)])
      .nullable()
      .optional(),
    nationalId: z.string().optional(),
    email: z.string().optional(),
    firstname: z.string().optional(),
    middlename: z.string().optional(),
    lastname: z.string().optional(),
    phone: z.string().optional(),
    mobile: z.string().optional(),
    newsletterSubscribed: z.boolean().optional(),
    isCompany: z.boolean().optional(),
    companyName: z.string().optional(),
    companyCoCNumber: z.string().optional(),
    companyVatNumber: z.string().optional(),
    addressBillingName: z.string().optional(),
    addressBillingStreet: z.string().optional(),
    addressBillingStreet2: z.string().optional(),
    addressBillingNumber: z.string().optional(),
    addressBillingExtension: z.string().optional(),
    addressBillingZipcode: z.string().optional(),
    addressBillingCity: z.string().optional(),
    addressBillingRegion: z.string().optional(),
    addressBillingCountry: orFalse(countryObject).optional(),
    addressBillingRegionData: orFalse(z.record(z.unknown())).optional(),
    addressShippingCompany: z.union([z.string(), z.literal(false)]).optional(),
    addressShippingName: z.string().optional(),
    addressShippingStreet: z.string().optional(),
    addressShippingStreet2: z.string().optional(),
    addressShippingNumber: z.string().optional(),
    addressShippingExtension: z.string().optional(),
    addressShippingZipcode: z.string().optional(),
    addressShippingCity: z.string().optional(),
    addressShippingRegion: z.string().optional(),
    addressShippingCountry: orFalse(countryObject).optional(),
    addressShippingRegionData: orFalse(z.record(z.unknown())).optional(),
    paymentId: z.string().optional(),
    paymentStatus: z.nativeEnum(OrderPaymentStatus).optional(),
    paymentIsPost: z.boolean().optional(),
    paymentIsInvoiceExternal: z.boolean().optional(),
    paymentTaxRate: z.number().optional(),
    paymentTaxRates: z.array(taxRate).optional(),
    paymentBasePriceExcl: z.number().optional(),
    paymentBasePriceIncl: z.number().optional(),
    paymentPriceExcl: z.number().optional(),
    paymentPriceIncl: z.number().optional(),
    paymentTitle: z.string().optional(),
    paymentData: z.union([z.array(z.unknown()), z.record(z.unknown())]).optional(),
    shipmentId: z.union([z.string(), z.literal(false)]).optional(),
    shipmentStatus: z.nativeEnum(OrderShipmentStatus).optional(),
    shipmentIsCashOnDelivery: z.boolean().optional(),
    shipmentIsPickup: z.boolean().optional(),
    shipmentTaxRate: z.number().optional(),
    shipmentTaxRates: z.array(taxRate).optional(),
    shipmentBasePriceExcl: z.number().optional(),
    shipmentBasePriceIncl: z.number().optional(),
    shipmentPriceExcl: z.number().optional(),
    shipmentPriceIncl: z.number().optional(),
    shipmentDiscountExcl: z.number().optional(),
    shipmentDiscountIncl: z.number().optional(),
    shipmentTitle: z.string().optional(),
    shipmentData: z.union([z.array(z.unknown()), z.record(z.unknown())]).optional(),
    shippingDate: z.string().nullable().optional(),
    deliveryDate: z.string().nullable().optional(),
    isDiscounted: z.boolean().optional(),
    discountType: z.string().optional(),
    discountAmount: z.number().optional(),
    discountPercentage: z.number().optional(),
    discountCouponCode: z.string().optional(),
    taxRates: z.array(taxRate).optional(),
    isNewCustomer: z.boolean().optional(),
    comment: z.string().optional(),
    memo: z.string().optional(),
    allowNotifications: z.boolean().optional(),
    doNotifyNew: z.boolean().optional(),
    doNotifyReminder: z.boolean().optional(),
    doNotifyCancelled: z.boolean().optional(),
    language: z.record(z.unknown()).optional(),
    giftCardsPayment: z.array(z.unknown()).optional(),
    customer: orFalse(resourceRef).optional(),
    invoices: resourceRef.optional(),
    shipments: resourceRef.optional(),
    products: resourceRef.optional(),
    metafields: resourceRef.optional(),
    quote: resourceRef.optional(),
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
  number?: string;
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
    if (!parsed.success)
      throw new LightspeedValidationError("invalid credit input", parsed.error.issues);
    return this.transport.send({
      method: "POST",
      path: EXCEPTIONS.orderCredit(id),
      body: { credit: parsed.data },
    });
  };
}

export { OrderResource as default };
