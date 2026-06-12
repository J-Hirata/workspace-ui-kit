/**
 * DB ↔ Tool 型の変換・読み書きレイヤ。
 * tools / tasks / attachments の3表を扱う。
 */

import { sql } from "@/lib/db";
import { type Tool } from "@/lib/pm-schema";
import toolsSeed from "@/data/tools.json";

// ---------- 読み込み ----------

export async function fetchAllTools(): Promise<Tool[]> {
  const toolRows = await sql`
    SELECT id, name, zone,
           impact, urgency, ease,
           current_version, markdown, memo, links, updated_at
    FROM tools
    ORDER BY updated_at ASC
  `;

  if (toolRows.length === 0) return [];

  const ids = toolRows.map((r) => r.id as string);

  const taskRows = await sql`
    SELECT id, tool_id, text, done, sort_order
    FROM tasks
    WHERE tool_id = ANY(${ids})
    ORDER BY sort_order ASC
  `;

  const attRows = await sql`
    SELECT id, tool_id, name, mime_type, data_url
    FROM attachments
    WHERE tool_id = ANY(${ids})
  `;

  return toolRows.map((r) => {
    const toolId = r.id as string;
    const tasks = taskRows
      .filter((t) => t.tool_id === toolId)
      .map((t) => ({
        id: t.id as string,
        text: t.text as string,
        done: t.done as boolean,
      }));

    const attachments = attRows
      .filter((a) => a.tool_id === toolId)
      .map((a) => ({
        id: a.id as string,
        name: a.name as string,
        mimeType: a.mime_type as string,
        dataUrl: (a.data_url as string | null) ?? undefined,
      }));

    const links: string[] = Array.isArray(r.links) ? r.links : [];

    return {
      id: toolId,
      name: r.name as string,
      zone: r.zone as Tool["zone"],
      priority: {
        impact: r.impact as number,
        urgency: r.urgency as number,
        ease: r.ease as number,
      },
      currentVersion: r.current_version as string,
      markdown: r.markdown as string,
      materials: {
        memo: r.memo as string,
        attachments,
        links,
      },
      tasks,
    } satisfies Tool;
  });
}

// ---------- 書き込み ----------

export async function upsertTool(tool: Tool): Promise<void> {
  const { id, name, zone, priority, currentVersion, markdown, materials } =
    tool;

  await sql`
    INSERT INTO tools
      (id, name, zone, impact, urgency, ease,
       current_version, markdown, memo, links, updated_at)
    VALUES
      (${id}, ${name}, ${zone},
       ${priority.impact}, ${priority.urgency}, ${priority.ease},
       ${currentVersion}, ${markdown}, ${materials.memo},
       ${JSON.stringify(materials.links)}, now())
    ON CONFLICT (id) DO UPDATE SET
      name            = EXCLUDED.name,
      zone            = EXCLUDED.zone,
      impact          = EXCLUDED.impact,
      urgency         = EXCLUDED.urgency,
      ease            = EXCLUDED.ease,
      current_version = EXCLUDED.current_version,
      markdown        = EXCLUDED.markdown,
      memo            = EXCLUDED.memo,
      links           = EXCLUDED.links,
      updated_at      = now()
  `;

  // tasks を差し替え（削除 → 一括 INSERT）
  await sql`DELETE FROM tasks WHERE tool_id = ${id}`;
  if (tool.tasks.length > 0) {
    for (let i = 0; i < tool.tasks.length; i++) {
      const t = tool.tasks[i];
      await sql`
        INSERT INTO tasks (id, tool_id, text, done, sort_order)
        VALUES (${t.id}, ${id}, ${t.text}, ${t.done}, ${i})
      `;
    }
  }

  // attachments を差し替え（削除 → 一括 INSERT）
  await sql`DELETE FROM attachments WHERE tool_id = ${id}`;
  for (const att of materials.attachments) {
    await sql`
      INSERT INTO attachments (id, tool_id, name, mime_type, data_url)
      VALUES (${att.id}, ${id}, ${att.name}, ${att.mimeType}, ${att.dataUrl ?? null})
    `;
  }
}

// ---------- 初回シード ----------

/**
 * tools 表が空のとき tools.json を一括投入する。
 * ページロード時に1回だけ呼ぶ。
 */
export async function seedIfEmpty(): Promise<void> {
  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM tools`;
  if ((count as number) > 0) return;

  for (const tool of toolsSeed as Tool[]) {
    await upsertTool(tool);
  }
}
