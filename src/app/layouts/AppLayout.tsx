import { Suspense, useId, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import Icon from "../../shared/components/Icon";
import { useTasks } from "../../features/tasks/hooks/useTasks";
import type { TaskWorkspace } from "../../features/tasks/hooks/useTaskWorkspace";
import AddTaskModal from "../../features/tasks/components/AddTaskModal";
import EditTaskModal from "../../features/tasks/components/EditTaskModal";
import styles from "./AppLayout.module.css";

const AppLayout = () => {
  const workspace = useTasks();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 900px)");
  const isShortViewport = useMediaQuery("(max-height: 560px)");
  const location = useLocation();
  const scrollOwner =
    location.pathname === "/" && !isMobile && !isShortViewport ? "panels" : "page";
  const menuId = useId();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingTask = workspace.tasks.find((task) => task.id === editingId);
  const context: TaskWorkspace = {
    ...workspace,
    openAdd: () => setIsAddOpen(true),
    openEdit: setEditingId,
  };
  const incompleteCount = workspace.tasks.filter((task) => task.progress < 100).length;

  const navigation = (
    <nav className={styles.nav} aria-label="メインナビゲーション">
      <NavLink
        onClick={() => setIsMenuOpen(false)}
        to="/"
        end
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
        aria-label="ダッシュボード"
      >
        <Icon name="dashboard" />
        <span>ダッシュボード</span>
      </NavLink>
      <NavLink
        onClick={() => setIsMenuOpen(false)}
        to="/tasks"
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
        aria-label="タスク一覧"
      >
        <Icon name="tasks" />
        <span>タスク一覧</span>
        <span className={styles.navCount}>{workspace.tasks.length}</span>
      </NavLink>
    </nav>
  );

  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>
        コンテンツへ移動
      </a>
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.brand} aria-label="Tasks ホーム">
          <span className={styles.brandName}>Tasks</span>
        </Link>
        {navigation}
      </aside>
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.headerTitle}>
            <IconButton
              className={styles.menuButton}
              aria-label="メニューを開く"
              aria-expanded={isMobile && isMenuOpen}
              aria-controls={isMobile && isMenuOpen ? menuId : undefined}
              onClick={() => setIsMenuOpen(true)}
            >
              <Icon name="menu" />
            </IconButton>
            <span>タスク管理</span>
          </div>
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
          <div className={styles.viewport} data-scroll-owner={scrollOwner}>
            <Suspense fallback={<p role="status">読み込み中…</p>}>
              <Outlet context={context} />
            </Suspense>
          </div>
        </main>
      </div>
      <Drawer
        open={isMobile && isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        slotProps={{ paper: { className: styles.drawerPaper, id: menuId } }}
      >
        <div className={styles.drawerHeader}>
          <span>メニュー</span>
          <IconButton aria-label="メニューを閉じる" onClick={() => setIsMenuOpen(false)}>
            <Icon name="close" />
          </IconButton>
        </div>
        {navigation}
      </Drawer>
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
