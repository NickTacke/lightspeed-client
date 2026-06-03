---
"lightspeed-client": patch
---

fix order/orderProduct/orderEvent schemas against live data (order number is a string, country fields are objects, order products use quantityOrdered/price fields). previously these schemas threw on real orders.
