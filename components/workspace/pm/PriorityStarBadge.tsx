"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

type PriorityStarBadgeProps = {
  total: number;
  selected?: boolean;
};

/**
 * スコア帯ごとの星の色（合計は3〜15）:
 *   11〜15 … 濃い金色（赤み寄り）= 最優先がひと目で分かる
 *    6〜10 … 薄い黄色 = 通常
 *    3〜 5 … 青系の薄色 = 低優先
 */
function getTier(total: number) {
  if (total >= 11) {
    return {
      star: "fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400",
      num: "text-amber-950",
    };
  }
  if (total >= 6) {
    return {
      star: "fill-amber-200 text-amber-200 dark:fill-amber-300/80 dark:text-amber-300/80",
      num: "text-amber-900",
    };
  }
  return {
    star: "fill-sky-200 text-sky-200 dark:fill-sky-400/60 dark:text-sky-400/60",
    num: "text-sky-900",
  };
}

/** P2 右端: 星形の中に優先スコア合計（3〜15）を表示 */
export function PriorityStarBadge({ total }: PriorityStarBadgeProps) {
  const twoDigits = total >= 10;
  const tier = getTier(total);

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: twoDigits ? 32 : 28, height: twoDigits ? 32 : 28 }}
      aria-label={`優先スコア合計 ${total}`}
    >
      <Star
        aria-hidden
        className={cn("absolute inset-0 size-full", tier.star)}
        strokeWidth={1.25}
      />
      <span
        className={cn(
          "relative z-10 font-bold leading-none tabular-nums",
          twoDigits ? "text-[9px]" : "text-[10px]",
          tier.num,
        )}
      >
        {total}
      </span>
    </span>
  );
}
