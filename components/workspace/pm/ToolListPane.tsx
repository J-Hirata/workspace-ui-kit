"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { cn } from "@/lib/utils";
import { type ToolRow, type ZoneKey, ZONE_ORDER } from "@/lib/pm-schema";
import { ZONE_LABELS } from "@/lib/pm-labels";
import { getZoneTheme } from "@/lib/zone-theme";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { AddItemDialog } from "@/components/workspace/AddItemDialog";
import { SortableToolRow } from "@/components/workspace/pm/SortableToolRow";

type ToolListPaneProps = {
  zone: ZoneKey;
  tools: ToolRow[];
  selectedToolId: string;
  onSelectTool: (id: string) => void;
  onAddTool: (name: string) => void;
  onMoveToolToZone: (id: string, zone: ZoneKey) => void;
};

export function ToolListPane({
  zone,
  tools,
  selectedToolId,
  onSelectTool,
  onAddTool,
  onMoveToolToZone,
}: ToolListPaneProps) {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter((t) => t.name.toLowerCase().includes(q));
  }, [tools, search]);

  const otherZones = ZONE_ORDER.filter((z) => z !== zone);
  const theme = getZoneTheme(zone);

  return (
    <aside
      className={cn(
        "flex h-full w-72 shrink-0 flex-col border-r border-border transition-colors",
        theme.pane2Bg,
      )}
      aria-label={`${ZONE_LABELS[zone]}のツール一覧`}
    >
      <div className="border-b border-border/60 bg-background/40 px-3 py-2 backdrop-blur-[1px]">
        <p
          className={cn(
            "text-xs font-bold tracking-wide",
            theme.label,
          )}
        >
          {ZONE_LABELS[zone]}
          <span className="ml-1 font-normal text-muted-foreground">の一覧</span>
        </p>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ツールを検索…"
          className="mt-2 h-8 border-border/80 bg-background text-sm"
          aria-label="ツールを検索"
        />
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-2">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="mb-2 flex w-full items-center gap-2 rounded-md border border-dashed border-border bg-background/60 px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            <Plus className="size-4" aria-hidden />
            ＋ 新規ツール
          </button>
          <SortableContext
            items={filtered.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-0.5">
              {filtered.map((tool) => (
                <SortableToolRow
                  key={tool.id}
                  tool={tool}
                  zone={zone}
                  selected={tool.id === selectedToolId}
                  onSelect={onSelectTool}
                  actions={
                    <>
                      {otherZones.map((z) => (
                        <DropdownMenuItem
                          key={z}
                          onClick={() => onMoveToolToZone(tool.id, z)}
                        >
                          {ZONE_LABELS[z]}へ移動
                        </DropdownMenuItem>
                      ))}
                    </>
                  }
                />
              ))}
            </ul>
          </SortableContext>
          {filtered.length === 0 && (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              該当するツールがありません
            </p>
          )}
        </div>
      </ScrollArea>
      <div className="border-t border-border p-3">
        <div
          className={cn(
            "rounded-md border border-green-200 bg-green-50 px-2.5 py-2",
            "dark:border-green-900 dark:bg-green-950/40",
          )}
        >
          <p className="text-[10px] font-semibold text-green-800 dark:text-green-300">
            P2→P1 D&amp;Dで区分へ移動
          </p>
          <p className="mt-1 text-[9px] leading-snug text-green-700 dark:text-green-400/90">
            保留・プランニング中・アーカイブなど。… メニューからも可。
          </p>
        </div>
      </div>
      <AddItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="新規ツール"
        description={`${ZONE_LABELS[zone]} に追加します`}
        fieldLabel="ツール名"
        fieldId="tool-name"
        placeholder="例: 在庫管理ツール"
        onAdd={onAddTool}
      />
    </aside>
  );
}
