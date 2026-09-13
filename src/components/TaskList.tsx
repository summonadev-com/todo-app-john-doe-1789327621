import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { TaskGroup } from '@/components/TaskGroup';
import { TaskItem } from '@/components/TaskItem';
import { groupTasks } from '@/lib/tasks';
import type { Task } from '@/types/task';

interface TaskListProps {
  tasks: Task[];
  today: string;
  onToggle: (id: string) => void;
  onUpdate: (id: string, patch: { title?: string; dueAt?: string | null }) => void;
  onDelete: (id: string) => void;
}

const GROUP_ORDER = [
  { key: 'overdue', label: 'Overdue', tone: 'danger' },
  { key: 'today', label: 'Today', tone: 'warning' },
  { key: 'upcoming', label: 'Upcoming', tone: 'default' },
  { key: 'none', label: 'No date', tone: 'default' },
] as const;

export function TaskList({ tasks, today, onToggle, onUpdate, onDelete }: TaskListProps) {
  const groups = useMemo(() => groupTasks(tasks, today), [tasks, today]);
  const [showCompleted, setShowCompleted] = useState(false);

  const activeCount = tasks.length - groups.completed.length;

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="Nothing here yet"
        description="Add your first task above — a due date is optional."
      />
    );
  }

  return (
    <div className="flex flex-col gap-7">
      {activeCount === 0 && (
        <EmptyState
          title="All clear"
          description="Every task is done. Enjoy the quiet."
          tone="success"
        />
      )}

      {GROUP_ORDER.map(({ key, label, tone }) => (
        <TaskGroup
          key={key}
          label={label}
          tone={tone}
          tasks={groups[key]}
          today={today}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}

      {groups.completed.length > 0 && (
        <section className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            aria-expanded={showCompleted}
            className="flex w-fit items-center gap-1.5 rounded-lg px-1 py-1 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase transition hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          >
            <span
              className={`inline-block text-sm leading-none transition-transform ${showCompleted ? 'rotate-90' : ''}`}
              aria-hidden
            >
              ›
            </span>
            Completed <span className="opacity-60">({groups.completed.length})</span>
          </button>
          {showCompleted && (
            <ul className="flex flex-col gap-2">
              {groups.completed.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  today={today}
                  onToggle={onToggle}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
