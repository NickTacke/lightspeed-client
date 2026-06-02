import { z } from "zod";
import { WebhookFormat, WebhookItemAction, WebhookItemGroup } from "../../constants/enums";
import { timestamps } from "../../core/fragments";
import type { Transport } from "../../core/http";
import { Resource } from "../../core/resource";

export const webhookSchema = timestamps
  .extend({
    id: z.number(),
    isActive: z.boolean(),
    url: z.string(),
    format: z.nativeEnum(WebhookFormat),
    itemGroup: z.nativeEnum(WebhookItemGroup),
    itemAction: z.nativeEnum(WebhookItemAction),
    secret: z.string(),
    extra: z.string(),
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
