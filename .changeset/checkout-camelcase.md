---
"lightspeed-client": minor
---

BREAKING: the checkout API now uses camelCase fields (createdAt, orderId, variantId, shipmentMethod, paymentMethod, ...) like the rest of the client, instead of the raw snake_case it returned in 0.1.0. checkout validate() and order() now return typed results (CheckoutValidation, CheckoutOrderResult). write inputs also changed: set the shipment method via `update(id, { shipmentMethod: "core|..." })` (was `shipment_method_id`), the payment method via `update(id, { paymentMethod: { id } })` (was `payment_method_id`), and add products via `{ variantId, quantity }` (was `variant_id`); these write field names are live-confirmed against the Lightspeed v2 checkout API. update any code that read or wrote snake_case checkout fields.
