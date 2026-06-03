import { expect, test } from "bun:test";
import { fromWire, toWire } from "../../src/core/casing";

// map is camelCase -> wire (snake) for a single resource
const MAP = { zipCode: "zip_code", countryId: "country_id" } as const;

test("toWire renames camel keys to wire and leaves others intact", () => {
  const out = toWire({ zipCode: "1011AA", countryId: 5, city: "Amsterdam" }, MAP);
  expect(out).toEqual({ zip_code: "1011AA", country_id: 5, city: "Amsterdam" });
});

test("fromWire renames wire keys back to camel and leaves others intact", () => {
  const out = fromWire({ zip_code: "1011AA", country_id: 5, city: "Amsterdam" }, MAP);
  expect(out).toEqual({ zipCode: "1011AA", countryId: 5, city: "Amsterdam" });
});

test("fromWire leaves dynamic-key maps untouched (no blanket rewrite)", () => {
  const errors = { "shipping_address.address1.required": "msg", another_snake_key: "x" };
  expect(fromWire(errors, MAP)).toEqual(errors);
});

test("helpers skip undefined values and ignore missing mapped keys", () => {
  expect(toWire({ zipCode: undefined, city: "A" }, MAP)).toEqual({ city: "A" });
  expect(fromWire({ city: "A" }, MAP)).toEqual({ city: "A" });
});

test("helpers are shallow (nested objects are not rewritten)", () => {
  const nested = { zipCode: "1", inner: { country_id: 9 } };
  expect(toWire(nested, MAP)).toEqual({ zip_code: "1", inner: { country_id: 9 } });
});

test("toWire preserves null (clears a field) but drops undefined", () => {
  expect(toWire({ zipCode: null, city: undefined }, MAP)).toEqual({ zip_code: null });
});

test("fromWire reverses a map with unique wire values deterministically", () => {
  const map = { aId: "a_id", bId: "b_id" } as const;
  expect(fromWire({ a_id: 1, b_id: 2 }, map)).toEqual({ aId: 1, bId: 2 });
});
