// read and write a product metafield via client.products.metafields(id)
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

const productId = Number(process.env.LS_PRODUCT_ID);
if (!productId) throw new Error("set LS_PRODUCT_ID to a valid product id");

const mf = client.products.metafields(productId);

// list existing metafields
const existing = await mf.list();
console.log("existing metafields:", existing.length);

// create a new one
const created = await mf.create({
  namespace: "example",
  key: "colour",
  value: "red",
  valueType: "STRING",
});
console.log("created:", created.id, created.key, "=", created.value);

// update value
const updated = await mf.update(created.id, {
  key: "colour",
  value: "blue",
});
console.log("updated:", updated.id, updated.key, "=", updated.value);

// delete
await mf.delete(created.id);
console.log("deleted:", created.id);
