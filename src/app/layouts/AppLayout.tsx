import { Suspense, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import Button from "@mui/material/Button";
import Icon from "../../shared/components/Icon";
import { useTasks } from "../../features/tasks/hooks/useTasks";
import type { TaskWorkspace } from "../../features/tasks/hooks/useTaskWorkspace";
import AddTaskModal from "../../features/tasks/components/AddTaskModal";
import EditTaskModal from "../../features/tasks/components/EditTaskModal";
import styles from "./AppLayout.module.css";

const AppLayout = () => {
  const workspace = useTasks();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingTask = workspace.tasks.find((task) => task.id === editingId);
  const context: TaskWorkspace = {
    ...workspace,
    openAdd: () => setIsAddOpen(true),
    openEdit: setEditingId,
  };
  const incompleteCount = workspace.tasks.filter((task) => task.progress < 100).length;

  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>
        コンテンツへ移動
      </a>
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.brand} aria-label="Tasks ホーム">
          <span className={styles.brandName}>Tasks</span>
        </Link>
        <nav className={styles.nav} aria-label="メインナビゲーション">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
            aria-label="ダッシュボード"
          >
            <Icon name="dashboard" />
            <span>ダッシュボード</span>
          </NavLink>
          <NavLink
            to="/tasks"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
            aria-label="タスク一覧"
          >
            <Icon name="tasks" />
            <span>タスク一覧</span>
            <span className={styles.navCount}>{workspace.tasks.length}</span>
          </NavLink>
        </nav>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <span>タスク管理</span>
          <div className={styles.storageStatus}>
            {workspace.storageError ? (
              <span className={styles.storageError} role="alert" title={workspace.storageError}>
                {workspace.storageError}
              </span>
            ) : (
              <span className={styles.storageMessage} role="status">
                {workspace.hasUnsavedChanges ? "保存中…" : ""}
              </span>
            )}
            <span className={styles.retrySlot}>
              {workspace.storageError && (
                <Button
                  size="small"
                  color="inherit"
                  onClick={workspace.canEdit ? workspace.retrySave : workspace.retryLoad}
                >
                  再試行
                </Button>
              )}
            </span>
          </div>
          <span className={styles.remaining}>
            未完了 <strong>{incompleteCount}</strong> 件
          </span>
        </header>
        <main id="main-content" tabIndex={-1} className={styles.main}>
          <div className={styles.viewport}>
            <Suspense fallback={<p role="status">読み込み中…</p>}>
              <Outlet context={context} />
            </Suspense>
          </div>
        </main>
      </div>
      {isAddOpen && <AddTaskModal onAdd={workspace.addTask} onClose={() => setIsAddOpen(false)} />}
      {editingTask && (
        <EditTaskModal
          key={editingTask.id}
          task={editingTask}
          onUpdate={workspace.updateTask}
          onDelete={workspace.deleteTask}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  );
};

export default AppLayout;
