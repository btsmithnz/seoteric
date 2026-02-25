import { BadgeCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolCall } from "./tool-call";

export function CheckTrustSignalsTool({ state }: { state: string }) {
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
    </ToolCall>
  );
}
