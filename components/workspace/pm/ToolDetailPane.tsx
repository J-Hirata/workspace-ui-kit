"use client";

import { Plus, X } from "lucide-react";

import { type ProjectDetail, type Task, type Tool } from "@/lib/pm-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineTextField } from "@/components/primitives";
import { ProjectDetailSection } from "@/components/workspace/pm/ProjectDetailSection";

type ToolDetailPaneProps = {
  tool: Tool;
  onUpdateField: (field: "name", value: string) => void;
  onUpdateTasks: (tasks: Task[]) => void;
  onUpdateProjectDetails: (details: ProjectDetail[]) => void;
};

export function ToolDetailPane({
  tool,
  onUpdateField,
  onUpdateTasks,
  onUpdateProjectDetails,
}: ToolDetailPaneProps) {
  const fieldKey = tool.id;
  const activeTasks = tool.tasks.filter((t) => !t.done);
  const doneTasks = tool.tasks.filter((t) => t.done);

  const updateTaskText = (id: string, text: string) => {
    onUpdateTasks(
      tool.tasks.map((t) => (t.id === id ? { ...t, text } : t)),
    );
  };

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
    const actives = tool.tasks.filter((t) => !t.done);
    const dones = tool.tasks.filter((t) => t.done);
    onUpdateTasks([...actives, task, ...dones]);
  };

  /** タスクを完全に削除（やめる） */
  const removeTask = (id: string) => {
    onUpdateTasks(tool.tasks.filter((t) => t.id !== id));
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

        <div className="mt-4 flex items-center justify-between">
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
                aria-label={`タスク「${task.text || "（空）"}」を完了済みへ移す`}
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
                className="h-8 min-w-0 flex-1 bg-card"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`タスク「${task.text || "（空）"}」を削除する`}
                onClick={() => removeTask(task.id)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <ProjectDetailSection
            key={`${fieldKey}-details`}
            toolId={tool.id}
            details={tool.projectDetails}
            onUpdateDetails={onUpdateProjectDetails}
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
              チェックで完了済みへ。右の × でタスクごと削除できます。
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
                <span className="min-w-0 flex-1 text-sm text-muted-foreground line-through">
                  {task.text}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`完了済みタスク「${task.text}」を削除する`}
                  onClick={() => removeTask(task.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
