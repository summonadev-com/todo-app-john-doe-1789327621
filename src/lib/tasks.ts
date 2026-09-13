import { getBucket, isValidDateOnly } from '@/lib/dates';
import type { DueBucket, Task } from '@/types/task';

/** Narrows arbitrary parsed JSON into a valid Task, or null when unusable. */
export function coerceTask(value: unknown): Task | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;

  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!title) return null;

  const id = typeof raw.id === 'string' && raw.id ? raw.id : createId();
  const dueAt = isValidDateOnly(raw.dueAt) ? (raw.dueAt as string) : null;
  const completed = raw.completed === true;
  const createdAt =
    typeof raw.createdAt === 'string' && !Number.isNaN(Date.parse(raw.createdAt))
      ? raw.createdAt
      : new Date().toISOString();
  const completedAt =
    typeof raw.completedAt === 'string' && !Number.isNaN(Date.parse(raw.completedAt))
      ? raw.completedAt
      : null;

  return {
    id,
    title,
    notes: typeof raw.notes === 'string' ? raw.notes : undefined,
    dueAt,
    completed,
    completedAt: completed ? completedAt : null,
    createdAt,
  };
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `t_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

/** Due date ascending (dated before undated), then createdAt ascending. */
export function compareTasks(a: Task, b: Task): number {
  if (a.dueAt && b.dueAt && a.dueAt !== b.dueAt) return a.dueAt < b.dueAt ? -1 : 1;
  if (a.dueAt && !b.dueAt) return -1;
  if (!a.dueAt && b.dueAt) return 1;
  return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
}

export interface GroupedTasks {
  overdue: Task[];
  today: Task[];
  upcoming: Task[];
  none: Task[];
  completed: Task[];
}

export function groupTasks(tasks: Task[], today: string): GroupedTasks {
  const groups: GroupedTasks = {
    overdue: [],
    today: [],
    upcoming: [],
    none: [],
    completed: [],
  };

  for (const task of tasks) {
    if (task.completed) {
      groups.completed.push(task);
      continue;
    }
    const bucket: DueBucket = getBucket(task.dueAt, today);
    groups[bucket].push(task);
  }

  groups.overdue.sort(compareTasks);
  groups.today.sort(compareTasks);
  groups.upcoming.sort(compareTasks);
  groups.none.sort(compareTasks);
  // Most recently completed first.
  groups.completed.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));

  return groups;
}

export function isValidTitle(title: string): boolean {
  return title.trim().length > 0;
}
