import { z } from "zod";
import { orFalse, resourceRef, timestamps } from "../../core/fragments";
import type { Transport } from "../../core/http";
import { Resource } from "../../core/resource";
import { MetafieldResource } from "../shared/metafield";

// docs-derived schema (test shop has no shipments — unvalidated live)
export const shipmentProductSchema = timestamps
  .extend({
    id: z.number(),
    quantity: z.number().optional(),
    price: z.number().optional(),
    priceExcl: z.number().optional(),
    taxRate: z.number().optional(),
    title: z.string().optional(),
    articleCode: z.string().optional(),
    sku: z.string().optional(),
    ean: z.string().optional(),
    weightValue: z.number().optional(),
    weightUnit: z.string().optional(),
    variant: orFalse(resourceRef).optional(),
    shipment: resourceRef.optional(),
  })
  .passthrough();
export type ShipmentProduct = z.infer<typeof shipmentProductSchema>;

export class ShipmentProductResource extends Resource<ShipmentProduct> {
  protected schema = shipmentProductSchema;
  protected singular = "shipmentProduct";
  protected plural = "shipmentProducts";
  protected base: string;

  constructor(transport: Transport, parentPrefix: string) {
    super(transport);
    this.base = `${parentPrefix}/products`;
  }

  list = (q?: Parameters<ShipmentProductResource["list_"]>[0]) => this.list_(q);
  count = (q?: Record<string, unknown>) => this.count_(q);
  get = (id: number) => this.get_(id);
}

// docs-derived schema (unvalidated live)
export const shipmentSchema = timestamps
  .extend({
    id: z.number(),
    number: z.number().optional(),
    status: z.string().optional(),
    trackingCode: z.string().optional(),
    trackingUrl: z.string().optional(),
    carrier: z.string().optional(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    company: z.string().optional(),
    email: z.string().optional(),
    addressStreet: z.string().optional(),
    addressStreet2: z.string().optional(),
    addressNumber: z.string().optional(),
    addressZipcode: z.string().optional(),
    addressCity: z.string().optional(),
    addressRegion: z.string().optional(),
    addressCountry: z.string().optional(),
    customer: orFalse(resourceRef).optional(),
    order: resourceRef.optional(),
    products: resourceRef.optional(),
    metafields: resourceRef.optional(),
  })
  .passthrough();
export type Shipment = z.infer<typeof shipmentSchema>;

export const shipmentUpdateSchema = z.object({
  status: z.string().optional(),
  trackingCode: z.string().optional(),
  trackingUrl: z.string().optional(),
  carrier: z.string().optional(),
});
export type ShipmentUpdate = z.input<typeof shipmentUpdateSchema>;

export interface ShipmentFilters {
  status?: string;
  order?: number;
}

export class ShipmentResource extends Resource<Shipment> {
  protected base = "shipments";
  protected schema = shipmentSchema;
  protected singular = "shipment";
  protected plural = "shipments";

  list = (q?: ShipmentFilters & Parameters<ShipmentResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: ShipmentFilters & Parameters<ShipmentResource["list_"]>[0]) => this.paginate_(q);
  count = (q?: ShipmentFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
  update = (id: number, input: ShipmentUpdate) => this.update_(id, shipmentUpdateSchema, input);

  products = (id: number) => new ShipmentProductResource(this.transport, `${this.base}/${id}`);
  metafields = (id: number) =>
    new MetafieldResource(this.transport, `${this.base}/${id}`, this.singular);
}

export { ShipmentResource as default };
