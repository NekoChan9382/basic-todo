import type { Task } from "../types";
import styles from "./TaskCard.module.css";

type TaskCardProps = {
  task: Task;
};

const priorityLabels = { low: "低", mid: "中", high: "高" };
const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const TaskCard = ({ task }: TaskCardProps) => {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>{task.title}</h2>
      {task.detail && <p className={styles.detail}>{task.detail}</p>}
      <dl className={styles.info}>
        <div className={styles.item}>
          <dt>進捗</dt>
          <dd>
            {task.progress}%{task.progress === 100 && "（完了）"}
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
      </dl>
    </article>
  );
};

export default TaskCard;
