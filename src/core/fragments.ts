import { z } from "zod";

// { resource: { id: number|false, url, link, embedded? } }
// `embedded` appears when the API inlines the related object(s); preserve it.
export const resourceRef = z.object({
  resource: z
    .object({
      id: z.union([z.number(), z.literal(false)]),
      url: z.string(),
      link: z.string(),
      embedded: z.unknown().optional(),
    })
    .passthrough(),
});

// country fields are objects on write-side resources (orders/quotes), or false
export const countryObject = z.object({
  id: z.number(),
  code: z.string(),
  code3: z.string().optional(),
  title: z.string(),
});

export const timestamps = z.object({
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const fileObject = z.object({
  createdAt: z.string(),
  updatedAt: z.string(),
  extension: z.string(),
  size: z.number(),
  title: z.string(),
  thumb: z.string(),
  src: z.string(),
});

// fields documented as `object | false`
export const orFalse = <T extends z.ZodTypeAny>(inner: T) => z.union([inner, z.literal(false)]);
