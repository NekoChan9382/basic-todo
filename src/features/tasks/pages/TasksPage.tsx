import Button from "@mui/material/Button";
import Icon from "../../../shared/components/Icon";
import TaskTransfer from "../components/TaskTransfer";
import TaskCard from "../components/TaskCard";
import { useTaskWorkspace } from "../hooks/useTaskWorkspace";
import styles from "./TasksPage.module.css";

const TasksPage = () => {
  const { tasks, updateTask, importTasks, canEdit, openAdd, openEdit } = useTaskWorkspace();

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div className={styles.titleRow}>
          <h1>タスク一覧</h1>
          <span className={styles.count}>{tasks.length} 件</span>
        </div>
        <div className={styles.headerActions}>
          <TaskTransfer tasks={tasks} disabled={!canEdit} onImport={importTasks} />
          <Button
            className={styles.addButton}
            aria-label="タスクを追加"
            variant="contained"
            startIcon={<Icon name="plus" />}
            disabled={!canEdit}
            onClick={openAdd}
          >
            <span className={styles.fullButtonLabel}>タスクを追加</span>
            <span className={styles.compactButtonLabel}>追加</span>
          </Button>
        </div>
      </header>
      <div className={styles.listContent} role="region" aria-label="すべてのタスク">
        <section className={styles.taskList} aria-label="タスク一覧">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              disabled={!canEdit}
              onProgressChange={(id, progress) => updateTask(id, { progress })}
              onEdit={openEdit}
            />
          ))}
          {canEdit && tasks.length === 0 && (
            <div className={styles.empty}>
              <p>タスクはありません。</p>
              <Button onClick={openAdd} startIcon={<Icon name="plus" />}>
                タスクを追加
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TasksPage;
