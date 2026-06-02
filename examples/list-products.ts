// list the first page of products and print their titles
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

const products = await client.products.list({ limit: 50 });

for (const p of products) {
  console.log(`[${p.id}] ${p.title}`);
}

console.log(`${products.length} product(s) returned`);
