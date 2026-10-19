import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExamCalendar } from '../lib/academic/exam-calendar.mjs';

test('exports exam events as UTC iCalendar entries', () => {
  const ics = buildExamCalendar([{
    id: 'exam-1',
    title: 'Data Structures',
    subjectCode: 'CSE201',
    startsAt: '2026-10-20T04:00:00.000Z',
    endsAt: '2026-10-20T06:00:00.000Z',
    venue: 'Block A, Room 12',
    sourceUrl: 'https://example.test/schedule',
  }], new Date('2026-10-19T00:00:00.000Z'));
  assert.match(ics, /BEGIN:VCALENDAR/);
  assert.match(ics, /DTSTART:20261020T040000Z/);
  assert.match(ics, /DTEND:20261020T060000Z/);
  assert.match(ics, /SUMMARY:Data Structures/);
  assert.match(ics, /LOCATION:Block A\\, Room 12/);
  assert.match(ics, /END:VCALENDAR/);
});

test('escapes ICS text and defaults a missing end time to one hour', () => {
  const ics = buildExamCalendar([{
    id: 'exam-2',
    title: 'Math,; Final\nT1',
    subjectCode: 'MTH101',
    startsAt: '2026-10-20T04:00:00.000Z',
    endsAt: null,
    venue: '',
    sourceUrl: '',
  }], new Date('2026-10-19T00:00:00.000Z'));
  assert.match(ics, /SUMMARY:Math\\,\\; Final\\nT1/);
  assert.match(ics, /DTEND:20261020T050000Z/);
});

test('rejects invalid exam date ranges', () => {
  assert.throws(() => buildExamCalendar([{
    id: 'bad',
    title: 'Bad date',
    subjectCode: '',
    startsAt: 'not-a-date',
    endsAt: null,
    venue: '',
    sourceUrl: '',
  }]), /valid start and end times/);
  assert.throws(() => buildExamCalendar([{
    id: 'bad-range',
    title: 'Bad range',
    subjectCode: '',
    startsAt: '2026-10-20T05:00:00.000Z',
    endsAt: '2026-10-20T04:00:00.000Z',
    venue: '',
    sourceUrl: '',
  }]), /valid start and end times/);
});
