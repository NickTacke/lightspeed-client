// full guest checkout flow: create → add product → pick methods → validate → order
import { LightspeedClient } from "../src/index";

const apiKey = process.env.LS_KEY;
const apiSecret = process.env.LS_SECRET;
if (!apiKey || !apiSecret) throw new Error("set LS_KEY and LS_SECRET");

const client = new LightspeedClient({
  apiKey,
  apiSecret,
  language: process.env.LS_LANGUAGE ?? "nl",
  cluster: (process.env.LS_CLUSTER as "eu1" | "us1") ?? "eu1",
});

const variantId = Number(process.env.LS_VARIANT_ID);
if (!variantId) throw new Error("set LS_VARIANT_ID to a buyable variant id");

// 1. create a guest checkout
const checkout = await client.checkouts.create({
  mode: "guest",
  customer: {
    email: "buyer@example.com",
    firstname: "Test",
    lastname: "Buyer",
    gender: "male",
  },
});
console.log("checkout:", checkout.id);

// 2. add a product (by variant id)
await client.checkouts.products(checkout.id).add({ variantId, quantity: 1 });

// 3. choose a shipment method (ids come from the checkout's options).
// method id is string | number on the wire; coerce to string for the update.
const shipMethods = await client.checkouts.shipmentMethods(checkout.id);
const shipmentMethod = String(shipMethods[0]?.id ?? "");
await client.checkouts.update(checkout.id, { shipmentMethod });

// 4. payment methods become available once a shipment method is set
const payMethods = await client.checkouts.paymentMethods(checkout.id);

// 5. fill addresses + select the payment method
const address = {
  name: "Test Buyer",
  address1: "Teststraat",
  number: 1,
  zipcode: "1011 AA",
  city: "Amsterdam",
  country: "nl",
};
await client.checkouts.update(checkout.id, {
  shipmentMethod,
  billingAddress: address,
  shippingAddress: address,
  paymentMethod: { id: String(payMethods[0]?.id ?? "") },
  terms: 1,
});

// 6. validate, then convert to an order
const validation = await client.checkouts.validate(checkout.id);
if (!validation.validated) {
  console.error("checkout invalid:", validation.errors);
} else {
  const result = await client.checkouts.order(checkout.id);
  console.log("order created:", result.orderId);
}
