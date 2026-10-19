export type GradeImportRow = { code: string; name: string; credits: number; gradePoint: number; letterGrade: string | null; marksObtained: number | null; maxMarks: number | null };
export type AttendanceImportRow = { code: string; name: string; credits: number; classesHeld: number; classesAttended: number; targetPercent: number };
export type AcademicCsvResult =
  | { ok: true; kind: 'GRADE_CARD'; rows: GradeImportRow[]; count: number }
  | { ok: true; kind: 'ATTENDANCE'; rows: AttendanceImportRow[]; count: number }
  | { ok: false; error: string };
export function parseAcademicCsv(input: string, kind: 'GRADE_CARD' | 'ATTENDANCE'): AcademicCsvResult;
