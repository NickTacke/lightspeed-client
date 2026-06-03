import { expect, test } from "bun:test";
import { z } from "zod";
import {
  countryObject,
  fileObject,
  orFalse,
  resourceRef,
  timestamps,
} from "../../src/core/fragments";

test("resourceRef parses id|false + url + link", () => {
  const v = resourceRef.parse({
    resource: { id: false, url: "products/1/images", link: "https://x/y.json" },
  });
  expect(v.resource.id).toBe(false);
});

test("orFalse accepts the inner shape or false", () => {
  const schema = orFalse(z.object({ id: z.number() }));
  expect(schema.parse(false)).toBe(false);
  expect(schema.parse({ id: 1 })).toEqual({ id: 1 });
});

test("fileObject parses a real image object", () => {
  const v = fileObject.parse({
    createdAt: "2026-06-02T10:24:44+02:00",
    updatedAt: "2026-06-02T10:24:44+02:00",
    extension: "png",
    size: 246845,
    title: "x",
    thumb: "https://t",
    src: "https://s",
  });
  expect(v.extension).toBe("png");
});

test("countryObject parses a live country object", () => {
  const c = countryObject.parse({ id: 150, code: "nl", code3: "nld", title: "Netherlands, The" });
  expect(c.code).toBe("nl");
});

test("resourceRef preserves embedded payload when present", () => {
  const ref = resourceRef.parse({
    resource: { id: false, url: "u", link: "l", embedded: [{ id: 1 }] },
  });
  expect(ref.resource.embedded).toEqual([{ id: 1 }]);
});

test("resourceRef still parses without embedded", () => {
  const ref = resourceRef.parse({ resource: { id: 7, url: "u", link: "l" } });
  expect(ref.resource.id).toBe(7);
});
