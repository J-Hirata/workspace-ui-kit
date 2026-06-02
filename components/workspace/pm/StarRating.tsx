"use client";

import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
  label: string;
};

export function StarRating({ value, onChange, label }: StarRatingProps) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div
        className="flex items-center gap-0.5"
        role="group"
        aria-label={`${label}（${value} / 5）`}
      >
        {Array.from({ length: 5 }, (_, i) => {
          const star = i + 1;
          const filled = star <= value;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className={cn(
                "rounded px-0.5 text-base leading-none transition-colors",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                filled
                  ? "text-amber-500 hover:text-amber-600"
                  : "text-muted-foreground/40 hover:text-amber-400/80",
              )}
              aria-label={`${label} ${star}点`}
              aria-pressed={filled}
            >
              {filled ? "★" : "☆"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
