import { useState, type FormEvent } from 'react';
import type { NewTaskInput } from '@/hooks/useTasks';

interface TaskFormProps {
  onAdd: (input: NewTaskInput) => void;
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError('Give the task a name first.');
      return;
    }
    onAdd({ title, dueAt: dueAt || null });
    setTitle('');
    setDueAt('');
    setError(null);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm ring-1 ring-black/[0.02] sm:p-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError(null);
          }}
          placeholder="What needs doing?"
          aria-label="Task name"
          aria-invalid={error ? true : undefined}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 transition outline-none hover:border-slate-300 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            aria-label="Due date (optional)"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition outline-none hover:border-slate-300 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 sm:flex-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 active:bg-indigo-700"
          >
            Add
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 px-1 text-sm text-rose-600">
          {error}
        </p>
      )}
    </form>
  );
}
