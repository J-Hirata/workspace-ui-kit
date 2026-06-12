"use client";

import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { type ZoneKey } from "@/lib/pm-schema";
import { ZONE_LABELS } from "@/lib/pm-labels";
import { getZoneTheme } from "@/lib/zone-theme";

type SaveStatus = "idle" | "saving" | "saved" | "error";

type PmGlobalHeaderProps = {
  zone: ZoneKey;
  toolName: string;
  saveStatus?: SaveStatus;
};

const SAVE_LABELS: Record<SaveStatus, string> = {
  idle: "",
  saving: "保存中…",
  saved: "保存済み",
  error: "保存失敗",
};

export function PmGlobalHeader({
  zone,
  toolName,
  saveStatus = "idle",
}: PmGlobalHeaderProps) {
  const theme = getZoneTheme(zone);
  const zoneLabel = ZONE_LABELS[zone];
  const saveLabel = SAVE_LABELS[saveStatus];

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
      <nav
        className="flex min-w-0 flex-1 items-center gap-2 text-sm"
        aria-label="現在地"
      >
        <span
          className={cn(
            "shrink-0 rounded-md px-2.5 py-1 text-xs font-bold",
            theme.chip,
          )}
        >
          {zoneLabel}
        </span>
        <ChevronRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <span className="min-w-0 truncate font-semibold text-foreground">
          {toolName}
        </span>
      </nav>
      {saveLabel && (
        <span
          className={cn(
            "shrink-0 text-xs",
            saveStatus === "error"
              ? "text-destructive"
              : "text-muted-foreground",
          )}
        >
          {saveLabel}
        </span>
      )}
    </header>
  );
}
