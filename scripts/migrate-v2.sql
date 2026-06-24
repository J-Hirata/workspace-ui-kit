-- v2 UI 用 DB マイグレーション（Neon SQL Editor で1文ずつ実行可）
-- 既存データは削除しない additive 変更のみ

-- 1. tools 表に進捗段階
ALTER TABLE tools ADD COLUMN IF NOT EXISTS progress SMALLINT NOT NULL DEFAULT 1;

-- 2. プロジェクト詳細行（markdown の後継）
CREATE TABLE IF NOT EXISTS project_details (
  id          TEXT PRIMARY KEY,
  tool_id     TEXT NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  text        TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  sort_order  INTEGER NOT NULL DEFAULT 0
);

-- 3. attachments に種別列
ALTER TABLE attachments ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'file';
