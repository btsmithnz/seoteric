import { SearchIcon } from "lucide-react";
import { ToolCall } from "./tool-call";

export function InspectDomTool() {
  return (
    <ToolCall icon={<SearchIcon className="size-4 inline" />}>
      Inspecting your website
    </ToolCall>
  );
}
