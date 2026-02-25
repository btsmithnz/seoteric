import { TrendingUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolCall } from "./tool-call";

export interface GoogleSerpToolInput {
  keyword: string;
}

export function GoogleSerpTool({
  state,
  input,
}: {
  state: string;
  input?: GoogleSerpToolInput;
}) {
  const done = state === "output-available";
  return (
    <ToolCall
      icon={
        <TrendingUpIcon
          className={cn("inline size-4", !done && "animate-pulse")}
        />
      }
    >
      {done ? "Search rankings retrieved" : "Checking search rankings..."}
      {input?.keyword && (
        <>
          <span className="mx-1">·</span>
          <span className="font-mono text-xs opacity-60">
            "{input.keyword}"
          </span>
        </>
      )}
    </ToolCall>
  );
}
