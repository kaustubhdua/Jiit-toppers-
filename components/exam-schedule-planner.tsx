'use client';

import { useMemo, useState, useSyncExternalStore, type FormEvent } from 'react';
import { CalendarDays, Download, Plus, Trash2 } from 'lucide-react';
import { buildExamCalendar } from '@/lib/academic/exam-calendar.mjs';

type ExamEvent = {
  id: string;
  title: string;
  subjectCode: string;
  startsAt: string;
  endsAt: string | null;
  venue: string;
  sourceUrl: string;
  createdAt: string;
};

const STORAGE_KEY = 'jiit-toppers:exam-events:v1';
const STORAGE_EVENT = 'jiit-toppers:exam-events-changed';
const MAX_EVENTS = 100;

function isExamEvent(value: unknown): value is ExamEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Record<string, unknown>;
  return typeof event.id === 'string'
    && typeof event.title === 'string'
    && event.title.length > 0
    && typeof event.subjectCode === 'string'
    && typeof event.startsAt === 'string'
    && (event.endsAt === null || typeof event.endsAt === 'string')
    && typeof event.venue === 'string'
    && typeof event.sourceUrl === 'string'
    && typeof event.createdAt === 'string'
    && !Number.isNaN(new Date(event.startsAt).getTime())
    && (event.endsAt === null || !Number.isNaN(new Date(event.endsAt).getTime()));
}

function parseEvents(snapshot: string): ExamEvent[] {
  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isExamEvent).slice(0, MAX_EVENTS);
  } catch {
    return [];
  }
}

function getEventsSnapshot(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? '[]';
  } catch {
    return '[]';
  }
}

function getServerEventsSnapshot(): string {
  return '[]';
}

