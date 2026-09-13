export type DueBucket = 'overdue' | 'today' | 'upcoming' | 'none';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  /** Date-only ISO string, e.g. "2025-03-14", or null when the task has no due date. */
  dueAt: string | null;
  completed: boolean;
  completedAt?: string | null;
  createdAt: string;
}

export interface TaskEnvelope {
  version: number;
  tasks: Task[];
}

export const TASKS_STORAGE_KEY = 'todo.tasks.v1';
export const TASKS_VERSION = 1;
