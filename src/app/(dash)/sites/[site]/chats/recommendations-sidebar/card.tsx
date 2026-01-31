"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingButton } from "@/components/elements/loading-button";
import { cn } from "@/lib/utils";
import { CheckIcon, XIcon, ExternalLinkIcon, Undo2Icon } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

const priorityColors = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
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
  const [loadingAction, setLoadingAction] = useState<'complete' | 'dismiss' | 'reopen' | null>(null);
  const updateStatus = useMutation(api.recommendations.updateStatus);

  const priority = recommendation.priority as keyof typeof priorityColors;
  const category = recommendation.category as keyof typeof categoryLabels;

  const handleComplete = async () => {
    if (!recommendation._id) return;
    setLoadingAction('complete');
    try {
      await updateStatus({ id: recommendation._id, status: "completed" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDismiss = async () => {
    if (!recommendation._id) return;
    setLoadingAction('dismiss');
    try {
      await updateStatus({ id: recommendation._id, status: "dismissed" });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReopen = async () => {
    if (!recommendation._id) return;
    setLoadingAction('reopen');
    try {
      await updateStatus({ id: recommendation._id, status: "open" });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <Card size={compact ? "sm" : "default"} className={cn(compact && "border-l-2 border-l-primary")}>
      <CardHeader className={cn(compact && "pb-1")}>
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0",
                  priorityColors[priority] || priorityColors.medium
                )}
              >
                {priority}
              </Badge>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {categoryLabels[category] || category}
              </Badge>
            </div>
            <CardTitle className={cn(compact && "text-sm")}>{recommendation.title}</CardTitle>
          </div>
          {showActions && recommendation._id && (
            <div className="flex gap-1 shrink-0">
              {recommendation.status === "completed" || recommendation.status === "dismissed" ? (
                <LoadingButton
                  size="icon-xs"
                  variant="ghost"
                  onClick={handleReopen}
                  disabled={loadingAction !== null}
                  loading={loadingAction === 'reopen'}
                  icon={<Undo2Icon className="size-3" />}
                  spinnerClassName="size-3"
                  title="Reopen"
                />
              ) : (
                <>
                  <LoadingButton
                    size="icon-xs"
                    variant="ghost"
                    onClick={handleComplete}
                    disabled={loadingAction !== null}
                    loading={loadingAction === 'complete'}
                    icon={<CheckIcon className="size-3" />}
                    spinnerClassName="size-3"
                    title="Mark as complete"
                  />
                  <LoadingButton
                    size="icon-xs"
                    variant="ghost"
                    onClick={handleDismiss}
                    disabled={loadingAction !== null}
                    loading={loadingAction === 'dismiss'}
                    icon={<XIcon className="size-3" />}
                    spinnerClassName="size-3"
                    title="Dismiss"
                  />
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn(compact && "pt-0")}>
        <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>
          {recommendation.description}
        </p>
        {recommendation.pageUrl && (
          <a
            href={recommendation.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
          >
            <ExternalLinkIcon className="size-3" />
            {recommendation.pageUrl}
          </a>
        )}
      </CardContent>
    </Card>
  );
}
