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
});

describe("MetafieldResource paths", () => {
  const fakeTransport = {
    calls: [] as unknown[],
    send: async (args: unknown) => {
      (fakeTransport.calls as unknown[]).push(args);
      return { productMetafields: [sample] };
    },
  };

  test("list uses parent prefix path", async () => {
    const r = new MetafieldResource(fakeTransport as never, "products/5", "product");
    await r.list();
    expect((fakeTransport.calls[0] as { path: string }).path).toBe("products/5/metafields.json");
  });

  test("get uses parent prefix path", async () => {
    fakeTransport.calls = [];
    fakeTransport.send = async (args: unknown) => {
      fakeTransport.calls.push(args);
      return { productMetafield: sample };
    };
    const r = new MetafieldResource(fakeTransport as never, "products/5", "product");
    const m = await r.get(284908443);
    expect((fakeTransport.calls[0] as { path: string }).path).toBe(
      "products/5/metafields/284908443.json",
    );
    expect(m.id).toBe(284908443);
  });
});
