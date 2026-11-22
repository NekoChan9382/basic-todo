import type { Task } from "../types";

const STORAGE_KEY = "todo-app:tasks";
type StoredTask = Omit<Task, "due_date"> & { due_date: string | null };
type StoredTasks = { version: 1; tasks: StoredTask[] };
export type LoadTasksResult = { ok: true; tasks: Task[] } | { ok: false; error: string };
export type SaveTasksResult = { ok: true } | { ok: false; error: string };

// Helpers

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasTaskFields = (value: Record<string, unknown>): boolean =>
  typeof value.id === "string" &&
  value.id.trim().length > 0 &&
  typeof value.title === "string" &&
  typeof value.detail === "string" &&
  typeof value.progress === "number" &&
  Number.isFinite(value.progress) &&
  value.progress >= 0 &&
  value.progress <= 100 &&
  (value.priority === "low" || value.priority === "mid" || value.priority === "high");

const isStoredTask = (value: unknown): value is StoredTask => {
  if (!isRecord(value) || !hasTaskFields(value)) return false;
  if (value.due_date === null) return true;
  if (typeof value.due_date !== "string") return false;
  const date = new Date(value.due_date);
  return Number.isFinite(date.getTime()) && date.toISOString() === value.due_date;
};

const isTask = (value: unknown): value is Task =>
  isRecord(value) &&
  hasTaskFields(value) &&
  (value.due_date === null ||
    (value.due_date instanceof Date && Number.isFinite(value.due_date.getTime())));

const hasUniqueIds = (tasks: { id: string }[]): boolean =>
  new Set(tasks.map((task) => task.id)).size === tasks.length;

export const loadTasks = (): LoadTasksResult => {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { ok: false, error: "タスクの保存データを読み取れませんでした。" };
  }
  if (raw === null) return { ok: true, tasks: [] };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { ok: false, error: "タスクの保存データが有効な JSON ではありません。" };
  }
  if (!isRecord(data) || data.version !== 1) {
    return { ok: false, error: "タスクの保存形式に対応していません。" };
  }
  if (!Array.isArray(data.tasks) || !data.tasks.every(isStoredTask) || !hasUniqueIds(data.tasks)) {
    return { ok: false, error: "タスクの保存データが不正です。" };
  }
  return {
    ok: true,
    tasks: data.tasks.map(({ id, title, detail, progress, priority, due_date }) => ({
      id,
      title,
      detail,
      progress,
      priority,
      due_date: due_date === null ? null : new Date(due_date),
    })),
  };
};

export const saveTasks = (tasks: Task[]): SaveTasksResult => {
  if (!Array.isArray(tasks) || !tasks.every(isTask) || !hasUniqueIds(tasks)) {
    return { ok: false, error: "保存するタスクが不正です。" };
  }
  const data: StoredTasks = {
    version: 1,
    tasks: tasks.map(({ id, title, detail, progress, priority, due_date }) => ({
      id,
      title,
      detail,
      progress,
      priority,
      due_date: due_date === null ? null : due_date.toISOString(),
    })),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { ok: true };
  } catch {
    return { ok: false, error: "タスクを保存できませんでした。" };
  }
};
