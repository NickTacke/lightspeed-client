// explicit, shallow field-name mapping. map is camelCase -> wire-name.
// only keys present in the map are renamed; every other key passes through
// verbatim. this deliberately does NOT recurse and does NOT auto-convert
// snake<->camel, so dynamic-key maps (e.g. validation error objects keyed by
// "shipping_address.address1.required") are never corrupted.
export type FieldMap = Record<string, string>;

// camelCase input -> wire body (drops undefined values)
export function toWire(obj: Record<string, unknown>, map: FieldMap): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    out[map[k] ?? k] = v;
  }
  return out;
}

// wire response -> camelCase (reverse the map)
export function fromWire(obj: Record<string, unknown>, map: FieldMap): Record<string, unknown> {
  const reverse: FieldMap = {};
  for (const [camel, wire] of Object.entries(map)) reverse[wire] = camel;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[reverse[k] ?? k] = v;
  return out;
}
