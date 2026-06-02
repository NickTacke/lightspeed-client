import { z } from "zod";
import { EXCEPTIONS } from "../../core/endpoints";
import { orFalse, resourceRef } from "../../core/fragments";
import type { Transport } from "../../core/http";
import { SingletonResource } from "../../core/resource";

export const accountSchema = z
  .object({
    id: z.number(),
    appId: orFalse(z.number()),
    apiKey: z.string(),
    signout: resourceRef,
    permissions: resourceRef,
    ratelimit: resourceRef,
    metafields: resourceRef,
  })
  .passthrough();
export type Account = z.infer<typeof accountSchema>;

export const accountPermissionsSchema = z.object({}).passthrough();
export type AccountPermissions = z.infer<typeof accountPermissionsSchema>;

export const accountRateLimitSchema = z.object({}).passthrough();
export type AccountRateLimit = z.infer<typeof accountRateLimitSchema>;

export class AccountResource extends SingletonResource<Account> {
  protected base = "account";
  protected schema = accountSchema;
  protected key = "account";

  get = () => this.get_();

  permissions = () =>
    this.transport.send<Record<string, unknown>>({
      method: "GET",
      path: EXCEPTIONS.accountPermissions,
    });

  rateLimit = () =>
    this.transport.send<Record<string, unknown>>({
      method: "GET",
      path: EXCEPTIONS.accountRateLimit,
    });
}

export { AccountResource as default };
