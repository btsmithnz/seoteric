import { GlobeIcon } from "lucide-react";
import { ToolCall } from "./tool-call";

export function WebsiteTextTool() {
  return (
    <ToolCall icon={<GlobeIcon className="inline size-4" />}>
      Reading your website
    </ToolCall>
  );
}
