import { useState } from "react";
import Button from "@mui/material/Button";
import AddTaskModal from "../components/AddTaskModal";
import TaskCard from "../components/TaskCard";
import { useTasks } from "../hooks/useTasks";
import type { Task } from "../types";
import styles from "./TasksPage.module.css";

const TasksPage = () => {
  const { tasks, addTask, storageError, canEdit, hasUnsavedChanges, retryLoad, retrySave } =
    useTasks();
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <main>
      <h1>タスク管理</h1>
      <Button
        variant="contained"
        disabled={!canEdit}
        onClick={() => setIsAddOpen(true)}
        sx={{ mb: 2 }}
      >
        タスクを追加
      </Button>
      {isAddOpen && <AddTaskModal onAdd={addTask} onClose={() => setIsAddOpen(false)} />}
      {storageError && (
        <div role="alert">
          <p>{storageError}</p>
          <button type="button" onClick={canEdit ? retrySave : retryLoad}>
            {canEdit ? "保存を再試行" : "読み込みを再試行"}
          </button>
        </div>
      )}
      {hasUnsavedChanges && <p role="status">未保存の変更があります。</p>}
      {canEdit && tasks.length === 0 && <p>タスクはありません。</p>}
      <TaskList tasks={tasks} />
    </main>
  );
};

const TaskList = ({ tasks }: { tasks: Task[] }) => (
  <section className={styles.taskList} aria-label="タスク一覧">
    {tasks.map((task) => (
      <TaskCard key={task.id} task={task} />
    ))}
  </section>
);

export default TasksPage;
