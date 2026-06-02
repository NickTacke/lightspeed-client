import { z } from "zod";
import { orFalse, resourceRef, timestamps } from "../../core/fragments";
import type { Transport } from "../../core/http";
import { Resource } from "../../core/resource";
import { MetafieldResource } from "../shared/metafield";

// docs-derived schema (test shop has no invoices — unvalidated live)
export const invoiceItemSchema = timestamps
  .extend({
    id: z.number(),
    quantity: z.number().optional(),
    price: z.number().optional(),
    priceExcl: z.number().optional(),
    taxRate: z.number().optional(),
    title: z.string().optional(),
    articleCode: z.string().optional(),
    sku: z.string().optional(),
    variant: orFalse(resourceRef).optional(),
    invoice: resourceRef.optional(),
  })
  .passthrough();
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

export class InvoiceItemResource extends Resource<InvoiceItem> {
  protected schema = invoiceItemSchema;
  protected singular = "invoiceItem";
  protected plural = "invoiceItems";
  protected base: string;

  constructor(transport: Transport, parentPrefix: string) {
    super(transport);
    this.base = `${parentPrefix}/items`;
  }

  list = (q?: Parameters<InvoiceItemResource["list_"]>[0]) => this.list_(q);
  count = (q?: Record<string, unknown>) => this.count_(q);
  get = (id: number) => this.get_(id);
}

// docs-derived schema (unvalidated live)
export const invoiceSchema = timestamps
  .extend({
    id: z.number(),
    number: z.number().optional(),
    status: z.string().optional(),
    customerId: z.number().nullable().optional(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    company: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    gender: z.string().optional(),
    isCompany: z.boolean().optional(),
    addressBillingStreet: z.string().optional(),
    addressBillingStreet2: z.string().optional(),
    addressBillingNumber: z.string().optional(),
    addressBillingZipcode: z.string().optional(),
    addressBillingCity: z.string().optional(),
    addressBillingRegion: z.string().optional(),
    addressBillingCountry: z.string().optional(),
    priceExcl: z.number().optional(),
    priceIncl: z.number().optional(),
    customer: orFalse(resourceRef).optional(),
    order: resourceRef.optional(),
    items: resourceRef.optional(),
    metafields: resourceRef.optional(),
  })
  .passthrough();
export type Invoice = z.infer<typeof invoiceSchema>;

export const invoiceUpdateSchema = z.object({
  status: z.string().optional(),
  memo: z.string().optional(),
});
export type InvoiceUpdate = z.input<typeof invoiceUpdateSchema>;

export interface InvoiceFilters {
  status?: string;
  email?: string;
  number?: number;
}

export class InvoiceResource extends Resource<Invoice> {
  protected base = "invoices";
  protected schema = invoiceSchema;
  protected singular = "invoice";
  protected plural = "invoices";

  list = (q?: InvoiceFilters & Parameters<InvoiceResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: InvoiceFilters & Parameters<InvoiceResource["list_"]>[0]) => this.paginate_(q);
  count = (q?: InvoiceFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
  update = (id: number, input: InvoiceUpdate) => this.update_(id, invoiceUpdateSchema, input);

  items = (id: number) => new InvoiceItemResource(this.transport, `${this.base}/${id}`);
  metafields = (id: number) =>
    new MetafieldResource(this.transport, `${this.base}/${id}`, this.singular);
}

export { InvoiceResource as default };
