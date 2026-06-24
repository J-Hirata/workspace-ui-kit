"use client";

import { type Materials, type Priority, type Progress } from "@/lib/pm-schema";
import { PRIORITY_AXIS_LABELS } from "@/lib/pm-labels";
import { getPriorityTotal } from "@/lib/computed/priority";
import { Pane4Section } from "@/components/workspace/Pane4Section";
import { InlineTextareaField } from "@/components/primitives";
import { AttachmentSection } from "@/components/workspace/pm/AttachmentSection";
import { ProgressBarSection } from "@/components/workspace/pm/ProgressBarSection";
import { StarRating } from "@/components/workspace/pm/StarRating";

type ToolMaterialsPaneProps = {
  toolId: string;
  materials: Materials;
  priority: Priority;
  progress: Progress;
  onUpdateMaterials: (patch: Partial<Materials>) => void;
  onUpdatePriority: (axis: keyof Priority, value: number) => void;
  onUpdateProgress: (progress: Progress) => void;
};

export function ToolMaterialsPane({
  toolId,
  materials,
  priority,
  progress,
  onUpdateMaterials,
  onUpdatePriority,
  onUpdateProgress,
}: ToolMaterialsPaneProps) {
  const priorityTotal = getPriorityTotal(priority);

  return (
    <aside
      className="h-full w-96 shrink-0 overflow-x-hidden overflow-y-auto border-l border-border bg-muted/20"
      aria-label="素材"
    >
      <Pane4Section title="補足メモ">
        <InlineTextareaField
          key={`${toolId}-memo`}
          value={materials.memo}
          onSave={(memo) => onUpdateMaterials({ memo })}
          ariaLabel="補足メモ"
          placeholder="メモを入力"
        />
      </Pane4Section>

      <Pane4Section title="優先度（★クリックで1〜5）">
        <div className="flex flex-col gap-3 rounded-md border border-border bg-card/60 p-3">
          <StarRating
            key={`${toolId}-impact`}
            label={PRIORITY_AXIS_LABELS.impact}
            value={priority.impact}
            onChange={(v) => onUpdatePriority("impact", v)}
          />
          <StarRating
            key={`${toolId}-urgency`}
            label={PRIORITY_AXIS_LABELS.urgency}
            value={priority.urgency}
            onChange={(v) => onUpdatePriority("urgency", v)}
          />
          <StarRating
            key={`${toolId}-ease`}
            label={PRIORITY_AXIS_LABELS.ease}
            value={priority.ease}
            onChange={(v) => onUpdatePriority("ease", v)}
          />
          <p className="text-[10px] text-muted-foreground">
            合計 {priorityTotal} → P2 右端
          </p>
        </div>
      </Pane4Section>

      <Pane4Section title="進捗（1〜3）">
        <ProgressBarSection
          key={`${toolId}-progress`}
          progress={progress}
          onChange={onUpdateProgress}
        />
      </Pane4Section>

      <Pane4Section title="ファイル（Excel / CSV / txt / 画像 / PDF）">
        <AttachmentSection
          key={`${toolId}-attachments`}
          attachments={materials.attachments}
          onChange={(attachments) => onUpdateMaterials({ attachments })}
        />
      </Pane4Section>
    </aside>
  );
}
