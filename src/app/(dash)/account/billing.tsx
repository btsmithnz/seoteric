"use client";

import { CustomerPortalLink } from "@convex-dev/polar/react";
import { useAction } from "convex/react";
import { CheckIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useAuthQuery } from "@/lib/hooks";
import { PLAN_CATALOG, type PlanId, PRO_PROMO_CODE } from "@/lib/plans";
import { cn } from "@/lib/utils";

function UsageBar({ limit, used }: { limit: number; used: number }) {
  const percentage = Math.min(
    100,
    Math.round((used / Math.max(1, limit)) * 100)
  );

  return (
    <div className="space-y-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-muted-foreground text-xs">
        {used} / {limit}
      </p>
    </div>
  );
}

function PlanPrice({ planId }: { planId: "agency" | "pro" }) {
  const plan = PLAN_CATALOG[planId];
  const [amount, period] = plan.price.split("/");

  if (!plan.introPrice) {
    return (
      <CardTitle className="flex items-end gap-2 text-2xl">
        <span>{amount}</span>
        {period ? (
          <span className="pb-0.5 text-muted-foreground text-sm">
            /{period}
          </span>
        ) : null}
      </CardTitle>
    );
  }

  return (
    <div className="space-y-1">
      <CardTitle className="flex items-end gap-2 text-2xl">
        <span className="text-muted-foreground/80 line-through">
          {plan.introPrice.original}
        </span>
        <span>{plan.introPrice.discounted}</span>
        <span className="pb-0.5 text-muted-foreground text-sm">/month</span>
      </CardTitle>
      <p className="text-muted-foreground text-xs">{plan.introPrice.label}</p>
    </div>
  );
}

function PlanCheckoutButton({
  disabled = false,
  discountCode,
  label,
  productId,
}: {
  disabled?: boolean;
  discountCode?: string;
  label: string;
  productId: null | string;
}) {
  const generateCheckoutLink = useAction(api.polar.generateCheckoutLink);
  const [checkoutUrl, setCheckoutUrl] = useState<string>();

  useEffect(() => {
    if (!productId || disabled) {
      setCheckoutUrl(undefined);
      return;
    }

    let active = true;
    setCheckoutUrl(undefined);

    generateCheckoutLink({
      productIds: [productId],
      origin: window.location.origin,
      successUrl: window.location.href,
    })
      .then(({ url }) => {
        if (!active) {
          return;
        }
        if (!discountCode) {
          setCheckoutUrl(url);
          return;
        }
        const checkout = new URL(url);
        checkout.searchParams.set("discount_code", discountCode);
        setCheckoutUrl(checkout.toString());
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setCheckoutUrl(undefined);
      });

    return () => {
      active = false;
    };
  }, [discountCode, disabled, generateCheckoutLink, productId]);

  if (disabled) {
    return (
      <Button className="w-full" disabled>
        Current plan
      </Button>
    );
  }

  if (!(productId && checkoutUrl)) {
    return (
      <Button className="w-full" disabled variant="outline">
        Loading checkout...
      </Button>
    );
  }

  return (
    <a
      className={buttonVariants({ className: "w-full" })}
      href={checkoutUrl}
      rel="noreferrer"
      target="_blank"
    >
      {label}
    </a>
  );
}

function SubscriptionActions({ currentPlan }: { currentPlan: PlanId }) {
  const products = useAuthQuery(api.polar.getConfiguredProducts);

  if (!products) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-4 md:grid-cols-2">
        {(["pro", "agency"] as const).map((planId) => {
          const plan = PLAN_CATALOG[planId];
          const isCurrent = currentPlan === planId;
          const productId =
            planId === "pro"
              ? products.proMonthly?.id
              : products.agencyMonthly?.id;
          const buttonLabel = `Upgrade to ${plan.name}`;

          return (
            <Card
              className={cn(
                "flex h-full flex-col",
                isCurrent && "border-primary/40 bg-primary/5"
              )}
              key={planId}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-lg tracking-tight">
                    {plan.name}
                  </p>
                  <div className="flex items-center gap-2">
                    {plan.badge ? <Badge>{plan.badge}</Badge> : null}
                    {isCurrent ? (
                      <Badge variant="secondary">Current plan</Badge>
                    ) : null}
                  </div>
                </div>
                <PlanPrice planId={planId} />
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li className="flex items-center gap-2" key={feature}>
                      <CheckIcon className="size-3.5 text-muted-foreground" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <PlanCheckoutButton
                  disabled={isCurrent}
                  discountCode={planId === "pro" ? PRO_PROMO_CODE : undefined}
                  label={buttonLabel}
                  productId={productId ?? null}
                />
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <CustomerPortalLink
        className={buttonVariants({
          variant: "outline",
          className: "w-full sm:w-auto",
        })}
        polarApi={{
          generateCustomerPortalUrl: api.polar.generateCustomerPortalUrl,
        }}
      >
        Manage subscription
      </CustomerPortalLink>
    </div>
  );
}

export function Billing() {
  const entitlements = useAuthQuery(api.billing.getEntitlements);

  if (!entitlements) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const cycleStart = new Date(entitlements.cycle.startMs);
  const cycleEnd = new Date(entitlements.cycle.endMs);

  return (
    <div className="flex scroll-mt-20 flex-col gap-5" id="billing">
      <div>
        <h2 className="font-semibold text-lg">Billing & Usage</h2>
        <p className="text-muted-foreground text-sm">
          Current plan:{" "}
          <span className="font-medium text-foreground capitalize">
            {entitlements.plan}
          </span>
          {" · "}
          Model tier:{" "}
          <span className="font-medium text-foreground capitalize">
            {entitlements.modelTier}
          </span>
        </p>
        <p className="text-muted-foreground text-xs">
          Usage cycle: {cycleStart.toLocaleDateString()} -{" "}
          {cycleEnd.toLocaleDateString()}
        </p>
      </div>

      <div className="grid gap-4">
        <div className="rounded-md border p-3">
          <p className="mb-2 font-medium text-sm">Sites</p>
          <UsageBar
            limit={entitlements.limits.sites}
            used={entitlements.usage.sites}
          />
        </div>

        <div className="rounded-md border p-3">
          <p className="mb-2 font-medium text-sm">Messages</p>
          <UsageBar
            limit={entitlements.limits.messages}
            used={entitlements.usage.messages}
          />
        </div>

        <div className="rounded-md border p-3">
          <p className="mb-2 font-medium text-sm">PageSpeed reports</p>
          <UsageBar
            limit={entitlements.limits.pageSpeedReports}
            used={entitlements.usage.pageSpeedReports}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-medium text-sm">Plan actions</p>
        <p className="text-muted-foreground text-xs">
          Pro is $16/month. Intro offer: first 3 months at $8/month with code{" "}
          <span className="font-medium text-foreground">{PRO_PROMO_CODE}</span>{" "}
          in Polar checkout.
        </p>
        <SubscriptionActions currentPlan={entitlements.plan as PlanId} />
      </div>
    </div>
  );
}
