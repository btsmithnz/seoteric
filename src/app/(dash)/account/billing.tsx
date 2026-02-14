"use client";

import { CheckoutLink, CustomerPortalLink } from "@convex-dev/polar/react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useAuthQuery } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  proMonthly: "Pro",
  agencyMonthly: "Agency",
};

function UsageBar({
  label,
  current,
  limit,
}: {
  label: string;
  current: number;
  limit: number;
}) {
  const isUnlimited = !Number.isFinite(limit);
  const pct = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);

  let barColor = "bg-primary";
  if (pct >= 100) {
    barColor = "bg-destructive";
  } else if (pct >= 80) {
    barColor = "bg-amber-500";
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {current} / {isUnlimited ? "Unlimited" : limit.toLocaleString()}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 w-full overflow-hidden bg-muted">
          <div
            className={cn("h-full transition-all", barColor)}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function UsageDashboard() {
  const usage = useAuthQuery(api.usage.getUserUsage);

  if (!usage) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm">Current plan:</span>
        <Badge variant="secondary">
          {PLAN_LABELS[usage.plan] ?? usage.plan}
        </Badge>
      </div>

      <div className="flex flex-col gap-3">
        <UsageBar
          current={usage.current.sites}
          label="Sites"
          limit={usage.limits.sites}
        />
        <UsageBar
          current={usage.current.messages}
          label="Messages this month"
          limit={usage.limits.messagesPerMonth}
        />
        <UsageBar
          current={usage.current.activeRecommendations}
          label="Active recommendations"
          limit={usage.limits.activeRecommendations}
        />
        <UsageBar
          current={usage.current.pageSpeedTests}
          label="PageSpeed tests this month"
          limit={usage.limits.pageSpeedTestsPerMonth}
        />
      </div>
    </div>
  );
}

function Subscription() {
  const products = useAuthQuery(api.polar.getConfiguredProducts);

  if (!products) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-28" />
      </div>
    );
  }

  const productIds = [
    products.proMonthly?.id,
    products.agencyMonthly?.id,
  ].filter((p) => p != null);

  if (productIds.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm">No products found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <CheckoutLink embed={false} polarApi={api.polar} productIds={productIds}>
        Upgrade to Premium
      </CheckoutLink>

      <CustomerPortalLink
        polarApi={{
          generateCustomerPortalUrl: api.polar.generateCustomerPortalUrl,
        }}
      >
        Manage Subscription
      </CustomerPortalLink>
    </div>
  );
}

export function Billing() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold text-lg">Usage</h2>
        <p className="text-muted-foreground text-sm">
          Your current usage across plan limits.
        </p>
        <UsageDashboard />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-semibold text-lg">Subscription</h2>
        <p className="text-muted-foreground text-sm">
          Manage your subscription and billing details.
        </p>
        <Subscription />
      </div>
    </div>
  );
}
