import { LightbulbIcon } from "lucide-react";
import { RecommendationCard } from "../../../app/(dash)/sites/[site]/chats/recommendations-sidebar/card";
import { CreateRecommendationOutput } from "@/ai/tools/recommendations";
import { ToolCall } from "./tool-call";

interface CreateRecommendationToolProps {
  state: string;
  output?: CreateRecommendationOutput;
}

export function CreateRecommendationTool({
  state,
  output,
}: CreateRecommendationToolProps) {
  if (state === "output-available" && output) {
    return (
      <div className="my-2 max-w-md">
        <RecommendationCard
          recommendation={{
            title: output.title,
            description: output.description,
            category: output.category,
            priority: output.priority,
            pageUrl: output.pageUrl,
          }}
          compact
          showActions={false}
        />
      </div>
    );
  }

  return (
    <ToolCall icon={<LightbulbIcon className="size-4 inline" />}>
      Creating recommendation...
    </ToolCall>
  );
}
