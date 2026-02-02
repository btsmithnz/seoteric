"use client";

import { CheckoutLink, CustomerPortalLink } from "@convex-dev/polar/react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
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

  const productIds = [products.standardMonthly?.id].filter((p) => p != null);

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
    <div className="flex flex-col gap-2">
      <h2 className="font-semibold text-lg">Subscription</h2>
      <p className="text-muted-foreground text-sm">
        Manage your subscription and billing details.
      </p>

      <Subscription />
    </div>
  );
}
