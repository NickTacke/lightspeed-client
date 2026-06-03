import { expect, test } from "bun:test";
import { LightspeedClient } from "../../../src/index";
import {
  OrderCustomStatusResource,
  orderCustomStatusSchema,
} from "../../../src/resources/sales/order-custom-status";

class FakeTransport {
  // biome-ignore lint/suspicious/noExplicitAny: test fake
  calls: any[] = [];
  // biome-ignore lint/suspicious/noExplicitAny: test fake
  constructor(private responder: (a: any) => any) {}
  // biome-ignore lint/suspicious/noExplicitAny: test fake
  async send(args: any) {
    this.calls.push(args);
    return this.responder(args);
  }
}

const sample = {
  id: 85508,
  createdAt: "2026-06-03T00:56:12+02:00",
  updatedAt: "2026-06-03T00:56:15+02:00",
  title: "Backorder",
  color: "#000000",
};

test("orderCustomStatusSchema parses the live shape", () => {
  const s = orderCustomStatusSchema.parse(sample);
  expect(s.id).toBe(85508);
  expect(s.title).toBe("Backorder");
  expect(s.color).toBe("#000000");
});

test("OrderCustomStatusResource.list hits orders/customstatuses.json with customStatuses envelope", async () => {
  const t = new FakeTransport(() => ({ customStatuses: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new OrderCustomStatusResource(t as any);
  const result = await r.list();
  expect(result).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "orders/customstatuses.json" });
});

test("OrderCustomStatusResource.get reads customStatus envelope", async () => {
  const t = new FakeTransport(() => ({ customStatus: sample }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new OrderCustomStatusResource(t as any);
  const s = await r.get(85508);
  expect(s.id).toBe(85508);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "orders/customstatuses/85508.json" });
});

test("OrderCustomStatusResource.create POSTs customStatus envelope", async () => {
  const t = new FakeTransport(() => ({ customStatus: sample }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new OrderCustomStatusResource(t as any);
  await r.create({ title: "Backorder", color: "#000000" });
  expect(t.calls[0]).toMatchObject({
    method: "POST",
    path: "orders/customstatuses.json",
    body: { customStatus: { title: "Backorder", color: "#000000" } },
  });
});

test("client.orderCustomStatuses is an OrderCustomStatusResource", () => {
  const c = new LightspeedClient({ apiKey: "k", apiSecret: "s", language: "nl" });
  expect(c.orderCustomStatuses).toBeInstanceOf(OrderCustomStatusResource);
  expect(typeof c.orderCustomStatuses.list).toBe("function");
  expect(typeof c.orderCustomStatuses.get).toBe("function");
  expect(typeof c.orderCustomStatuses.create).toBe("function");
  expect(typeof c.orderCustomStatuses.update).toBe("function");
  expect(typeof c.orderCustomStatuses.delete).toBe("function");
});
