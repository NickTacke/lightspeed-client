import { z } from "zod";
import { resourceRef } from "../../core/fragments";
import { Resource } from "../../core/resource";

export const groupsCustomerSchema = z
  .object({
    id: z.number(),
    group: resourceRef,
    customer: resourceRef,
  })
  .passthrough();
export type GroupsCustomer = z.infer<typeof groupsCustomerSchema>;

export const groupsCustomerInputSchema = z.object({
  group: z.number(),
  customer: z.number(),
});
export type GroupsCustomerInput = z.input<typeof groupsCustomerInputSchema>;

export interface GroupsCustomerFilters {
  group?: number;
  customer?: number;
}

export class GroupsCustomerResource extends Resource<GroupsCustomer> {
  protected base = "groups/customers";
  protected schema = groupsCustomerSchema;
  protected singular = "groupsCustomer";
  protected plural = "groupsCustomers";

  list = (q?: GroupsCustomerFilters & Parameters<GroupsCustomerResource["list_"]>[0]) =>
    this.list_(q);
  paginate = (q?: GroupsCustomerFilters & Parameters<GroupsCustomerResource["list_"]>[0]) =>
    this.paginate_(q);
  count = (q?: GroupsCustomerFilters) => this.count_(q as Record<string, unknown>);
  get = (id: number) => this.get_(id);
  create = (input: GroupsCustomerInput) => this.create_(groupsCustomerInputSchema, input);
  delete = (id: number) => this.delete_(id);
}

export { GroupsCustomerResource as default };
