import { expect, test } from "bun:test";
import { LightspeedClient } from "../../../src/index";
import {
  InvoiceItemResource,
  InvoiceResource,
  invoiceSchema,
  invoiceUpdateSchema,
} from "../../../src/resources/sales/invoice";

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

const sample = {
  id: 332615050,
  createdAt: "2026-01-01T00:00:00+00:00",
  updatedAt: "2026-01-01T00:00:00+00:00",
  number: "INV00001",
  status: "not_paid",
  priceExcl: 41.32,
  priceIncl: 49.99,
  isVatShifted: false,
  doNotifyNew: true,
  doNotifyPaid: false,
  invoice: false,
  isCreditNote: false,
  creditNote: false,
  order: { resource: { id: 1, url: "https://example.com/orders/1.json", link: "orders/1" } },
  customer: {
    resource: { id: 1, url: "https://example.com/customers/1.json", link: "customers/1" },
  },
  items: {
    resource: {
      id: false,
      url: "https://example.com/invoices/1/items.json",
      link: "invoices/1/items",
    },
  },
  metafields: {
    resource: {
      id: false,
      url: "https://example.com/invoices/1/metafields.json",
      link: "invoices/1/metafields",
    },
  },
  events: {
    resource: {
      id: false,
      url: "https://example.com/invoices/1/events.json",
      link: "invoices/1/events",
    },
  },
};

test("invoiceSchema parses a live-shaped sample", () => {
  const inv = invoiceSchema.parse(sample);
  expect(inv.id).toBe(332615050);
  expect(inv.number).toBe("INV00001");
  expect(inv.status).toBe("not_paid");
});

test("invoiceSchema accepts customer: false (customer-less invoice)", () => {
  expect(
    invoiceSchema.safeParse({ id: 1, createdAt: "x", updatedAt: "y", customer: false }).success,
  ).toBe(true);
});

test("invoiceSchema preserves unknown fields via passthrough", () => {
  const inv = invoiceSchema.parse({ ...sample, extra: "x" });
  expect((inv as Record<string, unknown>).extra).toBe("x");
});

test("invoiceUpdateSchema partial", () => {
  const r = invoiceUpdateSchema.parse({ status: "paid" });
  expect(r.status).toBe("paid");
});

test("InvoiceResource hits invoices.json with invoices envelope on list", async () => {
  const t = new FakeTransport(() => ({ invoices: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new InvoiceResource(t as any);
  const result = await r.list();
  expect(result).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "invoices.json" });
});

test("InvoiceResource.items(id) scoped to invoices/{id}/items with invoiceItems envelope", async () => {
  const t = new FakeTransport(() => ({ invoiceItems: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new InvoiceResource(t as any);
  const items = r.items(3001);
  expect(items).toBeInstanceOf(InvoiceItemResource);
  await items.list();
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "invoices/3001/items.json" });
});

test("InvoiceResource.items(id).count hits invoices/{id}/items/count.json", async () => {
  const t = new FakeTransport(() => ({ count: 2 }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new InvoiceResource(t as any);
  const count = await r.items(3001).count();
  expect(count).toBe(2);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "invoices/3001/items/count.json" });
});

test("InvoiceResource.metafields(id) scoped to invoices/{id}/metafields", async () => {
  const t = new FakeTransport(() => ({ invoiceMetafields: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new InvoiceResource(t as any);
  const mf = r.metafields(3001);
  expect(typeof mf.list).toBe("function");
  await mf.list();
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "invoices/3001/metafields.json" });
});

test("client.invoices is an InvoiceResource with no create/delete", () => {
  const c = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  expect(c.invoices).toBeInstanceOf(InvoiceResource);
  expect(typeof c.invoices.list).toBe("function");
  expect(typeof c.invoices.update).toBe("function");
  expect((c.invoices as unknown as Record<string, unknown>).create).toBeUndefined();
  expect((c.invoices as unknown as Record<string, unknown>).delete).toBeUndefined();
});
