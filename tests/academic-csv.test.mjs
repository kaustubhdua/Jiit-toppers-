import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAcademicCsv } from '../lib/academic/parse-csv.mjs';

test('parses grade CSV aliases, quoted commas and optional marks', () => {
  const result = parseAcademicCsv('course_code,course_name,credits,grade_point,letter_grade,marks_obtained,max_marks\nCS101,"Data Structures, Lab",3,8.5,B+,42,50', 'GRADE_CARD');
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.kind, 'GRADE_CARD');
    assert.deepEqual(result.rows[0], { code: 'CS101', name: 'Data Structures, Lab', credits: 3, gradePoint: 8.5, letterGrade: 'B+', marksObtained: 42, maxMarks: 50 });
  }
});

test('parses attendance CSV and defaults target to 75', () => {
  const result = parseAcademicCsv('code,name,credits,classes_held,classes_attended\nEC101,Circuits,4,20,17', 'ATTENDANCE');
  assert.equal(result.ok, true);
  if (result.ok) assert.deepEqual(result.rows[0], { code: 'EC101', name: 'Circuits', credits: 4, classesHeld: 20, classesAttended: 17, targetPercent: 75 });
});

test('rejects invalid grades, marks and class counts', () => {
  assert.equal(parseAcademicCsv('code,name,credits,grade_point\nCS101,Algorithms,3,11', 'GRADE_CARD').ok, false);
  assert.equal(parseAcademicCsv('code,name,credits,grade_point,marks_obtained,max_marks\nCS101,Algorithms,3,8,45,40', 'GRADE_CARD').ok, false);
  assert.equal(parseAcademicCsv('code,name,credits,classes_held,classes_attended\nCS101,Algorithms,3,10,11', 'ATTENDANCE').ok, false);
});

test('rejects missing/unknown/duplicate columns and duplicate subjects', () => {
  assert.equal(parseAcademicCsv('code,name,credits\nCS101,Algorithms,3', 'GRADE_CARD').ok, false);
  assert.equal(parseAcademicCsv('code,name,credits,grade_point,student_email\nCS101,Algorithms,3,8,a@b.com', 'GRADE_CARD').ok, false);
  assert.equal(parseAcademicCsv('code,name,credits,grade_point,grade_point\nCS101,Algorithms,3,8,8', 'GRADE_CARD').ok, false);
  assert.equal(parseAcademicCsv('code,name,credits,grade_point\nCS101,Algorithms,3,8\ncs101,Algorithms,3,9', 'GRADE_CARD').ok, false);
});

test('rejects malformed quotes, oversized files and too many rows', () => {
  assert.equal(parseAcademicCsv('code,name,credits,grade_point\nCS101,"Missing quote,3,8', 'GRADE_CARD').ok, false);
  assert.equal(parseAcademicCsv('x'.repeat(1_000_001), 'GRADE_CARD').ok, false);
  const rows = ['code,name,credits,grade_point', ...Array.from({ length: 101 }, (_, index) => `CS${index},Course ${index},3,8`)].join('\n');
  assert.equal(parseAcademicCsv(rows, 'GRADE_CARD').ok, false);
});

test('rejects columns that do not match the selected import type', () => {
  assert.equal(parseAcademicCsv('code,name,credits,grade_point,classes_held\\nCS101,Algorithms,3,8,10', 'GRADE_CARD').ok, false);
  assert.equal(parseAcademicCsv('code,name,credits,classes_held,classes_attended,grade_point\\nCS101,Algorithms,3,10,9,8', 'ATTENDANCE').ok, false);
});

test('rejects control characters in names and invalid grade labels', () => {
  assert.equal(parseAcademicCsv('code,name,credits,grade_point\\nCS101,"Bad\\nName",3,8', 'GRADE_CARD').ok, false);
  assert.equal(parseAcademicCsv('code,name,credits,grade_point,letter_grade\\nCS101,Algorithms,3,8,A!', 'GRADE_CARD').ok, false);
});

test('requires both marks fields or neither', () => {
  assert.equal(parseAcademicCsv('code,name,credits,grade_point,marks_obtained\nCS101,Algorithms,3,8,40', 'GRADE_CARD').ok, false);
});
