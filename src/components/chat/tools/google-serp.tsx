import { TrendingUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolCall } from "./tool-call";

export function GoogleSerpTool({ state }: { state: string }) {
  const done = state === "output-available";
  return (
    <ToolCall
      icon={
        <TrendingUpIcon
          className={cn("inline size-4", !done && "animate-pulse")}
        />
      }
    >
      {done ? "Search rankings retrieved" : "Checking search rankings..."}
    </ToolCall>
  );
}
