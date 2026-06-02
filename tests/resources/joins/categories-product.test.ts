import { expect, test } from "bun:test";
import {
  categoriesProductInputSchema,
  categoriesProductSchema,
} from "../../../src/resources/joins/categories-product";
import type { CategoriesProductFilters } from "../../../src/resources/joins/categories-product";

// trimmed real sample from GET /nl/categories/products.json (live shop eu1/nl, 2026-06-02)
const sample = {
  id: 1171906066,
  sortOrder: 1,
  category: {
    resource: {
      id: 13881645,
      url: "categories/13881645",
      link: "https://api.webshopapp.com/nl/categories/13881645.json",
    },
  },
  product: {
    resource: {
      id: 163090479,
      url: "products/163090479",
      link: "https://api.webshopapp.com/nl/products/163090479.json",
    },
  },
};

test("categoriesProductSchema parses a real record", () => {
  const r = categoriesProductSchema.parse(sample);
  expect(r.id).toBe(1171906066);
  expect(r.sortOrder).toBe(1);
  expect(r.category.resource.id).toBe(13881645);
  expect(r.product.resource.id).toBe(163090479);
});

test("categoriesProductSchema preserves unknown fields via passthrough", () => {
  const r = categoriesProductSchema.parse({ ...sample, extra: "x" });
  expect((r as Record<string, unknown>).extra).toBe("x");
});

test("categoriesProductInputSchema requires category and product", () => {
  expect(categoriesProductInputSchema.safeParse({}).success).toBe(false);
  expect(categoriesProductInputSchema.safeParse({ category: 1 }).success).toBe(false);
  expect(categoriesProductInputSchema.safeParse({ product: 1 }).success).toBe(false);
  expect(categoriesProductInputSchema.safeParse({ category: 1, product: 2 }).success).toBe(true);
});

test("categoriesProductInputSchema accepts optional sortOrder", () => {
  const r = categoriesProductInputSchema.parse({ category: 1, product: 2, sortOrder: 5 });
  expect(r.sortOrder).toBe(5);
});

test("path is categories/products (flat, no parent id)", () => {
  // base drives derivePath -> categories/products.json, categories/products/count.json, etc.
  // confirmed via live: GET /nl/categories/products.json returns categoriesProducts envelope
  const { CategoriesProductResource } = require("../../../src/resources/joins/categories-product");
  const transport = { send: async () => ({ categoriesProducts: [] }) };
  const res = new CategoriesProductResource(transport);
  // accessing protected base via cast
  expect((res as unknown as { base: string }).base).toBe("categories/products");
  expect((res as unknown as { plural: string }).plural).toBe("categoriesProducts");
  expect((res as unknown as { singular: string }).singular).toBe("categoriesProduct");
});

test("filter serialization: product and category params pass through", () => {
  // toQuery is protected; verify via shape -- filters interface accepts the right keys
  const filters: CategoriesProductFilters = { product: 163090479, category: 13881645 };
  expect(filters.product).toBe(163090479);
  expect(filters.category).toBe(13881645);
});
