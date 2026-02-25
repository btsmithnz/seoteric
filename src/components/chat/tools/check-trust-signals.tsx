import { BadgeCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolCall } from "./tool-call";

export interface CheckTrustSignalsToolInput {
  domain: string;
}

export function CheckTrustSignalsTool({
  state,
  input,
}: {
  state: string;
  input?: CheckTrustSignalsToolInput;
}) {
  const done = state === "output-available";
  return (
    <ToolCall
      icon={
        <BadgeCheckIcon
          className={cn("inline size-4", !done && "animate-pulse")}
        />
      }
    >
      {done ? "Checked trust signals" : "Checking trust signals..."}
      {input?.domain && (
        <>
          <span className="mx-1">·</span>
          <span className="font-mono text-xs opacity-60">{input.domain}</span>
        </>
      )}
    </ToolCall>
  );
}
