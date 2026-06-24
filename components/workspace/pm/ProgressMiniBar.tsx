"use client";

import { cn } from "@/lib/utils";
import { type Progress } from "@/lib/pm-schema";
import { getProgressTier } from "@/lib/progress-tier";

type ProgressMiniBarProps = {
  progress: Progress;
  className?: string;
};

/** P2 一覧用: 進捗 1/2/3 の小さなバー（表示のみ） */
export function ProgressMiniBar({ progress, className }: ProgressMiniBarProps) {
  const tier = getProgressTier(progress);

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
              step <= progress ? tier.fill : "bg-muted-foreground/20",
            )}
          />
        ))}
      </span>
      <span className={cn("text-[9px] font-medium tabular-nums", tier.text)}>
        {progress}/3
      </span>
    </span>
  );
}
