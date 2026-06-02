import { type Priority } from "@/lib/pm-schema";

export function getPriorityTotal(priority: Priority): number {
  return priority.impact + priority.urgency + priority.ease;
}
