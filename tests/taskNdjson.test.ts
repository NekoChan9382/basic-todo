import assert from "node:assert/strict";
import { test } from "node:test";
import {
  exportTasksNdjson,
  parseTasksNdjson,
  mergeImportedTasks,
} from "../src/features/tasks/lib/taskNdjson.ts";
import type { Task } from "../src/features/tasks/types.ts";

const task = (id = "1"): Task => ({
  id,
  title: "日本語のタスク",
  detail: '改行\nと "引用"、\\',
  progress: 55,
  priority: "high",
  due_date: new Date("2026-11-24T09:00:00.000Z"),
});

test("1 行 1 タスクで全項目を往復し、説明の改行は行を分けない", () => {
  const tasks = [task(), { ...task("2"), due_date: null, progress: 100 }];
  const text = exportTasksNdjson(tasks);
  assert.equal(text.trimEnd().split("\n").length, 2);
  assert.equal(JSON.parse(text.split("\n")[0]).due_date, "2026-11-24T09:00:00.000Z");
  assert.deepEqual(parseTasksNdjson(text), tasks);
  assert.equal("complete" in JSON.parse(text.split("\n")[0]), false);
});

test("BOM・CRLF・空行・末尾改行なしを許容", () => {
  const line = exportTasksNdjson([task()]).trimEnd();
  assert.deepEqual(parseTasksNdjson(`\uFEFF\r\n${line}\r\n \r\n`), [task()]);
  assert.deepEqual(parseTasksNdjson(line), [task()]);
  assert.deepEqual(parseTasksNdjson(" \n"), []);
  assert.equal(exportTasksNdjson([]), "");
});

test("行番号付きで JSON エラー・不正な型や範囲・不正な日付を拒否", () => {
  const valid = JSON.parse(exportTasksNdjson([task()]));
  const prefix = exportTasksNdjson([task("other")]);
  for (const value of [
    null,
    [],
    {},
    { ...valid, title: " " },
    { ...valid, detail: 1 },
    { ...valid, progress: 101 },
    { ...valid, progress: -1 },
    { ...valid, priority: "urgent" },
    { ...valid, due_date: "invalid" },
    { ...valid, due_date: "2026-02-30T00:00:00.000Z" },
  ]) {
    assert.throws(() => parseTasksNdjson(prefix + JSON.stringify(value)), /2 行目/);
  }
  assert.throws(() => parseTasksNdjson(prefix + "{"), /2 行目/);
  assert.throws(() => parseTasksNdjson(JSON.stringify([valid])), /1 行目/);
});

test("ファイル内の重複 ID を拒否し、既存データは変更しない", () => {
  const current = [task()];
  const snapshot = structuredClone(current);
  assert.throws(() => parseTasksNdjson(exportTasksNdjson(current).repeat(2)), /2 行目.*重複/);
  assert.deepEqual(current, snapshot);
});

test("既存 ID は変更せず、新しい ID だけ追加。再インポートは変更なし", () => {
  const current = [task()];
  const incoming = [{ ...task(), title: "変更" }, task("2")];
  const merged = mergeImportedTasks(current, incoming);
  assert.deepEqual(merged, [task(), task("2")]);
  assert.equal(merged[0], current[0]);
  assert.equal(mergeImportedTasks(merged, incoming), merged);
  assert.equal(mergeImportedTasks(current, []), current);
});

test("不正な進捗や日付をエクスポートしない", () => {
  assert.throws(() => exportTasksNdjson([{ ...task(), progress: NaN }]));
  assert.throws(() => exportTasksNdjson([{ ...task(), due_date: new Date("invalid") }]));
  assert.throws(() => exportTasksNdjson([task(), task()]));
});
