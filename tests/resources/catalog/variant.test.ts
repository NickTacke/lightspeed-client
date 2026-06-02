import { expect, test } from "bun:test";
import { LightspeedClient } from "../../../src/index";
import {
  VariantMovementResource,
  variantInputSchema,
  variantSchema,
  variantUpdateSchema,
} from "../../../src/resources/catalog/variant";

// trimmed real sample from GET /nl/variants.json (live shop eu1/nl, 2026-06-02)
// deviations vs plan: hs=null, taxType=null, image=false, matrix=false, additionalcost=false
const sample = {
  id: 322925834,
  createdAt: "2026-06-02T10:24:43+02:00",
  updatedAt: "2026-06-02T10:24:43+02:00",
  isDefault: true,
  sortOrder: 1,
  articleCode: "LABL26",
  ean: "",
  sku: "",
  hs: null,
  unitPrice: 0,
  unitUnit: "",
  priceExcl: 2.8843,
  priceIncl: 3.49,
  priceCost: 1.25,
  oldPriceExcl: 0,
  oldPriceIncl: 0,
  stockTracking: "enabled",
  stockLevel: 148,
  stockAlert: 10,
  stockMinimum: 0,
  stockSold: 0,
  stockBuyMininum: 1,
  stockBuyMinimum: 1,
  stockBuyMaximum: 10000,
  weight: 0,
  weightValue: "0.000",
  weightUnit: "g",
  volume: 0,
  volumeValue: 0,
  volumeUnit: "ml",
  colli: 0,
  sizeX: 0,
  sizeY: 0,
  sizeZ: 0,
  sizeXValue: "0.000",
  sizeYValue: "0.000",
  sizeZValue: "0.000",
  sizeUnit: "cm",
  matrix: false,
  title: "1 kanaals relais board 3V",
  taxType: null,
  image: false,
  tax: {
    resource: {
      id: 1207266,
      url: "taxes/1207266",
      link: "https://api.webshopapp.com/nl/taxes/1207266.json",
    },
  },
  product: {
    resource: {
      id: 163090479,
      url: "products/163090479",
      link: "https://api.webshopapp.com/nl/products/163090479.json",
    },
  },
  movements: {
    resource: {
      id: false,
      url: "variants/movements?variant=322925834",
      link: "https://api.webshopapp.com/nl/variants/movements.json?variant=322925834",
    },
  },
  metafields: {
    resource: {
      id: false,
      url: "variants/322925834/metafields",
      link: "https://api.webshopapp.com/nl/variants/322925834/metafields.json",
    },
  },
  additionalcost: false,
  options: [],
};

test("variantSchema parses a real variant", () => {
  const v = variantSchema.parse(sample);
  expect(v.id).toBe(322925834);
  expect(v.hs).toBeNull();
  expect(v.taxType).toBeNull();
  expect(v.image).toBe(false);
  expect(v.matrix).toBe(false);
  expect(v.additionalcost).toBe(false);
});

test("variantUpdateSchema allows partial update", () => {
  const result = variantUpdateSchema.parse({ priceIncl: 4.99 });
  expect(result.priceIncl).toBe(4.99);
});

test("variantInputSchema is fully optional (no required fields)", () => {
  // variants are created under a product; title is optional
  expect(variantInputSchema.safeParse({}).success).toBe(true);
});

test("variantSchema preserves unknown fields via passthrough", () => {
  const v = variantSchema.parse({ ...sample, customField: "extra" });
  expect((v as Record<string, unknown>).customField).toBe("extra");
});

test("VariantResource.metafields returns a callable MetafieldResource", () => {
  const c = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  const mf = c.variants.metafields(322925834);
  expect(typeof mf.list).toBe("function");
  expect(typeof mf.get).toBe("function");
});

test("VariantResource has no movements accessor", () => {
  const c = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  expect((c.variants as unknown as Record<string, unknown>).movements).toBeUndefined();
});

test("client.variantMovements is a top-level VariantMovementResource", () => {
  const c = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  expect(c.variantMovements).toBeInstanceOf(VariantMovementResource);
  expect(typeof c.variantMovements.list).toBe("function");
  expect(typeof c.variantMovements.get).toBe("function");
  expect(typeof c.variantMovements.count).toBe("function");
  expect(typeof c.variantMovements.paginate).toBe("function");
  // read-only: no mutators
  expect((c.variantMovements as unknown as Record<string, unknown>).create).toBeUndefined();
  expect((c.variantMovements as unknown as Record<string, unknown>).delete).toBeUndefined();
});
