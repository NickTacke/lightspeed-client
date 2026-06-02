import { expect, test } from "bun:test";
import { tagInputSchema, tagSchema, tagUpdateSchema } from "../../../src/resources/catalog/tag";

// trimmed real sample from GET /nl/tags.json (live shop eu1/nl, 2026-06-02)
const sample = {
  id: 18890214,
  createdAt: "2026-06-02T10:24:43+02:00",
  updatedAt: "2026-06-02T10:24:44+02:00",
  isVisible: true,
  url: "single-channel-relay",
  title: "single channel relay",
  products: {
    resource: {
      id: false,
      url: "tags/products?tag=18890214",
      link: "https://api.webshopapp.com/nl/tags/products.json?tag=18890214",
    },
  },
};

test("tagSchema parses a real tag", () => {
  const t = tagSchema.parse(sample);
  expect(t.id).toBe(18890214);
  expect(t.title).toBe("single channel relay");
  expect(t.isVisible).toBe(true);
});

test("tagUpdateSchema allows partial update without title", () => {
  const result = tagUpdateSchema.parse({ isVisible: false });
  expect(result.isVisible).toBe(false);
});

test("tagInputSchema requires title", () => {
  expect(tagInputSchema.safeParse({}).success).toBe(false);
  expect(tagInputSchema.safeParse({ title: "my-tag" }).success).toBe(true);
});

test("tagSchema preserves unknown fields via passthrough", () => {
  const t = tagSchema.parse({ ...sample, extra: "x" });
  expect((t as Record<string, unknown>).extra).toBe("x");
});
