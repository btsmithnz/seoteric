"use client";

import { useMutation } from "convex/react";
import { CheckIcon, ExternalLinkIcon, Undo2Icon, XIcon } from "lucide-react";
import { useState } from "react";
import { LoadingButton } from "@/components/elements/loading-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

const priorityColors = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400",
};

const categoryLabels = {
  technical: "Technical",
  content: "Content",
  "on-page": "On-Page",
  "off-page": "Off-Page",
  performance: "Performance",
};

export interface RecommendationData {
  _id?: Id<"recommendations">;
  title: string;
  description: string;
  category: string;
  priority: string;
  pageUrl?: string;
  status?: string;
}

interface RecommendationCardProps {
  recommendation: RecommendationData;
  showActions?: boolean;
  compact?: boolean;
}

export function RecommendationCard({
  recommendation,
  showActions = false,
  compact = false,
}: RecommendationCardProps) {
  const [loadingAction, setLoadingAction] = useState<
    "complete" | "dismiss" | "reopen" | null
  >(null);
  const updateStatus = useMutation(api.recommendations.updateStatus);

  const priority = recommendation.priority as keyof typeof priorityColors;
  const category = recommendation.category as keyof typeof categoryLabels;

  const handleComplete = async () => {
    if (!recommendation._id) {
      return;
    }
    setLoadingAction("complete");
    try {
      await updateStatus({ id: recommendation._id, status: "completed" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDismiss = async () => {
    if (!recommendation._id) {
      return;
    }
    setLoadingAction("dismiss");
    try {
      await updateStatus({ id: recommendation._id, status: "dismissed" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReopen = async () => {
    if (!recommendation._id) {
      return;
    }
    setLoadingAction("reopen");
    try {
      await updateStatus({ id: recommendation._id, status: "open" });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Card
      className={cn(compact && "border-l-2 border-l-primary")}
      size={compact ? "sm" : "default"}
    >
      <CardHeader className={cn(compact && "pb-1")}>
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-1.5">
              <Badge
                className={cn(
                  "px-1.5 py-0 text-[10px] capitalize",
                  priorityColors[priority] || priorityColors.medium
                )}
                variant="outline"
              >
                {priority}
              </Badge>
              <Badge className="px-1.5 py-0 text-[10px]" variant="secondary">
                {categoryLabels[category] || category}
              </Badge>
            </div>
            <CardTitle className={cn(compact && "text-sm")}>
              {recommendation.title}
            </CardTitle>
          </div>
          {showActions && recommendation._id && (
            <div className="flex shrink-0 gap-1">
              {recommendation.status === "completed" ||
              recommendation.status === "dismissed" ? (
                <LoadingButton
                  disabled={loadingAction !== null}
                  icon={<Undo2Icon className="size-3" />}
                  loading={loadingAction === "reopen"}
                  onClick={handleReopen}
                  size="icon-xs"
                  spinnerClassName="size-3"
                  title="Reopen"
                  variant="ghost"
                />
              ) : (
                <>
                  <LoadingButton
                    disabled={loadingAction !== null}
                    icon={<CheckIcon className="size-3" />}
                    loading={loadingAction === "complete"}
                    onClick={handleComplete}
                    size="icon-xs"
                    spinnerClassName="size-3"
                    title="Mark as complete"
                    variant="ghost"
                  />
                  <LoadingButton
                    disabled={loadingAction !== null}
                    icon={<XIcon className="size-3" />}
                    loading={loadingAction === "dismiss"}
                    onClick={handleDismiss}
                    size="icon-xs"
                    spinnerClassName="size-3"
                    title="Dismiss"
                    variant="ghost"
                  />
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn(compact && "pt-0")}>
        <p
          className={cn(
            "text-muted-foreground",
            compact ? "text-xs" : "text-sm"
          )}
        >
          {recommendation.description}
        </p>
        {recommendation.pageUrl && (
          <a
            className="mt-2 inline-flex items-center gap-1 text-primary text-xs hover:underline"
            href={recommendation.pageUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLinkIcon className="size-3" />
            {recommendation.pageUrl}
          </a>
        )}
      </CardContent>
    </Card>
  );
}
