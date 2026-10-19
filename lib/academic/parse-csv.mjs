const MAX_FILE_CHARS = 1_000_000;
const MAX_ROWS = 100;
const ALIASES = {
  course_code: 'code',
  course_name: 'name',
  gradepoint: 'grade_point',
  class_held: 'classes_held',
  class_attended: 'classes_attended',
  target: 'target_percent',
};
const ALLOWED_COLUMNS = new Set([
  'code', 'name', 'credits', 'grade_point', 'letter_grade',
  'marks_obtained', 'max_marks', 'classes_held', 'classes_attended', 'target_percent',
]);

function parseRows(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let closedQuote = false;

  for (let i = 0; i < text.length; i += 1) {
    const character = text[i];
    if (quoted) {
      if (character === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 1; }
        else { quoted = false; closedQuote = true; }
      } else {
        field += character;
      }
      continue;
    }
    if (character === '"' && field.length === 0 && !closedQuote) {
      quoted = true;
    } else if (character === ',' ) {
      row.push(field); field = ''; closedQuote = false;
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field); field = ''; closedQuote = false;
      if (row.some(cell => cell.trim() !== '')) rows.push(row);
      row = [];
      if (rows.length > MAX_ROWS + 1) return { error: 'CSV may contain at most 100 data rows.' };
    } else {
      if (closedQuote && character.trim() !== '') return { error: 'Unexpected text after a quoted CSV field.' };
      field += character;
    }
  }
  if (quoted) return { error: 'A quoted CSV field was not closed.' };
  row.push(field);
  if (row.some(cell => cell.trim() !== '')) rows.push(row);
  if (rows.length > MAX_ROWS + 1) return { error: 'CSV may contain at most 100 data rows.' };
  return { rows };
}

function normalizeHeader(header) {
  const cleaned = header.replace(/^\uFEFF/, '').trim().toLowerCase().replace(/[ -]+/g, '_');
  return ALIASES[cleaned] ?? cleaned;
}

function numeric(value, { required = false, min = 0, max = Number.MAX_SAFE_INTEGER, integer = false } = {}) {
  if (value.trim() === '') return required ? { error: 'is required' } : { value: null };
  const parsed = Number(value.trim());
  if (!Number.isFinite(parsed) || parsed < min || parsed > max || (integer && !Number.isInteger(parsed))) return { error: `must be ${integer ? 'a whole number' : 'a number'} from ${min} to ${max}` };
  return { value: parsed };
}

/** Parse and validate a small, user-selected academic CSV entirely in the browser. */
export function parseAcademicCsv(input, kind) {
  if (typeof input !== 'string' || input.trim() === '') return { ok: false, error: 'Choose a non-empty CSV file.' };
  if (input.length > MAX_FILE_CHARS) return { ok: false, error: 'CSV must be 1 MB or smaller.' };
  if (kind !== 'GRADE_CARD' && kind !== 'ATTENDANCE') return { ok: false, error: 'Choose a supported import type.' };

  const parsed = parseRows(input);
  if (parsed.error) return { ok: false, error: parsed.error };
  const [headerRow, ...dataRows] = parsed.rows ?? [];
  if (!headerRow || dataRows.length === 0) return { ok: false, error: 'CSV needs a header row and at least one data row.' };
  if (dataRows.length > MAX_ROWS) return { ok: false, error: 'CSV may contain at most 100 data rows.' };

  const headers = headerRow.map(normalizeHeader);
  if (headers.some(header => !header) || new Set(headers).size !== headers.length) return { ok: false, error: 'CSV has an empty or duplicate column name.' };
  const unknown = headers.find(header => !ALLOWED_COLUMNS.has(header));
  if (unknown) return { ok: false, error: `Unsupported column: ${unknown}` };
  const index = Object.fromEntries(headers.map((header, position) => [header, position]));
  const required = kind === 'GRADE_CARD'
    ? ['code', 'name', 'credits', 'grade_point']
    : ['code', 'name', 'credits', 'classes_held', 'classes_attended'];
  const missing = required.find(header => index[header] === undefined);
  if (missing) return { ok: false, error: `Missing required column: ${missing}` };

  const seenCodes = new Set();
  const rows = [];
  for (let i = 0; i < dataRows.length; i += 1) {
    const cells = dataRows[i];
    if (cells.length !== headers.length) return { ok: false, error: `Row ${i + 2} has ${cells.length} cells but the header has ${headers.length} columns.` };
    const value = header => index[header] === undefined ? '' : String(cells[index[header]] ?? '').trim();
    const code = value('code').toUpperCase();
    const name = value('name');
    if (!/^[A-Z0-9][A-Z0-9._/-]{0,19}$/.test(code)) return { ok: false, error: `Row ${i + 2}: course code is invalid.` };
    if (!name || name.length > 120) return { ok: false, error: `Row ${i + 2}: course name is required and must be at most 120 characters.` };
    if (seenCodes.has(code)) return { ok: false, error: `Row ${i + 2}: duplicate course code ${code}.` };
    seenCodes.add(code);

    const credit = numeric(value('credits'), { required: true, min: 0.1, max: 30 });
    if (credit.error || Math.abs(credit.value * 10 - Math.round(credit.value * 10)) >= 1e-8) return { ok: false, error: `Row ${i + 2}: credits must be between 0.1 and 30 in increments of 0.1.` };
    const row = { code, name, credits: credit.value };

    if (kind === 'GRADE_CARD') {
      const grade = numeric(value('grade_point'), { required: true, min: 0, max: 10 });
      if (grade.error) return { ok: false, error: `Row ${i + 2}: grade point ${grade.error}.` };
      const marks = numeric(value('marks_obtained'), { min: 0, max: 999999 });
      const maximum = numeric(value('max_marks'), { min: 0.01, max: 999999 });
      if (marks.error || maximum.error) return { ok: false, error: `Row ${i + 2}: marks must be valid non-negative numbers and maximum marks must be positive.` };
      if ((marks.value === null) !== (maximum.value === null)) return { ok: false, error: `Row ${i + 2}: provide both marks obtained and maximum marks, or leave both blank.` };
      if (marks.value !== null && marks.value > maximum.value) return { ok: false, error: `Row ${i + 2}: marks obtained cannot exceed maximum marks.` };
      const letterGrade = value('letter_grade');
      if (letterGrade.length > 4) return { ok: false, error: `Row ${i + 2}: letter grade must be at most 4 characters.` };
      Object.assign(row, { gradePoint: grade.value, letterGrade: letterGrade || null, marksObtained: marks.value, maxMarks: maximum.value });
    } else {
      const held = numeric(value('classes_held'), { required: true, min: 0, max: 100000, integer: true });
      const attended = numeric(value('classes_attended'), { required: true, min: 0, max: 100000, integer: true });
      const target = numeric(value('target_percent') || '75', { required: true, min: 0, max: 100 });
      if (held.error || attended.error || target.error) return { ok: false, error: `Row ${i + 2}: class counts must be whole numbers and target must be from 0 to 100.` };
      if (attended.value > held.value) return { ok: false, error: `Row ${i + 2}: attended classes cannot exceed classes held.` };
      Object.assign(row, { classesHeld: held.value, classesAttended: attended.value, targetPercent: target.value });
    }
    rows.push(row);
  }
  return { ok: true, kind, rows, count: rows.length };
}
