'use client';

import { useState, type ChangeEvent } from 'react';
import { parseAcademicCsv } from '@/lib/academic/parse-csv.mjs';
import type { AcademicCsvResult } from '@/lib/academic/parse-csv';

type Preview = Extract<AcademicCsvResult, { ok: true }>;

export function AcademicCsvImport({ termId, onImported }: { termId: string; onImported: () => Promise<void> }) {
  const [kind, setKind] = useState<'GRADE_CARD' | 'ATTENDANCE'>('GRADE_CARD');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function readAndParse(selectedFile: File | null, selectedKind = kind) {
    setFile(selectedFile);
    setPreview(null);
    setError('');
    setMessage('');
    if (!selectedFile) return;
    if (selectedFile.size > 1_000_000) {
      setError('Choose a CSV file no larger than 1 MB.');
      return;
    }
    try {
      const parsed = parseAcademicCsv(await selectedFile.text(), selectedKind);
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      setPreview(parsed);
    } catch {
      setError('The file could not be read. Try saving it as UTF-8 CSV.');
    }
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    void readAndParse(event.currentTarget.files?.[0] ?? null);
  }

  async function onKindChange(value: 'GRADE_CARD' | 'ATTENDANCE') {
    setKind(value);
    if (file) await readAndParse(file, value);
  }

  async function confirmImport() {
    if (!file || !preview) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
      const checksum = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      const response = await fetch(`/api/academic/terms/${termId}/imports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: preview.kind, originalName: file.name, sizeBytes: file.size, checksum, rows: preview.rows }),
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) {
        const messageByCode: Record<string, string> = {
          DUPLICATE_IMPORT: 'This exact file has already been imported for this account.',
          SUBJECT_METADATA_CONFLICT: 'A course code already exists with different name or credits. Resolve that conflict before importing.',
          TERM_NOT_FOUND: 'The selected term is no longer available. Reload the page.',
          IMPORT_TOO_LARGE: 'This import is too large.',
        };
        throw new Error(messageByCode[data.error] ?? 'Import failed. No rows were committed; check the file and try again.');
      }
      await onImported();
      setFile(null); setPreview(null);
      setMessage(`Imported ${data.importedRows} row(s). The source and import time are recorded.`);
      const input = document.getElementById('academic-csv-file') as HTMLInputElement | null;
      if (input) input.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed. No rows were committed.');
    } finally { setBusy(false); }
  }

  return <article className="jt-card jt-csv-import">
    <h3>Import a CSV file</h3>
    <p>Choose a grade-card or attendance CSV. The file is parsed in your browser; the original file is not uploaded. Only the rows you preview and confirm are sent to your account.</p>
    <div className="jt-record-form jt-csv-import-controls">
      <label>Import type<select value={kind} onChange={event => void onKindChange(event.target.value as 'GRADE_CARD' | 'ATTENDANCE')}><option value="GRADE_CARD">Grade card</option><option value="ATTENDANCE">Attendance</option></select></label>
      <label>CSV file<input id="academic-csv-file" type="file" accept=".csv,text/csv" onChange={onFileChange}/></label>
    </div>
    <details className="jt-csv-format"><summary>CSV format requirements</summary>
      {kind === 'GRADE_CARD'
        ? <p>Required headers: code, name, credits, grade_point. Optional: letter_grade, marks_obtained, max_marks. If marks are provided, include both marks_obtained and max_marks.</p>
        : <p>Required headers: code, name, credits, classes_held, classes_attended. Optional: target_percent (defaults to 75). Use one row per subject and do not exceed 100 rows.</p>}
    </details>
    {error && <p className="jt-record-error" role="alert">{error}</p>}
    {message && <p className="jt-record-message" role="status">{message}</p>}
    {preview && <div className="jt-csv-preview">
      <strong>Preview: {preview.count} row(s)</strong>
      <div className="jt-csv-table-wrap"><table><thead><tr><th>Code</th><th>Subject</th><th>Credits</th>{preview.kind === 'GRADE_CARD' ? <><th>Grade point</th><th>Marks</th></> : <><th>Attended / held</th><th>Target</th></>}</tr></thead>
        <tbody>{preview.rows.slice(0, 8).map(row => <tr key={row.code}><td>{row.code}</td><td>{row.name}</td><td>{row.credits.toFixed(1)}</td>{preview.kind === 'GRADE_CARD' ? <><td>{row.gradePoint.toFixed(2)}</td><td>{row.marksObtained === null ? '—' : `${row.marksObtained} / ${row.maxMarks}`}</td></> : <><td>{row.classesAttended} / {row.classesHeld}</td><td>{row.targetPercent}%</td></>}</tr>)}</tbody>
      </table></div>
      {preview.count > 8 && <small>Showing the first 8 rows. All {preview.count} validated rows will be imported.</small>}
      <button className="jt-primary" type="button" onClick={confirmImport} disabled={busy}>{busy ? 'Importing…' : `Confirm and import ${preview.count} row(s)`}</button>
    </div>}
  </article>;
}
