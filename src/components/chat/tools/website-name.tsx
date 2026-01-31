import { GlobeIcon } from "lucide-react";
import { ToolCall } from "./tool-call";

export function WebsiteNameTool() {
  return (
    <ToolCall icon={<GlobeIcon className="size-4 inline" />}>
      Looking at your website
    </ToolCall>
  );
}
