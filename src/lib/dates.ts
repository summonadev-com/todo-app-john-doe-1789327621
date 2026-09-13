import type { DueBucket } from '@/types/task';

/** Returns today's local date as a date-only ISO string ("2025-03-14"). */
export function todayISO(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateOnly(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_ONLY.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
}

/** Whole-day difference: due - today. Negative means overdue. */
export function daysUntil(dueAt: string, today: string): number {
  const a = new Date(`${today}T00:00:00`).getTime();
  const b = new Date(`${dueAt}T00:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function getBucket(dueAt: string | null, today: string): DueBucket {
  if (!dueAt || !isValidDateOnly(dueAt)) return 'none';
  const diff = daysUntil(dueAt, today);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  return 'upcoming';
}

/** Due within the next 48 hours (tomorrow or the day after) and not yet overdue. */
export function isDueSoon(dueAt: string | null, today: string): boolean {
  if (!dueAt || !isValidDateOnly(dueAt)) return false;
  const diff = daysUntil(dueAt, today);
  return diff > 0 && diff <= 2;
}

const WEEKDAY = new Intl.DateTimeFormat(undefined, { weekday: 'long' });
const SHORT_DATE = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
const LONG_DATE = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function formatDueLabel(dueAt: string, today: string): string {
  if (!isValidDateOnly(dueAt)) return dueAt;
  const diff = daysUntil(dueAt, today);
  const date = new Date(`${dueAt}T00:00:00`);

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return '1 day overdue';
  if (diff < -1) return `${Math.abs(diff)} days overdue`;
  if (diff <= 6) return WEEKDAY.format(date);

  const sameYear = date.getFullYear() === new Date(`${today}T00:00:00`).getFullYear();
  return sameYear ? SHORT_DATE.format(date) : LONG_DATE.format(date);
}
