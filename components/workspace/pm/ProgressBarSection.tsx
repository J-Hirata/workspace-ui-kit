"use client";

import { cn } from "@/lib/utils";
import { type Progress } from "@/lib/pm-schema";
import { getProgressTier } from "@/lib/progress-tier";

type ProgressBarSectionProps = {
  progress: Progress;
  onChange: (progress: Progress) => void;
};

/** P4 用: 進捗 1/2/3 をクリックで変更する大きめバー */
export function ProgressBarSection({
  progress,
  onChange,
}: ProgressBarSectionProps) {
  const tier = getProgressTier(progress);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {([1, 2, 3] as const).map((step) => {
          const active = step <= progress;
          const selected = step === progress;
          return (
            <button
              key={step}
              type="button"
              onClick={() => onChange(step)}
              aria-label={`進捗 ${step}/3 に設定`}
              aria-pressed={selected}
              className={cn(
                "flex h-9 flex-1 flex-col items-center justify-center rounded-md border text-xs font-semibold tabular-nums transition-colors",
                "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                active ? tier.fill : "bg-muted/40",
                active ? "border-transparent text-white" : "border-border text-muted-foreground",
                selected && "ring-2 ring-ring ring-offset-1",
              )}
            >
              {step}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex flex-1 items-center gap-1">
          {([1, 2, 3] as const).map((step) => (
            <span
              key={step}
              aria-hidden
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                step <= progress ? tier.fill : "bg-muted-foreground/20",
              )}
            />
          ))}
        </div>
        <span className={cn("shrink-0 text-xs font-medium tabular-nums", tier.text)}>
          {progress}/3
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground">{tier.label}</p>
    </div>
  );
}
