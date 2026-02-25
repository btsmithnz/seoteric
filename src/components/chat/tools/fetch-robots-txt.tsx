import { FileTextIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToolCall } from "./tool-call";

export function FetchRobotsTxtTool({ state }: { state: string }) {
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
    </ToolCall>
  );
}
