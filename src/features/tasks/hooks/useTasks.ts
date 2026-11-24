import { useEffect, useState } from "react";
import { loadTasks, saveTasks } from "../storage/taskStorage.ts";
import type { NewTaskInput, Task } from "../types";
import { mergeImportedTasks, parseTasksNdjson } from "../lib/taskNdjson.ts";
import { createTask } from "../lib/createTask.ts";

type NewTask = Omit<Task, "id">;
type TaskChanges = Partial<NewTask>;

const validateTask = (task: NewTask) => {
  if (!task.title.trim()) throw new Error("タイトルを入力してください。");
  if (!Number.isFinite(task.progress) || task.progress < 0 || task.progress > 100) {
    throw new RangeError("進捗は 0〜100 で指定してください。");
  }
  if (
    task.due_date !== null &&
    (!(task.due_date instanceof Date) || !Number.isFinite(task.due_date.getTime()))
  ) {
    throw new RangeError("有効な期限を指定してください。");
  }
};

export const useTasks = () => {
  const [initial] = useState(loadTasks);
  const [tasks, setTasks] = useState<Task[]>(() => (initial.ok ? initial.tasks : []));
  const [savedTasks, setSavedTasks] = useState(tasks);
  const [loadError, setLoadError] = useState<string | null>(() =>
    initial.ok ? null : initial.error,
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveAttempt, setSaveAttempt] = useState(0);

  useEffect(() => {
    if (loadError !== null || tasks === savedTasks) return;
    const result = saveTasks(tasks);
    if (result.ok) {
      // localStorage への同期結果を UI に反映する。保存済み配列との比較で再保存を防ぐ。
      // oxlint-disable-next-line react/set-state-in-effect
      setSavedTasks(tasks);
      setSaveError(null);
    } else {
      setSaveError(result.error);
    }
  }, [tasks, savedTasks, loadError, saveAttempt]);

  const addTask = (input: NewTaskInput) => {
    if (loadError !== null) throw new Error("保存データを読み込んでから追加してください。");
    const task = createTask(input, tasks);
    setTasks((current) => [...current, task]);
  };

  const updateTask = (id: string, changes: TaskChanges) => {
    if (loadError !== null) return;
    const existing = tasks.find((task) => task.id === id);
    if (!existing) return;
    validateTask({ ...existing, ...changes });
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== id) return task;
        const dueDate = changes.due_date === undefined ? task.due_date : changes.due_date;
        return { ...task, ...changes, id, due_date: dueDate === null ? null : new Date(dueDate) };
      }),
    );
  };

  const deleteTask = (id: string) => {
    if (loadError !== null) return;
    setTasks((current) =>
      current.some((task) => task.id === id) ? current.filter((task) => task.id !== id) : current,
    );
  };

  const importTasks = (text: string) => {
    if (loadError !== null) throw new Error("保存データを読み込んでからインポートしてください。");
    const incoming = parseTasksNdjson(text);
    setTasks((current) => mergeImportedTasks(current, incoming));
  };

  const retryLoad = () => {
    if (loadError === null) return;
    const result = loadTasks();
    if (!result.ok) {
      setLoadError(result.error);
      return;
    }
    setTasks(result.tasks);
    setSavedTasks(result.tasks);
    setLoadError(null);
    setSaveError(null);
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    importTasks,
    canEdit: loadError === null,
    storageError: loadError ?? saveError,
    hasUnsavedChanges: tasks !== savedTasks,
    retryLoad,
    retrySave: () => setSaveAttempt((attempt) => attempt + 1),
  };
};
