import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolCall } from "./tool-call";

export interface CheckKeywordCannibalizationToolInput {
  urls: string[];
}

export function CheckKeywordCannibalizationTool({
  state,
  input,
}: {
  state: string;
  input?: CheckKeywordCannibalizationToolInput;
}) {
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
      {input?.urls?.length && (
        <>
          <span className="mx-1">·</span>
          <span className="font-mono text-xs opacity-60">
            {input.urls.length} pages
          </span>
        </>
      )}
    </ToolCall>
  );
}
