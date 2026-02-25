import { NetworkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatUrl, ToolCall } from "./tool-call";

export interface FetchSitemapToolInput {
  domain?: string;
  url: string;
}

export function FetchSitemapTool({
  state,
  input,
}: {
  state: string;
  input?: FetchSitemapToolInput;
}) {
  const done = state === "output-available";
  let displayUrl: string | null = null;
  if (input?.url) {
    displayUrl = input.url.startsWith("http")
      ? formatUrl(input.url)
      : input.url;
  }
  return (
    <ToolCall
      icon={
        <NetworkIcon
          className={cn("inline size-4", !done && "animate-pulse")}
        />
      }
    >
      {done ? "Fetched sitemap" : "Fetching sitemap..."}
      {displayUrl && (
        <>
          <span className="mx-1">·</span>
          <span className="font-mono text-xs opacity-60">{displayUrl}</span>
        </>
      )}
    </ToolCall>
  );
}
