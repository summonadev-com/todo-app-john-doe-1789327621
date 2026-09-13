import { formatDueLabel, getBucket, isDueSoon } from '@/lib/dates';

interface DueDateBadgeProps {
  dueAt: string;
  today: string;
  muted?: boolean;
}

export function DueDateBadge({ dueAt, today, muted = false }: DueDateBadgeProps) {
  const bucket = getBucket(dueAt, today);
  const soon = isDueSoon(dueAt, today);
  const label = formatDueLabel(dueAt, today);

  let tone = 'border-slate-200 bg-slate-50 text-slate-500';
  if (!muted) {
    if (bucket === 'overdue') tone = 'border-rose-200 bg-rose-50 text-rose-700';
    else if (bucket === 'today') tone = 'border-amber-200 bg-amber-50 text-amber-800';
    else if (soon) tone = 'border-amber-200 bg-amber-50/60 text-amber-700';
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${tone}`}
    >
      {label}
    </span>
  );
}
