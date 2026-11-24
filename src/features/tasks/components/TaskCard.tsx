import { useState } from "react";
import type { Task } from "../types";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import styles from "./TaskCard.module.css";

type TaskCardProps = {
  task: Task;
  onProgressChange: (id: string, progress: number) => void;
  onEdit: (id: string) => void;
  disabled?: boolean;
};

const priorityLabels = { low: "低", mid: "中", high: "高" };
const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const TaskCard = ({ task, onProgressChange, onEdit, disabled = false }: TaskCardProps) => {
  const [draftProgress, setDraftProgress] = useState<number | null>(null);
  const [sliderRevision, setSliderRevision] = useState(0);
  const progress = draftProgress ?? task.progress;

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>{task.title}</h2>
        <Button
          className={styles.editButton}
          type="button"
          size="small"
          disabled={disabled}
          onClick={() => onEdit(task.id)}
          aria-label={`${task.title}を編集`}
        >
          編集
        </Button>
      </div>
      {task.detail && (
        <p className={styles.detail} title={task.detail}>
          {task.detail}
        </p>
      )}
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
              key={sliderRevision}
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
              onChangeCommitted={(event, value) => {
                if (typeof value !== "number") return;
                setDraftProgress(null);
                if (value !== task.progress) onProgressChange(task.id, value);
                if (
                  event.type.startsWith("pointer") ||
                  event.type.startsWith("touch") ||
                  event.type === "mouseup"
                ) {
                  // ドラッグ終了時に Slider を再生成し、document の操作リスナーを破棄する。
                  setSliderRevision((revision) => revision + 1);
                }
              }}
              onPointerCancel={() => {
                setDraftProgress(null);
                setSliderRevision((revision) => revision + 1);
              }}
              onTouchCancel={() => {
                setDraftProgress(null);
                setSliderRevision((revision) => revision + 1);
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
