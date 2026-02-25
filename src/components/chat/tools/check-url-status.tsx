import { Link2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolCall } from "./tool-call";

export function CheckUrlStatusTool({ state }: { state: string }) {
  const done = state === "output-available";
  return (
    <ToolCall
      icon={
        <Link2Icon className={cn("inline size-4", !done && "animate-pulse")} />
      }
    >
      {done ? "Link checked" : "Checking link status..."}
    </ToolCall>
  );
}
