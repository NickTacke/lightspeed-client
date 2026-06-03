import { expect, test } from "bun:test";
import { ShopResource, shopSchema } from "../../../src/resources/store/shop";

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

// trimmed from live GET /nl/shop.json (id 356891, 2026-06-02)
const sample = {
  id: 356891,
  createdAt: "2026-02-09T13:36:52+01:00",
  status: "test",
  isB2b: false,
  isRetail: false,
  subDomain: "benselectronics-test-store",
  mainDomain: "benselectronics-test-store.webshopapp.com",
  email: "info@benselectronics.nl",
  phone: "",
  fax: "",
  street: "",
  street2: "",
  zipcode: "",
  city: "",
  region: "",
  country: { id: 150, code: "nl", code3: "nld", title: "Netherlands, The" },
  vatNumber: "",
  cocNumber: "",
  industry: "------------",
  currency: {
    shortcode: "EUR",
    symbol: "€",
    title: "Euro",
    isDefault: true,
    currencyRate: "1.000000",
  },
  company: {
    resource: {
      id: false,
      url: "shop/company",
      link: "https://api.webshopapp.com/nl/shop/company.json",
    },
  },
  limits: {
    resource: {
      id: false,
      url: "shop/limits",
      link: "https://api.webshopapp.com/nl/shop/limits.json",
    },
  },
};

test("shopSchema parses live shop fixture", () => {
  const s = shopSchema.parse(sample);
  expect(s.id).toBe(356891);
  expect(s.country.code).toBe("nl");
  expect(s.currency.shortcode).toBe("EUR");
  expect(s.currency.isDefault).toBe(true);
});

test("shopSchema preserves unknown fields via passthrough", () => {
  const s = shopSchema.parse({
    ...sample,
    javascript: { resource: { id: false, url: "shop/javascript", link: "https://x" } },
  });
  expect((s as Record<string, unknown>).javascript).toBeDefined();
});

test("ShopResource.metafields().list hits shop/metafields.json with shopMetafields envelope", async () => {
  const t = new FakeTransport(() => ({ shopMetafields: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ShopResource(t as any);
  const mf = r.metafields();
  expect(typeof mf.list).toBe("function");
  const list = await mf.list();
  expect(list).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "shop/metafields.json" });
});

test("ShopResource.metafields().create POSTs shop/metafields.json with shopMetafield envelope", async () => {
  const t = new FakeTransport(() => ({
    shopMetafield: { id: 1, createdAt: "x", updatedAt: "x", key: "k", value: "v" },
  }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ShopResource(t as any);
  await r.metafields().create({ key: "k", value: "v" });
  expect(t.calls[0]).toMatchObject({
    method: "POST",
    path: "shop/metafields.json",
    body: { shopMetafield: { key: "k", value: "v" } },
  });
});
