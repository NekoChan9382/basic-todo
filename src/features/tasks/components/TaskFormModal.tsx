import { useId, useState } from "react";
import type { SubmitEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Task } from "../types";
import styles from "./TaskFormModal.module.css";

type TaskFormModalProps = {
  task?: Task;
  onSubmit: (input: Omit<Task, "id">) => void;
  onDelete?: () => void;
  onClose: () => void;
};

const formatDateInput = (date: Date | null) => {
  if (!date) return "";
  return [
    date.getFullYear().toString().padStart(4, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const TaskFormModal = ({ task, onSubmit, onDelete, onClose }: TaskFormModalProps) => {
  const headingId = useId();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    if (!title) {
      setError("タイトルを入力してください。");
      return;
    }
    const progress = String(form.get("progress") ?? "");
    const priority = String(form.get("priority") ?? "");
    const dueDate = String(form.get("due_date") ?? "");
    try {
      onSubmit({
        title,
        detail: String(form.get("detail") ?? ""),
        progress: progress === "" ? 0 : Number(progress),
        priority: priority === "" ? "mid" : (priority as Task["priority"]),
        due_date:
          dueDate === ""
            ? null
            : task && dueDate === formatDateInput(task.due_date)
              ? task.due_date
              : new Date(`${dueDate}T00:00:00`),
      });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "タスクを保存できませんでした。");
    }
  };

  const handleDelete = () => {
    try {
      onDelete?.();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "タスクを削除できませんでした。");
    }
  };

  return (
    <Modal open onClose={onClose} aria-labelledby={headingId}>
      <Box
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}

        tabIndex={-1}
        className={styles.dialog}
      >
        <Box component="form" className={styles.form} onSubmit={handleSubmit}>
          <Typography id={headingId} component="h2" variant="h6">
            {task ? "タスクを編集" : "タスクを追加"}
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            name="title"
            label="タイトル"
            defaultValue={task?.title ?? ""}
            required
            autoFocus
            fullWidth
          />
          <TextField
            name="detail"
            label="説明"
            defaultValue={task?.detail ?? ""}
            multiline
            minRows={3}
            fullWidth
          />
          <TextField
            defaultValue={task?.progress ?? ""}
            name="progress"
            label="進捗（%）"
            type="number"
            fullWidth
            helperText="未入力の場合は 0%"
            slotProps={{ htmlInput: { min: 0, max: 100, step: "any" } }}
          />
          <TextField
            name="priority"
            label="優先度"
            select
            defaultValue={task?.priority ?? ""}
            fullWidth
            helperText="未選択の場合は「中」"
          >
            <MenuItem value="">未選択</MenuItem>
            <MenuItem value="low">低</MenuItem>
            <MenuItem value="mid">中</MenuItem>
            <MenuItem value="high">高</MenuItem>
          </TextField>
          <TextField
            defaultValue={formatDateInput(task?.due_date ?? null)}
            name="due_date"
            label="締め切り"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Box className={styles.actions}>
            {task && onDelete && (
              <Button type="button" color="error" onClick={handleDelete}>
                タスクを削除
              </Button>
            )}
            <Button type="button" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" variant="contained">
              {task ? "保存" : "追加"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default TaskFormModal;
