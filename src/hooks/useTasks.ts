import { useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { coerceTask, createId } from '@/lib/tasks';
import { TASKS_STORAGE_KEY, TASKS_VERSION, type Task } from '@/types/task';

function deserialize(raw: unknown): Task[] {
  // Accept both the versioned envelope and a bare array (older/hand-written data).
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as { tasks?: unknown }).tasks)
      ? (raw as { tasks: unknown[] }).tasks
      : [];

  const out: Task[] = [];
  for (const entry of list) {
    const task = coerceTask(entry);
    if (task) out.push(task);
  }
  return out;
}

function serialize(tasks: Task[]) {
  return { version: TASKS_VERSION, tasks };
}

export interface NewTaskInput {
  title: string;
  dueAt?: string | null;
  notes?: string;
}

export function useTasks() {
  const { value: tasks, setValue, persistenceFailed } = useLocalStorage<Task[]>(
    TASKS_STORAGE_KEY,
    [],
    deserialize,
    serialize,
  );

  const addTask = useCallback(
    (input: NewTaskInput) => {
      const title = input.title.trim();
      if (!title) return;
      const task: Task = {
        id: createId(),
        title,
        notes: input.notes?.trim() || undefined,
        dueAt: input.dueAt || null,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
      };
      setValue((prev) => [...prev, task]);
    },
    [setValue],
  );

  const updateTask = useCallback(
    (id: string, patch: Partial<Pick<Task, 'title' | 'dueAt' | 'notes'>>) => {
      setValue((prev) =>
        prev.map((task) => {
          if (task.id !== id) return task;
          const nextTitle = patch.title !== undefined ? patch.title.trim() : task.title;
          if (!nextTitle) return task;
          return {
            ...task,
            title: nextTitle,
            dueAt: patch.dueAt !== undefined ? patch.dueAt || null : task.dueAt,
            notes: patch.notes !== undefined ? patch.notes.trim() || undefined : task.notes,
          };
        }),
      );
    },
    [setValue],
  );

  const toggleComplete = useCallback(
    (id: string) => {
      setValue((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                completed: !task.completed,
                completedAt: !task.completed ? new Date().toISOString() : null,
              }
            : task,
        ),
      );
    },
    [setValue],
  );

  const deleteTask = useCallback(
    (id: string) => {
      setValue((prev) => prev.filter((task) => task.id !== id));
    },
    [setValue],
  );

  return { tasks, addTask, updateTask, toggleComplete, deleteTask, persistenceFailed };
}
