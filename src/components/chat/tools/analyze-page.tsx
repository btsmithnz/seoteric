import { ScanSearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatUrl, ToolCall } from "./tool-call";

export interface AnalyzePageToolInput {
  url: string;
}

export function AnalyzePageTool({
  state,
  input,
}: {
  state: string;
  input?: AnalyzePageToolInput;
}) {
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
      {input?.url && (
        <>
          <span className="mx-1">·</span>
          <span className="font-mono text-xs opacity-60">
            {formatUrl(input.url)}
          </span>
        </>
      )}
    </ToolCall>
  );
}
