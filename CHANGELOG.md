# lightspeed-client

## 0.2.1

### Patch Changes

- a7c6840: fix customer and variant-movement schemas against live data: customer addressBilling/ShippingCountry are country objects (not strings), and variant movements have no updatedAt. previously customers.list/get and variantMovements.list threw on real data.

## 0.2.0

### Minor Changes

- d5da31c: add snake/camel field-mapping helpers (core/casing) used to normalize snake_case resources to camelCase
- 942dce5: BREAKING: the checkout API now uses camelCase fields (createdAt, orderId, variantId, shipmentMethod, paymentMethod, ...) like the rest of the client, instead of the raw snake_case it returned in 0.1.0. checkout validate() and order() now return typed results (CheckoutValidation, CheckoutOrderResult). write inputs also changed: set the shipment method via `update(id, { shipmentMethod: "core|..." })` (was `shipment_method_id`), the payment method via `update(id, { paymentMethod: { id } })` (was `payment_method_id`), and add products via `{ variantId, quantity }` (was `variant_id`); these write field names are live-confirmed against the Lightspeed v2 checkout API. update any code that read or wrote snake_case checkout fields.
- 8cc9f9a: preserve embedded payloads on resource references and add a country-object fragment (live-validated)
- 5e8d0b2: add product sub-resources relations/filterValues/attributes (client.products.relations(id) etc.) and a top-level quantity-discounts resource (client.quantityDiscounts). product attributes are read/update/delete only (the API has no create). all live-validated.
- 050c0de: bind metafields on the shop and account singletons (client.shop.metafields(), client.account.metafields()). live-validated.
- 19e602b: add top-level type-attributes (client.typeAttributes) and order custom-statuses (client.orderCustomStatuses) resources. all live-validated.

### Patch Changes

- 93466d8: fix attribute schema against live data: no longer requires createdAt/updatedAt (the api omits them) and models defaultValue + types. previously attributes.create threw on the response.
- eea894c: live-validate invoice and shipment schemas (number is a string; confirmed field set). previously list/get threw on real invoices/shipments.
- 5f259bf: fix order/orderProduct/orderEvent schemas against live data (order number is a string, country fields are objects, order products use quantityOrdered/price fields). previously these schemas threw on real orders.
- ec45945: tolerate null shipmentZipcode on abandoned quotes (quotes.list/get no longer throws on carts without a shipping address)
- 4018366: live-validate quote schema (country objects, confirmed fields); document returns as docs-derived (no live data)
- 59ddb55: document v0.2.0 resources (product relations/filtervalues/attributes, quantity discounts, type attributes, order custom statuses, shop/account metafields) and add a checkout-to-order example
- 612e144: fix webhook and type schemas against live data: webhook now models the real fields (isActive, itemGroup, itemAction, format, address, language) instead of nonexistent url/secret/extra; type no longer requires createdAt/updatedAt. previously webhooks.get/list and types.get/list threw on real records.
