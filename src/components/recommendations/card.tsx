"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  onComplete?: (id: Id<"recommendations">) => void;
  onDismiss?: (id: Id<"recommendations">) => void;
  onReopen?: (id: Id<"recommendations">) => void;
}

export function RecommendationCard({
  recommendation,
  showActions = false,
  compact = false,
  onComplete,
  onDismiss,
  onReopen,
}: RecommendationCardProps) {
  const priority = recommendation.priority as keyof typeof priorityColors;
  const category = recommendation.category as keyof typeof categoryLabels;

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
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => onReopen?.(recommendation._id!)}
                  title="Reopen"
                >
                  <Undo2Icon className="size-3" />
                </Button>
              ) : (
                <>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => onComplete?.(recommendation._id!)}
                    title="Mark as complete"
                  >
                    <CheckIcon className="size-3" />
                  </Button>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => onDismiss?.(recommendation._id!)}
                    title="Dismiss"
                  >
                    <XIcon className="size-3" />
                  </Button>
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
