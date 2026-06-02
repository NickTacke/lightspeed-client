import { expect, test } from "bun:test";
import {
  attributeInputSchema,
  attributeSchema,
  attributeUpdateSchema,
} from "../../../src/resources/catalog/attribute";

// NOTE: live shop has no attributes — schema modelled from docs
// live: GET /nl/attributes.json returns {"attributes": []}
const sample = {
  id: 1,
  createdAt: "2026-01-01T00:00:00+00:00",
  updatedAt: "2026-01-01T00:00:00+00:00",
  title: "Color",
  type: "select",
  isRequired: false,
  position: 1,
};

test("attributeSchema parses a minimal attribute object", () => {
  const a = attributeSchema.parse(sample);
  expect(a.id).toBe(1);
  expect(a.title).toBe("Color");
  expect(a.type).toBe("select");
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
