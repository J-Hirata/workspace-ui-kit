/**
 * Pane 4「素材ライブラリ」の永続化方針（教材用の明示的決定）。
 *
 * - **現行**: `indexeddb` のみ。同一オリジン・同一ブラウザ内で候補者ごとに
 *   フォルダ階層とファイル Blob を保持する。サーバー不要で `npm run dev` でも動く。
 * - **将来**: 本番で共有・バックアップが必要なら `server`（アップロード API +
 *   オブジェクトストレージ + DB）へ差し替え。この定数を切り替え起点にできるよう export。
 */
export const MATERIAL_PERSISTENCE_MODE = "indexeddb" as const;

export type MaterialPersistenceMode =
  | typeof MATERIAL_PERSISTENCE_MODE
  | "server";
