import { expect, test } from "bun:test";
import { typeInputSchema, typeSchema, typeUpdateSchema } from "../../../src/resources/catalog/type";

// NOTE: live shop has no types — schema modelled from docs; passthrough covers undoc fields
// live: GET /nl/types.json returns {"types": []}
const sample = {
  id: 1,
  createdAt: "2026-01-01T00:00:00+00:00",
  updatedAt: "2026-01-01T00:00:00+00:00",
  title: "Electronics",
  products: {
    resource: {
      id: false,
      url: "products?type=1",
      link: "https://api.webshopapp.com/nl/products.json?type=1",
    },
  },
};

test("typeSchema parses a minimal type object", () => {
  const t = typeSchema.parse(sample);
  expect(t.id).toBe(1);
  expect(t.title).toBe("Electronics");
});

test("typeUpdateSchema allows partial update without title", () => {
  const result = typeUpdateSchema.parse({ title: "New" });
  expect(result.title).toBe("New");
});

test("typeInputSchema requires title", () => {
  expect(typeInputSchema.safeParse({}).success).toBe(false);
  expect(typeInputSchema.safeParse({ title: "T" }).success).toBe(true);
});

test("typeSchema preserves unknown fields via passthrough", () => {
  const t = typeSchema.parse({ ...sample, extra: "x" });
  expect((t as Record<string, unknown>).extra).toBe("x");
});
