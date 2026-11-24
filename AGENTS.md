# Repository Guidelines

## Project Structure & Module Organization

This is a frontend-only React and TypeScript task management application built with Vite. Use feature-based organization:

```text
src/
  app/App.tsx                 # Application composition
  features/tasks/
    components/              # Cards, task forms, and NDJSON transfer
    pages/TasksPage.tsx       # Task screen
    hooks/useTasks.ts         # State and persistence
    storage/taskStorage.ts   # localStorage API
    lib/createTask.ts        # Defaults, validation, timestamp IDs
    types.ts                 # Task model
  shared/
    components/              # Cross-feature UI
    hooks/                   # Cross-feature hooks
    lib/                     # Cross-feature utilities
  assets/                    # Imported assets
  main.tsx                   # React entry point
  index.css                  # Global styles
public/                      # Static assets
```

Keep task-specific code in `features/tasks/`; use `shared/` for code needed across features. Keep `app/` focused on composition. Empty shared directories use `.gitkeep`.

## Data & Persistence

Use `features/tasks/types.ts` as the initial model: `id`, `title`, `detail`, `progress` (0–100), `priority` (`low`, `mid`, `high`), and `due_date` (`Date | null`). Only the title is required when creating tasks; default detail to an empty string, progress to 0, priority to `mid`, and due date to null. Generate IDs from `Date.now()` plus a sequence suffix and check existing IDs for collisions. Use MUI Modal for the add form. Derive completion from `progress === 100`; do not store a separate `complete` property. Validate the progress range when accepting input and loading stored data. Run entirely in the browser without a backend. Persist tasks in localStorage through `storage/taskStorage.ts`; components must not access storage directly. Serialize dates as ISO strings and restore `Date` values when loading; preserve null for an unset deadline. Validate stored data and handle malformed JSON and storage failures. `useTasks()` loads tasks on initialization and automatically saves changes. Call it once in `TasksPage` and pass data/actions to children. It exposes add/update/delete actions, storage errors, unsaved status, and load/save retries. Load failures block editing and saving; save failures preserve in-memory changes. Invalid progress or dates passed to mutation actions throw `RangeError`. The storage API exports `loadTasks()` and `saveTasks(tasks)`, returning discriminated `ok` results. It uses key `todo-app:tasks` and the versioned `{ version: 1, tasks }` format. Reads never modify stored data; callers must avoid automatic overwrites after load failures.

## Task Import & Export

Use UTF-8 NDJSON (`.ndjson` or `.jsonl`): one complete task object per line, without an array or version wrapper. Export all Task fields, serialize dates as ISO strings, preserve null deadlines, and omit derived completion. `lib/taskSerialization.ts` shares validation and date conversion with localStorage; `lib/taskNdjson.ts` handles NDJSON. Accept blank lines, CRLF, and an initial BOM. Validate the entire file before updating state; report invalid lines and reject duplicate IDs within a file. Import through `useTasks.importTasks()`, preserving existing tasks and skipping existing IDs. Successful imports follow normal automatic persistence; save errors remain visible with retry support.

## Build, Test, and Development Commands

Use pnpm to match the committed `pnpm-lock.yaml`:

- `pnpm install`: install dependencies.
- `pnpm dev`: start Vite with hot module replacement.
- `pnpm build`: run TypeScript project checks and generate the production bundle in `dist/`.
- `pnpm lint`: run Oxlint using `.oxlintrc.json`.
- `pnpm preview`: serve the production bundle locally after building.

## Coding Style & Naming Conventions

Use colocated CSS Modules (`*.module.css`) for static custom styles, including styles applied to MUI components via `className`. Express responsive layouts with CSS media queries. Reserve `sx` for styles that need runtime values; keep static layout and spacing in CSS Modules.

Use two-space indentation, functional React components, and TypeScript types for component inputs and shared data. Name component files in PascalCase, such as `TaskCard.tsx`, and ordinary variables and functions in camelCase. Preserve existing model fields such as `due_date` unless deliberately migrating their consumers. Use `import type` for type-only imports. Quote and semicolon styles currently vary; match the surrounding file. Oxlint is configured; no dedicated formatter is configured. Respect TypeScript checks for unused locals and parameters.

## Testing Guidelines

Storage, task creation, and NDJSON tests live in `tests/*.test.ts` and use Node’s built-in test runner. Run `node --test tests/*.test.ts` with Node.js 24 or later. Name tests `*.test.ts`. No package test script or coverage threshold is configured. Run `pnpm lint` and `pnpm build` before submitting changes, and manually verify affected behavior with `pnpm dev`. If adding automated tests, document the runner, command, and naming convention alongside the setup.

## Commit & Pull Request Guidelines

Git history is unavailable in this checkout, so no existing commit convention can be verified. Use concise, imperative subjects, such as `Add task completion toggle`. Keep changes focused. Pull requests should explain the change, link relevant issues, list validation results and known failures, and include screenshots for visible interface changes. Commit lockfile updates when changing dependencies; exclude `node_modules/` and generated `dist/` output.
