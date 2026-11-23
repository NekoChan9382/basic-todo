import { useId, useState } from "react";
import type { SubmitEvent } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { NewTaskInput } from "../types";
import styles from "./AddTaskModal.module.css";

type AddTaskModalProps = {
  onAdd: (input: NewTaskInput) => void;
  onClose: () => void;
};

const AddTaskModal = ({ onAdd, onClose }: AddTaskModalProps) => {
  const headingId = useId();
  const descriptionId = useId();
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
      onAdd({
        title,
        detail: String(form.get("detail") ?? ""),
        progress: progress === "" ? undefined : Number(progress),
        priority: priority === "" ? undefined : (priority as "low" | "mid" | "high"),
        due_date: dueDate === "" ? null : new Date(`${dueDate}T00:00:00`),
      });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "タスクを追加できませんでした。");
    }
  };

  return (
    <Modal open onClose={onClose} aria-labelledby={headingId} aria-describedby={descriptionId}>
      <Box
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={styles.dialog}
      >
        <Box component="form" className={styles.form} onSubmit={handleSubmit}>
          <Typography id={headingId} component="h2" variant="h6">
            タスクを追加
          </Typography>
          <Typography id={descriptionId} variant="body2" color="text.secondary">
            タイトルのみ必須です。他の項目は任意です。
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField name="title" label="タイトル" required autoFocus fullWidth />
          <TextField name="detail" label="説明" multiline minRows={3} fullWidth />
          <TextField
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
            defaultValue=""
            fullWidth
            helperText="未選択の場合は「中」"
          >
            <MenuItem value="">未選択</MenuItem>
            <MenuItem value="low">低</MenuItem>
            <MenuItem value="mid">中</MenuItem>
            <MenuItem value="high">高</MenuItem>
          </TextField>
          <TextField
            name="due_date"
            label="締め切り"
            type="date"
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Box className={styles.actions}>
            <Button type="button" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" variant="contained">
              追加
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddTaskModal;
