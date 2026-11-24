import { useOutletContext } from "react-router-dom";
import type { useTasks } from "./useTasks";

export type TaskWorkspace = ReturnType<typeof useTasks> & {
  openAdd: () => void;
  openEdit: (id: string) => void;
};

// 状態の所有者は AppLayout。各画面から useTasks を再初期化しない。
export const useTaskWorkspace = () => useOutletContext<TaskWorkspace>();
