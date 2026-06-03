import { describe, expect, test } from "bun:test";
import { metafieldSchema } from "../../../src/resources/shared/metafield";
import { MetafieldResource } from "../../../src/resources/shared/metafield";

// trimmed real sample from GET /nl/products/163090479/metafields/284908443.json
const sample = {
  id: 284908443,
  createdAt: "2026-06-02T10:24:43+02:00",
  updatedAt: "2026-06-02T10:24:43+02:00",
  key: "meta_description_nl",
  value: "1 kanaals relais board 3V",
};

describe("metafieldSchema", () => {
  test("parses a real metafield", () => {
    const m = metafieldSchema.parse(sample);
    expect(m.id).toBe(284908443);
    expect(m.key).toBe("meta_description_nl");
  });

  test("passthrough preserves unknown fields", () => {
    const m = metafieldSchema.parse({ ...sample, namespace: "my_ns" });
    expect((m as Record<string, unknown>).namespace).toBe("my_ns");
  });

  test("accepts a numeric value (e.g. shop metafield value: 0)", () => {
    expect(
      metafieldSchema.safeParse({
        id: 1,
        createdAt: "x",
        updatedAt: "y",
        key: "k",
        value: 0,
      }).success,
    ).toBe(true);
  });
});

describe("MetafieldResource paths", () => {
  let calls: unknown[] = [];
  // typed as returning unknown so we can swap responses per test
  const fakeTransport: { send: (args: unknown) => Promise<unknown> } = {
    send: async (args) => {
      calls.push(args);
      return { productMetafields: [sample] };
    },
  };

  test("list uses parent prefix path", async () => {
    calls = [];
    fakeTransport.send = async (args) => {
      calls.push(args);
      return { productMetafields: [sample] };
    };
    const r = new MetafieldResource(fakeTransport as never, "products/5", "product");
    await r.list();
    expect((calls[0] as { path: string }).path).toBe("products/5/metafields.json");
  });

  test("get uses parent prefix path", async () => {
    calls = [];
    fakeTransport.send = async (args) => {
      calls.push(args);
      return { productMetafield: sample };
    };
    const r = new MetafieldResource(fakeTransport as never, "products/5", "product");
    const m = await r.get(284908443);
    expect((calls[0] as { path: string }).path).toBe("products/5/metafields/284908443.json");
    expect(m.id).toBe(284908443);
  });
});
