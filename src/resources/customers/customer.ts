import { z } from "zod";
import { EXCEPTIONS } from "../../core/endpoints";
import { LightspeedValidationError } from "../../core/errors";
import { countryObject, orFalse, resourceRef, timestamps } from "../../core/fragments";
import type { Transport } from "../../core/http";
import { Resource } from "../../core/resource";
import { MetafieldResource } from "../shared/metafield";

// docs-derived schema (live shop has no customers — unvalidated live)
export const customerSchema = timestamps
  .extend({
    id: z.number(),
    isConfirmed: z.boolean().optional(),
    remoteId: z.string().optional(),
    nationalId: z.string().optional(),
    email: z.string().optional(),
    firstname: z.string().optional(),
    middlename: z.string().optional(),
    lastname: z.string().optional(),
    phone: z.string().optional(),
    mobile: z.string().optional(),
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
    addressShippingName: z.string().optional(),
    addressShippingStreet: z.string().optional(),
    addressShippingStreet2: z.string().optional(),
    addressShippingNumber: z.string().optional(),
    addressShippingExtension: z.string().optional(),
    addressShippingZipcode: z.string().optional(),
    addressShippingCity: z.string().optional(),
    addressShippingRegion: z.string().optional(),
    addressShippingCountry: orFalse(countryObject).optional(),
    memo: z.string().nullable().optional(),
    doNotifyRegistered: z.boolean().optional(),
    groups: orFalse(resourceRef).optional(),
    metafields: resourceRef.optional(),
  })
  .passthrough();
export type Customer = z.infer<typeof customerSchema>;

export const customerInputSchema = z.object({
  email: z.string().optional(),
  firstname: z.string().optional(),
  middlename: z.string().optional(),
  lastname: z.string().optional(),
  isConfirmed: z.boolean().optional(),
  remoteId: z.string().optional(),
  nationalId: z.string().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
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
  addressBillingCountry: z.string().optional(),
  addressShippingName: z.string().optional(),
  addressShippingStreet: z.string().optional(),
  addressShippingStreet2: z.string().optional(),
  addressShippingNumber: z.string().optional(),
  addressShippingExtension: z.string().optional(),
  addressShippingZipcode: z.string().optional(),
  addressShippingCity: z.string().optional(),
  addressShippingRegion: z.string().optional(),
  addressShippingCountry: z.string().optional(),
  memo: z.string().nullable().optional(),
  doNotifyRegistered: z.boolean().optional(),
});
export type CustomerInput = z.input<typeof customerInputSchema>;

export const customerUpdateSchema = customerInputSchema.partial();
export type CustomerUpdate = z.input<typeof customerUpdateSchema>;

export const customerLoginInputSchema = z.object({
  password: z.string(),
});
export type CustomerLoginInput = z.input<typeof customerLoginInputSchema>;

export interface CustomerFilters {
  email?: string;
  isConfirmed?: boolean;
}

export class CustomerResource extends Resource<Customer> {
  protected base = "customers";
  protected schema = customerSchema;
  protected singular = "customer";
  protected plural = "customers";

  list = (q?: CustomerFilters & Parameters<CustomerResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: CustomerFilters & Parameters<CustomerResource["list_"]>[0]) => this.paginate_(q);
  count = (q?: CustomerFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
  create = (input: CustomerInput) => this.create_(customerInputSchema, input);
  update = (id: number, input: CustomerUpdate) => this.update_(id, customerUpdateSchema, input);
  delete = (id: number) => this.delete_(id);

  metafields = (id: number) =>
    new MetafieldResource(this.transport, `${this.base}/${id}`, this.singular);

  // POST customers/{id}/login.json — body: { customerLogin: { password } }
  // response shape undocumented/unreachable; returned as unknown
  login = async (id: number, input: CustomerLoginInput): Promise<unknown> => {
    const parsed = customerLoginInputSchema.safeParse(input);
    if (!parsed.success)
      throw new LightspeedValidationError("invalid login input", parsed.error.issues);
    return this.transport.send({
      method: "POST",
      path: EXCEPTIONS.customerLogin(id),
      body: { customerLogin: parsed.data },
    });
  };

  // GET customers/{id}/tokens.json — SSO token endpoint
  // response shape undocumented/unreachable; returned as unknown
  singleSignOn = (id: number): Promise<unknown> =>
    this.transport.send({
      method: "GET",
      path: EXCEPTIONS.customerTokens(id),
    });
}

export { CustomerResource as default };
