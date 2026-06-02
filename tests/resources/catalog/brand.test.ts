import { expect, test } from "bun:test";
import { LightspeedClient } from "../../../src/index";
import {
  brandInputSchema,
  brandSchema,
  brandUpdateSchema,
} from "../../../src/resources/catalog/brand";

// trimmed real sample from GET /nl/brands.json (live shop eu1/nl, 2026-06-02)
// deviations vs plan: content=false, image=false
const sample = {
  id: 5000916,
  createdAt: "2026-06-02T10:24:26+02:00",
  updatedAt: "2026-06-02T10:24:26+02:00",
  url: "delta",
  title: "Delta",
  content: false,
  image: false,
  products: {
    resource: {
      id: false,
      url: "products?brand=5000916",
      link: "https://api.webshopapp.com/nl/products.json?brand=5000916",
    },
  },
  isVisible: true,
};

test("brandSchema parses a real brand", () => {
  const b = brandSchema.parse(sample);
  expect(b.id).toBe(5000916);
  expect(b.content).toBe(false);
  expect(b.image).toBe(false);
  expect(b.isVisible).toBe(true);
});

test("brandUpdateSchema allows partial update without title", () => {
  const result = brandUpdateSchema.parse({ isVisible: false });
  expect(result.isVisible).toBe(false);
});

test("brandInputSchema requires title", () => {
  expect(brandInputSchema.safeParse({}).success).toBe(false);
  expect(brandInputSchema.safeParse({ title: "MyBrand" }).success).toBe(true);
});

test("brandSchema preserves unknown fields via passthrough", () => {
  const b = brandSchema.parse({ ...sample, extra: "x" });
  expect((b as Record<string, unknown>).extra).toBe("x");
});

test("BrandResource.image(id) is a SingleImageResource", () => {
  const client = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  const img = client.brands.image(5000916);
  expect(typeof img.get).toBe("function");
  expect(typeof img.create).toBe("function");
  expect(typeof img.delete).toBe("function");
  expect((img as unknown as Record<string, unknown>).list).toBeUndefined();
});
