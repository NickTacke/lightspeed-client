import { expect, test } from "bun:test";
import { AccountResource, accountSchema } from "../../../src/resources/store/account";

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

// trimmed from live GET /nl/account.json (id 389694, 2026-06-02)
const sample = {
  id: 389694,
  appId: false,
  apiKey: "test-api-key",
  signout: {
    resource: {
      id: false,
      url: "account/signout",
      link: "https://api.webshopapp.com/nl/account/signout.json",
    },
  },
  permissions: {
    resource: {
      id: false,
      url: "account/permissions",
      link: "https://api.webshopapp.com/nl/account/permissions.json",
    },
  },
  ratelimit: {
    resource: {
      id: false,
      url: "account/ratelimit",
      link: "https://api.webshopapp.com/nl/account/ratelimit.json",
    },
  },
  metafields: {
    resource: {
      id: false,
      url: "account/metafields",
      link: "https://api.webshopapp.com/nl/account/metafields.json",
    },
  },
};

test("accountSchema parses live account fixture", () => {
  const a = accountSchema.parse(sample);
  expect(a.id).toBe(389694);
  expect(a.appId).toBe(false);
  expect(typeof a.apiKey).toBe("string");
});

test("accountSchema preserves unknown fields via passthrough", () => {
  const a = accountSchema.parse({ ...sample, extraField: "hello" });
  expect((a as Record<string, unknown>).extraField).toBe("hello");
});

test("AccountResource.metafields().list hits account/metafields.json with accountMetafields envelope", async () => {
  const t = new FakeTransport(() => ({ accountMetafields: [] }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new AccountResource(t as any);
  const mf = r.metafields();
  expect(typeof mf.list).toBe("function");
  const list = await mf.list();
  expect(list).toEqual([]);
  expect(t.calls[0]).toMatchObject({ method: "GET", path: "account/metafields.json" });
});

test("AccountResource.metafields().create POSTs account/metafields.json with accountMetafield envelope", async () => {
  const t = new FakeTransport(() => ({
    accountMetafield: { id: 1, createdAt: "x", updatedAt: "x", key: "k", value: "v" },
  }));
  // biome-ignore lint/suspicious/noExplicitAny: test fake cast
  const r = new AccountResource(t as any);
  await r.metafields().create({ key: "k", value: "v" });
  expect(t.calls[0]).toMatchObject({
    method: "POST",
    path: "account/metafields.json",
    body: { accountMetafield: { key: "k", value: "v" } },
  });
});
