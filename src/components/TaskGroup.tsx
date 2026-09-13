import { TaskItem } from '@/components/TaskItem';
import type { Task } from '@/types/task';

interface TaskGroupProps {
  label: string;
  tone?: 'default' | 'danger' | 'warning';
  tasks: Task[];
  today: string;
  onToggle: (id: string) => void;
  onUpdate: (id: string, patch: { title?: string; dueAt?: string | null }) => void;
  onDelete: (id: string) => void;
}

export function TaskGroup({
  label,
  tone = 'default',
  tasks,
  today,
  onToggle,
  onUpdate,
  onDelete,
}: TaskGroupProps) {
  if (tasks.length === 0) return null;

  const labelTone =
    tone === 'danger' ? 'text-rose-600' : tone === 'warning' ? 'text-amber-700' : 'text-slate-500';

  return (
    <section className="flex flex-col gap-2">
      <h2 className={`px-1 text-xs font-semibold tracking-wider uppercase ${labelTone}`}>
        {label} <span className="opacity-60">({tasks.length})</span>
      </h2>
      <ul className="flex flex-col gap-2">
        {tasks.map((task) => (
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
    </section>
  );
}
