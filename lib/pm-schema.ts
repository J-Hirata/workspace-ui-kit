/**

 * ツール PM ドメインの Zod スキーマ（v2）。

 */



import { z } from "zod";



export const zoneKeySchema = z.enum([

  "creating",

  "operating",

  "on_hold",

  "planning",

  "archived",

  "completed",

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



/** 進捗段階: 1=全然 / 2=まあまあ / 3=結構進んでいる */

export const progressSchema = z.number().int().min(1).max(3);

export type Progress = z.infer<typeof progressSchema>;



/** タスク予定の1行。done=true で「完了済みタスク」へ移動する */

export const taskSchema = z.object({

  id: z.string(),

  text: z.string(),

  done: z.boolean(),

});

export type Task = z.infer<typeof taskSchema>;



/** プロジェクト詳細の1行（日付付きメモ）。新規行は上に追加 */

export const projectDetailSchema = z.object({

  id: z.string(),

  text: z.string(),

  createdAt: z.string(),

  /** true = ユーザーが「行を追加」した行のみ削除可 */
  deletable: z.boolean().default(false),

});

export type ProjectDetail = z.infer<typeof projectDetailSchema>;



/** P4 添付: file=実データ, path=ローカルパス文字列 */

export const attachmentKindSchema = z.enum(["file", "path"]);

export type AttachmentKind = z.infer<typeof attachmentKindSchema>;



export const pmAttachmentSchema = z.object({

  id: z.string(),

  name: z.string(),

  mimeType: z.string(),

  kind: attachmentKindSchema.default("file"),

  dataUrl: z.string().optional(),

  path: z.string().optional(),

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

  progress: progressSchema.default(1),

  currentVersion: z.string(),

  tasks: z.array(taskSchema),

  /** @deprecated v2 UI 移行後は projectDetails を正とする。移行期間中は両方保持 */

  markdown: z.string(),

  projectDetails: z.array(projectDetailSchema).default([]),

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

  progress: Progress;

};


