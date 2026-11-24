import type { Task } from "../types";
import { getDeadlineLabel } from "../lib/dashboardTasks.ts";
import Icon from "../../../shared/components/Icon";
import styles from "./CompactTaskCard.module.css";

type CompactTaskCardProps = {
  task: Task;
  now: Date;
  onEdit: (id: string) => void;
  disabled: boolean;
};

const CompactTaskCard = ({ task, now, onEdit, disabled }: CompactTaskCardProps) => {
  const deadline = getDeadlineLabel(task.due_date, now);
  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => onEdit(task.id)}
      disabled={disabled}
      aria-label={`${task.title}を編集`}
    >
      <div className={styles.top}>
        <span className={styles.priority} data-priority={task.priority}>
          優先度 {{ low: "低", mid: "中", high: "高" }[task.priority]}
        </span>
        <span className={`${styles.deadline} ${deadline.urgent ? styles.urgent : ""}`}>
          <Icon name="clock" />
          {deadline.text}
        </span>
      </div>
      <h3 className={styles.title}>{task.title}</h3>
      {task.detail && <p className={styles.detail}>{task.detail}</p>}
      <div className={styles.progressRow}>
        <span
          className={styles.track}
          role="progressbar"
          aria-label={`${task.title}の進捗`}
          aria-valuenow={task.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${task.progress}%` }} />
        </span>
        <span className={styles.percent}>{task.progress}%</span>
        <span className={styles.editLabel}>編集</span>
      </div>
    </button>
  );
};

export default CompactTaskCard;
