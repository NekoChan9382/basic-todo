import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getDeadlineLabel,
  selectDashboardTasks,
} from "../src/features/tasks/lib/dashboardTasks.ts";
import type { Task } from "../src/features/tasks/types.ts";

const now = new Date(2026, 10, 24, 12);
const task = (
  id: string,
  date: Date | null,
  priority: Task["priority"] = "mid",
  progress = 0,
): Task => ({ id, title: id, detail: "", due_date: date, priority, progress });

test("期限超過と7日後の終日までの未完了タスクを期限順に抽出", () => {
  const tasks = [
    task("last-day", new Date(2026, 11, 1, 23, 59)),
    task("far", new Date(2026, 11, 2)),
    task("today", new Date(2026, 10, 24)),
    task("overdue", new Date(2026, 10, 23)),
    task("complete", new Date(2026, 10, 20), "high", 100),
    task("no-date", null),
  ];
  const snapshot = [...tasks];
  const result = selectDashboardTasks(tasks, now);
  assert.deepEqual(
    result.upcoming.map((t) => t.id),
    ["overdue", "today", "last-day"],
  );
  assert.equal(result.overdueCount, 1);
  assert.equal(result.pendingCount, 5);
  assert.equal(result.completeCount, 1);
  assert.deepEqual(tasks, snapshot);
});

test("優先度高は期限未設定も含め、完了タスクを除外し期限順に抽出", () => {
  const result = selectDashboardTasks(
    [
      task("no-date", null, "high"),
      task("future", new Date(2027, 0, 1), "high"),
      task("mid", now),
      task("today", now, "high"),
      task("done", now, "high", 100),
    ],
    now,
  );
  assert.deepEqual(
    result.highPriority.map((t) => t.id),
    ["today", "future", "no-date"],
  );
});

test("今日・明日・期限超過のラベルはローカルの日付境界で判定", () => {
  assert.deepEqual(getDeadlineLabel(null, now), { text: "期限未設定", urgent: false });
  assert.deepEqual(getDeadlineLabel(new Date(2026, 10, 23, 23, 59), now), {
    text: "期限超過",
    urgent: true,
  });
  assert.equal(getDeadlineLabel(new Date(2026, 10, 24), now).text, "今日まで");
  assert.equal(getDeadlineLabel(new Date(2026, 10, 24, 23, 59), now).text, "今日まで");
  assert.equal(getDeadlineLabel(new Date(2026, 10, 25, 23, 59), now).text, "明日まで");
  assert.notEqual(getDeadlineLabel(new Date(2026, 10, 26), now).text, "明日まで");
});

test("空データと月・年の境界を扱う", () => {
  assert.deepEqual(selectDashboardTasks([], now), {
    upcoming: [],
    highPriority: [],
    pendingCount: 0,
    completeCount: 0,
    overdueCount: 0,
  });
  const endOfYear = new Date(2026, 11, 28, 12);
  const result = selectDashboardTasks(
    [task("in", new Date(2027, 0, 4, 23, 59)), task("out", new Date(2027, 0, 5))],
    endOfYear,
  );
  assert.deepEqual(
    result.upcoming.map((t) => t.id),
    ["in"],
  );
});
