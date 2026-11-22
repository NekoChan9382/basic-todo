type Priority = "low" | "mid" | "high";
export type Task = {
  id: string;
  title: string;
  detail: string;
  // 0〜100。100 の場合にタスク完了と判定する。
  progress: number;
  priority: Priority;
  due_date: Date | null;
};

// タイトル以外は省略可能。作成時に既定値を補完する。
export type NewTaskInput = Pick<Task, "title"> & Partial<Omit<Task, "id" | "title">>;
