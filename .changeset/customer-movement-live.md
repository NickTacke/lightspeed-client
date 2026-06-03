---
"lightspeed-client": patch
---

fix customer and variant-movement schemas against live data: customer addressBilling/ShippingCountry are country objects (not strings), and variant movements have no updatedAt. previously customers.list/get and variantMovements.list threw on real data.
