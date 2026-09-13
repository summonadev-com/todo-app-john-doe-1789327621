import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ConfirmDeleteButton } from '@/components/ConfirmDeleteButton';
import { DueDateBadge } from '@/components/DueDateBadge';
import { getBucket } from '@/lib/dates';
import type { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  today: string;
  onToggle: (id: string) => void;
  onUpdate: (id: string, patch: { title?: string; dueAt?: string | null }) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, today, onToggle, onUpdate, onDelete }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftDue, setDraftDue] = useState(task.dueAt ?? '');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function startEdit() {
    setDraftTitle(task.title);
    setDraftDue(task.dueAt ?? '');
    setError(null);
    setEditing(true);
  }

  function save() {
    if (!draftTitle.trim()) {
      setError('Task name can’t be empty.');
      return;
    }
    onUpdate(task.id, { title: draftTitle, dueAt: draftDue || null });
    setEditing(false);
    setError(null);
  }

  function cancel() {
    setEditing(false);
    setError(null);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      save();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  }

  const bucket = getBucket(task.dueAt, today);
  const emphasis = task.completed
    ? 'border-slate-200 bg-slate-50'
    : bucket === 'overdue'
      ? 'border-rose-200 bg-rose-50/50'
      : bucket === 'today'
        ? 'border-amber-200 bg-amber-50/50'
        : 'border-slate-200 bg-white';

  if (editing) {
    return (
      <li className="rounded-2xl border border-indigo-300 bg-white p-3 shadow-sm ring-4 ring-indigo-500/10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            ref={inputRef}
            type="text"
            value={draftTitle}
            onChange={(e) => {
              setDraftTitle(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            aria-label="Task name"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[15px] outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
          <input
            type="date"
            value={draftDue}
            onChange={(e) => setDraftDue(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Due date"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30"
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancel}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
            >
              Cancel
            </button>
          </div>
        </div>
        {error && (
          <p role="alert" className="mt-2 px-1 text-sm text-rose-600">
            {error}
          </p>
        )}
      </li>
    );
  }

  return (
    <li
      className={`group flex items-start gap-3 rounded-2xl border px-3 py-3 shadow-sm transition hover:border-slate-300 sm:px-4 ${emphasis}`}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={task.completed ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        className="mt-0.5 size-[18px] shrink-0 cursor-pointer rounded border-slate-300 accent-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <button
          type="button"
          onClick={startEdit}
          className="min-w-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:rounded"
          title="Click to edit"
        >
          <span
            className={`block min-w-0 text-[15px] leading-snug break-words ${
              task.completed ? 'text-slate-400 line-through' : 'text-slate-800'
            }`}
          >
            {task.title}
          </span>
        </button>
        {task.notes && <span className="text-xs text-slate-500">{task.notes}</span>}
      </div>

      {task.dueAt && <DueDateBadge dueAt={task.dueAt} today={today} muted={task.completed} />}

      <ConfirmDeleteButton onConfirm={() => onDelete(task.id)} label={task.title} />
    </li>
  );
}
