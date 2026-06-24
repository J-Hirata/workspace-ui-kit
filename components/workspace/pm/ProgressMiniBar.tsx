"use client";

import { cn } from "@/lib/utils";
import { type Progress } from "@/lib/pm-schema";

type ProgressMiniBarProps = {
  progress: Progress;
  className?: string;
};

/** P2 一覧用: 進捗 1/2/3 の小さなバー */
export function ProgressMiniBar({ progress, className }: ProgressMiniBarProps) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center gap-1", className)}
      aria-label={`進捗 ${progress}/3`}
    >
      <span className="inline-flex items-center gap-0.5">
        {([1, 2, 3] as const).map((step) => (
          <span
            key={step}
            aria-hidden
            className={cn(
              "h-1.5 w-2 rounded-full transition-colors",
              step <= progress
                ? "bg-emerald-500 dark:bg-emerald-400"
                : "bg-muted-foreground/20",
            )}
          />
        ))}
      </span>
      <span className="text-[9px] font-medium tabular-nums text-muted-foreground">
        {progress}/3
      </span>
    </span>
  );
}
