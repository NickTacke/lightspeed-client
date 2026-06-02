// iterate all products using the paginate() async iterator (cursor/since_id mode)
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

let count = 0;

for await (const product of client.products.paginate({ limit: 250 })) {
  count++;
  if (count <= 10) {
    console.log(`[${product.id}] ${product.title}`);
  }
}

console.log(`total: ${count} product(s)`);
