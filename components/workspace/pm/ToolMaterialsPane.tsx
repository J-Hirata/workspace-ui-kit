"use client";

import { type Materials } from "@/lib/pm-schema";
import { Pane4Section } from "@/components/workspace/Pane4Section";
import { InlineTextareaField } from "@/components/primitives";
import { AttachmentSection } from "@/components/workspace/pm/AttachmentSection";

type ToolMaterialsPaneProps = {
  toolId: string;
  materials: Materials;
  onUpdateMaterials: (patch: Partial<Materials>) => void;
};

export function ToolMaterialsPane({
  toolId,
  materials,
  onUpdateMaterials,
}: ToolMaterialsPaneProps) {
  const linksText = materials.links.join("\n");

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

      <Pane4Section title="画像・PDF（複数）">
        <AttachmentSection
          key={`${toolId}-attachments`}
          attachments={materials.attachments}
          onChange={(attachments) => onUpdateMaterials({ attachments })}
        />
      </Pane4Section>

      <Pane4Section title="リンク（複数行・Git含む）">
        <InlineTextareaField
          key={`${toolId}-links`}
          value={linksText}
          onSave={(raw) =>
            onUpdateMaterials({
              links: raw
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          ariaLabel="リンク一覧"
          placeholder="1行に1 URL"
        />
        {materials.links.length > 0 && (
          <ul className="mt-2 space-y-1">
            {materials.links.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-[10px] text-primary underline-offset-2 hover:underline"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Pane4Section>
    </aside>
  );
}
