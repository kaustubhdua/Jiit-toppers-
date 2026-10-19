'use client';

import { useEffect, useState } from 'react';

type ImportRecord = {
  id: string;
  kind: 'GRADE_CARD' | 'ATTENDANCE' | 'TIMETABLE' | 'EXAM_SCHEDULE';
  status: 'REVIEW_REQUIRED' | 'CONFIRMED' | 'FAILED' | 'DELETED';
  originalName: string;
  mimeType: string;
  sizeBytes: string;
  checksum: string | null;
  parserVersion: string | null;
  sourceLabel: string | null;
  createdAt: string;
  confirmedAt: string | null;
  deletedAt: string | null;
};

const kindLabel: Record<ImportRecord['kind'], string> = {
  GRADE_CARD: 'Grade card',
  ATTENDANCE: 'Attendance',
  TIMETABLE: 'Timetable',
  EXAM_SCHEDULE: 'Exam schedule',
};

export function AcademicImportHistory({ termId, onDeleted }: { termId: string; onDeleted: () => Promise<void> }) {
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedTermId, setLoadedTermId] = useState('');
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const response = await fetch(`/api/academic/terms/${termId}/imports`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? 'Import history is unavailable.');
    setImports(data.imports as ImportRecord[]);
  }

  useEffect(() => {
    let active = true;
    fetch(`/api/academic/terms/${termId}/imports`, { cache: 'no-store' })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? 'Import history is unavailable.');
        if (active) {
          setImports(data.imports as ImportRecord[]);
          setError('');
          setLoadedTermId(termId);
        }
      })
      .catch(() => { if (active) { setError('Import history could not be loaded. The database may be unavailable.'); setLoadedTermId(termId); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [termId]);

  async function deleteImport(record: ImportRecord) {
    const warning = record.kind === 'GRADE_CARD'
      ? 'Deleting this import also deletes the grade records currently attributed to it. This cannot be undone.'
      : 'Deleting this import also deletes attendance snapshots attributed to it. This cannot be undone.';
    if (!window.confirm(`Delete “${record.originalName}”? ${warning}`)) return;
    setBusyId(record.id); setError(''); setMessage('');
    try {
      const response = await fetch(`/api/academic/terms/${termId}/imports?importId=${encodeURIComponent(record.id)}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error === 'STORAGE_CLEANUP_REQUIRED'
          ? 'This import has a stored file that must be securely removed first.'
          : 'The import could not be deleted.');
      }
      await load();
      await onDeleted();
      setMessage('Import history and the records attributed to it were deleted.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import deletion failed.');
    } finally {
      setBusyId('');
    }
  }

  const isLoading = loading || loadedTermId !== termId;

  return <section className="jt-card jt-record-form-card" aria-labelledby="jt-import-history-title">
    <h3 id="jt-import-history-title">Import history</h3>
    <p>Review the CSV imports associated with this term. Deleting an import also removes records currently linked to that import; no uploaded raw file is stored by this CSV flow.</p>
    {isLoading && <p role="status">Loading import history…</p>}
    {error && <p className="jt-record-error" role="alert">{error}</p>}
    {message && <p className="jt-record-message" role="status">{message}</p>}
    {!isLoading && imports.length === 0 && !error && <p>No imports recorded for this term yet.</p>}
    {imports.length > 0 && <ul className="jt-import-history">
      {imports.map(record => <li key={record.id}>
        <div>
          <strong>{record.originalName}</strong>
          <span>{kindLabel[record.kind]} · {record.status.replaceAll('_', ' ').toLocaleLowerCase()} · {(Number(record.sizeBytes) / 1024).toFixed(1)} KB</span>
          <small>Imported {new Date(record.createdAt).toLocaleString('en-IN')} · {record.parserVersion ?? 'parser version not recorded'}</small>
        </div>
        <button className="jt-danger" type="button" onClick={() => void deleteImport(record)} disabled={Boolean(busyId)}>{busyId === record.id ? 'Deleting…' : 'Delete import'}</button>
      </li>)}
    </ul>}
  </section>;
}
