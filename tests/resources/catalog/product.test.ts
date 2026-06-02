import { expect, test } from "bun:test";
import {
  productInputSchema,
  productSchema,
  productUpdateSchema,
} from "../../../src/resources/catalog/product";

// trimmed real sample from GET /nl/products.json (live shop eu1/nl, 2026-06-02)
// adjustments from live vs plan: supplier is false (plan assumed resourceRef)
// quantityDiscounts present (handled by passthrough)
const sample = {
  id: 163090479,
  createdAt: "2026-06-02T10:24:43+02:00",
  updatedAt: "2026-06-02T10:24:44+02:00",
  isVisible: true,
  visibility: "visible",
  hasMatrix: false,
  data01: "",
  data02: "",
  data03: "",
  url: "1-kanaals-relais-board-3v",
  title: "1 kanaals relais board 3V",
  fulltitle: "1 kanaals relais board 3V",
  description: "",
  content: "<h2>x</h2>",
  set: false,
  brand: false,
  categories: {
    resource: {
      id: false,
      url: "categories/products?product=163090479",
      link: "https://api.webshopapp.com/nl/categories/products.json?product=163090479",
    },
  },
  deliverydate: false,
  image: {
    createdAt: "2026-06-02T10:24:44+02:00",
    updatedAt: "2026-06-02T10:24:44+02:00",
    extension: "png",
    size: 246845,
    title: "x",
    thumb: "https://t",
    src: "https://s",
  },
  images: { resource: { id: false, url: "products/163090479/images", link: "https://x" } },
  relations: { resource: { id: false, url: "x", link: "https://x" } },
  metafields: { resource: { id: false, url: "x", link: "https://x" } },
  reviews: { resource: { id: false, url: "x", link: "https://x" } },
  type: false,
  attributes: { resource: { id: false, url: "x", link: "https://x" } },
  // live: supplier is false (not a resourceRef as plan assumed)
  supplier: false,
  tags: { resource: { id: false, url: "x", link: "https://x" } },
  variants: { resource: { id: false, url: "x", link: "https://x" } },
  movements: { resource: { id: false, url: "x", link: "https://x" } },
  templateDataFields: {},
};

test("productSchema parses a real product", () => {
  const p = productSchema.parse(sample);
  expect(p.id).toBe(163090479);
  expect(p.set).toBe(false);
  // supplier is false on live data
  expect(p.supplier).toBe(false);
});

test("productUpdateSchema allows partial update without title", () => {
  const result = productUpdateSchema.parse({ isVisible: false });
  expect(result.isVisible).toBe(false);
});

test("productInputSchema requires title", () => {
  expect(productInputSchema.safeParse({}).success).toBe(false);
});

test("productSchema preserves unknown fields via passthrough", () => {
  const p = productSchema.parse({
    ...sample,
    quantityDiscounts: { resource: { id: false, url: "x", link: "https://x" } },
  });
  expect((p as Record<string, unknown>).quantityDiscounts).toBeDefined();
});
