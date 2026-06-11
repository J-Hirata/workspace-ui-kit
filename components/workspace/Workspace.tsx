"use client";

/**
 * ツール PM 用 4 ペインワークスペース（第1版）。
 * 設計正: four-pane-planning/docs/workspace-ui-wireframe.svg
 */

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import {
  type Task,
  type Tool,
  type ToolRow,
  type ZoneKey,
} from "@/lib/pm-schema";
import { getPriorityTotal } from "@/lib/computed/priority";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ZoneNavPane } from "@/components/workspace/pm/ZoneNavPane";
import { ToolListPane } from "@/components/workspace/pm/ToolListPane";
import { ToolDetailPane } from "@/components/workspace/pm/ToolDetailPane";
import { ToolMaterialsPane } from "@/components/workspace/pm/ToolMaterialsPane";
import { PmGlobalHeader } from "@/components/workspace/pm/PmGlobalHeader";

type WorkspaceProps = {
  initialTools: Tool[];
  workspace: { name: string; version: string; icon: string };
};

/** 新規ツールはタスク予定3行（空）で開始する */
function createEmptyTasks(toolId: string): Task[] {
  return [1, 2, 3].map((n) => ({
    id: `${toolId}-task${n}`,
    text: "",
    done: false,
  }));
}

function createMinimalTool(name: string, zone: ZoneKey): Tool {
  const id = `t-${Date.now()}`;
  return {
    id,
    name,
    zone,
    priority: { impact: 3, urgency: 3, ease: 3 },
    currentVersion: "",
    tasks: createEmptyTasks(id),
    markdown: "",
    materials: { memo: "", attachments: [], links: [] },
  };
}

export function Workspace({ initialTools, workspace }: WorkspaceProps) {
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [selectedZone, setSelectedZone] = useState<ZoneKey>("creating");
  const [selectedToolId, setSelectedToolId] = useState<string>(
    initialTools.find((t) => t.zone === "creating")?.id ??
      initialTools[0]?.id ??
      "",
  );
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const counts = useMemo(() => {
    const c: Record<ZoneKey, number> = {
      creating: 0,
      operating: 0,
      on_hold: 0,
      planning: 0,
      archived: 0,
    };
    for (const t of tools) c[t.zone]++;
    return c;
  }, [tools]);

  const zoneTools: ToolRow[] = useMemo(
    () =>
      tools
        .filter((t) => t.zone === selectedZone)
        .map((t) => ({
          id: t.id,
          name: t.name,
          priorityTotal: getPriorityTotal(t.priority),
        })),
    [tools, selectedZone],
  );

  const activeTool =
    tools.find((t) => t.id === selectedToolId) ??
    tools.find((t) => t.zone === selectedZone) ??
    tools[0];

  const updateTool = useCallback((id: string, patch: Partial<Tool>) => {
    setTools((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  }, []);

  const selectZone = useCallback(
    (zone: ZoneKey) => {
      setSelectedZone(zone);
      setSelectedToolId((prev) => {
        const current = tools.find((t) => t.id === prev);
        if (current?.zone === zone) return prev;
        return tools.find((t) => t.zone === zone)?.id ?? prev;
      });
    },
    [tools],
  );

  const moveToolToZone = useCallback((id: string, zone: ZoneKey) => {
    setTools((prev) =>
      prev.map((t) => (t.id === id ? { ...t, zone } : t)),
    );
    setSelectedZone(zone);
    setSelectedToolId(id);
  }, []);

  const addTool = useCallback(
    (name: string) => {
      const tool = createMinimalTool(name, selectedZone);
      setTools((prev) => [...prev, tool]);
      setSelectedToolId(tool.id);
    },
    [selectedZone],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null);
      const { active, over } = event;
      if (!over) return;

      const toolId = String(active.id);
      const overId = String(over.id);

      if (overId.startsWith("zone:")) {
        const zone = overId.replace("zone:", "") as ZoneKey;
        moveToolToZone(toolId, zone);
        return;
      }

      const zoneToolIds = tools
        .filter((t) => t.zone === selectedZone)
        .map((t) => t.id);
      const oldIndex = zoneToolIds.indexOf(toolId);
      const newIndex = zoneToolIds.indexOf(overId);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;

      const reordered = arrayMove(zoneToolIds, oldIndex, newIndex);
      setTools((prev) => {
        const others = prev.filter((t) => t.zone !== selectedZone);
        const inZone = reordered
          .map((id) => prev.find((t) => t.id === id))
          .filter((t): t is Tool => !!t);
        return [...others, ...inZone];
      });
    },
    [moveToolToZone, selectedZone, tools],
  );

  const activeDragTool = activeDragId
    ? tools.find((t) => t.id === activeDragId)
    : null;

  if (!activeTool) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        ツールデータがありません。data/tools.json を確認してください。
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SidebarProvider
        defaultOpen
        className="h-screen w-full overflow-hidden bg-background text-foreground"
      >
        <ZoneNavPane
          workspaceName={workspace.name}
          workspaceVersion={workspace.version}
          selectedZone={selectedZone}
          counts={counts}
          onSelectZone={selectZone}
        />
        <SidebarInset className="flex min-w-0 flex-col bg-background">
          <PmGlobalHeader zone={selectedZone} toolName={activeTool.name} />
          <div className="flex min-h-0 flex-1 overflow-hidden">
            <ToolListPane
              zone={selectedZone}
              tools={zoneTools}
              selectedToolId={selectedToolId}
              onSelectTool={setSelectedToolId}
              onAddTool={addTool}
              onMoveToolToZone={moveToolToZone}
            />
            <div className="min-w-0 flex-1 overflow-hidden">
              <ToolDetailPane
                tool={activeTool}
                onUpdatePriority={(axis, value) =>
                  updateTool(activeTool.id, {
                    priority: { ...activeTool.priority, [axis]: value },
                  })
                }
                onUpdateField={(field, value) =>
                  updateTool(activeTool.id, { [field]: value })
                }
                onUpdateTasks={(tasks) => updateTool(activeTool.id, { tasks })}
              />
            </div>
            <ToolMaterialsPane
              toolId={activeTool.id}
              materials={activeTool.materials}
              onUpdateMaterials={(patch) =>
                updateTool(activeTool.id, {
                  materials: { ...activeTool.materials, ...patch },
                })
              }
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
      <DragOverlay>
        {activeDragTool ? (
          <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-lg">
            {activeDragTool.name}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
