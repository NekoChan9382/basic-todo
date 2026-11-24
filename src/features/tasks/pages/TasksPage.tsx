import { useState } from "react";
import Button from "@mui/material/Button";
import AddTaskModal from "../components/AddTaskModal";
import EditTaskModal from "../components/EditTaskModal";
import TaskTransfer from "../components/TaskTransfer";
import TaskCard from "../components/TaskCard";
import { useTasks } from "../hooks/useTasks";
import type { Task } from "../types";
import styles from "./TasksPage.module.css";

const TasksPage = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    importTasks,
    storageError,
    canEdit,
    hasUnsavedChanges,
    retryLoad,
    retrySave,
  } = useTasks();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const editingTask = tasks.find((task) => task.id === editingTaskId);

  return (
    <main>
      <h1>タスク管理</h1>
      <div className={styles.buttonBar}>
        <Button
          variant="contained"
          disabled={!canEdit}
          onClick={() => setIsAddOpen(true)}
          className={styles.addButton}
        >
          タスクを追加
        </Button>
        {isAddOpen && <AddTaskModal onAdd={addTask} onClose={() => setIsAddOpen(false)} />}
        {editingTask && (
          <EditTaskModal
            key={editingTask.id}
            task={editingTask}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onClose={() => setEditingTaskId(null)}
          />
        )}
        {storageError && (
          <div role="alert">
            <p>{storageError}</p>
            <button type="button" onClick={canEdit ? retrySave : retryLoad}>
              {canEdit ? "保存を再試行" : "読み込みを再試行"}
            </button>
          </div>
        )}
        {hasUnsavedChanges && <p role="status">未保存の変更があります。</p>}
      </div>
      <TaskTransfer tasks={tasks} disabled={!canEdit} onImport={importTasks} />
      {canEdit && tasks.length === 0 && <p>タスクはありません。</p>}
      <TaskList
        tasks={tasks}
        disabled={!canEdit}
        onProgressChange={(id, progress) => updateTask(id, { progress })}
        onEdit={setEditingTaskId}
      />
    </main>
  );
};

type TaskListProps = {
  tasks: Task[];
  disabled: boolean;
  onProgressChange: (id: string, progress: number) => void;
  onEdit: (id: string) => void;
};

const TaskList = ({ tasks, disabled, onProgressChange, onEdit }: TaskListProps) => (
  <section className={styles.taskList} aria-label="タスク一覧">
    {tasks.map((task) => (
      <TaskCard
        key={task.id}
        task={task}
        disabled={disabled}
        onProgressChange={onProgressChange}
        onEdit={onEdit}
      />
    ))}
  </section>
);

export default TasksPage;
