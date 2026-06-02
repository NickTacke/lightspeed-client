import { z } from "zod";

// { resource: { id: number|false, url, link } } — appears on most relations
export const resourceRef = z.object({
  resource: z.object({
    id: z.union([z.number(), z.literal(false)]),
    url: z.string(),
    link: z.string(),
  }),
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
