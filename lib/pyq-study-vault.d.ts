export type PyqStudyStatus = "SAVED" | "PLANNED" | "ATTEMPTED" | "REVIEWED";
export type StoredPyqEntry = {
  id: string;
  title: string;
  subject: string;
  url: string;
  year: string;
  status: PyqStudyStatus;
  notes: string;
  createdAt: string;
};
export function isValidPyqHttpsUrl(value: unknown): value is string;
export function isStoredPyqEntry(value: unknown): value is StoredPyqEntry;
export function parseStoredPyqEntries(raw: string | null): StoredPyqEntry[];
