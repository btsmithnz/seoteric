import { GlobeIcon } from "lucide-react";
import { ToolCall } from "./tool-call";

export function WebsiteNameTool() {
  return (
    <ToolCall icon={<GlobeIcon className="inline size-4" />}>
      Looking at your website
    </ToolCall>
  );
}
