import { useState } from "react";
import type { Task } from "../types";
import Slider from "@mui/material/Slider";
import styles from "./TaskCard.module.css";

type TaskCardProps = {
  task: Task;
  onProgressChange: (id: string, progress: number) => void;
  disabled?: boolean;
};

const priorityLabels = { low: "低", mid: "中", high: "高" };
const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const TaskCard = ({ task, onProgressChange, disabled = false }: TaskCardProps) => {
  const [draftProgress, setDraftProgress] = useState<number | null>(null);
  const progress = draftProgress ?? task.progress;

  return (
    <article className={styles.card}>
      <h2 className={styles.title}>{task.title}</h2>
      {task.detail && <p className={styles.detail}>{task.detail}</p>}
      <dl className={styles.info}>
        <div className={`${styles.item} ${styles.progressItem}`}>
          <dt>進捗</dt>
          <dd className={styles.progressValue}>
            {progress}%{progress === 100 && "（完了）"}
          </dd>
        </div>
        <div className={styles.item}>
          <dt>優先度</dt>
          <dd>{priorityLabels[task.priority]}</dd>
        </div>
        <div className={styles.item}>
          <dt>締め切り</dt>
          <dd>
            {task.due_date ? (
              <time dateTime={task.due_date.toISOString()}>
                {dateFormatter.format(task.due_date)}
              </time>
            ) : (
              "未設定"
            )}
          </dd>
        </div>
        <div className={styles.progressControl}>
          <dt className={styles.visuallyHidden}>進捗を変更</dt>
          <dd>
            <Slider
              aria-label={`${task.title}の進捗`}
              getAriaValueText={(value) => `${value}%`}
              min={0}
              max={100}
              step={5}
              shiftStep={5}
              value={progress}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}%`}
              disabled={disabled}
              onChange={(_, value) => {
                if (typeof value === "number") setDraftProgress(value);
              }}
              onChangeCommitted={(_, value) => {
                if (typeof value !== "number") return;
                setDraftProgress(null);
                if (value !== task.progress) onProgressChange(task.id, value);
              }}
              size="small"
            />
          </dd>
        </div>
      </dl>
    </article>
  );
};

export default TaskCard;
