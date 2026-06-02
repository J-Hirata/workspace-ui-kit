"use client";

import { type Materials } from "@/lib/pm-schema";
import { Pane4Section } from "@/components/workspace/Pane4Section";
import { InlineTextareaField } from "@/components/primitives";

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
      className="h-full w-64 shrink-0 overflow-x-hidden overflow-y-auto border-l border-border bg-muted/20"
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

      <Pane4Section title="画像（複数）">
        {materials.images.length === 0 ? (
          <p className="text-xs text-muted-foreground">画像なし</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {materials.images.map((img) => (
              <div
                key={img.id}
                className="flex h-10 w-14 items-center justify-center rounded border border-border bg-muted px-1 text-center text-[9px] text-muted-foreground"
                title={img.name}
              >
                {img.name.slice(0, 6)}
              </div>
            ))}
          </div>
        )}
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
