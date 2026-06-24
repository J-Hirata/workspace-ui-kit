import { type Progress } from "@/lib/pm-schema";

/** 進捗 1=青 / 2=黄 / 3=オレンジ */
export function getProgressTier(progress: Progress) {
  if (progress >= 3) {
    return {
      fill: "bg-orange-500 dark:bg-orange-400",
      text: "text-orange-800 dark:text-orange-200",
      label: "結構進んでいる",
    };
  }
  if (progress >= 2) {
    return {
      fill: "bg-amber-400 dark:bg-amber-300",
      text: "text-amber-900 dark:text-amber-100",
      label: "まあまあ進んでいる",
    };
  }
  return {
    fill: "bg-sky-400 dark:bg-sky-400",
    text: "text-sky-900 dark:text-sky-100",
    label: "全然進んでいない",
  };
}
