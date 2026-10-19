'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AcademicCsvImport } from './academic-csv-import';

type Grade = { gradePoint: string | number; letterGrade: string | null; marksObtained: string | number | null; maxMarks: string | number | null; source: string; sourceLabel: string | null; observedAt: string };
type AttendanceSnapshot = { classesHeld: number; classesAttended: number; targetPercent: string | number; source: string; sourceLabel: string | null; observedAt: string };
type Subject = { id: string; code: string; name: string; credits: string | number; grades: Grade[]; attendanceSnapshots: AttendanceSnapshot[] };
type Term = { id: string; label: string; academicYear: number; semesterNumber: number; subjects: Subject[]; _count: { subjects: number; gradeRecords: number; attendanceSnapshots: number } };

export function AcademicRecordsManager() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState('');
  const [termLabel, setTermLabel] = useState('');
  const [academicYear, setAcademicYear] = useState(String(new Date().getFullYear()));
  const [semesterNumber, setSemesterNumber] = useState('1');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [credits, setCredits] = useState('3');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedTerm = useMemo(
    () => terms.find(term => term.id === selectedTermId) ?? terms[0] ?? null,
    [terms, selectedTermId],
  );

  async function loadTerms() {
    const response = await fetch('/api/academic/terms', { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? 'Could not load academic terms.');
    setTerms(data.terms as Term[]);
  }

  useEffect(() => {
    let active = true;
    fetch('/api/academic/terms', { cache: 'no-store' })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? 'Could not load academic terms.');
        if (active) setTerms(data.terms as Term[]);
      })
      .catch(() => { if (active) setError('Academic records are unavailable. The database may not be active yet.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function submitTerm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(''); setError('');
    try {
      const response = await fetch('/api/academic/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: termLabel.trim(), academicYear: Number(academicYear), semesterNumber: Number(semesterNumber) }),
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error === 'TERM_ALREADY_EXISTS' ? 'That academic year and semester already exist.' : data.error === 'TERM_LIMIT_REACHED' ? 'This account has reached the 30-term limit.' : 'Could not create this term. Check the fields and try again.');
      setTermLabel('');
      setSelectedTermId(data.term.id);
      await loadTerms();
      setMessage('Academic term created.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create this term.');
    } finally { setBusy(false); }
  }

  async function submitSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTerm) return;
    setBusy(true); setMessage(''); setError('');
    try {
      const response = await fetch(`/api/academic/terms/${selectedTerm.id}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: subjectCode.trim(), name: subjectName.trim(), credits: Number(credits) }),
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error === 'SUBJECT_ALREADY_EXISTS' ? 'This course code already exists in the selected term.' : data.error === 'SUBJECT_LIMIT_REACHED' ? 'This term has reached the 50-subject limit.' : 'Could not add the subject. Check the fields and try again.');
      setSubjectCode(''); setSubjectName('');
      await loadTerms();
      setMessage('Subject added. You can now add your own grade and attendance values.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add the subject.');
    } finally { setBusy(false); }
  }

  async function submitSubjectUpdate(event: FormEvent<HTMLFormElement>, subject: Subject) {
    event.preventDefault();
    if (!selectedTerm) return;
    const form = new FormData(event.currentTarget);
    setBusy(true); setMessage(''); setError('');
    try {
      const response = await fetch(`/api/academic/terms/${selectedTerm.id}/subjects`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subject.id, name: String(form.get('name') ?? '').trim(), credits: Number(form.get('credits')) }),
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Subject details were not saved. Check the name and credits.');
      await loadTerms();
      setMessage(`Subject details saved for ${subject.code}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save subject details.');
    } finally { setBusy(false); }
  }

  async function submitGrade(event: FormEvent<HTMLFormElement>, subject: Subject) {
    event.preventDefault();
    if (!selectedTerm) return;
    const form = new FormData(event.currentTarget);
    const optionalNumber = (value: FormDataEntryValue | null) => String(value ?? '').trim() === '' ? null : Number(value);
    setBusy(true); setMessage(''); setError('');
    try {
      const response = await fetch(`/api/academic/terms/${selectedTerm.id}/grades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentSubjectId: subject.id,
          gradePoint: Number(form.get('gradePoint')),
          letterGrade: String(form.get('letterGrade') ?? '').trim() || null,
          marksObtained: optionalNumber(form.get('marksObtained')),
          maxMarks: optionalNumber(form.get('maxMarks')),
        }),
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) throw new Error('Grade was not saved. Check grade points and marks, then try again.');
      await loadTerms();
      setMessage(`Grade saved for ${subject.code}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save grade.');
    } finally { setBusy(false); }
  }

  async function exportRecords() {
    setBusy(true); setMessage(''); setError('');
    try {
      const response = await fetch('/api/academic/export', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error('Your records could not be exported right now.');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `jiit-toppers-academic-records-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage('A JSON export of your academic records was downloaded.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    } finally { setBusy(false); }
  }

  async function deleteSelectedTerm() {
    if (!selectedTerm || !window.confirm(`Delete ${selectedTerm.label} and all its subjects, grade records, attendance history and import metadata? This cannot be undone.`)) return;
    setBusy(true); setMessage(''); setError('');
    try {
      const response = await fetch(`/api/academic/terms/${selectedTerm.id}`, { method: 'DELETE', cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error === 'STORAGE_CLEANUP_REQUIRED' ? 'This term has stored documents that need secure cleanup before deletion.' : 'The selected term could not be deleted.');
      setSelectedTermId('');
      await loadTerms();
      setMessage(`${selectedTerm.label} and its academic records were deleted.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    } finally { setBusy(false); }
  }

  async function submitAttendance(event: FormEvent<HTMLFormElement>, subject: Subject) {
    event.preventDefault();
    if (!selectedTerm) return;
    const form = new FormData(event.currentTarget);
    setBusy(true); setMessage(''); setError('');
    try {
      const response = await fetch(`/api/academic/terms/${selectedTerm.id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentSubjectId: subject.id,
          classesHeld: Number(form.get('classesHeld')),
          classesAttended: Number(form.get('classesAttended')),
          targetPercent: Number(form.get('targetPercent')),
        }),
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error === 'INVALID_ATTENDANCE' ? 'Attended classes cannot exceed classes held.' : data.error === 'ATTENDANCE_HISTORY_LIMIT_REACHED' ? 'This term has reached the attendance history limit.' : 'Attendance was not saved. Check the values and try again.');
      await loadTerms();
      setMessage(`Attendance snapshot saved for ${subject.code}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save attendance.');
    } finally { setBusy(false); }
  }

  return <section className="jt-record-manager" aria-labelledby="jt-record-manager-title">
    <span className="jt-kicker">YOUR PRIVATE ACADEMIC RECORDS</span>
    <h2 id="jt-record-manager-title">Build your academic history.</h2>
    <p className="jt-lead">Records are tied to your signed-in account. Manual entries are student-provided, not official JIIT data. You can update grades and add new attendance snapshots as your counts change.</p>
    {loading && <p role="status">Loading your records…</p>}
    {error && <p className="jt-record-error" role="alert">{error}</p>}
    {message && <p className="jt-record-message" role="status">{message}</p>}

    <article className="jt-card jt-record-form-card">
      <h3>Add an academic term</h3>
      <form className="jt-record-form" onSubmit={submitTerm}>
        <label>Term label<input value={termLabel} onChange={event => setTermLabel(event.target.value)} required maxLength={80} placeholder="e.g. Semester 3" /></label>
        <label>Academic year<input type="number" min="2000" max="2100" value={academicYear} onChange={event => setAcademicYear(event.target.value)} required /></label>
        <label>Semester number<input type="number" min="1" max="12" value={semesterNumber} onChange={event => setSemesterNumber(event.target.value)} required /></label>
        <button className="jt-primary" type="submit" disabled={busy}>Create term</button>
      </form>
    </article>

    {terms.length > 0 && <>
      <div className="jt-record-term-select">
        <label htmlFor="academic-term-select">Selected term</label>
        <select id="academic-term-select" value={selectedTerm?.id ?? ''} onChange={event => setSelectedTermId(event.target.value)}>
          {terms.map(term => <option key={term.id} value={term.id}>{term.label} · {term.academicYear} · Semester {term.semesterNumber}</option>)}
        </select>
      </div>
      <div className="jt-record-actions">
        <button className="jt-account-button" type="button" onClick={exportRecords} disabled={busy}>Export all records (JSON)</button>
        {selectedTerm && <button className="jt-danger" type="button" onClick={deleteSelectedTerm} disabled={busy}>Delete selected term</button>}
      </div>
    </>}

    {selectedTerm && <article className="jt-card jt-record-form-card">
      <h3>Add a subject to {selectedTerm.label}</h3>
      <form className="jt-record-form" onSubmit={submitSubject}>
        <label>Course code<input value={subjectCode} onChange={event => setSubjectCode(event.target.value)} required maxLength={20} placeholder="e.g. 15B11CI301" /></label>
        <label>Course name<input value={subjectName} onChange={event => setSubjectName(event.target.value)} required maxLength={120} placeholder="e.g. Data Structures" /></label>
        <label>Credits<input type="number" value={credits} onChange={event => setCredits(event.target.value)} required min="0.1" max="30" step="0.1" /></label>
        <button className="jt-primary" type="submit" disabled={busy}>Add subject</button>
      </form>
    </article>}

    {selectedTerm && <AcademicCsvImport termId={selectedTerm.id} onImported={loadTerms}/>}

    {selectedTerm && selectedTerm.subjects.length === 0 && <div className="jt-task-empty"><strong>No subjects in this term yet.</strong><span>Add a subject above to start recording grades and attendance.</span></div>}
    {selectedTerm && selectedTerm.subjects.length > 0 && <div className="jt-record-subjects">
      {selectedTerm.subjects.map(subject => {
        const grade = subject.grades[0];
        const attendance = subject.attendanceSnapshots[0];
        const percentage = attendance && attendance.classesHeld > 0 ? (attendance.classesAttended / attendance.classesHeld) * 100 : null;
        return <article className="jt-card jt-record-subject" key={subject.id}>
          <div className="jt-record-subject-heading"><div><span className="jt-kicker">{subject.code} · {Number(subject.credits).toFixed(1)} CREDITS</span><h3>{subject.name}</h3></div><span className="jt-pill">Private records</span></div>
          <form className="jt-record-form jt-record-subject-edit" onSubmit={event => submitSubjectUpdate(event, subject)}>
            <label>Course name<input name="name" maxLength={120} defaultValue={subject.name} required /></label>
            <label>Credits<input name="credits" type="number" min="0.1" max="30" step="0.1" defaultValue={String(subject.credits)} required /></label>
            <button className="jt-account-button" type="submit" disabled={busy}>Save subject details</button>
          </form>
          <div className="jt-record-summary">
            <div><span>Latest grade point</span><strong>{grade ? Number(grade.gradePoint).toFixed(2) : 'Not entered'}</strong></div>
            <div><span>Latest attendance</span><strong>{percentage === null ? 'Not entered' : `${percentage.toFixed(1)}%`}</strong></div>
          </div>
          <form className="jt-record-form jt-record-subform" onSubmit={event => submitGrade(event, subject)}>
            <h4>Grade record</h4>
            <label>Grade points<input name="gradePoint" type="number" min="0" max="10" step="0.01" defaultValue={grade ? String(grade.gradePoint) : ''} required /></label>
            <label>Letter grade<input name="letterGrade" maxLength={4} defaultValue={grade?.letterGrade ?? ''} placeholder="Optional" /></label>
            <label>Marks obtained<input name="marksObtained" type="number" min="0" step="0.01" defaultValue={grade?.marksObtained == null ? '' : String(grade.marksObtained)} /></label>
            <label>Maximum marks<input name="maxMarks" type="number" min="0.01" step="0.01" defaultValue={grade?.maxMarks == null ? '' : String(grade.maxMarks)} /></label>
            <button className="jt-primary" type="submit" disabled={busy}>Save grade</button>
          </form>
          <form className="jt-record-form jt-record-subform" onSubmit={event => submitAttendance(event, subject)}>
            <h4>Attendance snapshot</h4>
            <label>Classes held<input name="classesHeld" type="number" min="0" max="100000" step="1" defaultValue={attendance?.classesHeld ?? ''} required /></label>
            <label>Classes attended<input name="classesAttended" type="number" min="0" max="100000" step="1" defaultValue={attendance?.classesAttended ?? ''} required /></label>
            <label>Target (%)<input name="targetPercent" type="number" min="0" max="100" step="0.1" defaultValue={attendance ? String(attendance.targetPercent) : '75'} required /></label>
            <button className="jt-primary" type="submit" disabled={busy}>Save attendance</button>
          </form>
          {grade && <small>Grade source: {grade.sourceLabel ?? grade.source}. Last updated {new Date(grade.observedAt).toLocaleString('en-IN')}.</small>}
          {attendance && <small>Attendance source: {attendance.sourceLabel ?? attendance.source}. Last updated {new Date(attendance.observedAt).toLocaleString('en-IN')}.</small>}
        </article>;
      })}
    </div>}
    <p className="jt-planner-notice">No JIIT portal connection or document upload is active. Do not treat these entries as official records. XLSX/PDF imports and secure raw-document storage are not available.</p>
  </section>;
}
