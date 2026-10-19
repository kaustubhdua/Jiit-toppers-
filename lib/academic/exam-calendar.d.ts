export type ExamCalendarEvent = {
  id: string;
  title: string;
  subjectCode: string;
  startsAt: string;
  endsAt: string | null;
  venue: string;
  sourceUrl: string;
};

export function buildExamCalendar(events: ExamCalendarEvent[], now?: Date): string;
