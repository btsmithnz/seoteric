import { ShieldIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolCall } from "./tool-call";

export function CheckSecurityHeadersTool({ state }: { state: string }) {
  const done = state === "output-available";
  return (
    <ToolCall
      icon={
        <ShieldIcon className={cn("inline size-4", !done && "animate-pulse")} />
      }
    >
      {done ? "Checked security headers" : "Checking security headers..."}
    </ToolCall>
  );
}
