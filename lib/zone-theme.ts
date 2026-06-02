import { type ZoneKey } from "@/lib/pm-schema";

/** P1 の表示順（運用中を最上段） */
export const ZONE_ORDER: ZoneKey[] = [
  "operating",
  "creating",
  "on_hold",
  "planning",
  "archived",
];

export type ZoneTheme = {
  /** P1 非選択 */
  navIdle: string;
  /** P1 選択中 */
  navActive: string;
  /** P2 ペイン背景 */
  pane2Bg: string;
  /** P2 ヘッダー・パンくずの区分チップ */
  chip: string;
  /** 区分ラベル文字色 */
  label: string;
};

export const ZONE_THEMES: Record<ZoneKey, ZoneTheme> = {
  operating: {
    navIdle:
      "border-l-red-400 bg-red-50/70 text-red-950 hover:bg-red-50 dark:bg-red-950/30 dark:text-red-100",
    navActive:
      "border-l-red-500 bg-red-100 text-red-950 shadow-sm dark:bg-red-950/50 dark:text-red-50",
    pane2Bg: "bg-red-50/90 dark:bg-red-950/25",
    chip: "bg-red-100 text-red-900 dark:bg-red-900/60 dark:text-red-100",
    label: "text-red-800 dark:text-red-200",
  },
  creating: {
    navIdle:
      "border-l-sky-400 bg-sky-50/70 text-sky-950 hover:bg-sky-50 dark:bg-sky-950/30 dark:text-sky-100",
    navActive:
      "border-l-sky-500 bg-sky-100 text-sky-950 shadow-sm dark:bg-sky-950/50 dark:text-sky-50",
    pane2Bg: "bg-sky-50/90 dark:bg-sky-950/25",
    chip: "bg-sky-100 text-sky-900 dark:bg-sky-900/60 dark:text-sky-100",
    label: "text-sky-800 dark:text-sky-200",
  },
  on_hold: {
    navIdle:
      "border-l-orange-400 bg-orange-50/70 text-orange-950 hover:bg-orange-50 dark:bg-orange-950/30 dark:text-orange-100",
    navActive:
      "border-l-orange-500 bg-orange-100 text-orange-950 shadow-sm dark:bg-orange-950/50 dark:text-orange-50",
    pane2Bg: "bg-orange-50/90 dark:bg-orange-950/25",
    chip: "bg-orange-100 text-orange-900 dark:bg-orange-900/60 dark:text-orange-100",
    label: "text-orange-900 dark:text-orange-200",
  },
  planning: {
    navIdle:
      "border-l-emerald-400 bg-emerald-50/70 text-emerald-950 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-100",
    navActive:
      "border-l-emerald-500 bg-emerald-100 text-emerald-950 shadow-sm dark:bg-emerald-950/50 dark:text-emerald-50",
    pane2Bg: "bg-emerald-50/90 dark:bg-emerald-950/25",
    chip: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-100",
    label: "text-emerald-800 dark:text-emerald-200",
  },
  archived: {
    navIdle:
      "border-l-slate-400 bg-slate-100/80 text-slate-800 hover:bg-slate-100 dark:bg-slate-800/40 dark:text-slate-200",
    navActive:
      "border-l-slate-500 bg-slate-200/90 text-slate-900 shadow-sm dark:bg-slate-800/70 dark:text-slate-100",
    pane2Bg: "bg-slate-100/90 dark:bg-slate-900/40",
    chip: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100",
    label: "text-slate-700 dark:text-slate-300",
  },
};

export function getZoneTheme(zone: ZoneKey): ZoneTheme {
  return ZONE_THEMES[zone];
}
