interface SummaryLineProps {
  overdue: number;
  dueToday: number;
}

export function SummaryLine({ overdue, dueToday }: SummaryLineProps) {
  if (overdue === 0 && dueToday === 0) return null;

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-sm font-medium">
      {overdue > 0 && (
        <span className="text-rose-600">
          {overdue} overdue
        </span>
      )}
      {overdue > 0 && dueToday > 0 && <span className="text-slate-300">·</span>}
      {dueToday > 0 && (
        <span className="text-amber-700">
          {dueToday} due today
        </span>
      )}
    </p>
  );
}
