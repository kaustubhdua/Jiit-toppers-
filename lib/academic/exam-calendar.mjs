function escapeIcsText(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function toIcsDate(value) {
  return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function buildExamCalendar(events, now = new Date()) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JIIT Toppers//Exam Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const event of events) {
    const start = new Date(event.startsAt);
    const end = event.endsAt ? new Date(event.endsAt) : new Date(start.getTime() + 60 * 60 * 1000);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      throw new TypeError('Exam events must have valid start and end times.');
    }
    lines.push(
      'BEGIN:VEVENT',
      `UID:${escapeIcsText(event.id)}@jiit-toppers`,
      `DTSTAMP:${toIcsDate(now.toISOString())}`,
      `DTSTART:${toIcsDate(start.toISOString())}`,
      `DTEND:${toIcsDate(end.toISOString())}`,
      `SUMMARY:${escapeIcsText(event.title)}`,
      `DESCRIPTION:${escapeIcsText([event.subjectCode, event.sourceUrl].filter(Boolean).join(' | '))}`,
      `LOCATION:${escapeIcsText(event.venue || '')}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}
