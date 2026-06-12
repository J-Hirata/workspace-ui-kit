import { NextRequest, NextResponse } from "next/server";
import { fetchAllTools, seedIfEmpty, upsertTool } from "@/lib/db-tools";
import { toolSchema, toolsSchema } from "@/lib/pm-schema";

export async function GET() {
  try {
    await seedIfEmpty();
    const tools = await fetchAllTools();
    return NextResponse.json({ tools });
  } catch (err) {
    console.error("[GET /api/tools]", err);
    return NextResponse.json(
      { error: "DB 読み込みに失敗しました" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    // 1件の場合: { tool: Tool }
    if (body.tool !== undefined) {
      const parsed = toolSchema.safeParse(body.tool);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "不正なデータ形式です", details: parsed.error.issues },
          { status: 400 },
        );
      }
      await upsertTool(parsed.data);
      return NextResponse.json({ ok: true });
    }

    // 複数の場合: { tools: Tool[] }
    if (body.tools !== undefined) {
      const parsed = toolsSchema.safeParse(body.tools);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "不正なデータ形式です", details: parsed.error.issues },
          { status: 400 },
        );
      }
      for (const tool of parsed.data) {
        await upsertTool(tool);
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "tool または tools が必要です" },
      { status: 400 },
    );
  } catch (err) {
    console.error("[PUT /api/tools]", err);
    return NextResponse.json(
      { error: "DB 書き込みに失敗しました" },
      { status: 500 },
    );
  }
}
