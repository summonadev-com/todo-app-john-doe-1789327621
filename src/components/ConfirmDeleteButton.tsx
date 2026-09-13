import { useEffect, useState } from 'react';

interface ConfirmDeleteButtonProps {
  onConfirm: () => void;
  label?: string;
}

export function ConfirmDeleteButton({ onConfirm, label = 'task' }: ConfirmDeleteButtonProps) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), 4000);
    return () => window.clearTimeout(timer);
  }, [armed]);

  if (armed) {
    return (
      <span className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white transition hover:bg-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={() => setArmed(false)}
          className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setArmed(true)}
      aria-label={`Delete ${label}`}
      title={`Delete ${label}`}
      className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-4">
        <path d="M4 6h12M8.5 6V4.5h3V6M6 6l.7 9.2a1 1 0 0 0 1 .8h4.6a1 1 0 0 0 1-.8L14 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
