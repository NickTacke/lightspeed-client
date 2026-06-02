import { expect, test } from "bun:test";
import { z } from "zod";
import { Resource, SingletonResource } from "../../src/core/resource";

const widget = z.object({ id: z.number(), name: z.string() });

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

class WidgetResource extends Resource<z.infer<typeof widget>> {
  protected base = "widgets";
  protected schema = widget;
  protected singular = "widget";
  protected plural = "widgets";
  // biome-ignore lint/suspicious/noExplicitAny: test fake
  list = (q?: any) => this.list_(q);
  get = (id: number) => this.get_(id);
  create = (input: { name: string }) => this.create_(z.object({ name: z.string() }), input);
}

test("list unwraps plural envelope and validates", async () => {
  const t = new FakeTransport(() => ({ widgets: [{ id: 1, name: "a" }] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new WidgetResource(t as any);
  expect(await r.list()).toEqual([{ id: 1, name: "a" }]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "widgets.json" });
});

test("get unwraps singular envelope", async () => {
  const t = new FakeTransport(() => ({ widget: { id: 2, name: "b" } }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new WidgetResource(t as any);
  expect(await r.get(2)).toEqual({ id: 2, name: "b" });
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "widgets/2.json" });
});

test("create wraps body in singular envelope and validates input", async () => {
  const t = new FakeTransport(() => ({ widget: { id: 3, name: "c" } }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new WidgetResource(t as any);
  await r.create({ name: "c" });
  expect(t.calls[0]).toMatchObject({
    method: "POST",
    path: "widgets.json",
    body: { widget: { name: "c" } },
  });
});

class ShopRes extends SingletonResource<{ id: number }> {
  protected base = "shop";
  protected schema = z.object({ id: z.number() });
  protected key = "shop";
  get = () => this.get_();
}

test("singleton get hits base.json and unwraps key", async () => {
  const t = new FakeTransport(() => ({ shop: { id: 7 } }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new ShopRes(t as any);
  expect(await r.get()).toEqual({ id: 7 });
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "shop.json" });
});
