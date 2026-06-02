import { expect, test } from "bun:test";
import { accountSchema } from "../../../src/resources/store/account";

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
