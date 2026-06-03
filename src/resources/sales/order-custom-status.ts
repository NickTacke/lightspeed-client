import { z } from "zod";
import { timestamps } from "../../core/fragments";
import { Resource } from "../../core/resource";

export const orderCustomStatusSchema = timestamps
  .extend({ id: z.number(), title: z.string().optional(), color: z.string().optional() })
  .passthrough();
export type OrderCustomStatus = z.infer<typeof orderCustomStatusSchema>;

export const orderCustomStatusInputSchema = z.object({
  title: z.string(),
  color: z.string().optional(),
});
export type OrderCustomStatusInput = z.input<typeof orderCustomStatusInputSchema>;
export const orderCustomStatusUpdateSchema = orderCustomStatusInputSchema.partial();
export type OrderCustomStatusUpdate = z.input<typeof orderCustomStatusUpdateSchema>;

export class OrderCustomStatusResource extends Resource<OrderCustomStatus> {
  protected base = "orders/customstatuses";
  protected schema = orderCustomStatusSchema;
  protected singular = "customStatus";
  protected plural = "customStatuses";

  list = (q?: Parameters<OrderCustomStatusResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: Parameters<OrderCustomStatusResource["list_"]>[0]) => this.paginate_(q);
  count = (q?: Record<string, unknown>) => this.count_(q);
  get = (id: number) => this.get_(id);
  create = (input: OrderCustomStatusInput) => this.create_(orderCustomStatusInputSchema, input);
  update = (id: number, input: OrderCustomStatusUpdate) =>
    this.update_(id, orderCustomStatusUpdateSchema, input);
  delete = (id: number) => this.delete_(id);
}

export { OrderCustomStatusResource as default };
