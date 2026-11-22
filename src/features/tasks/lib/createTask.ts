import type { NewTaskInput, Task } from "../types";

let sequence = 0;

/** 現在時刻と連番で ID を作り、読み込み済みタスクとの重複も避ける。 */
export const createTask = (input: NewTaskInput, existingTasks: readonly Task[]): Task => {
  const title = input.title.trim();
  if (!title) throw new Error("タイトルを入力してください。");
  const progress = input.progress ?? 0;
  if (!Number.isFinite(progress) || progress < 0 || progress > 100) {
    throw new RangeError("進捗は 0〜100 で指定してください。");
  }
  const priority = input.priority ?? "mid";
  if (!["low", "mid", "high"].includes(priority)) {
    throw new Error("優先度を選択してください。");
  }
  const dueDate = input.due_date ?? null;
  if (dueDate !== null && (!(dueDate instanceof Date) || !Number.isFinite(dueDate.getTime()))) {
    throw new RangeError("有効な期限を指定してください。");
  }
  const timestamp = Date.now();
  let id: string;
  do {
    id = `${timestamp}-${sequence++}`;
  } while (existingTasks.some((task) => task.id === id));
  return {
    id,
    title,
    detail: input.detail ?? "",
    progress,
    priority,
    due_date: dueDate === null ? null : new Date(dueDate),
  };
};
