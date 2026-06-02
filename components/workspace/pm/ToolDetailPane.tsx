"use client";

import { type Tool, type Priority } from "@/lib/pm-schema";
import { PRIORITY_AXIS_LABELS, showsCurrentVersion } from "@/lib/pm-labels";
import { getPriorityTotal } from "@/lib/computed/priority";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InlineFieldRow,
  InlineTextField,
  InlineTextareaField,
} from "@/components/primitives";
import { StarRating } from "@/components/workspace/pm/StarRating";

type ToolDetailPaneProps = {
  tool: Tool;
  onUpdatePriority: (axis: keyof Priority, value: number) => void;
  onUpdateField: (
    field: "currentVersion" | "nextStep" | "markdown",
    value: string,
  ) => void;
};

export function ToolDetailPane({
  tool,
  onUpdatePriority,
  onUpdateField,
}: ToolDetailPaneProps) {
  const total = getPriorityTotal(tool.priority);
  const showVersion = showsCurrentVersion(tool.zone);
  const fieldKey = tool.id;

  return (
    <section
      className="h-full min-w-0 overflow-x-hidden overflow-y-auto bg-background"
      aria-label={`${tool.name}の詳細`}
    >
      <div className="mx-auto w-full max-w-3xl px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          P3 本文
        </p>
        <h1 className="mt-1 text-lg font-semibold">{tool.name}</h1>

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
          <InlineFieldRow label="次の一手">
            <InlineTextField
              key={`${fieldKey}-next`}
              value={tool.nextStep}
              onSave={(v) => onUpdateField("nextStep", v)}
              ariaLabel="次の一手"
              placeholder="1行で次のアクション"
            />
          </InlineFieldRow>
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
      </div>
    </section>
  );
}
