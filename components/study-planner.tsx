'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Check, Circle, Plus, Trash2 } from 'lucide-react';

type StudyTask = {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
};

const STORAGE_KEY = 'jiit-toppers:study-tasks:v1';
const MAX_TASKS = 100;

function isStudyTask(value: unknown): value is StudyTask {
  if (!value || typeof value !== 'object') return false;
  const task = value as Record<string, unknown>;
  return typeof task.id === 'string'
    && typeof task.title === 'string'
    && task.title.length > 0
    && typeof task.dueDate === 'string'
    && typeof task.completed === 'boolean'
    && typeof task.createdAt === 'string';
}

function loadTasks(): StudyTask[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStudyTask).slice(0, MAX_TASKS);
  } catch {
    return [];
  }
}

export function StudyPlanner() {
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('open');
  const [loaded, setLoaded] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);

  useEffect(() => {
    setTasks(loadTasks());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      setStorageWarning(false);
    } catch {
      setStorageWarning(true);
    }
  }, [loaded, tasks]);

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (cleanTitle.length < 2 || cleanTitle.length > 120 || tasks.length >= MAX_TASKS) return;
    const task: StudyTask = {
      id: window.crypto.randomUUID(),
      title: cleanTitle,
      dueDate,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(current => [task, ...current].slice(0, MAX_TASKS));
    setTitle('');
    setDueDate('');
  }

  function toggleTask(id: string) {
    setTasks(current => current.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  }

  function deleteTask(id: string) {
    setTasks(current => current.filter(task => task.id !== id));
  }

  const visibleTasks = tasks.filter(task => filter === 'all' || (filter === 'open' ? !task.completed : task.completed));
  const completedCount = tasks.filter(task => task.completed).length;

  return <section className="jt-study-planner" aria-labelledby="jt-study-planner-title">
    <div className="jt-source-heading">
      <div><span className="jt-kicker">PERSONAL STUDY PLAN</span><h2 id="jt-study-planner-title">Make the next session count.</h2></div>
      <p>{completedCount} of {tasks.length} task{tasks.length === 1 ? '' : 's'} completed</p>
    </div>
    <p className="jt-planner-notice">Your study tasks are saved in this browser only. They are not synced to an account or sent to JIIT Toppers servers. Clearing browser data removes them.</p>
    <form className="jt-task-form" onSubmit={addTask}>
      <label>Task<input value={title} onChange={event => setTitle(event.target.value)} minLength={2} maxLength={120} required placeholder="e.g. Revise linked lists" /></label>
      <label>Due date (optional)<input type="date" value={dueDate} onChange={event => setDueDate(event.target.value)} /></label>
      <button className="jt-primary" type="submit" disabled={title.trim().length < 2 || tasks.length >= MAX_TASKS}><Plus size={16} aria-hidden="true"/>Add task</button>
    </form>
    {storageWarning && <p className="jt-storage-warning" role="alert">The browser could not save your tasks. Check available storage or export/copy your task list before leaving.</p>}
    <div className="jt-task-toolbar" role="group" aria-label="Filter study tasks">
      {(['open', 'all', 'done'] as const).map(value => <button key={value} type="button" className={filter === value ? 'active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value === 'open' ? 'To do' : value === 'done' ? 'Completed' : 'All tasks'}</button>)}
    </div>
    {visibleTasks.length === 0
      ? <div className="jt-task-empty"><strong>{filter === 'done' ? 'Nothing completed yet.' : filter === 'open' ? 'Your list is clear.' : 'No tasks yet.'}</strong><span>Add a small, specific task to get started.</span></div>
      : <ul className="jt-task-list">{visibleTasks.map(task => <li key={task.id} className={task.completed ? 'completed' : ''}>
        <button className="jt-task-toggle" type="button" onClick={() => toggleTask(task.id)} aria-label={task.completed ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as complete`}>{task.completed ? <Check size={18} aria-hidden="true"/> : <Circle size={18} aria-hidden="true"/>}</button>
        <div className="jt-task-copy"><strong>{task.title}</strong>{task.dueDate && <span>Due {new Date(`${task.dueDate}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}</div>
        <button className="jt-task-delete" type="button" onClick={() => deleteTask(task.id)} aria-label={`Delete ${task.title}`}><Trash2 size={16} aria-hidden="true"/></button>
      </li>)}</ul>}
    {tasks.length > 0 && <button className="jt-clear-tasks" type="button" onClick={() => setTasks([])}>Clear all tasks</button>}
  </section>;
}
