import { expect, test } from "bun:test";
import { typeInputSchema, typeSchema, typeUpdateSchema } from "../../../src/resources/catalog/type";

// live-confirmed sample (GET types/{id}.json): no createdAt/updatedAt
const sample = {
  id: 252474,
  title: "Electronics",
  attributes: {
    resource: {
      id: false,
      url: "types/attributes?type=252474",
      link: "https://api.webshopapp.com/nl/types/attributes.json?type=252474",
    },
  },
};

test("typeSchema parses a live type object without timestamps", () => {
  const t = typeSchema.parse(sample);
  expect(t.id).toBe(252474);
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
