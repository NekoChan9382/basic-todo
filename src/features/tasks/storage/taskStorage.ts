import type { Task } from "../types";

import {
  isRecord,
  isStoredTask,
  isTask,
  hasUniqueIds,
  toStoredTask,
  fromStoredTask,
} from "../lib/taskSerialization.ts";
import type { StoredTask } from "../lib/taskSerialization.ts";
const STORAGE_KEY = "todo-app:tasks";

type StoredTasks = { version: 1; tasks: StoredTask[] };
export type LoadTasksResult = { ok: true; tasks: Task[] } | { ok: false; error: string };
export type SaveTasksResult = { ok: true } | { ok: false; error: string };

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
    tasks: data.tasks.map(fromStoredTask),
  };
};

export const saveTasks = (tasks: Task[]): SaveTasksResult => {
  if (!Array.isArray(tasks) || !tasks.every(isTask) || !hasUniqueIds(tasks)) {
    return { ok: false, error: "保存するタスクが不正です。" };
  }
  const data: StoredTasks = {
    version: 1,
    tasks: tasks.map(toStoredTask),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { ok: true };
  } catch {
    return { ok: false, error: "タスクを保存できませんでした。" };
  }
};
