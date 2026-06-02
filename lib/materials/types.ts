import { z } from "zod";

/** 仮想フォルダ（親子は parentId で表現。null はルート直下） */
export const materialFolderSchema = z.object({
  id: z.string(),
  parentId: z.string().nullable(),
  name: z.string().min(1),
});
export type MaterialFolder = z.infer<typeof materialFolderSchema>;

/**
 * 素材ファイルのメタデータ。実体 Blob は IndexedDB の別ストアに
 * `blobKey`（= `${candidateId}:${id}`）で保存する。
 */
export const materialFileRecordSchema = z.object({
  id: z.string(),
  folderId: z.string().nullable(),
  name: z.string().min(1),
  mimeType: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  updatedAt: z.string(),
});
export type MaterialFileRecord = z.infer<typeof materialFileRecordSchema>;

export const materialStateSchema = z.object({
  folders: z.array(materialFolderSchema),
  files: z.array(materialFileRecordSchema),
});
export type MaterialState = z.infer<typeof materialStateSchema>;
