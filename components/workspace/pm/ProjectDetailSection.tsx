"use client";

import { Plus, X } from "lucide-react";

import { type ProjectDetail } from "@/lib/pm-schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ProjectDetailSectionProps = {
  toolId: string;
  details: ProjectDetail[];
  onUpdateDetails: (details: ProjectDetail[]) => void;
};

function formatDetailDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

/** 新しい行が上、古い行が下 */
function sortNewestFirst(details: ProjectDetail[]): ProjectDetail[] {
  return [...details].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

/** 1行 Input 相当（約2rem）の 10〜15 倍 — 詳細を読みやすくする高さ */
const DETAIL_ROW_MIN_HEIGHT = "min-h-80";

export function ProjectDetailSection({
  toolId,
  details,
  onUpdateDetails,
}: ProjectDetailSectionProps) {
  const sorted = sortNewestFirst(details);

  const updateText = (id: string, text: string) => {
    onUpdateDetails(
      details.map((d) => (d.id === id ? { ...d, text } : d)),
    );
  };

  const removeRow = (id: string) => {
    onUpdateDetails(details.filter((d) => d.id !== id));
  };

  const addRow = () => {
    const row: ProjectDetail = {
      id: `${toolId}-detail-${Date.now()}`,
      text: "",
      createdAt: new Date().toISOString(),
      deletable: true,
    };
    onUpdateDetails([row, ...details]);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">プロジェクト詳細</h2>
        <Button
          variant="outline"
          size="xs"
          onClick={addRow}
          aria-label="プロジェクト詳細の行を追加"
        >
          <Plus data-icon="inline-start" />
          行を追加
        </Button>
      </div>
      <div className="mt-3 space-y-4">
        {sorted.length === 0 && (
          <p className="text-xs text-muted-foreground">
            メモがありません。「行を追加」で新しい行を上に足せます。
          </p>
        )}
        {sorted.map((detail) => (
          <article
            key={detail.id}
            className="rounded-lg border border-border bg-card/60 p-3"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium tabular-nums text-muted-foreground">
                {formatDetailDate(detail.createdAt)}
              </p>
              {detail.deletable && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`${formatDetailDate(detail.createdAt)} の行を削除する`}
                  onClick={() => removeRow(detail.id)}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
            <Textarea
              key={`${detail.id}-input`}
              defaultValue={detail.text}
              placeholder="目的・仕様・改修メモ・全体像など（複数行で記述）"
              aria-label={`${formatDetailDate(detail.createdAt)} のプロジェクト詳細`}
              onBlur={(e) => {
                if (e.target.value !== detail.text) {
                  updateText(detail.id, e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  (e.target as HTMLTextAreaElement).blur();
                } else if (e.key === "Escape") {
                  (e.target as HTMLTextAreaElement).value = detail.text;
                  (e.target as HTMLTextAreaElement).blur();
                }
              }}
              className={`${DETAIL_ROW_MIN_HEIGHT} w-full resize-y bg-card text-sm leading-relaxed whitespace-pre-line`}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
