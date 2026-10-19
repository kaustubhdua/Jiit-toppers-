export type BoundedJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; reason: 'TOO_LARGE' | 'INVALID_JSON' };

/** Read a request body with an explicit byte ceiling before JSON parsing. */
export function readJsonBounded(request: Request, maxBytes: number): Promise<BoundedJsonResult>;
