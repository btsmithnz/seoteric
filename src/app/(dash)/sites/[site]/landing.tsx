"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import {
  ArrowRightIcon,
  LightbulbIcon,
  MessageSquareIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { RecommendationCard } from "@/components/sidebars/recommendations/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CHAT_SUGGESTIONS } from "@/lib/suggestions";

interface SiteLandingProps {
  preloadedSite: Preloaded<typeof api.site.get>;
  preloadedRecommendations: Preloaded<typeof api.recommendations.listBySite>;
  siteId: Id<"sites">;
}

export function SiteLanding({
  preloadedSite,
  preloadedRecommendations,
  siteId,
}: SiteLandingProps) {
  const site = usePreloadedQuery(preloadedSite);
  const recommendations = usePreloadedQuery(preloadedRecommendations);
  const [showCompleted, setShowCompleted] = useState(false);
  const router = useRouter();

  const openRecs = recommendations.filter(
    (r) => r.status === "open" || r.status === "in_progress"
  );
  const completedRecs = recommendations.filter(
    (r) => r.status === "completed" || r.status === "dismissed"
  );

  const handleSuggestion = () => {
    router.push(`/sites/${siteId}/chats`);
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-semibold text-2xl">{site.name}</h1>
            <p className="text-muted-foreground text-sm">{site.domain}</p>
          </div>
          <div className="flex gap-2">
            <Button
              nativeButton={false}
              render={<Link href={`/sites/${siteId}/chats`} />}
              size="sm"
              variant="outline"
            >
              <MessageSquareIcon className="size-4" />
              Chats
            </Button>
            <Button
              nativeButton={false}
              render={<Link href={`/sites/${siteId}/config`} />}
              size="sm"
              variant="outline"
            >
              <SettingsIcon className="size-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Recommendations */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LightbulbIcon className="size-4 text-primary" />
              <h2 className="font-medium text-base">Recommendations</h2>
              {openRecs.length > 0 && (
                <Badge variant="secondary">{openRecs.length} open</Badge>
              )}
            </div>
            {completedRecs.length > 0 && (
              <Button
                onClick={() => setShowCompleted((prev) => !prev)}
                size="sm"
                variant="ghost"
              >
                {showCompleted
                  ? "Hide completed"
                  : `Show completed (${completedRecs.length})`}
              </Button>
            )}
          </div>

          {openRecs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  No open recommendations — your site is looking great!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {openRecs.map((rec) => (
                <RecommendationCard
                  key={rec._id}
                  recommendation={rec}
                  showActions
                />
              ))}
            </div>
          )}

          {showCompleted && completedRecs.length > 0 && (
            <div className="flex flex-col gap-3 opacity-60">
              {completedRecs.map((rec) => (
                <RecommendationCard
                  compact
                  key={rec._id}
                  recommendation={rec}
                  showActions
                />
              ))}
            </div>
          )}
        </div>

        {/* Start a Chat */}
        <div className="flex flex-col gap-3">
          <h2 className="font-medium text-base">Start a Chat</h2>
          <Suggestions>
            {CHAT_SUGGESTIONS.map((suggestion) => (
              <Suggestion
                key={suggestion}
                onClick={handleSuggestion}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>
          <div className="flex justify-end">
            <Button
              nativeButton={false}
              render={<Link href={`/sites/${siteId}/chats`} />}
              size="sm"
              variant="outline"
            >
              New empty chat
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
