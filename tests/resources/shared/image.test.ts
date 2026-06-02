import { describe, expect, test } from "bun:test";
import {
  ImageCollectionResource,
  SingleImageResource,
  imageSchema,
} from "../../../src/resources/shared/image";

// real sample from GET /nl/products/163090479/images/445094675.json
const sample = {
  id: 445094675,
  sortOrder: 1,
  createdAt: "2026-06-02T10:24:44+02:00",
  updatedAt: "2026-06-02T10:24:44+02:00",
  extension: "png",
  size: 246845,
  title: "3v-relais-module-optocoupler",
  thumb:
    "https://cdn.webshopapp.com/shops/356891/files/497366486/50x50x2/3v-relais-module-optocoupler.png",
  src: "https://cdn.webshopapp.com/shops/356891/files/497366486/3v-relais-module-optocoupler.png",
};

describe("imageSchema", () => {
  test("parses a real product image", () => {
    const img = imageSchema.parse(sample);
    expect(img.id).toBe(445094675);
    expect(img.extension).toBe("png");
    expect(img.sortOrder).toBe(1);
  });

  test("passthrough preserves unknown fields", () => {
    const img = imageSchema.parse({ ...sample, extra: "x" });
    expect((img as Record<string, unknown>).extra).toBe("x");
  });
});

describe("ImageCollectionResource paths", () => {
  let calls: unknown[] = [];
  const fakeTransport: { send: (args: unknown) => Promise<unknown> } = {
    send: async (args) => {
      calls.push(args);
      return { productImages: [sample] };
    },
  };

  test("list uses parent prefix path", async () => {
    calls = [];
    fakeTransport.send = async (args) => {
      calls.push(args);
      return { productImages: [sample] };
    };
    const r = new ImageCollectionResource(fakeTransport as never, "products/5", "product");
    await r.list();
    expect((calls[0] as { path: string }).path).toBe("products/5/images.json");
  });

  test("get uses parent prefix path", async () => {
    calls = [];
    fakeTransport.send = async (args) => {
      calls.push(args);
      return { productImage: sample };
    };
    const r = new ImageCollectionResource(fakeTransport as never, "products/5", "product");
    const img = await r.get(445094675);
    expect((calls[0] as { path: string }).path).toBe("products/5/images/445094675.json");
    expect(img.id).toBe(445094675);
  });
});

describe("SingleImageResource paths", () => {
  const calls: unknown[] = [];
  const fakeTransport = {
    send: async (args: unknown) => {
      calls.push(args);
      return { image: sample };
    },
  };

  test("get hits base/image.json", async () => {
    const r = new SingleImageResource(fakeTransport as never, "brands/5");
    await r.get();
    expect((calls[0] as { path: string }).path).toBe("brands/5/image.json");
  });
});
