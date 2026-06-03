import { z } from "zod";
import { WebhookFormat, WebhookItemAction, WebhookItemGroup } from "../../constants/enums";
import { Resource } from "../../core/resource";

// live-confirmed shape (GET webhooks/{id}.json). response stays tolerant:
// itemGroup/itemAction/format are plain strings since webhooks span many
// group/action combos. docs-only fields (url/secret/extra) are not present live.
export const webhookSchema = z
  .object({
    id: z.number(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    isActive: z.boolean().optional(),
    itemGroup: z.string().optional(),
    itemAction: z.string().optional(),
    format: z.string().optional(),
    address: z.string().optional(),
    language: z.record(z.unknown()).optional(),
  })
  .passthrough();
export type Webhook = z.infer<typeof webhookSchema>;

export const webhookInputSchema = z.object({
  isActive: z.boolean().optional(),
  url: z.string(),
  format: z.nativeEnum(WebhookFormat).optional(),
  itemGroup: z.nativeEnum(WebhookItemGroup),
  itemAction: z.nativeEnum(WebhookItemAction),
  secret: z.string().optional(),
  extra: z.string().optional(),
});
export type WebhookInput = z.input<typeof webhookInputSchema>;

export const webhookUpdateSchema = webhookInputSchema.partial();
export type WebhookUpdate = z.input<typeof webhookUpdateSchema>;

export class WebhookResource extends Resource<Webhook> {
  protected base = "webhooks";
  protected schema = webhookSchema;
  protected singular = "webhook";
  protected plural = "webhooks";

  list = () => this.list_();
  get = (id: number) => this.get_(id);
  create = (input: WebhookInput) => this.create_(webhookInputSchema, input);
  update = (id: number, input: WebhookUpdate) => this.update_(id, webhookUpdateSchema, input);
  delete = (id: number) => this.delete_(id);
}

export { WebhookResource as default };
