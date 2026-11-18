type Priority = "low" | "mid" | "high";
export type Task = {
  id: string;
  title: string;
  detail: string;
  complete: boolean;
  progress: number;
  priority: Priority;
  due_date: Date;
};
