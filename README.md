# lightspeed-client

TypeScript client for the **Lightspeed eCom (C-Series)** API — not Retail/POS.

```
bun add lightspeed-client
npm i lightspeed-client
```

---

## Auth & setup

Credentials live in your Lightspeed back office under **Settings > API access**. The client uses HTTP Basic auth (apiKey:apiSecret).

```ts
import { LightspeedClient } from "lightspeed-client";

const client = new LightspeedClient({
  apiKey: process.env.LS_KEY!,
  apiSecret: process.env.LS_SECRET!,
  language: "en",   // required — ISO language code used as a path segment
  cluster: "eu1",   // "eu1" (default) = api.webshopapp.com
                    // "us1"           = api.shoplightspeed.com
});
```

`language` must match the primary language configured for your shop (e.g. `"en"`, `"nl"`, `"de"`).

---

## Quickstart

```ts
// list products (one page, up to 250)
const products = await client.products.list({ limit: 50 });
console.log(products.map(p => p.title));

// get a single product
const product = await client.products.get(12345);

// create
const created = await client.products.create({ title: "New widget" });

// update
const updated = await client.products.update(created.id, { isVisible: true });

// delete
await client.products.delete(created.id);
```

---

## Pagination

Every list resource exposes two modes:

### Single page

```ts
const page = await client.products.list({ page: 1, limit: 100 });
```

### Full iteration with `paginate()`

```ts
for await (const product of client.products.paginate()) {
  console.log(product.title);
}
```

`paginate()` walks every page using **cursor mode** (`since_id`): it requests records with id greater than the highest seen so far. This is safe for arbitrarily large datasets (offset/`page` paging is capped on deep pages) and does not suffer from offset-drift when items are created mid-iteration. Limit is capped at 250 per page. Pass list filters to scope the walk:

```ts
for await (const product of client.products.paginate({ isVisible: true })) {
  // ...
}
```

If you need explicit page-by-page control, call `list({ page, limit })` in your own loop.

---

## Filtering

All list methods accept common filters:

| filter | type | description |
|---|---|---|
| `since_id` | `number` | return records with id > this value |
| `created_at_min` | `string` | ISO 8601 lower bound |
| `created_at_max` | `string` | ISO 8601 upper bound |
| `updated_at_min` | `string` | ISO 8601 lower bound |
| `updated_at_max` | `string` | ISO 8601 upper bound |
| `fields` | `string` | comma-separated field names to return |
| `page` | `number` | page number (1-indexed) |
| `limit` | `number` | results per page, max 250 |

Per-resource filters are passed in the same object:

```ts
// products: brand, supplier, type, isVisible, title
const visible = await client.products.list({ isVisible: true, limit: 50 });

// orders: customer_id, status, created_at_min, etc.
const recent = await client.orders.list({ updated_at_min: "2024-01-01T00:00:00Z" });
```

---

## Rate limiting

Lightspeed enforces three rolling windows (5-minute / hourly / daily). The client:

- **Proactively throttles** by reading `X-RateLimit-*` headers after each response and sleeping before the next call if any bucket is nearly exhausted.
- **Automatically retries** on 429 (and 5xx) responses with exponential back-off (up to 3 retries by default).

To disable proactive throttling (e.g. for batch scripts you control externally):

```ts
const client = new LightspeedClient({
  // ...
  rateLimit: { proactive: false },
});
```

---

## Errors

All errors extend `LightspeedError`. Import from `lightspeed-client`:

```ts
import {
  LightspeedApiError,
  LightspeedAuthError,       // 401
  LightspeedNotFoundError,   // 404
  LightspeedRateLimitError,  // 429; has .retryAfter (seconds)
  LightspeedBadRequestError, // 400 / 422 (validation failures)
  LightspeedServerError,     // 5xx
  LightspeedValidationError, // response schema mismatch (local)
  LightspeedTimeoutError,    // request exceeded timeoutMs
} from "lightspeed-client";

try {
  await client.products.get(9999999);
} catch (err) {
  if (err instanceof LightspeedNotFoundError) {
    console.log("not found:", err.status, err.message);
  }
}
```

Validation failures from the API come back as 400/422 and are thrown as `LightspeedBadRequestError` with a descriptive message.

---

## Sub-resources

Parent-scoped operations are accessed via factory methods on the resource:

