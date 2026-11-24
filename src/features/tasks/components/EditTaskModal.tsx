import type { Task } from "../types";
import TaskFormModal from "./TaskFormModal";

type EditTaskModalProps = {
  task: Task;
  onUpdate: (id: string, changes: Omit<Task, "id">) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

const EditTaskModal = ({ task, onUpdate, onDelete, onClose }: EditTaskModalProps) => (
  <TaskFormModal
    task={task}
    onSubmit={(input) => onUpdate(task.id, input)}
    onDelete={() => onDelete(task.id)}
    onClose={onClose}
  />
);

export default EditTaskModal;
