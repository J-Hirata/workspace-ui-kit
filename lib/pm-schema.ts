/**
 * ツール PM ドメインの Zod スキーマ（第1版）。
 */

import { z } from "zod";

export const zoneKeySchema = z.enum([
  "creating",
  "operating",
  "on_hold",
  "planning",
  "archived",
]);
export type ZoneKey = z.infer<typeof zoneKeySchema>;

/** @see lib/zone-theme.ts の ZONE_ORDER（表示順の SSoT） */
export { ZONE_ORDER } from "@/lib/zone-theme";

export const prioritySchema = z.object({
  impact: z.number().int().min(1).max(5),
  urgency: z.number().int().min(1).max(5),
  ease: z.number().int().min(1).max(5),
});
export type Priority = z.infer<typeof prioritySchema>;

/** タスク予定の1行。done=true で「完了済みタスク」へ移動する */
export const taskSchema = z.object({
  id: z.string(),
  text: z.string(),
  done: z.boolean(),
});
export type Task = z.infer<typeof taskSchema>;

/**
 * P4 の添付（画像 / PDF）。
 * dataUrl は実データ（base64）。旧シードデータ等、実データの無い添付は
 * dataUrl 無しのプレースホルダとして名前だけ表示する。
 */
export const pmAttachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.string(),
  dataUrl: z.string().optional(),
});
export type PmAttachment = z.infer<typeof pmAttachmentSchema>;

export const materialsSchema = z.object({
  memo: z.string(),
  attachments: z.array(pmAttachmentSchema),
  links: z.array(z.string()),
});
export type Materials = z.infer<typeof materialsSchema>;

export const toolSchema = z.object({
  id: z.string(),
  name: z.string(),
  zone: zoneKeySchema,
  priority: prioritySchema,
  currentVersion: z.string(),
  tasks: z.array(taskSchema),
  markdown: z.string(),
  materials: materialsSchema,
});
export type Tool = z.infer<typeof toolSchema>;

export const toolsSchema = z.array(toolSchema);

export const workspaceSchema = z.object({
  name: z.string(),
  version: z.string().default("1.0.0"),
  icon: z.string(),
});

export type ToolRow = {
  id: string;
  name: string;
  priorityTotal: number;
};
