import type { Task } from "../types";
import {
  fromStoredTask,
  hasUniqueIds,
  isStoredTask,
  isTask,
  toStoredTask,
} from "./taskSerialization.ts";

/** 1 行につき 1 タスク。説明中の改行は JSON のエスケープとして保存する。 */
export const exportTasksNdjson = (tasks: Task[]): string => {
  if (!tasks.every(isTask) || !hasUniqueIds(tasks)) {
    throw new Error("タスクのデータが不正なため、エクスポートできません。");
  }
  return tasks.length === 0
    ? ""
    : tasks.map((task) => JSON.stringify(toStoredTask(task))).join("\n") + "\n";
};

/** 不正な行があれば全体を拒否し、呼び出し元の状態は変更しない。 */
export const parseTasksNdjson = (text: string): Task[] => {
  const tasks: Task[] = [];
  const ids = new Set<string>();
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index].trim();
    if (!line) continue;
    let value: unknown;
    try {
      value = JSON.parse(line);
    } catch {
      throw new Error(`${index + 1} 行目: 有効な JSON ではありません。`);
    }
    if (!isStoredTask(value) || !value.title.trim()) {
      throw new Error(`${index + 1} 行目: タスクの項目・進捗・日付を確認してください。`);
    }
    if (ids.has(value.id)) {
      throw new Error(`${index + 1} 行目: ファイル内で ID「${value.id}」が重複しています。`);
    }
    ids.add(value.id);
    tasks.push(fromStoredTask(value));
  }
  return tasks;
};

/** 既存タスクを維持し、新しい ID のタスクだけ末尾に追加する。 */
export const mergeImportedTasks = (current: Task[], incoming: Task[]): Task[] => {
  const ids = new Set(current.map((task) => task.id));
  const additions = incoming.filter((task) => !ids.has(task.id));
  return additions.length === 0 ? current : [...current, ...additions];
};
