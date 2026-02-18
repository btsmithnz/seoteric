"use client";

import { LightbulbIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  Sidebar,
  SidebarMobileToggleButton,
  SidebarMobileToggleIcon,
} from "@/components/elements/sidebar";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuthQuery } from "@/lib/hooks";
import { RecommendationCard } from "./card";

export function RecommendationsSidebar() {
  const { site: siteId } = useParams<{ site: Id<"sites"> }>();
  const query = useAuthQuery(api.recommendations.listBySite, { siteId });
  const recommendations = useMemo(() => query ?? [], [query]);

  const openRecommendations = recommendations.filter(
    (r) => r.status === "open" || r.status === "in_progress"
  );
  const completedRecommendations = recommendations.filter(
    (r) => r.status === "completed" || r.status === "dismissed"
  );

  const isLoading = query === undefined;

  return (
    <Sidebar className="md:w-80" selector="recommendations" side="right">
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <div className="flex items-center gap-2">
          <LightbulbIcon className="size-4 text-primary" />
          <h2 className="font-medium text-sm">Recommendations</h2>
          {openRecommendations.length > 0 && (
            <span className="text-muted-foreground text-xs">
              ({openRecommendations.length})
            </span>
          )}
        </div>

        <SidebarMobileToggleButton selector="recommendations" variant="outline">
          <SidebarMobileToggleIcon
            className="rotate-180"
            selector="recommendations"
          />
        </SidebarMobileToggleButton>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-2">
        {isLoading && (
          <p className="py-4 text-center text-muted-foreground text-sm">
            Loading...
          </p>
        )}
        {!isLoading && recommendations.length === 0 && (
          <p className="py-4 text-center text-muted-foreground text-sm">
            No recommendations yet. Ask the AI to analyze your site.
          </p>
        )}

        {openRecommendations.map((rec) => (
          <RecommendationCard key={rec._id} recommendation={rec} showActions />
        ))}

        {completedRecommendations.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer py-2 text-muted-foreground text-xs hover:text-foreground">
              Completed ({completedRecommendations.length})
            </summary>
            <div className="space-y-2 pt-2 opacity-60">
              {completedRecommendations.map((rec) => (
                <RecommendationCard
                  compact
                  key={rec._id}
                  recommendation={rec}
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
