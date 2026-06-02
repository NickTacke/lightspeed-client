export class LightspeedError extends Error {}

export class LightspeedValidationError extends LightspeedError {
  constructor(
    message: string,
    readonly issues: unknown,
  ) {
    super(message);
    this.name = "LightspeedValidationError";
  }
}

export class LightspeedApiError extends LightspeedError {
  constructor(
    readonly status: number,
    message: string,
    readonly code: string | number | undefined,
    readonly detail: unknown,
    readonly raw: unknown,
  ) {
    super(message);
    this.name = "LightspeedApiError";
  }
}
export class LightspeedAuthError extends LightspeedApiError {
  name = "LightspeedAuthError";
}
export class LightspeedNotFoundError extends LightspeedApiError {
  name = "LightspeedNotFoundError";
}
export class LightspeedBadRequestError extends LightspeedApiError {
  name = "LightspeedBadRequestError";
}
export class LightspeedServerError extends LightspeedApiError {
  name = "LightspeedServerError";
}
export class LightspeedRateLimitError extends LightspeedApiError {
  retryAfter?: number;
  name = "LightspeedRateLimitError";
}

interface Parsed {
  message: string;
  code: string | number | undefined;
  detail: unknown;
}

// lightspeed wraps errors as { error: { code, method, request, message } };
// 422 may add a per-field { errors: {...} } map. shape-driven so unknown bodies degrade.
function extract(body: unknown): Parsed {
  const b = body as Record<string, unknown> | null;
  if (b && typeof b === "object") {
    const err = b.error as { code?: string | number; message?: string } | undefined;
    if (err && typeof err === "object")
      return { message: err.message ?? "error", code: err.code, detail: b };
    if (typeof b.message === "string") return { message: b.message, code: undefined, detail: b };
  }
  return { message: `lightspeed request failed (${typeof body})`, code: undefined, detail: body };
}

export function parseError(
  status: number,
  body: unknown,
  headers?: Record<string, string>,
): LightspeedApiError {
  const { message, code, detail } = extract(body);
  if (status === 401) return new LightspeedAuthError(status, message, code, detail, body);
  if (status === 404) return new LightspeedNotFoundError(status, message, code, detail, body);
  if (status === 429) {
    const e = new LightspeedRateLimitError(status, message, code, detail, body);
    const ra = Number(headers?.["retry-after"]);
    if (Number.isFinite(ra)) e.retryAfter = ra;
    return e;
  }
  if (status >= 500) return new LightspeedServerError(status, message, code, detail, body);
  if (status === 400 || status === 422)
    return new LightspeedBadRequestError(status, message, code, detail, body);
  return new LightspeedApiError(status, message, code, detail, body);
}