function subscribeToEvents(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function saveEvents(nextEvents: ExamEvent[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEvents));
    window.dispatchEvent(new Event(STORAGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

function localDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}

export function ExamSchedulePlanner() {
  const snapshot = useSyncExternalStore(subscribeToEvents, getEventsSnapshot, getServerEventsSnapshot);
  const storedEvents = useMemo(() => parseEvents(snapshot), [snapshot]);
  const [sessionEvents, setSessionEvents] = useState<ExamEvent[] | null>(null);
  const [title, setTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [venue, setVenue] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [filter, setFilter] = useState<'upcoming' | 'all' | 'past'>('upcoming');
  const [error, setError] = useState('');
  const [storageWarning, setStorageWarning] = useState(false);
  const events = sessionEvents ?? storedEvents;

  function commitEvents(nextEvents: ExamEvent[]) {
    if (saveEvents(nextEvents)) {
      setSessionEvents(null);
      setStorageWarning(false);
    } else {
      setSessionEvents(nextEvents);
      setStorageWarning(true);
    }
  }

  function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const cleanTitle = title.trim();
    const cleanCode = subjectCode.trim().toUpperCase();
    const cleanVenue = venue.trim();
    if (cleanTitle.length < 2 || cleanTitle.length > 120 || events.length >= MAX_EVENTS) {
      setError(events.length >= MAX_EVENTS ? 'This browser has reached the 100-event limit.' : 'Enter an exam title between 2 and 120 characters.');
      return;
    }
    if (!date || !startTime) {
      setError('Choose an exam date and start time.');
      return;
    }
    const start = localDateTime(date, startTime);
    const end = endTime ? localDateTime(date, endTime) : null;
    if (Number.isNaN(start.getTime()) || (end && (Number.isNaN(end.getTime()) || end <= start))) {
      setError('The end time must be later than the start time on the selected date.');
      return;
    }
    let safeSourceUrl = '';
    if (sourceUrl.trim()) {
      try {
        const parsed = new URL(sourceUrl.trim());
        if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('Invalid protocol');
        safeSourceUrl = parsed.toString();
      } catch {
        setError('Source link must be a valid HTTP or HTTPS URL.');
        return;
      }
    }

    const newEvent: ExamEvent = {
      id: window.crypto.randomUUID(),
      title: cleanTitle,
      subjectCode: cleanCode,
      startsAt: start.toISOString(),
      endsAt: end?.toISOString() ?? null,
      venue: cleanVenue,
      sourceUrl: safeSourceUrl,
      createdAt: new Date().toISOString(),
    };
    commitEvents([...events, newEvent].sort((a, b) => a.startsAt.localeCompare(b.startsAt)).slice(0, MAX_EVENTS));
    setTitle('');
    setSubjectCode('');
    setVenue('');
    setSourceUrl('');
    setError('');
  }

  function deleteEvent(id: string) {
    if (!window.confirm('Delete this exam from this browser?')) return;
    commitEvents(events.filter(event => event.id !== id));
  }

  function exportCalendar() {
    try {
      const calendar = buildExamCalendar(events);
      const blob = new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'jiit-toppers-exams.ics';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError('The calendar file could not be generated. Check the exam dates and try again.');
    }
  }

  const now = Date.now();
  const visibleEvents = events
    .filter(event => filter === 'all' || (filter === 'upcoming' ? new Date(event.startsAt).getTime() >= now : new Date(event.startsAt).getTime() < now))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const upcomingCount = events.filter(event => new Date(event.startsAt).getTime() >= now).length;

  return <section className="jt-exam-planner" aria-labelledby="jt-exam-planner-title">
    <div className="jt-source-heading">
      <div><span className="jt-kicker">PERSONAL EXAM CALENDAR</span><h2 id="jt-exam-planner-title">Keep exam dates in view.</h2></div>
      <p>{upcomingCount} upcoming exam{upcomingCount === 1 ? '' : 's'}</p>
    </div>
    <p className="jt-planner-notice">Add dates from a source you trust. This calendar is saved in this browser only and is not synced to JIIT Toppers or verified against the official portal. Source links are optional and are shown with each event.</p>
    {error && <p className="jt-record-error" role="alert">{error}</p>}
    {storageWarning && <p className="jt-storage-warning" role="alert">Browser storage is unavailable. Changes remain in this tab for now and will be lost if it closes.</p>}
    <form className="jt-exam-form" onSubmit={addEvent}>
      <label>Exam / assessment<input value={title} onChange={e => setTitle(e.target.value)} minLength={2} maxLength={120} required placeholder="e.g. Data Structures T2" /></label>
      <label>Course code (optional)<input value={subjectCode} onChange={e => setSubjectCode(e.target.value)} maxLength={24} placeholder="e.g. 15B11CI301" /></label>
      <label>Date<input type="date" value={date} onChange={e => setDate(e.target.value)} required /></label>
      <label>Start time<input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required /></label>
      <label>End time (optional)<input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} /></label>
      <label>Room / venue (optional)<input value={venue} onChange={e => setVenue(e.target.value)} maxLength={120} placeholder="e.g. Block A, Room 12" /></label>
      <label className="jt-exam-source">Source URL (optional)<input type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} maxLength={500} placeholder="https://…" /></label>
      <button className="jt-primary" type="submit" disabled={title.trim().length < 2 || !date}><Plus size={16} aria-hidden="true"/>Add exam</button>
    </form>
    <div className="jt-exam-toolbar">
      <div className="jt-task-toolbar" role="group" aria-label="Filter exam events">
        {(['upcoming', 'all', 'past'] as const).map(value => <button key={value} type="button" className={filter === value ? 'active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === 'upcoming' ? 'Upcoming' : value === 'past' ? 'Past' : 'All exams'}</button>)}
      </div>
      <button className="jt-account-button" type="button" onClick={exportCalendar} disabled={events.length === 0}><Download size={15} aria-hidden="true"/>Export calendar (.ics)</button>
    </div>
    {visibleEvents.length === 0
      ? <div className="jt-task-empty"><CalendarDays size={22} aria-hidden="true"/><strong>{filter === 'past' ? 'No past exams saved.' : filter === 'upcoming' ? 'No upcoming exams saved.' : 'No exams added yet.'}</strong><span>Add a date above or export your calendar when ready.</span></div>
      : <ul className="jt-exam-list">{visibleEvents.map(event => <li key={event.id}>
        <div className="jt-exam-date"><strong>{new Date(event.startsAt).toLocaleDateString('en-IN', { day: '2-digit' })}</strong><span>{new Date(event.startsAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span></div>
        <div className="jt-exam-copy">
          <strong>{event.title}</strong>
          <span>{event.subjectCode && `${event.subjectCode} · `}{new Date(event.startsAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}{event.endsAt ? `–${new Date(event.endsAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}{event.venue && ` · ${event.venue}`}</span>
          {event.sourceUrl && <a href={event.sourceUrl} target="_blank" rel="noreferrer">Open source</a>}
        </div>
        <button className="jt-task-delete" type="button" onClick={() => deleteEvent(event.id)} aria-label={`Delete ${event.title}`}><Trash2 size={16} aria-hidden="true"/></button>
      </li>)}</ul>}
  </section>;
}
