import { type ZoneKey } from "@/lib/pm-schema";

export const ZONE_LABELS: Record<ZoneKey, string> = {
  creating: "作成中",
  operating: "運用中",
  on_hold: "保留",
  planning: "プランニング中",
  archived: "アーカイブ",
  completed: "完成ツール",
};

export const ZONE_HINTS: Record<ZoneKey, string> = {
  creating: "実行中・編集中",
  operating: "稼働中・改良を継続",
  on_hold: "もうすぐ着手可・計画済み",
  planning: "ざっくり検討・プラン策定中",
  archived: "見送り・監視不要",
  completed: "独り立ち・使用可能",
};

/** 現行バージョン欄を出す区分（実装が進んでいるもの） */
export function showsCurrentVersion(zone: ZoneKey): boolean {
  return zone === "creating" || zone === "operating";
}

export const PRIORITY_AXIS_LABELS = {
  impact: "影響",
  urgency: "緊急",
  ease: "着手しやすさ",
} as const;
