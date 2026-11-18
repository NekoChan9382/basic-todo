# Repository Guidelines

## Project Structure & Module Organization

This is a frontend-only React and TypeScript task management application built with Vite. Use feature-based organization:

```text
src/
  app/App.tsx                 # Application composition
  features/tasks/
    components/TaskCard.tsx   # Task UI
    pages/TasksPage.tsx       # Task screen
    hooks/useTasks.ts         # State and operations (placeholder)
    storage/taskStorage.ts   # Persistence (placeholder)
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

Use `features/tasks/types.ts` as the initial model: `id`, `title`, `complete`, `priority` (`low`, `mid`, `high`), and `due_date` (`Date`). Run entirely in the browser without a backend. Persist tasks in localStorage through `storage/taskStorage.ts`; components must not access storage directly. Serialize dates as ISO strings and restore `Date` values when loading. Validate stored data and handle malformed JSON and storage failures. Hooks and persistence currently contain TODO placeholders.

## Build, Test, and Development Commands

Use pnpm to match the committed `pnpm-lock.yaml`:

- `pnpm install`: install dependencies.
- `pnpm dev`: start Vite with hot module replacement.
- `pnpm build`: run TypeScript project checks and generate the production bundle in `dist/`.
- `pnpm lint`: run Oxlint using `.oxlintrc.json`.
- `pnpm preview`: serve the production bundle locally after building.

## Coding Style & Naming Conventions

Use two-space indentation, functional React components, and TypeScript types for component inputs and shared data. Name component files in PascalCase, such as `TaskCard.tsx`, and ordinary variables and functions in camelCase. Preserve existing model fields such as `due_date` unless deliberately migrating their consumers. Use `import type` for type-only imports. Quote and semicolon styles currently vary; match the surrounding file. Oxlint is configured; no dedicated formatter is configured. Respect TypeScript checks for unused locals and parameters.

## Testing Guidelines

No automated test framework, test script, or coverage threshold is currently configured. Run `pnpm lint` and `pnpm build` before submitting changes, and manually verify affected behavior with `pnpm dev`. If adding automated tests, document the runner, command, and naming convention alongside the setup.

## Commit & Pull Request Guidelines

Git history is unavailable in this checkout, so no existing commit convention can be verified. Use concise, imperative subjects, such as `Add task completion toggle`. Keep changes focused. Pull requests should explain the change, link relevant issues, list validation results and known failures, and include screenshots for visible interface changes. Commit lockfile updates when changing dependencies; exclude `node_modules/` and generated `dist/` output.
