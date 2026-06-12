import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "id が必要です" }, { status: 400 });
  }
  try {
    await sql`DELETE FROM tools WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/tools/[id]]", err);
    return NextResponse.json(
      { error: "DB 削除に失敗しました" },
      { status: 500 },
    );
  }
}
