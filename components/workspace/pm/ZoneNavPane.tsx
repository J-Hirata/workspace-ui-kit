"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { type ZoneKey } from "@/lib/pm-schema";
import { ZONE_HINTS, ZONE_LABELS } from "@/lib/pm-labels";
import { ZONE_ORDER, getZoneTheme } from "@/lib/zone-theme";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Pane1Toggle } from "@/components/workspace/Pane1Toggle";

type ZoneNavPaneProps = {
  workspaceName: string;
  workspaceVersion: string;
  selectedZone: ZoneKey;
  counts: Record<ZoneKey, number>;
  onSelectZone: (zone: ZoneKey) => void;
};

function ZoneDropTarget({
  zone,
  selected,
  count,
  hint,
  onSelect,
}: {
  zone: ZoneKey;
  selected: boolean;
  count: number;
  hint: string;
  onSelect: () => void;
}) {
  const theme = getZoneTheme(zone);
  const { setNodeRef, isOver } = useDroppable({
    id: `zone:${zone}`,
    data: { zone },
  });

  return (
    <SidebarMenuItem ref={setNodeRef}>
      <SidebarMenuButton
        isActive={selected}
        onClick={onSelect}
        className={cn(
          "h-auto flex-col items-start gap-0.5 rounded-md border-l-[3px] py-2.5 transition-colors",
          "hover:bg-transparent data-[active=true]:bg-transparent",
          selected ? theme.navActive : theme.navIdle,
          isOver && "ring-2 ring-primary/30 ring-offset-1",
        )}
      >
        <span className="flex w-full items-center gap-2">
          <span className={cn("truncate font-bold", theme.label)}>
            {ZONE_LABELS[zone]}
          </span>
          <span
            className={cn(
              "ml-auto text-xs font-semibold tabular-nums opacity-80",
              theme.label,
            )}
          >
            {count}
          </span>
        </span>
        <span className="text-[10px] font-normal leading-tight opacity-75">
          {hint}
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function ZoneNavPane({
  workspaceName,
  workspaceVersion,
  selectedZone,
  counts,
  onSelectZone,
}: ZoneNavPaneProps) {
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border [&_[data-slot=sidebar-container]]:bg-sidebar"
    >
      <SidebarHeader className="border-b border-sidebar-border p-0">
        <div className="flex h-14 items-center justify-between gap-2 px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[state=expanded]:px-5">
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <h2 className="truncate text-sm font-bold text-sidebar-foreground">
              {workspaceName}
            </h2>
            <p className="text-[10px] tabular-nums text-muted-foreground">
              v{workspaceVersion}
            </p>
          </div>
          <Pane1Toggle />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-1 py-3 group-data-[collapsible=icon]:hidden">
        <SidebarGroup className="px-1">
          <SidebarGroupLabel className="px-2 text-xs font-semibold tracking-wide text-sidebar-foreground/70 uppercase">
            区分
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {ZONE_ORDER.map((zone) => (
                <ZoneDropTarget
                  key={zone}
                  zone={zone}
                  selected={selectedZone === zone}
                  count={counts[zone]}
                  hint={ZONE_HINTS[zone]}
                  onSelect={() => onSelectZone(zone)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
