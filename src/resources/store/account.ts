import { z } from "zod";
import { EXCEPTIONS } from "../../core/endpoints";
import { LightspeedValidationError } from "../../core/errors";
import { orFalse, resourceRef } from "../../core/fragments";
import { SingletonResource } from "../../core/resource";
import { MetafieldResource } from "../shared/metafield";

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

const permissionEntry = z.object({ read: z.boolean(), write: z.boolean() }).passthrough();

export const accountPermissionsSchema = z
  .object({
    content: permissionEntry,
    products: permissionEntry,
    customers: permissionEntry,
    orders: permissionEntry,
    settings: permissionEntry,
    tracking: permissionEntry,
  })
  .passthrough();
export type AccountPermissions = z.infer<typeof accountPermissionsSchema>;

const rateLimitWindow = z
  .object({
    limit: z.number(),
    remaining: z.number(),
    reset: z.number(),
    resetTime: z.string(),
  })
  .passthrough();

export const accountRateLimitSchema = z
  .object({
    limit5Min: rateLimitWindow,
    limitHour: rateLimitWindow,
    limitDay: rateLimitWindow,
  })
  .passthrough();
export type AccountRateLimit = z.infer<typeof accountRateLimitSchema>;

export class AccountResource extends SingletonResource<Account> {
  protected base = "account";
  protected schema = accountSchema;
  protected key = "account";

  get = () => this.get_();

  metafields = () => new MetafieldResource(this.transport, this.base, "account");

  permissions = async (): Promise<AccountPermissions> => {
    const raw = await this.transport.send<Record<string, unknown>>({
      method: "GET",
      path: EXCEPTIONS.accountPermissions,
    });
    const body = (raw?.accountPermissions ?? raw) as unknown;
    const parsed = accountPermissionsSchema.safeParse(body);
    if (!parsed.success)
      throw new LightspeedValidationError("invalid permissions response", parsed.error.issues);
    return parsed.data;
  };

  rateLimit = async (): Promise<AccountRateLimit> => {
    const raw = await this.transport.send<Record<string, unknown>>({
      method: "GET",
      path: EXCEPTIONS.accountRateLimit,
    });
    const body = (raw?.accountRatelimit ?? raw) as unknown;
    const parsed = accountRateLimitSchema.safeParse(body);
    if (!parsed.success)
      throw new LightspeedValidationError("invalid ratelimit response", parsed.error.issues);
    return parsed.data;
  };
}

export { AccountResource as default };
