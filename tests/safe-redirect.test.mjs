import test from 'node:test';
import assert from 'node:assert/strict';
import { safeRelativePath } from '../lib/security/safe-redirect.mjs';

test('safeRelativePath accepts local relative paths and preserves query/hash', () => {
  assert.equal(safeRelativePath('/academics?term=2026#grades'), '/academics?term=2026#grades');
  assert.equal(safeRelativePath('/'), '/');
});
test('safeRelativePath rejects external and protocol-relative redirects', () => {
  for (const value of ['https://evil.example', '//evil.example/path', 'javascript:alert(1)', 'https://jiit-toppers.invalid/']) {
    assert.equal(safeRelativePath(value), '/');
  }
});
test('safeRelativePath rejects backslashes and control characters', () => {
  assert.equal(safeRelativePath('/\\\\evil.example'), '/');
  assert.equal(safeRelativePath('/safe\npath'), '/');
});
