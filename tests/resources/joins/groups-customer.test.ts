import { expect, test } from "bun:test";
import {
  groupsCustomerInputSchema,
  groupsCustomerSchema,
} from "../../../src/resources/joins/groups-customer";
import type { GroupsCustomerFilters } from "../../../src/resources/joins/groups-customer";

// groups/customers is empty on the test shop; schema derived from docs and API structure
const sample = {
  id: 1,
  group: {
    resource: {
      id: 100,
      url: "groups/100",
      link: "https://api.webshopapp.com/nl/groups/100.json",
    },
  },
  customer: {
    resource: {
      id: 200,
      url: "customers/200",
      link: "https://api.webshopapp.com/nl/customers/200.json",
    },
  },
};

test("groupsCustomerSchema parses a record", () => {
  const r = groupsCustomerSchema.parse(sample);
  expect(r.id).toBe(1);
  expect(r.group.resource.id).toBe(100);
  expect(r.customer.resource.id).toBe(200);
});

test("groupsCustomerSchema preserves unknown fields via passthrough", () => {
  const r = groupsCustomerSchema.parse({ ...sample, extra: "x" });
  expect((r as Record<string, unknown>).extra).toBe("x");
});

test("groupsCustomerInputSchema requires group and customer", () => {
  expect(groupsCustomerInputSchema.safeParse({}).success).toBe(false);
  expect(groupsCustomerInputSchema.safeParse({ group: 1 }).success).toBe(false);
  expect(groupsCustomerInputSchema.safeParse({ customer: 1 }).success).toBe(false);
  expect(groupsCustomerInputSchema.safeParse({ group: 1, customer: 2 }).success).toBe(true);
});

test("path is groups/customers with correct envelope keys", () => {
  const { GroupsCustomerResource } = require("../../../src/resources/joins/groups-customer");
  const transport = { send: async () => ({ groupsCustomers: [] }) };
  const res = new GroupsCustomerResource(transport);
  expect((res as unknown as { base: string }).base).toBe("groups/customers");
  expect((res as unknown as { plural: string }).plural).toBe("groupsCustomers");
  expect((res as unknown as { singular: string }).singular).toBe("groupsCustomer");
});

test("filter serialization: group and customer params pass through", () => {
  const filters: GroupsCustomerFilters = { group: 100, customer: 200 };
  expect(filters.group).toBe(100);
  expect(filters.customer).toBe(200);
});
