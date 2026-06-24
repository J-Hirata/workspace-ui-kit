/**
 * v2 DB スキーマ確保 + markdown → project_details 移行。
 * fetchAllTools / seedIfEmpty の前に呼ぶ。すべて idempotent。
 */

import { sql } from "@/lib/db";

/** DDL とデータ移行を idempotent に実行 */
export async function ensureV2Schema(): Promise<void> {
  await sql`
    ALTER TABLE tools ADD COLUMN IF NOT EXISTS progress SMALLINT NOT NULL DEFAULT 1
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS project_details (
      id          TEXT PRIMARY KEY,
      tool_id     TEXT NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
      text        TEXT NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      sort_order  INTEGER NOT NULL DEFAULT 0
    )
  `;

  await sql`
    ALTER TABLE attachments ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'file'
  `;

  await sql`
    ALTER TABLE project_details
    ADD COLUMN IF NOT EXISTS deletable BOOLEAN NOT NULL DEFAULT false
  `;

  // markdown が非空で project_details が空のツールを移行
  const toolsToMigrate = await sql`
    SELECT t.id, t.markdown, t.updated_at
    FROM tools t
    WHERE t.markdown IS NOT NULL
      AND TRIM(t.markdown) <> ''
      AND NOT EXISTS (
        SELECT 1 FROM project_details pd WHERE pd.tool_id = t.id
      )
  `;

  for (const row of toolsToMigrate) {
    const toolId = row.id as string;
    const text = row.markdown as string;
    const updatedAt = row.updated_at;
    const createdAt =
      updatedAt instanceof Date
        ? updatedAt.toISOString()
        : String(updatedAt ?? new Date().toISOString());
    const detailId = `${toolId}-detail-migrated`;

    await sql`
      INSERT INTO project_details (id, tool_id, text, created_at, sort_order)
      VALUES (${detailId}, ${toolId}, ${text}, ${createdAt}, 0)
      ON CONFLICT (id) DO NOTHING
    `;
  }
}
