import type { NewTaskInput } from "../types";
import TaskFormModal from "./TaskFormModal";

type AddTaskModalProps = {
  onAdd: (input: NewTaskInput) => void;
  onClose: () => void;
};

const AddTaskModal = ({ onAdd, onClose }: AddTaskModalProps) => (
  <TaskFormModal onSubmit={onAdd} onClose={onClose} />
);

export default AddTaskModal;
