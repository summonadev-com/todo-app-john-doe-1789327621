import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-slate-500">Your tasks will appear here.</p>
    </div>
  );
}
