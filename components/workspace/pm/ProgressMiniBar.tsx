"use client";

import { cn } from "@/lib/utils";
import { type Progress } from "@/lib/pm-schema";

type ProgressMiniBarProps = {
  progress: Progress;
  className?: string;
};

/** 段階ごとの色: 1=青 / 2=黄 / 3=オレンジ（星バッジの帯に合わせる） */
function getProgressTier(progress: Progress) {
  if (progress >= 3) {
    return {
      fill: "bg-orange-500 dark:bg-orange-400",
      text: "text-orange-800 dark:text-orange-200",
    };
  }
  if (progress >= 2) {
    return {
      fill: "bg-amber-400 dark:bg-amber-300",
      text: "text-amber-900 dark:text-amber-100",
    };
  }
  return {
    fill: "bg-sky-400 dark:bg-sky-400",
    text: "text-sky-900 dark:text-sky-100",
  };
}

/** P2 一覧用: 進捗 1/2/3 の小さなバー（表示のみ。変更 UI は Phase 4） */
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
      <span
        className={cn(
          "text-[9px] font-medium tabular-nums",
          tier.text,
        )}
      >
        {progress}/3
      </span>
    </span>
  );
}
