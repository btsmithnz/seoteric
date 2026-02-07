import { LightbulbIcon } from "lucide-react";
import type { CreateRecommendationOutput } from "@/ai/tools/recommendations";
import { RecommendationCard } from "../../sidebars/recommendations/card";
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
          compact
          recommendation={{
            title: output.title,
            description: output.description,
            category: output.category,
            priority: output.priority,
            pageUrl: output.pageUrl,
          }}
          showActions={false}
        />
      </div>
    );
  }

  return (
    <ToolCall icon={<LightbulbIcon className="inline size-4" />}>
      Creating recommendation...
    </ToolCall>
  );
}
