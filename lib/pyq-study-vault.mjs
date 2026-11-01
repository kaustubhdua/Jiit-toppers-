const STATUSES = new Set(["SAVED", "PLANNED", "ATTEMPTED", "REVIEWED"]);
const MAX_ENTRIES = 500;
const MAX_URL_LENGTH = 2048;

export function isValidPyqHttpsUrl(value) {
  if (typeof value !== "string" || value.length > MAX_URL_LENGTH) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && Boolean(url.hostname)
      && !url.username
      && !url.password;
  } catch {
    return false;
  }
}

export function isStoredPyqEntry(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return typeof value.id === "string"
    && value.id.length > 0
    && typeof value.title === "string"
    && value.title.length > 0
    && value.title.length <= 120
    && typeof value.subject === "string"
    && value.subject.length <= 80
    && isValidPyqHttpsUrl(value.url)
    && typeof value.year === "string"
    && (value.year === "" || /^20\\d{2}$/.test(value.year))
    && STATUSES.has(value.status)
    && typeof value.notes === "string"
    && value.notes.length <= 1000
    && typeof value.createdAt === "string"
    && Number.isFinite(Date.parse(value.createdAt));
}

export function parseStoredPyqEntries(raw) {
  if (typeof raw !== "string" || raw.length > 2_000_000) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredPyqEntry).slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}
