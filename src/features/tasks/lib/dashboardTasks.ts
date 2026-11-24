import type { Task } from "../types";

const byDueDate = (a: Task, b: Task) => {
  if (a.due_date === null) return b.due_date === null ? 0 : 1;
  if (b.due_date === null) return -1;
  return a.due_date.getTime() - b.due_date.getTime();
};

/** 今日から7日後の終日まで。期限超過も見落とさないよう対象に含める。 */
export const selectDashboardTasks = (tasks: Task[], now: Date) => {
  const end = new Date(now);
  end.setDate(end.getDate() + 8);
  end.setHours(0, 0, 0, 0);
  const pending = tasks.filter((task) => task.progress < 100);
  return {
    upcoming: pending
      .filter((task) => task.due_date !== null && task.due_date < end)
      .sort(byDueDate),
    highPriority: pending.filter((task) => task.priority === "high").sort(byDueDate),
    pendingCount: pending.length,
    completeCount: tasks.length - pending.length,
    overdueCount: pending.filter(
      (task) =>
        task.due_date !== null &&
        task.due_date < new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    ).length,
  };
};

export const getDeadlineLabel = (date: Date | null, now: Date) => {
  if (!date) return { text: "期限未設定", urgent: false };
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date < today) return { text: "期限超過", urgent: true };
  if (date < tomorrow) return { text: "今日まで", urgent: true };
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);
  if (date < dayAfter) return { text: "明日まで", urgent: false };
  return {
    text: new Intl.DateTimeFormat("ja-JP", { month: "short", day: "numeric" }).format(date),
    urgent: false,
  };
};
