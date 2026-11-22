import assert from "node:assert/strict";
import { test } from "node:test";
import { createTask } from "../src/features/tasks/lib/createTask.ts";

test("タイトルだけで作成し、任意項目に既定値を補完する", () => {
  const task = createTask({ title: "  買い物  " }, []);
  assert.equal(task.title, "買い物");
  assert.equal(task.detail, "");
  assert.equal(task.progress, 0);
  assert.equal(task.priority, "mid");
  assert.equal(task.due_date, null);
});

test("空白だけのタイトル、不正な進捗と日付を拒否する", () => {
  assert.throws(() => createTask({ title: " \n " }, []));
  for (const progress of [-1, 101, NaN, Infinity]) {
    assert.throws(() => createTask({ title: "test", progress }, []), RangeError);
  }
  assert.throws(() => createTask({ title: "test", due_date: new Date("invalid") }, []), RangeError);
});

test("任意項目を保持し、入力した Date をコピーする", () => {
  const date = new Date("2026-11-22T00:00:00.000Z");
  const task = createTask(
    { title: "test", detail: "説明", progress: 100, priority: "high", due_date: date },
    [],
  );
  assert.equal(task.detail, "説明");
  assert.equal(task.progress, 100);
  assert.equal(task.priority, "high");
  assert.deepEqual(task.due_date, date);
  assert.notEqual(task.due_date, date);
});

test("同時刻の連続作成と既存 ID の衝突を避ける", (context) => {
  context.mock.method(Date, "now", () => 1795305600000);
  const first = createTask({ title: "first" }, []);
  const second = createTask({ title: "second" }, []);
  assert.match(first.id, /^1795305600000-\d+$/);
  assert.notEqual(first.id, second.id);
  const nextSequence = Number(second.id.split("-")[1]) + 1;
  const conflicting = { ...first, id: `1795305600000-${nextSequence}` };
  const third = createTask({ title: "third" }, [conflicting]);
  assert.notEqual(third.id, conflicting.id);
});
