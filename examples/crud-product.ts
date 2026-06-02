// create → get → update → delete a product
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

// create
const created = await client.products.create({
  title: "Example widget",
  isVisible: false,
});
console.log("created:", created.id, created.title);

// get
const fetched = await client.products.get(created.id);
console.log("fetched:", fetched.id, fetched.title);

// update
const updated = await client.products.update(created.id, {
  title: "Example widget (updated)",
  isVisible: false,
});
console.log("updated:", updated.id, updated.title);

// delete
await client.products.delete(created.id);
console.log("deleted:", created.id);
