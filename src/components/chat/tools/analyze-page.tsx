import { ScanSearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolCall } from "./tool-call";

export function AnalyzePageTool({ state }: { state: string }) {
  const done = state === "output-available";
  return (
    <ToolCall
      icon={
        <ScanSearchIcon
          className={cn("inline size-4", !done && "animate-pulse")}
        />
      }
    >
      {done ? "Page analyzed" : "Analyzing page..."}
    </ToolCall>
  );
}
