import { GlobeIcon } from "lucide-react";
import { ToolCall } from "./tool-call";

export function WebsiteTextTool() {
  return (
    <ToolCall icon={<GlobeIcon className="size-4 inline" />}>
      Reading your website
    </ToolCall>
  );
}
