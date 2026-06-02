import { expect, test } from "bun:test";
import { derivePath } from "../../src/core/endpoints";

test("list/count/get/create/update/delete derive standard paths", () => {
  expect(derivePath("products", "list")).toBe("products.json");
  expect(derivePath("products", "count")).toBe("products/count.json");
  expect(derivePath("products", "get", 5)).toBe("products/5.json");
  expect(derivePath("products", "create")).toBe("products.json");
  expect(derivePath("products", "update", 5)).toBe("products/5.json");
  expect(derivePath("products", "delete", 5)).toBe("products/5.json");
});

test("nested base path keeps its prefix", () => {
  expect(derivePath("orders/9/products", "list")).toBe("orders/9/products.json");
  expect(derivePath("orders/9/products", "get", 3)).toBe("orders/9/products/3.json");
});
