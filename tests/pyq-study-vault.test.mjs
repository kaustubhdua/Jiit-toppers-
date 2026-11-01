import test from "node:test";
import assert from "node:assert/strict";
import { isValidPyqHttpsUrl, isStoredPyqEntry, parseStoredPyqEntries } from "../lib/pyq-study-vault.mjs";

const validEntry = {
  id: "paper-1",
  title: "Data Structures End Semester",
  subject: "15B11CI301",
  url: "https://example.edu/paper",
  year: "2025",
  status: "SAVED",
  notes: "Revise trees",
  createdAt: "2026-11-01T10:00:00.000Z",
};

test("accepts HTTPS URLs without embedded credentials", () => {
  assert.equal(isValidPyqHttpsUrl("https://pyqjiit.rushilk.dev/"), true);
  assert.equal(isValidPyqHttpsUrl("http://example.com"), false);
  assert.equal(isValidPyqHttpsUrl("javascript:alert(1)"), false);
  assert.equal(isValidPyqHttpsUrl("https://user:pass@example.com"), false);
  assert.equal(isValidPyqHttpsUrl("not a URL"), false);
  assert.equal(isValidPyqHttpsUrl("https://example.com/" + "a".repeat(2050)), false);
});

test("validates stored record shape and bounded fields", () => {
  assert.equal(isStoredPyqEntry(validEntry), true);
  assert.equal(isStoredPyqEntry({ ...validEntry, status: "PUBLISHED" }), false);
  assert.equal(isStoredPyqEntry({ ...validEntry, url: "http://example.com" }), false);
  assert.equal(isStoredPyqEntry({ ...validEntry, notes: "x".repeat(1001) }), false);
  assert.equal(isStoredPyqEntry({ ...validEntry, year: "1999" }), false);
  assert.equal(isStoredPyqEntry(null), false);
});

test("loads only valid records from local storage JSON", () => {
  const loaded = parseStoredPyqEntries(JSON.stringify([validEntry, { ...validEntry, id: "bad", url: "http://example.com" }]));
  assert.deepEqual(loaded, [validEntry]);
  assert.deepEqual(parseStoredPyqEntries("{bad json"), []);
  assert.deepEqual(parseStoredPyqEntries(JSON.stringify({ entries: [validEntry] })), []);
  assert.deepEqual(parseStoredPyqEntries("x".repeat(2_000_001)), []);
});
