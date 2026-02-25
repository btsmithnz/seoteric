import { CodeIcon } from "lucide-react";
import { formatUrl, ToolCall } from "./tool-call";

export interface ScrapePageToolInput {
  url: string;
}

export function ScrapePageTool({ input }: { input?: ScrapePageToolInput }) {
  return (
    <ToolCall icon={<CodeIcon className="inline size-4" />}>
      Scraping page content
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
