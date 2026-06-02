"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

type PriorityStarBadgeProps = {
  total: number;
  selected?: boolean;
};

/** P2 右端: 星形の中に優先スコア合計（3〜15）を表示 */
export function PriorityStarBadge({ total, selected }: PriorityStarBadgeProps) {
  const twoDigits = total >= 10;

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: twoDigits ? 32 : 28, height: twoDigits ? 32 : 28 }}
      aria-label={`優先スコア合計 ${total}`}
    >
      <Star
        aria-hidden
        className={cn(
          "absolute inset-0 size-full",
          selected
            ? "fill-amber-400 text-amber-400"
            : "fill-amber-300 text-amber-300 dark:fill-amber-500/90 dark:text-amber-500/90",
        )}
        strokeWidth={1.25}
      />
      <span
        className={cn(
          "relative z-10 font-bold leading-none tabular-nums text-amber-950",
          twoDigits ? "text-[9px]" : "text-[10px]",
          selected && "text-amber-950",
        )}
      >
        {total}
      </span>
    </span>
  );
}
