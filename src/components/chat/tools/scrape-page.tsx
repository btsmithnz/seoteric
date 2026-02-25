import { CodeIcon } from "lucide-react";
import { ToolCall } from "./tool-call";

export function ScrapePageTool() {
  return (
    <ToolCall icon={<CodeIcon className="inline size-4" />}>
      Scraping page content
    </ToolCall>
  );
}
