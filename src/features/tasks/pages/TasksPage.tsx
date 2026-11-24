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
        <Button
          variant="contained"
          startIcon={<Icon name="plus" />}
          disabled={!canEdit}
          onClick={openAdd}
        >
          タスクを追加
        </Button>
      </header>
      <div
        className={styles.listScroll}
        role="region"
        tabIndex={0}
        aria-label="すべてのタスクとファイル入出力"
      >
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
        <section className={styles.transfer} aria-label="タスクのデータ管理">
          <div className={styles.transferHeading}>
            <h2>インポート・エクスポート</h2>
          </div>
          <TaskTransfer tasks={tasks} disabled={!canEdit} onImport={importTasks} />
        </section>
      </div>
    </div>
  );
};

export default TasksPage;
