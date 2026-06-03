import { expect, test } from "bun:test";
import {
  webhookInputSchema,
  webhookSchema,
  webhookUpdateSchema,
} from "../../../src/resources/store/webhook";

// live-confirmed sample (GET webhooks/{id}.json): no url/secret/extra
const sample = {
  id: 4745101,
  createdAt: "2026-01-01T00:00:00+00:00",
  updatedAt: "2026-01-01T00:00:00+00:00",
  isActive: true,
  itemGroup: "products",
  itemAction: "created",
  language: { id: 1, code: "nl", locale: "nl_NL", title: "Nederlands" },
  format: "json",
  address: "https://example.com/hook",
};

test("webhookSchema parses a live webhook fixture", () => {
  const w = webhookSchema.parse(sample);
  expect(w.id).toBe(4745101);
  expect(w.format).toBe("json");
  expect(w.itemGroup).toBe("products");
  expect(w.itemAction).toBe("created");
  expect(w.address).toBe("https://example.com/hook");
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
