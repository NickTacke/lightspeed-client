import { z } from "zod";
import { LightspeedValidationError } from "../../core/errors";
import { timestamps } from "../../core/fragments";
import type { Transport } from "../../core/http";
import { Resource } from "../../core/resource";

export const imageSchema = timestamps
  .extend({
    id: z.number(),
    sortOrder: z.number().optional(),
    extension: z.string(),
    size: z.number(),
    title: z.string(),
    thumb: z.string(),
    src: z.string(),
  })
  .passthrough();
export type Image = z.infer<typeof imageSchema>;

export const imageInputSchema = z.object({
  src: z.string().optional(),
  title: z.string().optional(),
  sortOrder: z.number().optional(),
});
export type ImageInput = z.input<typeof imageInputSchema>;

// collection: products/{id}/images — full CRUD (list/get/create/delete)
// envelope keys are parent-qualified: e.g. "productImage"/"productImages"
export class ImageCollectionResource extends Resource<Image> {
  protected schema = imageSchema;
  protected singular: string;
  protected plural: string;
  protected base: string;

  constructor(transport: Transport, parentPrefix: string, envelopePrefix: string) {
    super(transport);
    this.base = `${parentPrefix}/images`;
    this.singular = `${envelopePrefix}Image`;
    this.plural = `${envelopePrefix}Images`;
  }

  list = (q?: Parameters<ImageCollectionResource["list_"]>[0]) => this.list_(q);
  get = (id: number) => this.get_(id);
  create = (input: ImageInput) => this.create_(imageInputSchema, input);
  delete = (id: number) => this.delete_(id);
}

// singleton: brands/{id}/image, categories/{id}/image — get/create/delete, no id, no list
// always uses envelope key "image"
export class SingleImageResource {
  private readonly base: string;
  constructor(
    private readonly transport: Transport,
    prefix: string,
  ) {
    this.base = `${prefix}/image`;
  }

  async get(): Promise<Image> {
    const raw = await this.transport.send<Record<string, unknown>>({
      method: "GET",
      path: `${this.base}.json`,
    });
    const parsed = imageSchema.safeParse(raw?.image);
    if (!parsed.success)
      throw new LightspeedValidationError("invalid image response", parsed.error.issues);
    return parsed.data;
  }

  async create(input: ImageInput): Promise<Image> {
    const body = imageInputSchema.parse(input);
    const raw = await this.transport.send<Record<string, unknown>>({
      method: "POST",
      path: `${this.base}.json`,
      body: { image: body },
    });
    const parsed = imageSchema.safeParse(raw?.image);
    if (!parsed.success)
      throw new LightspeedValidationError("invalid image response", parsed.error.issues);
    return parsed.data;
  }

  async delete(): Promise<void> {
    await this.transport.send({ method: "DELETE", path: `${this.base}.json` });
  }
}
