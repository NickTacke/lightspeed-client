export const ProductVisibility = {
  hidden: "hidden",
  visible: "visible",
  auto: "auto",
} as const;
export type ProductVisibility = (typeof ProductVisibility)[keyof typeof ProductVisibility];

export const OrderStatus = {
  on_hold: "on_hold",
  processing_awaiting_payment: "processing_awaiting_payment",
  processing_awaiting_shipment: "processing_awaiting_shipment",
  processing_awaiting_pickup: "processing_awaiting_pickup",
  processing_ready_for_pickup: "processing_ready_for_pickup",
  completed: "completed",
  completed_shipped: "completed_shipped",
  completed_picked_up: "completed_picked_up",
  cancelled: "cancelled",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderPaymentStatus = {
  not_paid: "not_paid",
  partially_paid: "partially_paid",
  paid: "paid",
  cancelled: "cancelled",
} as const;
export type OrderPaymentStatus = (typeof OrderPaymentStatus)[keyof typeof OrderPaymentStatus];

export const OrderShipmentStatus = {
  not_shipped: "not_shipped",
  partially_shipped: "partially_shipped",
  shipped: "shipped",
  cancelled: "cancelled",
} as const;
export type OrderShipmentStatus = (typeof OrderShipmentStatus)[keyof typeof OrderShipmentStatus];

export const WebhookFormat = {
  json: "json",
  xml: "xml",
} as const;
export type WebhookFormat = (typeof WebhookFormat)[keyof typeof WebhookFormat];

export const WebhookItemGroup = {
  customers: "customers",
  orders: "orders",
  invoices: "invoices",
  shipments: "shipments",
  products: "products",
  variants: "variants",
  quotes: "quotes",
  reviews: "reviews",
  returns: "returns",
  subscriptions: "subscriptions",
} as const;
export type WebhookItemGroup = (typeof WebhookItemGroup)[keyof typeof WebhookItemGroup];

// wildcard "*" is a valid itemAction value; it matches all actions
export const WebhookItemAction = {
  created: "created",
  updated: "updated",
  deleted: "deleted",
  wildcard: "*",
} as const;
export type WebhookItemAction = (typeof WebhookItemAction)[keyof typeof WebhookItemAction];
