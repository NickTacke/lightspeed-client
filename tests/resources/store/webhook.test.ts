import { expect, test } from "bun:test";
import {
  webhookInputSchema,
  webhookSchema,
  webhookUpdateSchema,
} from "../../../src/resources/store/webhook";

// docs-derived sample (live webhooks.json is empty array on test shop)
const sample = {
  id: 1,
  createdAt: "2026-01-01T00:00:00+00:00",
  updatedAt: "2026-01-01T00:00:00+00:00",
  isActive: true,
  url: "https://example.com/webhook",
  format: "json",
  itemGroup: "orders",
  itemAction: "created",
  secret: "abc123",
  extra: "",
};

test("webhookSchema parses a webhook fixture", () => {
  const w = webhookSchema.parse(sample);
  expect(w.id).toBe(1);
  expect(w.format).toBe("json");
  expect(w.itemGroup).toBe("orders");
  expect(w.itemAction).toBe("created");
});

test("webhookSchema accepts wildcard itemAction", () => {
  const w = webhookSchema.parse({ ...sample, itemAction: "*" });
  expect(w.itemAction).toBe("*");
});

test("webhookInputSchema requires url, itemGroup, itemAction", () => {
  expect(webhookInputSchema.safeParse({}).success).toBe(false);
  expect(
    webhookInputSchema.safeParse({
      url: "https://x.com",
      itemGroup: "orders",
      itemAction: "created",
    }).success,
  ).toBe(true);
});

test("webhookUpdateSchema allows partial update", () => {
  const result = webhookUpdateSchema.parse({ isActive: false });
  expect(result.isActive).toBe(false);
});

test("webhookSchema preserves unknown fields via passthrough", () => {
  const w = webhookSchema.parse({ ...sample, newField: "value" });
  expect((w as Record<string, unknown>).newField).toBe("value");
});
