"use client";

import { Plus } from "lucide-react";

import { type Task, type Tool, type Priority } from "@/lib/pm-schema";
import { PRIORITY_AXIS_LABELS, showsCurrentVersion } from "@/lib/pm-labels";
import { getPriorityTotal } from "@/lib/computed/priority";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InlineFieldRow,
  InlineTextField,
  InlineTextareaField,
} from "@/components/primitives";
import { StarRating } from "@/components/workspace/pm/StarRating";

type ToolDetailPaneProps = {
  tool: Tool;
  onUpdatePriority: (axis: keyof Priority, value: number) => void;
  onUpdateField: (field: "name" | "currentVersion" | "markdown", value: string) => void;
  onUpdateTasks: (tasks: Task[]) => void;
};

export function ToolDetailPane({
  tool,
  onUpdatePriority,
  onUpdateField,
  onUpdateTasks,
}: ToolDetailPaneProps) {
  const total = getPriorityTotal(tool.priority);
  const showVersion = showsCurrentVersion(tool.zone);
  const fieldKey = tool.id;

  const activeTasks = tool.tasks.filter((t) => !t.done);
  const doneTasks = tool.tasks.filter((t) => t.done);

  const updateTaskText = (id: string, text: string) => {
    onUpdateTasks(
      tool.tasks.map((t) => (t.id === id ? { ...t, text } : t)),
    );
  };

  // チェック切替: done を反転。完了したタスクは配列の末尾へ送り、
  // 「完了済みタスク」セクション側で表示順が安定するようにする。
  const toggleTaskDone = (id: string, done: boolean) => {
    const target = tool.tasks.find((t) => t.id === id);
    if (!target) return;
    const rest = tool.tasks.filter((t) => t.id !== id);
    const updated = { ...target, done };
    onUpdateTasks(done ? [...rest, updated] : [updated, ...rest]);
  };

  const addTaskRow = () => {
    const task: Task = {
      id: `${tool.id}-task-${Date.now()}`,
      text: "",
      done: false,
    };
    // 未完了行の直後（完了済みの手前）に追加する
    const actives = tool.tasks.filter((t) => !t.done);
    const dones = tool.tasks.filter((t) => t.done);
    onUpdateTasks([...actives, task, ...dones]);
  };

  return (
    <section
      className="h-full min-w-0 overflow-x-hidden overflow-y-auto bg-background"
      aria-label={`${tool.name}の詳細`}
    >
      <div className="mx-auto w-full max-w-3xl px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          P3 本文
        </p>
        <div className="mt-1">
          <InlineTextField
            key={`${fieldKey}-name`}
            value={tool.name}
            onSave={(v) => onUpdateField("name", v)}
            ariaLabel="ツール名"
            placeholder="ツール名を入力"
            className="text-lg font-semibold"
          />
        </div>

        <Card className="mt-4 border-border bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              優先度（★クリックで1〜5）
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <StarRating
              key={`${fieldKey}-impact`}
              label={PRIORITY_AXIS_LABELS.impact}
              value={tool.priority.impact}
              onChange={(v) => onUpdatePriority("impact", v)}
            />
            <StarRating
              key={`${fieldKey}-urgency`}
              label={PRIORITY_AXIS_LABELS.urgency}
              value={tool.priority.urgency}
              onChange={(v) => onUpdatePriority("urgency", v)}
            />
            <StarRating
              key={`${fieldKey}-ease`}
              label={PRIORITY_AXIS_LABELS.ease}
              value={tool.priority.ease}
              onChange={(v) => onUpdatePriority("ease", v)}
            />
            <p className="text-[10px] text-muted-foreground">
              合計 {total} → P2 右端
            </p>
          </CardContent>
        </Card>

        <div className="mt-4 space-y-3 text-sm">
          {showVersion && (
            <InlineFieldRow label="現行バージョン">
              <InlineTextField
                key={`${fieldKey}-version`}
                value={tool.currentVersion}
                onSave={(v) => onUpdateField("currentVersion", v)}
                ariaLabel="現行バージョン"
                placeholder="v0.1"
              />
            </InlineFieldRow>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold">タスク予定</h2>
          <Button
            variant="outline"
            size="xs"
            onClick={addTaskRow}
            aria-label="タスク行を追加"
          >
            <Plus data-icon="inline-start" />
            行を追加
          </Button>
        </div>
        <div className="mt-2 space-y-1.5">
          {activeTasks.length === 0 && (
            <p className="text-xs text-muted-foreground">
              タスクはありません。「行を追加」で増やせます。
            </p>
          )}
          {activeTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={false}
                disabled={task.text.trim() === ""}
                onChange={() => toggleTaskDone(task.id, true)}
                aria-label={`タスク「${task.text || "（空）"}」を完了にする`}
                className="size-4 shrink-0 cursor-pointer rounded border-border accent-primary disabled:cursor-not-allowed disabled:opacity-40"
              />
              <Input
                key={`${task.id}-input`}
                defaultValue={task.text}
                placeholder="やることを入力"
                aria-label="タスク内容"
                onBlur={(e) => {
                  if (e.target.value !== task.text)
                    updateTaskText(task.id, e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    (e.target as HTMLInputElement).blur();
                  } else if (e.key === "Escape") {
                    (e.target as HTMLInputElement).value = task.text;
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="h-8 bg-card"
              />
            </div>
          ))}
        </div>

        <h2 className="mt-6 text-sm font-semibold">
          プロジェクト詳細（Markdown）
        </h2>
        <div className="mt-2 min-w-0">
          <InlineTextareaField
            key={`${fieldKey}-markdown`}
            value={tool.markdown}
            onSave={(v) => onUpdateField("markdown", v)}
            ariaLabel="プロジェクト詳細 Markdown"
            placeholder="目的・仕様・改修メモなど"
          />
        </div>

        <h2 className="mt-6 text-sm font-semibold">
          完了済みタスク
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {doneTasks.length}件
          </span>
        </h2>
        <div className="mt-2 space-y-1.5 pb-6">
          {doneTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              チェックしたタスクがここに移動します。
            </p>
          ) : (
            doneTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked
                  onChange={() => toggleTaskDone(task.id, false)}
                  aria-label={`タスク「${task.text}」をタスク予定に戻す`}
                  className="size-4 shrink-0 cursor-pointer rounded border-border accent-primary"
                />
                <span className="text-sm text-muted-foreground line-through">
                  {task.text}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
