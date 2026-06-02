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

export const materialsSchema = z.object({
  memo: z.string(),
  images: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      url: z.string().optional(),
    }),
  ),
  links: z.array(z.string()),
});
export type Materials = z.infer<typeof materialsSchema>;

export const toolSchema = z.object({
  id: z.string(),
  name: z.string(),
  zone: zoneKeySchema,
  priority: prioritySchema,
  currentVersion: z.string(),
  nextStep: z.string(),
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
