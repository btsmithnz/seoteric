import { CheckCircleIcon } from "lucide-react";
import { ToolCall } from "./tool-call";

interface UpdateRecommendationToolProps {
  state: string;
}

export function UpdateRecommendationTool({
  state,
}: UpdateRecommendationToolProps) {
  return (
    <ToolCall icon={<CheckCircleIcon className="size-4 inline" />}>
      {state === "output-available"
        ? "Updated recommendation"
        : "Updating recommendation..."}
    </ToolCall>
  );
}
