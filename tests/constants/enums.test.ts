import { describe, expect, it } from "bun:test";
import {
  OrderPaymentStatus,
  OrderShipmentStatus,
  OrderStatus,
  ProductVisibility,
  WebhookFormat,
  WebhookItemAction,
  WebhookItemGroup,
} from "../../src/constants/enums";

// helper: sort values without losing literal types on the expected side
function sorted<T extends string>(obj: Record<string, T>): T[] {
  return (Object.values(obj) as T[]).slice().sort();
}

describe("ProductVisibility", () => {
  it("has correct members", () => {
    expect(ProductVisibility.hidden).toBe("hidden");
    expect(ProductVisibility.visible).toBe("visible");
    expect(ProductVisibility.auto).toBe("auto");
  });

  it("has exact documented values", () => {
    expect(sorted(ProductVisibility)).toEqual(["auto", "hidden", "visible"]);
  });
});

describe("OrderStatus", () => {
  it("has correct members", () => {
    expect(OrderStatus.on_hold).toBe("on_hold");
    expect(OrderStatus.processing_awaiting_payment).toBe("processing_awaiting_payment");
    expect(OrderStatus.processing_awaiting_shipment).toBe("processing_awaiting_shipment");
    expect(OrderStatus.processing_awaiting_pickup).toBe("processing_awaiting_pickup");
    expect(OrderStatus.processing_ready_for_pickup).toBe("processing_ready_for_pickup");
    expect(OrderStatus.completed).toBe("completed");
    expect(OrderStatus.completed_shipped).toBe("completed_shipped");
    expect(OrderStatus.completed_picked_up).toBe("completed_picked_up");
    expect(OrderStatus.cancelled).toBe("cancelled");
  });

  it("has exact documented values", () => {
    expect(sorted(OrderStatus)).toEqual([
      "cancelled",
      "completed",
      "completed_picked_up",
      "completed_shipped",
      "on_hold",
      "processing_awaiting_payment",
      "processing_awaiting_pickup",
      "processing_awaiting_shipment",
      "processing_ready_for_pickup",
    ]);
  });
});

describe("OrderPaymentStatus", () => {
  it("has correct members", () => {
    expect(OrderPaymentStatus.not_paid).toBe("not_paid");
    expect(OrderPaymentStatus.partially_paid).toBe("partially_paid");
    expect(OrderPaymentStatus.paid).toBe("paid");
    expect(OrderPaymentStatus.cancelled).toBe("cancelled");
  });

  it("has exact documented values", () => {
    expect(sorted(OrderPaymentStatus)).toEqual(["cancelled", "not_paid", "paid", "partially_paid"]);
  });
});

describe("OrderShipmentStatus", () => {
  it("has correct members", () => {
    expect(OrderShipmentStatus.not_shipped).toBe("not_shipped");
    expect(OrderShipmentStatus.partially_shipped).toBe("partially_shipped");
    expect(OrderShipmentStatus.shipped).toBe("shipped");
    expect(OrderShipmentStatus.cancelled).toBe("cancelled");
  });

  it("has exact documented values", () => {
    expect(sorted(OrderShipmentStatus)).toEqual([
      "cancelled",
      "not_shipped",
      "partially_shipped",
      "shipped",
    ]);
  });
});

describe("WebhookFormat", () => {
  it("has correct members", () => {
    expect(WebhookFormat.json).toBe("json");
    expect(WebhookFormat.xml).toBe("xml");
  });

  it("has exact documented values", () => {
    expect(sorted(WebhookFormat)).toEqual(["json", "xml"]);
  });
});

describe("WebhookItemGroup", () => {
  it("has correct members", () => {
    expect(WebhookItemGroup.customers).toBe("customers");
    expect(WebhookItemGroup.orders).toBe("orders");
    expect(WebhookItemGroup.invoices).toBe("invoices");
    expect(WebhookItemGroup.shipments).toBe("shipments");
    expect(WebhookItemGroup.products).toBe("products");
    expect(WebhookItemGroup.variants).toBe("variants");
    expect(WebhookItemGroup.quotes).toBe("quotes");
    expect(WebhookItemGroup.reviews).toBe("reviews");
    expect(WebhookItemGroup.returns).toBe("returns");
    expect(WebhookItemGroup.subscriptions).toBe("subscriptions");
  });

  it("has exact documented values", () => {
    expect(sorted(WebhookItemGroup)).toEqual([
      "customers",
      "invoices",
      "orders",
      "products",
      "quotes",
      "returns",
      "reviews",
      "shipments",
      "subscriptions",
      "variants",
    ]);
  });
});

describe("WebhookItemAction", () => {
  it("has correct members", () => {
    expect(WebhookItemAction.created).toBe("created");
    expect(WebhookItemAction.updated).toBe("updated");
    expect(WebhookItemAction.deleted).toBe("deleted");
    expect(WebhookItemAction.wildcard).toBe("*");
  });

  it("has exact documented values", () => {
    expect(sorted(WebhookItemAction)).toEqual(["*", "created", "deleted", "updated"]);
  });
});
