---
"lightspeed-client": minor
---

BREAKING: the checkout API now uses camelCase fields (createdAt, orderId, variantId, shipmentMethod, paymentMethod, ...) like the rest of the client, instead of the raw snake_case it returned in 0.1.0. checkout validate() and order() now return typed results (CheckoutValidation, CheckoutOrderResult). update any code that read snake_case checkout fields.
