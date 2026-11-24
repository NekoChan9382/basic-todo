import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import type { Task } from "../types";
import { exportTasksNdjson } from "../lib/taskNdjson.ts";
import styles from "./TaskTransfer.module.css";

type TaskTransferProps = {
  tasks: Task[];
  disabled: boolean;
  onImport: (text: string) => void;
};

const TaskTransfer = ({ tasks, disabled, onImport }: TaskTransferProps) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [isReading, setIsReading] = useState(false);
  const [notice, setNotice] = useState<{ error: boolean; text: string } | null>(null);

  const handleExport = () => {
    setNotice(null);
    try {
      const blob = new Blob([exportTasksNdjson(tasks)], {
        type: "application/x-ndjson;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tasks-${new Date().toISOString().replace(/[:.]/g, "-")}.ndjson`;
      document.body.append(link);
      try {
        link.click();
      } finally {
        link.remove();
        // ダウンロードが URL を参照できるよう、解放は次のタスクへ遅らせる。
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (cause) {
      setNotice({
        error: true,
        text: cause instanceof Error ? cause.message : "エクスポートできませんでした。",
      });
    }
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setIsReading(true);
    setNotice(null);
    try {
      const text = await file.text();
      onImport(text);
      setNotice({
        error: false,
        text: "ファイルを読み込みました。",
      });
    } catch (cause) {
      setNotice({
        error: true,
        text: cause instanceof Error ? cause.message : "ファイルを読み込めませんでした。",
      });
    } finally {
      setIsReading(false);
    }
  };

  return (
    <section className={styles.transfer} aria-label="タスクのインポートとエクスポート">
      <div className={styles.buttons}>
        <Button
          type="button"
          variant="outlined"
          onClick={handleExport}
          disabled={disabled || isReading}
        >
          エクスポート
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={() => fileInput.current?.click()}
          disabled={disabled || isReading}
        >
          {isReading ? "読み込み中…" : "インポート"}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept=".ndjson,.jsonl,application/x-ndjson"
          hidden
          onChange={handleImport}
        />
      </div>
      {notice && (
        <Alert severity={notice.error ? "error" : "info"} role={notice.error ? "alert" : "status"}>
          {notice.text}
        </Alert>
      )}
    </section>
  );
};

export default TaskTransfer;
