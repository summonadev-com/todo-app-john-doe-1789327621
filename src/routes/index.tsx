import { useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { SummaryLine } from '@/components/SummaryLine';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { useTasks } from '@/hooks/useTasks';
import { useToday } from '@/hooks/useToday';
import { groupTasks } from '@/lib/tasks';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const { tasks, addTask, updateTask, toggleComplete, deleteTask, persistenceFailed } = useTasks();
  const today = useToday();

  const counts = useMemo(() => {
    const groups = groupTasks(tasks, today);
    return { overdue: groups.overdue.length, dueToday: groups.today.length };
  }, [tasks, today]);

  return (
    <main className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Your tasks
        </h1>
        <SummaryLine overdue={counts.overdue} dueToday={counts.dueToday} />
        {counts.overdue === 0 && counts.dueToday === 0 && (
          <p className="px-1 text-sm text-slate-500">Nothing overdue or due today.</p>
        )}
      </header>

      {persistenceFailed && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Storage isn’t available in this browser — your changes won’t be saved after you close the
          tab.
        </div>
      )}

      <TaskForm onAdd={addTask} />

      <TaskList
        tasks={tasks}
        today={today}
        onToggle={toggleComplete}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />

      <footer className="mt-4 border-t border-slate-200 pt-4 text-xs text-slate-400">
        Tasks are saved in this browser only.
      </footer>
    </main>
  );
}
