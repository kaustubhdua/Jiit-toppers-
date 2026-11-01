"use client";

import { useEffect, useMemo, useState } from "react";
import { BookMarked, Download, ExternalLink, Plus, Trash2 } from "lucide-react";
import { isValidPyqHttpsUrl, parseStoredPyqEntries } from "@/lib/pyq-study-vault.mjs";

type Status = "SAVED" | "PLANNED" | "ATTEMPTED" | "REVIEWED";
type Entry = {
  id: string;
  title: string;
  subject: string;
  url: string;
  year: string;
  status: Status;
  notes: string;
  createdAt: string;
};

const STORAGE_KEY = "jiit-toppers:pyq-study-vault:v1";
const statuses: Status[] = ["SAVED", "PLANNED", "ATTEMPTED", "REVIEWED"];


export function PersonalPyqTracker() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [url, setUrl] = useState("");
  const [year, setYear] = useState("");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState<"ALL" | Status>("ALL");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      let storedEntries: Entry[] = [];
      let loadError = "";
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        storedEntries = parseStoredPyqEntries(raw);
      } catch {
        loadError = "Saved records could not be read from this browser.";
      }
      if (active) {
        setEntries(storedEntries);
        if (loadError) setError(loadError);
        setReady(true);
      }
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const visible = useMemo(
    () => entries.filter((entry) => filter === "ALL" || entry.status === filter),
    [entries, filter],
  );

  function commitEntries(nextEntries: Entry[]) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
      setEntries(nextEntries);
      setError("");
      return true;
    } catch {
      setError("Browser storage is unavailable or full. Your changes were not saved; export existing records if possible.");
      return false;
    }
  }

  function addEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!title.trim()) return setError("Add a paper title before saving.");
    if (!isValidPyqHttpsUrl(url.trim())) return setError("Enter a valid HTTPS source link.");
    if (year && (!/^20\d{2}$/.test(year) || Number(year) > new Date().getFullYear() + 1)) {
      return setError("Enter a valid four-digit paper year.");
    }

    const entry: Entry = {
      id: crypto.randomUUID(),
      title: title.trim().slice(0, 120),
      subject: subject.trim().slice(0, 80),
      url: url.trim(),
      year,
      status: "SAVED",
      notes: notes.trim().slice(0, 1000),
      createdAt: new Date().toISOString(),
    };
    if (!ready || !commitEntries([entry, ...entries])) return;
    setTitle("");
    setSubject("");
    setUrl("");
    setYear("");
    setNotes("");
  }

  function exportEntries() {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), entries }, null, 2)], {
      type: "application/json",
    });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "jiit-toppers-study-vault.json";
    anchor.click();
    URL.revokeObjectURL(href);
  }

  return (
    <section className="jt-source-panel" aria-labelledby="personal-pyq-title">
      <div className="jt-source-heading">
        <div>
          <span className="jt-kicker">PERSONAL WORKSPACE · DEVICE-LOCAL</span>
          <h2 id="personal-pyq-title"><BookMarked size={22} aria-hidden="true" /> My paper tracker</h2>
        </div>
        <button className="jt-secondary" type="button" onClick={exportEntries} disabled={!ready || !entries.length}>
          <Download size={16} aria-hidden="true" /> Export records
        </button>
      </div>
      <p className="jt-source-note">Save links you choose to study and track your progress. Records stay in this browser and are not synced to an account or shared with JIIT Toppers. Anyone with access to this browser profile may be able to view them, so avoid storing sensitive information.</p>

      <form className="jt-card" onSubmit={addEntry}>
        <h3>Add a paper reference</h3>
        <div className="jt-grid jt-two">
          <label>Paper title<input required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Data Structures End Semester" /></label>
          <label>Subject (optional)<input maxLength={80} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject name or code" /></label>
          <label>Source URL<input required type="url" inputMode="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /></label>
          <label>Paper year (optional)<input inputMode="numeric" maxLength={4} value={year} onChange={(e) => setYear(e.target.value)} placeholder="2025" /></label>
        </div>
        <label>Personal notes (optional)<textarea maxLength={1000} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Topics to revise, attempt notes…" /></label>
        {error && <p role="alert" className="jt-error">{error}</p>}
        <button className="jt-primary" type="submit" disabled={!ready}><Plus size={16} aria-hidden="true" /> Save paper</button>
      </form>

      <div className="jt-section-head">
        <h3>Your saved references ({entries.length})</h3>
        <label>Filter status<select value={filter} onChange={(e) => setFilter(e.target.value as "ALL" | Status)}><option value="ALL">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
      </div>
      {!ready ? <p role="status">Loading your local records…</p> : visible.length === 0 ? (
        <div className="jt-card"><p>{entries.length ? "No papers match this filter." : "No saved papers yet. Add a source link above to start your personal study vault."}</p></div>
      ) : (
        <div className="jt-grid jt-two">
          {visible.map((entry) => (
            <article className="jt-resource" key={entry.id}>
              <span className="jt-pill">{entry.subject || "Subject not specified"}{entry.year ? ` · ${entry.year}` : ""}</span>
              <h3>{entry.title}</h3>
              {entry.notes && <p>{entry.notes}</p>}
              <label>Preparation status<select value={entry.status} onChange={(e) => commitEntries(entries.map((item) => item.id === entry.id ? { ...item, status: e.target.value as Status } : item))}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
              <div className="jt-source-footer">
                <a href={entry.url} target="_blank" rel="noopener noreferrer">Open original source <ExternalLink size={14} aria-hidden="true" /></a>
                <button className="jt-secondary" type="button" aria-label={`Delete ${entry.title}`} onClick={() => commitEntries(entries.filter((item) => item.id !== entry.id))}><Trash2 size={15} /> Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="jt-source-note">Only HTTPS links are accepted. The app does not fetch submitted URLs, download external files, or claim ownership of linked papers.</p>
    </section>
  );
}
