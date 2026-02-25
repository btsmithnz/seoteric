import { FileTextIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolCall } from "./tool-call";

export interface FetchRobotsTxtToolInput {
  domain: string;
}

export function FetchRobotsTxtTool({
  state,
  input,
}: {
  state: string;
  input?: FetchRobotsTxtToolInput;
}) {
  const done = state === "output-available";
  return (
    <ToolCall
      icon={
        <FileTextIcon
          className={cn("inline size-4", !done && "animate-pulse")}
        />
      }
    >
      {done ? "Fetched robots.txt" : "Fetching robots.txt..."}
      {input?.domain && (
        <>
          <span className="mx-1">·</span>
          <span className="font-mono text-xs opacity-60">{input.domain}</span>
        </>
      )}
    </ToolCall>
  );
}
