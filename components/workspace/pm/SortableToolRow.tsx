"use client";

import { type CSSProperties, type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { type ToolRow, type ZoneKey } from "@/lib/pm-schema";
import { PriorityStarBadge } from "@/components/workspace/pm/PriorityStarBadge";
import { ProgressMiniBar } from "@/components/workspace/pm/ProgressMiniBar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SortableToolRow({
  tool,
  zone,
  selected,
  onSelect,
  actions,
}: {
  tool: ToolRow;
  zone: ZoneKey;
  selected: boolean;
  onSelect: (id: string) => void;
  actions: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: tool.id,
    data: { containerId: zone, name: tool.name },
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/tool relative",
        isDragging && "pointer-events-none opacity-50",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(tool.id)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2.5 py-2.5 text-left transition-colors",
          "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          selected
            ? "bg-accent text-accent-foreground"
            : "text-foreground hover:bg-muted",
        )}
      >
        <span
          {...attributes}
          {...listeners}
          aria-label={`${tool.name} の並び替え`}
          className={cn(
            "flex size-5 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground",
            "opacity-0 transition-opacity group-focus-within/tool:opacity-100 group-hover/tool:opacity-100",
            "hover:text-foreground active:cursor-grabbing",
            "outline-none focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical aria-hidden className="size-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm">{tool.name}</span>
        <ProgressMiniBar progress={tool.progress} />
        <PriorityStarBadge total={tool.priorityTotal} selected={selected} />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className={cn(
                "absolute top-1/2 right-1 -translate-y-1/2",
                "opacity-0 group-focus-within/tool:opacity-100 group-hover/tool:opacity-100",
                "transition-opacity",
                "text-muted-foreground hover:text-foreground",
              )}
              aria-label={`${tool.name} の操作`}
            >
              <MoreHorizontal />
            </Button>
          }
        />
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuGroup>{actions}</DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
