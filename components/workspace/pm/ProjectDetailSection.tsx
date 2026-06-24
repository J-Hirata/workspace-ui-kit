"use client";

import { Plus } from "lucide-react";

import { type ProjectDetail } from "@/lib/pm-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProjectDetailSectionProps = {
  toolId: string;
  details: ProjectDetail[];
  onUpdateDetails: (details: ProjectDetail[]) => void;
};

function formatDetailDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" });
}

/** 新しい行が上、古い行が下 */
function sortNewestFirst(details: ProjectDetail[]): ProjectDetail[] {
  return [...details].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt),
  );
}

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

  const addRow = () => {
    const row: ProjectDetail = {
      id: `${toolId}-detail-${Date.now()}`,
      text: "",
      createdAt: new Date().toISOString(),
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
      <div className="mt-2 space-y-2">
        {sorted.length === 0 && (
          <p className="text-xs text-muted-foreground">
            メモがありません。「行を追加」で新しい行を上に足せます。
          </p>
        )}
        {sorted.map((detail) => (
          <div key={detail.id} className="flex items-start gap-2">
            <span
              className="mt-2 w-10 shrink-0 text-[10px] font-medium tabular-nums text-muted-foreground"
              aria-hidden
            >
              {formatDetailDate(detail.createdAt)}
            </span>
            <Input
              key={`${detail.id}-input`}
              defaultValue={detail.text}
              placeholder="目的・仕様・改修メモなど"
              aria-label={`${formatDetailDate(detail.createdAt)} のプロジェクト詳細`}
              onBlur={(e) => {
                if (e.target.value !== detail.text) {
                  updateText(detail.id, e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  (e.target as HTMLInputElement).blur();
                } else if (e.key === "Escape") {
                  (e.target as HTMLInputElement).value = detail.text;
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="min-h-8 bg-card"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
