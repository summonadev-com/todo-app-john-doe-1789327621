import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  tone?: 'neutral' | 'success';
  icon?: ReactNode;
}

export function EmptyState({ title, description, tone = 'neutral', icon }: EmptyStateProps) {
  const styles =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : 'border-dashed border-slate-300 bg-white/60 text-slate-700';
  const descStyles = tone === 'success' ? 'text-emerald-700' : 'text-slate-500';

  return (
    <div className={`rounded-2xl border px-6 py-12 text-center ${styles}`}>
      {icon && <div className="mb-3 flex justify-center">{icon}</div>}
      <p className="text-base font-medium">{title}</p>
      {description && <p className={`mt-1 text-sm ${descStyles}`}>{description}</p>}
    </div>
  );
}
