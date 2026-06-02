import { z } from "zod";
import { timestamps } from "../../core/fragments";
import { Resource } from "../../core/resource";

// docs-derived schema (live shop has no groups — unvalidated live)
export const groupSchema = timestamps
  .extend({
    id: z.number(),
    title: z.string(),
  })
  .passthrough();
export type Group = z.infer<typeof groupSchema>;

export const groupInputSchema = z.object({
  title: z.string(),
});
export type GroupInput = z.input<typeof groupInputSchema>;

export const groupUpdateSchema = groupInputSchema.partial();
export type GroupUpdate = z.input<typeof groupUpdateSchema>;

export class GroupResource extends Resource<Group> {
  protected base = "groups";
  protected schema = groupSchema;
  protected singular = "group";
  protected plural = "groups";

  list = (q?: Parameters<GroupResource["list_"]>[0]) => this.list_(q);
  paginate = (q?: Parameters<GroupResource["list_"]>[0]) => this.paginate_(q);
  count = (q?: Record<string, unknown>) => this.count_(q);
  get = (id: number) => this.get_(id);
  create = (input: GroupInput) => this.create_(groupInputSchema, input);
  update = (id: number, input: GroupUpdate) => this.update_(id, groupUpdateSchema, input);
  delete = (id: number) => this.delete_(id);
}

export { GroupResource as default };
