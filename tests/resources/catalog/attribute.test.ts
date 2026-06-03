import { expect, test } from "bun:test";
import {
  attributeInputSchema,
  attributeSchema,
  attributeUpdateSchema,
} from "../../../src/resources/catalog/attribute";

// live attribute shape (create + list): no createdAt/updatedAt
const sample = {
  id: 1,
  title: "Color",
  defaultValue: "",
  types: {
    resource: {
      id: false,
      url: "https://api.webshopapp.com/nl/attributes/1/types.json",
      link: "https://api.webshopapp.com/nl/attributes/1/types.json",
    },
  },
};

test("attributeSchema parses a live attribute object (no timestamps)", () => {
  const a = attributeSchema.parse(sample);
  expect(a.id).toBe(1);
  expect(a.title).toBe("Color");
  expect(a.defaultValue).toBe("");
  expect(a.types?.resource.id).toBe(false);
});

test("attributeUpdateSchema allows partial update without title", () => {
  const result = attributeUpdateSchema.parse({ isRequired: true });
  expect(result.isRequired).toBe(true);
});

test("attributeInputSchema requires title", () => {
  expect(attributeInputSchema.safeParse({}).success).toBe(false);
  expect(attributeInputSchema.safeParse({ title: "Size" }).success).toBe(true);
});

test("attributeSchema preserves unknown fields via passthrough", () => {
  const a = attributeSchema.parse({ ...sample, extra: "x" });
  expect((a as Record<string, unknown>).extra).toBe("x");
});
