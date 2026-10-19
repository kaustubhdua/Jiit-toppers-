export type BoundedJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; reason: 'TOO_LARGE' | 'INVALID_JSON' };

/** Read a request body with an explicit byte ceiling before JSON parsing. */
export async function readJsonBounded(request: Request, maxBytes: number): Promise<BoundedJsonResult> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) return { ok: false, reason: 'INVALID_JSON' };
  if (!request.body) return { ok: false, reason: 'INVALID_JSON' };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return { ok: false, reason: 'TOO_LARGE' };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, reason: 'INVALID_JSON' };
  } finally {
    try { reader.releaseLock(); } catch { /* A cancelled stream may already be unlocked. */ }
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(bytes)) as unknown };
  } catch {
    return { ok: false, reason: 'INVALID_JSON' };
  }
}
