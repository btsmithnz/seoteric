import { Link2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatUrl, ToolCall } from "./tool-call";

export interface CheckUrlStatusToolInput {
  url: string;
}

export function CheckUrlStatusTool({
  state,
  input,
}: {
  state: string;
  input?: CheckUrlStatusToolInput;
}) {
  const done = state === "output-available";
  return (
    <ToolCall
      icon={
        <Link2Icon className={cn("inline size-4", !done && "animate-pulse")} />
      }
    >
      {done ? "Link checked" : "Checking link status..."}
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
