import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { loadTasks, saveTasks } from "../src/features/tasks/storage/taskStorage.ts";
import type { Task } from "../src/features/tasks/types.ts";

const key = "todo-app:tasks";
let values: Map<string, string>;
let unavailable = false;
let writeFails = false;
beforeEach(() => {
  values = new Map();
  unavailable = false;
  writeFails = false;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      get localStorage() {
        if (unavailable) throw new Error("blocked");
        return {
          getItem: (name: string) => values.get(name) ?? null,
          setItem: (name: string, value: string) => {
            if (writeFails) throw new Error("quota exceeded");
            values.set(name, value);
          },
        };
      },
    },
  });
});
const task = (): Task => ({
  id: "task-1",
  title: "テスト",
  detail: "詳細",
  progress: 100,
  priority: "mid",
  due_date: new Date("2026-11-19T00:00:00.000Z"),
});

test("未保存と空配列", () => {
  assert.deepEqual(loadTasks(), { ok: true, tasks: [] });
  assert.deepEqual(saveTasks([]), { ok: true });
  assert.deepEqual(loadTasks(), { ok: true, tasks: [] });
});
test("日付と全項目の復元、complete の除外", () => {
  assert.deepEqual(saveTasks([{ ...task(), complete: true } as Task]), { ok: true });
  const stored = JSON.parse(values.get(key)!);
  assert.equal(stored.version, 1);
  assert.equal(stored.tasks[0].due_date, task().due_date!.toISOString());
  assert.equal("complete" in stored.tasks[0], false);
  assert.deepEqual(loadTasks(), { ok: true, tasks: [task()] });
  assert.deepEqual(saveTasks([{ ...task(), progress: 0 }]), { ok: true });
});
test("破損したデータと非対応バージョンを保持", () => {
  for (const raw of ["", "{", "null", "[]", '{"version":2,"tasks":[]}', '{"version":1}']) {
    values.set(key, raw);
    assert.equal(loadTasks().ok, false);
    assert.equal(values.get(key), raw);
  }
});
test("不正なフィールド・日付・重複 ID の読み込みを拒否", () => {
  const valid = { ...task(), due_date: task().due_date!.toISOString() };
  for (const patch of [
    { id: "" },
    { title: 1 },
    { detail: null },
    { progress: -1 },
    { progress: 101 },
    { priority: "urgent" },
    { due_date: "invalid" },
    { due_date: "2026-02-30T00:00:00.000Z" },
  ]) {
    values.set(key, JSON.stringify({ version: 1, tasks: [{ ...valid, ...patch }] }));
    assert.equal(loadTasks().ok, false);
  }
  values.set(key, JSON.stringify({ version: 1, tasks: [valid, valid] }));
  assert.equal(loadTasks().ok, false);
});
test("保存データの検証と既存データの保護", () => {
  saveTasks([task()]);
  const original = values.get(key);
  for (const invalid of [
    { ...task(), progress: NaN },
    { ...task(), progress: Infinity },
    { ...task(), progress: -1 },
    { ...task(), progress: 101 },
    { ...task(), due_date: new Date("invalid") },
  ]) {
    assert.equal(saveTasks([invalid]).ok, false);
    assert.equal(values.get(key), original);
  }
  assert.equal(saveTasks([task(), task()]).ok, false);
});
test("アクセス拒否と容量超過", () => {
  unavailable = true;
  assert.equal(loadTasks().ok, false);
  assert.equal(saveTasks([task()]).ok, false);
  unavailable = false;
  saveTasks([task()]);
  const original = values.get(key);
  writeFails = true;
  assert.equal(saveTasks([]).ok, false);
  assert.equal(values.get(key), original);
});

test("期限未設定の null を保存・復元する", () => {
  const tasks = [{ ...task(), due_date: null }];
  assert.deepEqual(saveTasks(tasks), { ok: true });
  assert.equal(JSON.parse(values.get(key)!).tasks[0].due_date, null);
  assert.deepEqual(loadTasks(), { ok: true, tasks });
});
