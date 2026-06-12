import { Workspace } from "@/components/workspace/Workspace";
import { fetchAllTools, seedIfEmpty } from "@/lib/db-tools";
import workspaceData from "@/data/workspace.json";
import toolsData from "@/data/tools.json";
import { toolsSchema, workspaceSchema } from "@/lib/pm-schema";

export default async function Page() {
  const wsResult = workspaceSchema.safeParse(workspaceData);
  if (!wsResult.success) {
    throw new Error(
      `workspace.json の形式が正しくありません: ${wsResult.error.issues[0]?.message}`,
    );
  }

  let initialTools;

  if (process.env.DATABASE_URL) {
    // DB が利用可能: シードして読み込む
    await seedIfEmpty();
    initialTools = await fetchAllTools();
  } else {
    // DB なし（ローカル .env.local 未設定時）: JSON フォールバック
    const toolsResult = toolsSchema.safeParse(toolsData);
    if (!toolsResult.success) {
      throw new Error(
        `tools.json の形式が正しくありません: ${toolsResult.error.issues[0]?.message}`,
      );
    }
    initialTools = toolsResult.data;
  }

  return <Workspace initialTools={initialTools} workspace={wsResult.data} />;
}
