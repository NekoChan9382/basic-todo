import type { Task } from "../types";

export type StoredTask = Omit<Task, "due_date"> & { due_date: string | null };

export const isRecord = (value: unknown): value is Record<string, unknown> =>
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

export const isStoredTask = (value: unknown): value is StoredTask => {
  if (!isRecord(value) || !hasTaskFields(value)) return false;
  if (value.due_date === null) return true;
  if (typeof value.due_date !== "string") return false;
  const date = new Date(value.due_date);
  return Number.isFinite(date.getTime()) && date.toISOString() === value.due_date;
};

export const isTask = (value: unknown): value is Task =>
  isRecord(value) &&
  hasTaskFields(value) &&
  (value.due_date === null ||
    (value.due_date instanceof Date && Number.isFinite(value.due_date.getTime())));

export const hasUniqueIds = (tasks: { id: string }[]): boolean =>
  new Set(tasks.map((task) => task.id)).size === tasks.length;

export const toStoredTask = ({
  id,
  title,
  detail,
  progress,
  priority,
  due_date,
}: Task): StoredTask => ({
  id,
  title,
  detail,
  progress,
  priority,
  due_date: due_date === null ? null : due_date.toISOString(),
});

export const fromStoredTask = ({
  id,
  title,
  detail,
  progress,
  priority,
  due_date,
}: StoredTask): Task => ({
  id,
  title,
  detail,
  progress,
  priority,
  due_date: due_date === null ? null : new Date(due_date),
});
