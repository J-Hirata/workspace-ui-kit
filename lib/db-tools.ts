/**
 * DB ↔ Tool 型の変換・読み書きレイヤ。
 * tools / tasks / attachments / project_details を扱う。
 */

import { sql } from "@/lib/db";
import { ensureV2Schema } from "@/lib/db-migrate";
import { type Tool, toolSchema } from "@/lib/pm-schema";
import toolsSeed from "@/data/tools.json";

// ---------- 読み込み ----------

export async function fetchAllTools(): Promise<Tool[]> {
  await ensureV2Schema();

  const toolRows = await sql`
    SELECT id, name, zone,
           impact, urgency, ease,
           progress,
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
    SELECT id, tool_id, name, mime_type, data_url, kind
    FROM attachments
    WHERE tool_id = ANY(${ids})
  `;

  const detailRows = await sql`
    SELECT id, tool_id, text, created_at, sort_order
    FROM project_details
    WHERE tool_id = ANY(${ids})
    ORDER BY sort_order ASC
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
      .map((a) => {
        const kind = (a.kind as string) === "path" ? "path" : "file";
        const dataUrl = (a.data_url as string | null) ?? undefined;
        return {
          id: a.id as string,
          name: a.name as string,
          mimeType: a.mime_type as string,
          kind: kind as "file" | "path",
          dataUrl: kind === "file" ? dataUrl : undefined,
          path: kind === "path" ? dataUrl : undefined,
        };
      });

    const projectDetails = detailRows
      .filter((d) => d.tool_id === toolId)
      .map((d) => ({
        id: d.id as string,
        text: d.text as string,
        createdAt: new Date(d.created_at as string).toISOString(),
      }));

    const links: string[] = Array.isArray(r.links) ? r.links : [];
    const progress = (r.progress as number | null) ?? 1;

    return toolSchema.parse({
      id: toolId,
      name: r.name as string,
      zone: r.zone as Tool["zone"],
      priority: {
        impact: r.impact as number,
        urgency: r.urgency as number,
        ease: r.ease as number,
      },
      progress,
      currentVersion: r.current_version as string,
      markdown: r.markdown as string,
      projectDetails,
      materials: {
        memo: r.memo as string,
        attachments,
        links,
      },
      tasks,
    });
  });
}

// ---------- 書き込み ----------

export async function upsertTool(tool: Tool): Promise<void> {
  await ensureV2Schema();

  const parsed = toolSchema.parse(tool);
  const { id, name, zone, priority, progress, currentVersion, markdown, materials } =
    parsed;

  await sql`
    INSERT INTO tools
      (id, name, zone, impact, urgency, ease, progress,
       current_version, markdown, memo, links, updated_at)
    VALUES
      (${id}, ${name}, ${zone},
       ${priority.impact}, ${priority.urgency}, ${priority.ease}, ${progress},
       ${currentVersion}, ${markdown}, ${materials.memo},
       ${JSON.stringify(materials.links)}, now())
    ON CONFLICT (id) DO UPDATE SET
      name            = EXCLUDED.name,
      zone            = EXCLUDED.zone,
      impact          = EXCLUDED.impact,
      urgency         = EXCLUDED.urgency,
      ease            = EXCLUDED.ease,
      progress        = EXCLUDED.progress,
      current_version = EXCLUDED.current_version,
      markdown        = EXCLUDED.markdown,
      memo            = EXCLUDED.memo,
      links           = EXCLUDED.links,
      updated_at      = now()
  `;

  await sql`DELETE FROM tasks WHERE tool_id = ${id}`;
  for (let i = 0; i < parsed.tasks.length; i++) {
    const t = parsed.tasks[i];
    await sql`
      INSERT INTO tasks (id, tool_id, text, done, sort_order)
      VALUES (${t.id}, ${id}, ${t.text}, ${t.done}, ${i})
    `;
  }

  await sql`DELETE FROM attachments WHERE tool_id = ${id}`;
  for (const att of materials.attachments) {
    const kind = att.kind ?? "file";
    const storedUrl =
      kind === "path" ? (att.path ?? att.dataUrl ?? null) : (att.dataUrl ?? null);
    await sql`
      INSERT INTO attachments (id, tool_id, name, mime_type, data_url, kind)
      VALUES (${att.id}, ${id}, ${att.name}, ${att.mimeType}, ${storedUrl}, ${kind})
    `;
  }

  await sql`DELETE FROM project_details WHERE tool_id = ${id}`;
  for (let i = 0; i < parsed.projectDetails.length; i++) {
    const d = parsed.projectDetails[i];
    await sql`
      INSERT INTO project_details (id, tool_id, text, created_at, sort_order)
      VALUES (${d.id}, ${id}, ${d.text}, ${d.createdAt}, ${i})
    `;
  }
}

// ---------- 初回シード ----------

/** tools 表が空のとき tools.json を一括投入する */
export async function seedIfEmpty(): Promise<void> {
  await ensureV2Schema();

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM tools`;
  if ((count as number) > 0) return;

  for (const raw of toolsSeed) {
    const tool = toolSchema.parse({
      ...raw,
      progress: 1,
      projectDetails: [],
      materials: {
        ...(raw as Tool).materials,
        attachments: ((raw as Tool).materials.attachments ?? []).map((a) => ({
          ...a,
          kind: "file" as const,
        })),
      },
    });
    await upsertTool(tool);
  }
}
