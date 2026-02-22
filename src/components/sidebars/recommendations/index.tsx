"use client";

import { LightbulbIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  Sidebar,
  SidebarMobileToggleButton,
  SidebarMobileToggleIcon,
} from "@/components/elements/sidebar";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuthQuery } from "@/lib/hooks";
import { STARTER_VISIBLE_RECOMMENDATIONS } from "@/lib/plans";
import { RecommendationCard } from "./card";

export function RecommendationsSidebar() {
  const { site: siteId } = useParams<{ site: Id<"sites"> }>();
  const query = useAuthQuery(api.recommendations.listBySite, { siteId });
  const entitlements = useAuthQuery(api.billing.getEntitlements);
  const recommendations = useMemo(() => query ?? [], [query]);
  const isStarterPlan = entitlements?.plan === "starter";

  const openRecommendations = recommendations.filter(
    (r) => r.status === "open" || r.status === "in_progress"
  );
  const completedRecommendations = recommendations.filter(
    (r) => r.status === "completed" || r.status === "dismissed"
  );
  const visibleOpenRecommendations = isStarterPlan
    ? openRecommendations.slice(0, STARTER_VISIBLE_RECOMMENDATIONS)
    : openRecommendations;
  const hiddenOpenRecommendationsCount = isStarterPlan
    ? Math.max(0, openRecommendations.length - STARTER_VISIBLE_RECOMMENDATIONS)
    : 0;

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

        {visibleOpenRecommendations.map((rec) => (
          <RecommendationCard key={rec._id} recommendation={rec} showActions />
        ))}
        {hiddenOpenRecommendationsCount > 0 && (
          <div className="space-y-2 rounded-md border border-dashed bg-muted/30 p-3">
            <p className="text-muted-foreground text-xs">
              Starter shows up to {STARTER_VISIBLE_RECOMMENDATIONS} active
              recommendations at once. Upgrade to view all{" "}
              {openRecommendations.length}.
            </p>
            <Button
              className="w-full"
              nativeButton={false}
              render={<Link href="/account#billing" />}
              size="sm"
            >
              Upgrade to view all
            </Button>
          </div>
        )}

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
