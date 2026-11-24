import { useEffect, useId, useState } from "react";
import Button from "@mui/material/Button";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useSearchParams } from "react-router-dom";
import Icon from "../../../shared/components/Icon";
import CompactTaskCard from "../components/CompactTaskCard";
import { useTaskWorkspace } from "../hooks/useTaskWorkspace";
import { selectDashboardTasks } from "../lib/dashboardTasks.ts";
import type { Task } from "../types";
import styles from "./DashboardPage.module.css";

const DashboardPage = () => {
  const { tasks, canEdit, openAdd, openEdit } = useTaskWorkspace();
  const isCompact = useMediaQuery("(max-width: 900px), (max-height: 560px)");
  const [searchParams, setSearchParams] = useSearchParams();
  const activePanel = searchParams.get("focus") === "priority" ? "priority" : "deadline";
  const tabPrefix = useId();
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
          className={styles.addButton}
          aria-label="タスクを追加"
          variant="contained"
          startIcon={<Icon name="plus" />}
          onClick={openAdd}
          disabled={!canEdit}
        >
          <span className={styles.fullButtonLabel}>タスクを追加</span>
          <span className={styles.compactButtonLabel}>追加</span>
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
      {isCompact && (
        <Tabs
          className={styles.mobileTabs}
          value={activePanel}
          variant="fullWidth"
          aria-label="ダッシュボードのタスク分類"
          onChange={(_, value: string) => {
            setSearchParams(
              (previous) => {
                const next = new URLSearchParams(previous);
                next.set("focus", value);
                return next;
              },
              { replace: true, preventScrollReset: true },
            );
          }}
        >
          <Tab
            id={`${tabPrefix}-deadline-tab`}
            aria-controls={`${tabPrefix}-deadline-panel`}
            value="deadline"
            label={`期限が近い ${upcoming.length}`}
          />
          <Tab
            id={`${tabPrefix}-priority-tab`}
            aria-controls={`${tabPrefix}-priority-panel`}
            value="priority"
            label={`優先度が高い ${highPriority.length}`}
          />
        </Tabs>
      )}
      <div className={styles.panels}>
        <TaskPanel
          id={`${tabPrefix}-deadline-panel`}
          labelledBy={isCompact ? `${tabPrefix}-deadline-tab` : undefined}
          hidden={isCompact && activePanel !== "deadline"}
          isCompact={isCompact}
          title="期限が近いタスク"
          icon="clock"
          tasks={upcoming}
          now={now}
          onEdit={openEdit}
          disabled={!canEdit}
          emptyText="期限が近いタスクはありません"
        />
        <TaskPanel
          id={`${tabPrefix}-priority-panel`}
          labelledBy={isCompact ? `${tabPrefix}-priority-tab` : undefined}
          hidden={isCompact && activePanel !== "priority"}
          isCompact={isCompact}
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
  id: string;
  labelledBy?: string;
  hidden: boolean;
  isCompact: boolean;
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
  id,
  labelledBy,
  hidden,
  isCompact,
  title,
  subtitle,
  icon,
  tasks,
  now,
  onEdit,
  disabled,
  emptyText,
}: TaskPanelProps) => (
  <section
    id={id}
    className={styles.panel}
    hidden={hidden}
    role={isCompact ? "tabpanel" : "region"}
    aria-label={title}
    aria-labelledby={labelledBy}
  >
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
    <div
      className={styles.panelList}
      tabIndex={isCompact ? undefined : 0}
      role="region"
      aria-label={`${title}の一覧`}
    >
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
