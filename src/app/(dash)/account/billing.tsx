"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { CheckoutLink, CustomerPortalLink } from "@convex-dev/polar/react";
import { useAuthenticatedQuery } from "@/lib/hooks";

function Subscription() {
  const products = useAuthenticatedQuery(api.polar.getConfiguredProducts);

  if (!products) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-28" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <CheckoutLink
        polarApi={api.polar}
        productIds={[products.standardMonthly!.id]}
        embed={false}
      >
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
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Subscription</h2>
      <p className="text-sm text-muted-foreground">
        Manage your subscription and billing details.
      </p>

      <Subscription />
    </div>
  );
}
