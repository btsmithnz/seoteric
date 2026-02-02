import { SearchIcon } from "lucide-react";
import { ToolCall } from "./tool-call";

export function InspectDomTool() {
  return (
    <ToolCall icon={<SearchIcon className="inline size-4" />}>
      Inspecting your website
    </ToolCall>
  );
}
