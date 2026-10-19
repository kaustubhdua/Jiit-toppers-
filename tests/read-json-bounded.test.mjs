import test from 'node:test';
import assert from 'node:assert/strict';
import { readJsonBounded } from '../lib/http/read-json-bounded.mjs';

test('parses valid JSON under the byte limit', async () => {
  const request = new Request('https://example.test/api', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Semester 3' }),
  });
  const result = await readJsonBounded(request, 128);
  assert.deepEqual(result, { ok: true, value: { name: 'Semester 3' } });
});

test('rejects malformed JSON', async () => {
  const request = new Request('https://example.test/api', { method: 'POST', body: '{bad' });
  assert.deepEqual(await readJsonBounded(request, 128), { ok: false, reason: 'INVALID_JSON' });
});

test('rejects a body that exceeds the byte limit', async () => {
  const request = new Request('https://example.test/api', { method: 'POST', body: JSON.stringify({ value: 'x'.repeat(200) }) });
  assert.deepEqual(await readJsonBounded(request, 32), { ok: false, reason: 'TOO_LARGE' });
});

test('rejects requests without a body and invalid byte limits', async () => {
  const emptyRequest = new Request('https://example.test/api', { method: 'GET' });
  assert.deepEqual(await readJsonBounded(emptyRequest, 32), { ok: false, reason: 'INVALID_JSON' });
  const bodyRequest = new Request('https://example.test/api', { method: 'POST', body: '{}' });
  assert.deepEqual(await readJsonBounded(bodyRequest, 0), { ok: false, reason: 'INVALID_JSON' });
});
