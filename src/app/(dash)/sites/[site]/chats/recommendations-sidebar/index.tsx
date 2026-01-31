"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { RecommendationCard } from "./card";
import { LightbulbIcon } from "lucide-react";
import {
  Sidebar,
  SidebarMobileToggleButton,
  SidebarMobileToggleIcon,
} from "@/components/elements/sidebar";

interface Props {
  siteId: Id<"sites">;
}

export function RecommendationsSidebar({ siteId }: Props) {
  const recommendations = useQuery(api.recommendations.listBySite, { siteId });

  if (!recommendations) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Loading recommendations...
      </div>
    );
  }

  const openRecommendations = recommendations.filter(
    (r) => r.status === "open" || r.status === "in_progress",
  );
  const completedRecommendations = recommendations.filter(
    (r) => r.status === "completed" || r.status === "dismissed",
  );

  return (
    <Sidebar side="right" selector="recommendations">
      <div className="flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <LightbulbIcon className="size-4 text-primary" />
          <h2 className="font-medium text-sm">Recommendations</h2>
          {openRecommendations.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ({openRecommendations.length})
            </span>
          )}
        </div>

        <SidebarMobileToggleButton selector="recommendations" variant="outline">
          <SidebarMobileToggleIcon selector="recommendations" className="rotate-180" />
        </SidebarMobileToggleButton>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 p-2">
        {openRecommendations.length === 0 &&
          completedRecommendations.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No recommendations yet. Ask the AI to analyze your site.
            </p>
          )}

        {openRecommendations.map((rec) => (
          <RecommendationCard
            key={rec._id}
            recommendation={rec}
            showActions
          />
        ))}

        {completedRecommendations.length > 0 && (
          <details className="group">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground py-2">
              Completed ({completedRecommendations.length})
            </summary>
            <div className="space-y-2 pt-2 opacity-60">
              {completedRecommendations.map((rec) => (
                <RecommendationCard
                  key={rec._id}
                  recommendation={rec}
                  compact
                  showActions
                />
              ))}
            </div>
          </details>
        )}
      </div>
    </Sidebar>
  );
}
