import { ShieldIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatUrl, ToolCall } from "./tool-call";

export interface CheckSecurityHeadersToolInput {
  url: string;
}

export function CheckSecurityHeadersTool({
  state,
  input,
}: {
  state: string;
  input?: CheckSecurityHeadersToolInput;
}) {
  const done = state === "output-available";
  return (
    <ToolCall
      icon={
        <ShieldIcon className={cn("inline size-4", !done && "animate-pulse")} />
      }
    >
      {done ? "Checked security headers" : "Checking security headers..."}
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
