import { expect, test } from "bun:test";
import { LightspeedClient } from "../../../src/index";
import {
  categoryInputSchema,
  categorySchema,
  categoryUpdateSchema,
} from "../../../src/resources/catalog/category";

// trimmed real sample from GET /nl/categories.json (live shop eu1/nl, 2026-06-02)
// deviations vs plan: image=false, path=string[], depth=number, type=string, sorting=string
const sample = {
  id: 13881645,
  createdAt: "2026-06-02T10:24:43+02:00",
  updatedAt: "2026-06-02T10:24:44+02:00",
  isVisible: true,
  depth: 2,
  path: ["13881645", "13881644"],
  type: "category",
  sortOrder: 1,
  sorting: "popular",
  url: "relais-boards/relais-boards",
  title: "Relais boards",
  fulltitle: "Relais boards",
  description: "",
  content: "",
  image: false,
  parent: {
    resource: {
      id: 13881644,
      url: "categories/13881644",
      link: "https://api.webshopapp.com/nl/categories/13881644.json",
    },
  },
  children: {
    resource: {
      id: false,
      url: "categories?parent=13881645",
      link: "https://api.webshopapp.com/nl/categories.json?parent=13881645",
    },
  },
  products: {
    resource: {
      id: false,
      url: "categories/products?category=13881645",
      link: "https://api.webshopapp.com/nl/categories/products.json?category=13881645",
    },
  },
};

test("categorySchema parses a real category", () => {
  const c = categorySchema.parse(sample);
  expect(c.id).toBe(13881645);
  expect(c.image).toBe(false);
  expect(c.depth).toBe(2);
  expect(c.path).toEqual(["13881645", "13881644"]);
  expect(c.sorting).toBe("popular");
});

test("categoryUpdateSchema allows partial update without title", () => {
  const result = categoryUpdateSchema.parse({ isVisible: false });
  expect(result.isVisible).toBe(false);
});

test("categoryInputSchema requires title", () => {
  expect(categoryInputSchema.safeParse({}).success).toBe(false);
  expect(categoryInputSchema.safeParse({ title: "Test" }).success).toBe(true);
});

test("categorySchema preserves unknown fields via passthrough", () => {
  const c = categorySchema.parse({ ...sample, extraField: "extra" });
  expect((c as Record<string, unknown>).extraField).toBe("extra");
});

test("CategoryResource.image(id) path is categories/{id}/image", () => {
  const client = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  const img = client.categories.image(13881645);
  expect(typeof img.get).toBe("function");
  expect(typeof img.create).toBe("function");
  expect(typeof img.delete).toBe("function");
  // SingleImageResource has no list
  expect((img as unknown as Record<string, unknown>).list).toBeUndefined();
});
