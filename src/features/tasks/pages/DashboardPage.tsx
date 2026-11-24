import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Icon from "../../../shared/components/Icon";
import CompactTaskCard from "../components/CompactTaskCard";
import { useTaskWorkspace } from "../hooks/useTaskWorkspace";
import { selectDashboardTasks } from "../lib/dashboardTasks.ts";
import type { Task } from "../types";
import styles from "./DashboardPage.module.css";

const DashboardPage = () => {
  const { tasks, canEdit, openAdd, openEdit } = useTaskWorkspace();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const { upcoming, highPriority, pendingCount, completeCount } = selectDashboardTasks(tasks, now);

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <h1>ダッシュボード</h1>
        </div>
        <Button
          variant="contained"
          startIcon={<Icon name="plus" />}
          onClick={openAdd}
          disabled={!canEdit}
        >
          タスクを追加
        </Button>
      </header>
      <section className={styles.stats} aria-label="タスクのサマリー">
        <span>
          全タスク <strong>{tasks.length}</strong> 件
        </span>
        <span>
          未完了 <strong>{pendingCount}</strong> 件
        </span>
        <span>
          完了 <strong>{completeCount}</strong> 件
        </span>
      </section>
      <div className={styles.panels}>
        <TaskPanel
          title="期限が近いタスク"
          subtitle="7日以内・期限超過"
          icon="clock"
          tasks={upcoming}
          now={now}
          onEdit={openEdit}
          disabled={!canEdit}
          emptyText="期限が近いタスクはありません"
        />
        <TaskPanel
          title="優先度の高いタスク"
          icon="flag"
          tasks={highPriority}
          now={now}
          onEdit={openEdit}
          disabled={!canEdit}
          emptyText="優先度の高いタスクはありません"
        />
      </div>
    </div>
  );
};

type TaskPanelProps = {
  title: string;
  subtitle?: string;
  icon: "clock" | "flag";
  tasks: Task[];
  now: Date;
  onEdit: (id: string) => void;
  disabled: boolean;
  emptyText: string;
};
const TaskPanel = ({
  title,
  subtitle,
  icon,
  tasks,
  now,
  onEdit,
  disabled,
  emptyText,
}: TaskPanelProps) => (
  <section className={styles.panel} aria-label={title}>
    <header className={styles.panelHeader}>
      <div className={styles.panelTitle}>
        <span className={styles.panelIcon}>
          <Icon name={icon} />
        </span>
        <h2>{title}</h2>
        <span className={styles.count}>{tasks.length}</span>
      </div>
      {subtitle && <p>{subtitle}</p>}
    </header>
    <div className={styles.panelList} tabIndex={0} role="region" aria-label={`${title}の一覧`}>
      {tasks.length ? (
        tasks.map((task) => (
          <CompactTaskCard
            key={task.id}
            task={task}
            now={now}
            onEdit={onEdit}
            disabled={disabled}
          />
        ))
      ) : (
        <div className={styles.empty}>
          <p>{emptyText}</p>
        </div>
      )}
    </div>
  </section>
);

export default DashboardPage;
