---
status: pending
title: Personal Todo App with Due Dates and Reminders
---

## Overview

A single-user, browser-local todo app focused on due dates. One person adds tasks, optionally gives each a due date, and sees them grouped as Overdue / Today / Upcoming / No date / Completed. Reminders are surfaced visually in-app (overdue and due-soon emphasis), with optional browser notifications added last as a clearly separated phase. All data lives in `localStorage`; there is no backend, no accounts, and no sharing.

The project currently contains only `README.md`, so the plan starts from scaffolding.

## Data model

A single `Task` entity, stored as an array under one `localStorage` key (e.g. `todo.tasks.v1`):

1. `id` — string, generated via `crypto.randomUUID()`.
2. `title` — string, required, trimmed, non-empty.
3. `notes` — optional string, short free text.
4. `dueAt` — optional ISO date string (date-only precision, e.g. `2025-03-14`) or `null` for tasks with no date.
5. `completed` — boolean.
6. `completedAt` — optional ISO timestamp, set when completed flips true, cleared when un-completed.
7. `createdAt` — ISO timestamp, used as the tiebreaker sort key.

A persisted envelope wraps the array with a `version` number so future shape changes can be migrated rather than silently dropped. Unknown or malformed stored data falls back to an empty list instead of crashing.

Derived (never stored) values: due bucket (`overdue` | `today` | `upcoming` | `none`), and `isDueSoon` (due within the next 48 hours and not yet overdue).

## Screens / routes

1. `/` — the only real screen: task input, grouped task list, and a filter toggle for showing/hiding completed tasks.
2. `/about` — optional tiny page explaining that data is stored in this browser only. Low priority; include only if Phase 5 time allows.

Editing happens inline on the list (no separate route or modal route), keeping URL state trivial.

## Component breakdown

1. `src/components/TaskForm.tsx` — title input plus optional date picker; used for creating a new task.
2. `src/components/TaskItem.tsx` — one row: checkbox, title, due-date badge, edit and delete actions; switches to inline edit mode on demand.
3. `src/components/TaskGroup.tsx` — a labelled section (e.g. "Overdue") with a count and its child rows.
4. `src/components/TaskList.tsx` — takes all tasks, renders the ordered groups, handles the empty state.
5. `src/components/DueDateBadge.tsx` — human-friendly relative label ("Today", "Tomorrow", "3 days overdue") with colour emphasis.
6. `src/components/EmptyState.tsx` — reusable illustration/message block.
7. `src/components/ConfirmDeleteButton.tsx` — two-step delete (click, then confirm) to avoid accidental loss.
8. `src/hooks/useTasks.ts` — the single source of truth: load, add, update, toggle, delete, plus persistence.
9. `src/hooks/useLocalStorage.ts` — generic typed read/write/subscribe helper with JSON guarding.
10. `src/lib/dates.ts` — bucket resolution, due-soon check, relative label formatting, today's date normalisation.
11. `src/lib/tasks.ts` — sorting, grouping, and validation pure functions.
12. `src/types/task.ts` — the `Task` type and the due-bucket union.

## Phased build order

### Phase 1 — Project scaffolding

1. Initialise a Vite React + TypeScript project at the repo root, keeping the existing `README.md`.
2. Install and configure `@tailwindcss/vite`, `@tanstack/react-router`, and `@tanstack/router-plugin` in `vite.config.ts`.
3. Create `src/styles/global.css` containing exactly `@import "tailwindcss";` and import it once in `src/main.tsx`.
4. Configure the `@/` path alias to `src/` in both `tsconfig.json` and `vite.config.ts`.
5. Create `src/routes/__root.tsx` (app shell: centered max-width container, heading, footer note) and `src/routes/index.tsx` (placeholder).
6. Wire the router in `src/main.tsx` using the generated `src/routeTree.gen.ts`; never edit that generated file.
7. Expected outcome: `npm run dev` serves a styled placeholder page at `/` with no console errors.

### Phase 2 — Data layer

1. Define the `Task` type and `DueBucket` union in `src/types/task.ts`.
2. Implement `src/hooks/useLocalStorage.ts` with safe JSON parse, versioned envelope handling, and write-on-change.
3. Implement `src/hooks/useTasks.ts` exposing `tasks`, `addTask`, `updateTask`, `toggleComplete`, `deleteTask`.
4. Implement pure helpers in `src/lib/dates.ts` and `src/lib/tasks.ts`.
5. Expected outcome: tasks added in one session reappear after a full page reload; corrupt stored JSON yields an empty list rather than a blank screen.

### Phase 3 — Core task UI

1. Build `TaskForm` with an enter-to-submit title field and an optional native date input; reject empty/whitespace titles.
2. Build `TaskItem` with checkbox toggle, inline title/date editing (Enter saves, Escape cancels), and `ConfirmDeleteButton`.
3. Build `TaskGroup`, `TaskList`, and `EmptyState`; render them from `src/routes/index.tsx`.
4. Sort within each group by due date ascending, then `createdAt` ascending; render groups in the order Overdue, Today, Upcoming, No date, Completed.
5. Add a "show completed" toggle that collapses the Completed group by default once it has entries.
6. Expected outcome: full create / edit / complete / delete loop works and survives reload.

### Phase 4 — Due-date emphasis and in-app reminders

1. Build `DueDateBadge` with relative labels and Tailwind colour emphasis: red for overdue, amber for today/due-soon, neutral otherwise.
2. Add a compact summary line at the top of `/` (e.g. "2 overdue · 3 due today") that is hidden when both counts are zero.
3. Recompute buckets when the calendar day rolls over — a lightweight interval or visibility-change listener so a tab left open overnight re-buckets correctly.
4. Expected outcome: opening the app immediately makes overdue and today's work visually obvious without any extra clicks.

### Phase 5 — Optional browser notifications (strictly last, skippable)

1. Add a single opt-in control in the app shell that requests `Notification` permission only on explicit user click.
2. When permission is granted, fire at most one notification per task per day for tasks that are overdue or due today; record the last-notified date in the persisted envelope to prevent repeats.
3. Handle `denied` and unsupported-browser cases by hiding or disabling the control with an explanatory tooltip — never block the core UI and never re-prompt automatically.
4. Expected outcome: notifications are a bonus layer; the app is fully usable with them off, denied, or unsupported.

## Empty and edge-case states

1. No tasks at all — friendly empty state prompting the first task.
2. All tasks completed — celebratory empty state above the collapsed Completed group.
3. A group with zero members is not rendered at all (no empty "Overdue" heading).
4. Whitespace-only or empty title on create/edit is rejected with inline feedback, not a silent no-op.
5. Very long titles wrap and truncate gracefully rather than overflowing the row.
6. `localStorage` unavailable or quota exceeded — the app still runs in memory for the session and shows a non-blocking "changes won't be saved" banner.
7. Clearing a due date on an existing task moves it to the No date group.
8. Completing an overdue task removes it from Overdue immediately.
9. Keyboard accessibility: form and every row action reachable by Tab, with visible focus rings.

## Out of scope

1. Accounts, authentication, sync, and any backend or database.
2. Tags, projects, priorities, subtasks, and drag-and-drop reordering.
3. Stats, streaks, and charts.
4. Recurring tasks and time-of-day (as opposed to date) reminders.
5. Sharing, collaboration, and export/import.
6. Dark mode (can be revisited after the core loop ships).
