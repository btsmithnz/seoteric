import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolCall } from "./tool-call";

export function CheckKeywordCannibalizationTool({ state }: { state: string }) {
  const done = state === "output-available";
  return (
    <ToolCall
      icon={
        <SearchIcon className={cn("inline size-4", !done && "animate-pulse")} />
      }
    >
      {done
        ? "Checked keyword cannibalization"
        : "Checking keyword cannibalization..."}
    </ToolCall>
  );
}
