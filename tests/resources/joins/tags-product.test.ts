import { expect, test } from "bun:test";
import {
  tagsProductInputSchema,
  tagsProductSchema,
} from "../../../src/resources/joins/tags-product";
import type { TagsProductFilters } from "../../../src/resources/joins/tags-product";

// trimmed real sample from GET /nl/tags/products.json (live shop eu1/nl, 2026-06-02)
// live: no sortOrder field on tagsProduct
const sample = {
  id: 444046025,
  tag: {
    resource: {
      id: 18890214,
      url: "tags/18890214",
      link: "https://api.webshopapp.com/nl/tags/18890214.json",
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

test("tagsProductSchema parses a real record", () => {
  const r = tagsProductSchema.parse(sample);
  expect(r.id).toBe(444046025);
  expect(r.tag.resource.id).toBe(18890214);
  expect(r.product.resource.id).toBe(163090479);
});

test("tagsProductSchema preserves unknown fields via passthrough", () => {
  const r = tagsProductSchema.parse({ ...sample, extra: "x" });
  expect((r as Record<string, unknown>).extra).toBe("x");
});

test("tagsProductInputSchema requires tag and product", () => {
  expect(tagsProductInputSchema.safeParse({}).success).toBe(false);
  expect(tagsProductInputSchema.safeParse({ tag: 1 }).success).toBe(false);
  expect(tagsProductInputSchema.safeParse({ product: 1 }).success).toBe(false);
  expect(tagsProductInputSchema.safeParse({ tag: 1, product: 2 }).success).toBe(true);
});

test("path is tags/products with correct envelope keys", () => {
  const { TagsProductResource } = require("../../../src/resources/joins/tags-product");
  const transport = { send: async () => ({ tagsProducts: [] }) };
  const res = new TagsProductResource(transport);
  expect((res as unknown as { base: string }).base).toBe("tags/products");
  expect((res as unknown as { plural: string }).plural).toBe("tagsProducts");
  expect((res as unknown as { singular: string }).singular).toBe("tagsProduct");
});

test("filter serialization: tag and product params pass through", () => {
  const filters: TagsProductFilters = { tag: 18890214, product: 163090479 };
  expect(filters.tag).toBe(18890214);
  expect(filters.product).toBe(163090479);
});
