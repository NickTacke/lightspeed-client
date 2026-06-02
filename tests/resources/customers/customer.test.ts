import { expect, test } from "bun:test";
import { LightspeedValidationError } from "../../../src/core/errors";
import { LightspeedClient } from "../../../src/index";
import {
  CustomerResource,
  customerInputSchema,
  customerSchema,
  customerUpdateSchema,
} from "../../../src/resources/customers/customer";

class FakeTransport {
  // biome-ignore lint/suspicious/noExplicitAny: test fake
  calls: any[] = [];
  // biome-ignore lint/suspicious/noExplicitAny: test fake
  constructor(private responder: (a: any) => any) {}
  // biome-ignore lint/suspicious/noExplicitAny: test fake
  async send(args: any) {
    this.calls.push(args);
    return this.responder(args);
  }
}

// docs-derived sample (live shop has no customers — unvalidated live)
const sample = {
  id: 42,
  createdAt: "2026-01-01T00:00:00+00:00",
  updatedAt: "2026-01-01T00:00:00+00:00",
  isConfirmed: true,
  email: "john@example.com",
  firstname: "John",
  middlename: "",
  lastname: "Doe",
  phone: "",
  mobile: "",
  companyName: "",
  companyCoCNumber: "",
  companyVatNumber: "",
  addressBillingCountry: "nl",
  addressShippingCountry: "nl",
  memo: null,
  doNotifyRegistered: true,
  groups: false,
  metafields: { resource: { id: false, url: "customers/42/metafields", link: "https://x" } },
};

test("customerSchema parses a docs-derived customer sample", () => {
  const c = customerSchema.parse(sample);
  expect(c.id).toBe(42);
  expect(c.email).toBe("john@example.com");
  expect(c.groups).toBe(false);
  expect(c.memo).toBeNull();
});

test("customerSchema preserves unknown fields via passthrough", () => {
  const c = customerSchema.parse({ ...sample, extraField: "x" });
  expect((c as Record<string, unknown>).extraField).toBe("x");
});

test("customerInputSchema accepts a full customer payload", () => {
  const result = customerInputSchema.safeParse({
    email: "john@example.com",
    firstname: "John",
    lastname: "Doe",
    isConfirmed: true,
    addressBillingCountry: "nl",
  });
  expect(result.success).toBe(true);
});

test("customerInputSchema accepts an empty object (all fields optional)", () => {
  expect(customerInputSchema.safeParse({}).success).toBe(true);
});

test("customerUpdateSchema allows partial update", () => {
  const r = customerUpdateSchema.parse({ email: "new@example.com" });
  expect(r.email).toBe("new@example.com");
});

test("CustomerResource.list hits customers.json with customers envelope", async () => {
  const t = new FakeTransport(() => ({ customers: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CustomerResource(t as any);
  const result = await r.list();
  expect(result).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "customers.json" });
});

test("CustomerResource.get hits customers/{id}.json", async () => {
  const t = new FakeTransport(() => ({ customer: sample }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CustomerResource(t as any);
  const c = await r.get(42);
  expect(c.id).toBe(42);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "customers/42.json" });
});

test("CustomerResource.create POSTs to customers.json with customer envelope", async () => {
  const t = new FakeTransport(() => ({ customer: sample }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CustomerResource(t as any);
  await r.create({ email: "john@example.com", firstname: "John", lastname: "Doe" });
  expect(t.calls[0]).toMatchObject({
    method: "POST",
    path: "customers.json",
    body: { customer: { email: "john@example.com", firstname: "John", lastname: "Doe" } },
  });
});

test("CustomerResource.update PUTs to customers/{id}.json with customer envelope", async () => {
  const t = new FakeTransport(() => ({ customer: sample }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CustomerResource(t as any);
  await r.update(42, { email: "new@example.com" });
  expect(t.calls[0]).toMatchObject({
    method: "PUT",
    path: "customers/42.json",
    body: { customer: { email: "new@example.com" } },
  });
});

test("CustomerResource.delete DELETEs customers/{id}.json", async () => {
  const t = new FakeTransport(() => undefined);
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CustomerResource(t as any);
  await r.delete(42);
  expect(t.calls[0]).toMatchObject({ method: "DELETE", path: "customers/42.json" });
});

test("CustomerResource.metafields(id) scopes to customers/{id}/metafields.json with customerMetafields envelope", async () => {
  const t = new FakeTransport(() => ({ customerMetafields: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CustomerResource(t as any);
  const mf = r.metafields(42);
  const list = await mf.list();
  expect(list).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "customers/42/metafields.json" });
});

test("CustomerResource.metafields(id).get hits customers/{id}/metafields/{mfId}.json with customerMetafield envelope", async () => {
  const metaSample = {
    id: 1,
    createdAt: "2026-01-01T00:00:00+00:00",
    updatedAt: "2026-01-01T00:00:00+00:00",
    key: "foo",
    value: "bar",
  };
  const t = new FakeTransport(() => ({ customerMetafield: metaSample }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CustomerResource(t as any);
  const mf = await r.metafields(42).get(1);
  expect(mf.id).toBe(1);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "customers/42/metafields/1.json" });
});

test("CustomerResource.login POSTs to customers/{id}/login.json with customerLogin envelope", async () => {
  const t = new FakeTransport(() => ({ customerLogin: { token: "abc" } }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CustomerResource(t as any);
  await r.login(42, { password: "secret" });
  expect(t.calls[0]).toMatchObject({
    method: "POST",
    path: "customers/42/login.json",
    body: { customerLogin: { password: "secret" } },
  });
});

test("CustomerResource.login throws LightspeedValidationError on invalid input", async () => {
  const t = new FakeTransport(() => ({}));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CustomerResource(t as any);
  await expect(r.login(42, { password: 123 as unknown as string })).rejects.toBeInstanceOf(
    LightspeedValidationError,
  );
});

test("CustomerResource.singleSignOn GETs customers/{id}/tokens.json", async () => {
  const t = new FakeTransport(() => ({ customerToken: { token: "xyz" } }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new CustomerResource(t as any);
  await r.singleSignOn(42);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "customers/42/tokens.json" });
});

test("client.customers is a CustomerResource", () => {
  const c = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  expect(c.customers).toBeInstanceOf(CustomerResource);
  expect(typeof c.customers.list).toBe("function");
  expect(typeof c.customers.count).toBe("function");
  expect(typeof c.customers.get).toBe("function");
  expect(typeof c.customers.create).toBe("function");
  expect(typeof c.customers.update).toBe("function");
  expect(typeof c.customers.delete).toBe("function");
  expect(typeof c.customers.login).toBe("function");
  expect(typeof c.customers.singleSignOn).toBe("function");
});
