export type Op = "list" | "count" | "get" | "create" | "update" | "delete";

// derive a json path from a resource base + op (+ id for get/update/delete)
export function derivePath(base: string, op: Op, id?: number | string): string {
  switch (op) {
    case "list":
    case "create":
      return `${base}.json`;
    case "count":
      return `${base}/count.json`;
    case "get":
    case "update":
    case "delete":
      if (id === undefined) throw new Error(`${op} requires an id`);
      return `${base}/${id}.json`;
  }
}

// non-crud endpoints that don't fit derivePath; resources build these explicitly
export const EXCEPTIONS = {
  accountPermissions: "account/permissions.json",
  accountRateLimit: "account/ratelimit.json",
  customerLogin: (id: number) => `customers/${id}/login.json`,
  customerTokens: (id: number) => `customers/${id}/tokens.json`,
  orderCredit: (id: number) => `orders/${id}/credit.json`,
  checkoutShipmentMethods: (id: number) => `checkouts/${id}/shipment_methods.json`,
  checkoutPaymentMethods: (id: number) => `checkouts/${id}/payment_methods.json`,
  checkoutValidate: (id: number) => `checkouts/${id}/validate.json`,
  checkoutOrder: (id: number) => `checkouts/${id}/order.json`,
} as const;