```ts
// product images
const images = await client.products.images(productId).list();

// product metafields
const mf = await client.products.metafields(productId).list();
await client.products.metafields(productId).create({ key: "colour", value: "red" });

// product relations / filter values / attributes
const relations = await client.products.relations(productId).list();
const filterValues = await client.products.filterValues(productId).list();
// attributes are derived from the product's type (list/get/update/delete, no create)
const attrs = await client.products.attributes(productId).list();

// metafields on the shop / account singletons (no id arg)
const shopMf = await client.shop.metafields().list();
const accountMf = await client.account.metafields().list();

// order products (line items)
const lineItems = await client.orders.products(orderId).list();

// order events
const events = await client.orderEvents.list({ orderId });

// quote products / shipping methods / payment methods
const qProducts = await client.quotes.products(quoteId).list();
const shipping  = await client.quotes.shipmentMethods(quoteId).list();
const payment   = await client.quotes.paymentMethods(quoteId).list();

// invoice items
const items = await client.invoices.items(invoiceId).list();

// shipment products
const sp = await client.shipments.products(shipmentId).list();

// checkout products / methods (camelCase, like the rest of the client)
await client.checkouts.products(checkoutId).add({ variantId: 1, quantity: 2 });
const methods = await client.checkouts.shipmentMethods(checkoutId);

// validate, then convert a checkout to an order (both return typed results)
const validation = await client.checkouts.validate(checkoutId); // CheckoutValidation
if (validation.validated) {
  const result = await client.checkouts.order(checkoutId);      // CheckoutOrderResult
  console.log(result.orderId);
}
```

---

## Raw escape hatch

Use `client.request` for endpoints or parameters not yet covered:

```ts
import { z } from "zod";

// without a schema — returns unknown
const raw = await client.request({
  method: "GET",
  path: "brands.json",
  query: { limit: 10 },
});

// with a zod schema — validates and types the response
const schema = z.object({ brand: z.object({ id: z.number(), title: z.string() }) });
const brand = await client.request({
  method: "GET",
  path: "brands/42.json",
  schema,
});
console.log(brand.brand.title);
```

---

## Resource coverage

### Catalog

| accessor | resource |
|---|---|
| `client.products` | Products (+ `.images(id)`, `.metafields(id)`, `.relations(id)`, `.filterValues(id)`, `.attributes(id)`) |
| `client.variants` | Variants |
| `client.variantMovements` | Variant stock movements |
| `client.categories` | Categories |
| `client.brands` | Brands |
| `client.types` | Product types |
| `client.typeAttributes` | Type-attribute links |
| `client.attributes` | Attributes |
| `client.tags` | Tags |
| `client.quantityDiscounts` | Quantity discounts (filters: `product`, `variant`) |

### Sales

| accessor | resource |
|---|---|
| `client.orders` | Orders (+ `.products(id)`) |
| `client.orderEvents` | Order events |
| `client.orderCustomStatuses` | Order custom statuses |
| `client.quotes` | Quotes (+ `.products(id)`, `.shipmentMethods(id)`, `.paymentMethods(id)`) |
| `client.invoices` | Invoices (+ `.items(id)`) |
| `client.shipments` | Shipments (+ `.products(id)`) |
| `client.returns` | Returns |
| `client.checkouts` | Checkouts — camelCase, no envelopes (bare arrays) (+ `.products(id)`, `.shipmentMethods(id)`, `.paymentMethods(id)`, `.validate(id)`, `.order(id)`) |

### Customers

| accessor | resource |
|---|---|
| `client.customers` | Customers |
| `client.groups` | Customer groups |

### Store

| accessor | resource |
|---|---|
| `client.account` | Account (singleton) (+ `.metafields()`) |
| `client.shop` | Shop (singleton) (+ `.metafields()`) |
| `client.webhooks` | Webhooks |

### Join tables

| accessor | resource |
|---|---|
| `client.categoriesProducts` | Category-product assignments |
| `client.tagsProducts` | Tag-product assignments |
| `client.groupsCustomers` | Group-customer assignments |

### Roadmap / not yet covered

The following top-level resources are not yet implemented and fall through to `client.request`. They are grouped by the themes targeted for v0.3.0+:

- **Content** — Blog posts and pages, Text pages, File / theme assets, Themes, Redirects
- **Merchandising** — Product reviews, Discounts and coupon codes, top-level Filters / filter values, Sets, Catalog feed
- **Config** — Tax, Shipping- and payment-method configuration, Delivery dates, Suppliers, External services, Subscriptions, Country / Language / Time
- **Support** — Support tickets, Contacts, Dashboard, Events

All shipped schemas in this release are live-validated against a real Lightspeed eCom shop. Schemas for resources without live test data are derived from the Lightspeed eCom API documentation; field presence may vary by plan or shop configuration.

---

## License

MIT
