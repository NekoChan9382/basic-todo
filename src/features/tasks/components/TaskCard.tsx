import type { Task } from "../types";

type TaskCardProps = {
  task: Task;
};

// TODO: 完了状態・優先度・期限の表示と操作を追加する。
const TaskCard = ({ task }: TaskCardProps) => {
  return (
    <article>
      <h3>{task.title}</h3>
      <p>{task.detail}</p>
      <div className="card-info">
        <span>{task.priority}</span>
        <span>{task.progress}</span>
      </div>
    </article>
  );
};

export default TaskCard;
