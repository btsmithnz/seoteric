import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PlanId } from "@/lib/plans";
import { PLAN_CATALOG, PLAN_ORDER, PRO_PROMO_CODE } from "@/lib/plans";
import { cn } from "@/lib/utils";

function planCta(planId: PlanId): string {
  switch (planId) {
    case "pro":
      return "Start with Pro";
    case "agency":
      return "Start with Agency";
    default:
      return "Get started free";
  }
}

function planCardClass(planId: PlanId): string {
  switch (planId) {
    case "pro":
      return "border-primary/40 shadow-lg shadow-primary/10 md:scale-[1.02]";
    case "agency":
      return "border-violet-500/20";
    default:
      return "border-blue-500/20";
  }
}

export default function PricingPage() {
  return (
    <main className="flex w-full flex-col">
      {/* Hero Header */}
      <section className="relative overflow-hidden pt-32 pb-20 text-center">
        <div className="absolute inset-0 bg-grid bg-grid-fade" />
        <div className="glow-orb-blue pointer-events-none absolute -top-32 -left-32 h-96 w-96" />
        <div className="glow-orb-purple pointer-events-none absolute -right-32 bottom-0 h-96 w-96" />
        <div className="relative z-10 px-4">
          <p className="mb-3 font-medium text-muted-foreground text-xs uppercase tracking-widest">
            Pricing
          </p>
          <h1 className="font-semibold text-4xl tracking-tight sm:text-5xl">
            Start free.{" "}
            <span className="text-gradient-blue">Scale when you're ready.</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Every plan includes the full AI toolkit. No credit card required.
          </p>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="px-4 pt-8 pb-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {PLAN_ORDER.map((planId) => {
            const plan = PLAN_CATALOG[planId];
            const isPro = planId === "pro";
            const [amount, period] = plan.price.split("/");

            return (
              <div
                className={cn(
                  "glass-card flex flex-col rounded-2xl p-6",
                  planCardClass(planId)
                )}
                key={plan.name}
              >
                {/* Plan name + badge */}
                <div className="mb-4 flex items-center justify-between gap-2">
                  <p className="font-semibold text-lg tracking-tight">
                    {plan.name}
                  </p>
                  {plan.badge ? (
                    <Badge className="shrink-0">{plan.badge}</Badge>
                  ) : null}
                </div>

                {/* Price block */}
                <div className="mb-3">
                  {plan.introPrice ? (
                    <div className="space-y-1">
                      <div className="flex items-end gap-2">
                        <span className="font-bold text-2xl text-muted-foreground/70 line-through">
                          {plan.introPrice.original}
                        </span>
                        <span className="font-bold text-3xl">
                          {plan.introPrice.discounted}
                        </span>
                        <span className="pb-0.5 text-muted-foreground text-sm">
                          /month
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {plan.introPrice.label}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-end gap-2">
                      <span className="font-bold text-3xl">{amount}</span>
                      {period ? (
                        <span className="pb-0.5 text-muted-foreground text-sm">
                          /{period}
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="mb-5 text-muted-foreground text-sm">
                  {plan.description}
                </p>

                {/* Features */}
                <ul className="mb-6 flex-1 space-y-2">
                  {plan.features.map((feature) => (
                    <li className="flex items-center gap-2" key={feature}>
                      <CheckIcon className="size-3.5 shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-auto">
                  <Button
                    className={cn("w-full", isPro && "glow-primary")}
                    nativeButton={false}
                    render={<Link href="/onboarding" />}
                    variant={isPro ? "default" : "outline"}
                  >
                    {planCta(planId)}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Promo Footer */}
      <section className="pb-16 text-center text-muted-foreground text-sm">
        Use code{" "}
        <span className="metric-chip inline-block rounded-md px-2 py-0.5 font-mono text-foreground text-xs">
          {PRO_PROMO_CODE}
        </span>{" "}
        at checkout for Pro intro pricing.
      </section>
    </main>
  );
}
