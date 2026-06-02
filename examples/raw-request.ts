// use client.request with a zod schema for a typed response
import { z } from "zod";
import { LightspeedClient } from "../src/index";

const apiKey = process.env.LS_KEY;
const apiSecret = process.env.LS_SECRET;
if (!apiKey || !apiSecret) throw new Error("set LS_KEY and LS_SECRET");

const client = new LightspeedClient({
  apiKey,
  apiSecret,
  language: process.env.LS_LANGUAGE ?? "en",
  cluster: (process.env.LS_CLUSTER as "eu1" | "us1") ?? "eu1",
});

// typed request with an inline schema
const brandListSchema = z.object({
  brands: z.array(
    z
      .object({
        id: z.number(),
        title: z.string(),
      })
      .passthrough(),
  ),
});

const result = await client.request({
  method: "GET",
  path: "brands.json",
  query: { limit: 10 },
  schema: brandListSchema,
});

for (const brand of result.brands) {
  console.log(`[${brand.id}] ${brand.title}`);
}
