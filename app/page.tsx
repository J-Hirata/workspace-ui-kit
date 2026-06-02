import { Workspace } from "@/components/workspace/Workspace";
import toolsData from "@/data/tools.json";
import workspaceData from "@/data/workspace.json";
import { toolsSchema, workspaceSchema } from "@/lib/pm-schema";

export default function Page() {
  const toolsResult = toolsSchema.safeParse(toolsData);
  const wsResult = workspaceSchema.safeParse(workspaceData);

  if (!toolsResult.success || !wsResult.success) {
    const errors = [
      !toolsResult.success &&
        `tools.json: ${toolsResult.error.issues[0]?.message}`,
      !wsResult.success &&
        `workspace.json: ${wsResult.error.issues[0]?.message}`,
    ].filter(Boolean);
    throw new Error(`データの形式が正しくありません:\n${errors.join("\n")}`);
  }

  return (
    <Workspace initialTools={toolsResult.data} workspace={wsResult.data} />
  );
}
