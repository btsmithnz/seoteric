import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PLAN_CATALOG, PLAN_ORDER, PRO_PROMO_CODE } from "@/lib/plans";

function PlanPrice({ planId }: { planId: "agency" | "pro" | "starter" }) {
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

export default function PricingPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-6xl flex-col items-center p-4 py-12">
      <header className="mb-8 text-center">
        <h1 className="font-medium text-2xl tracking-tight">Pricing</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Plan limits and billing are enforced per usage cycle.
        </p>
      </header>

      <div className="grid w-full gap-4 md:grid-cols-3">
        {PLAN_ORDER.map((planId) => {
          const plan = PLAN_CATALOG[planId];
          const cta =
            planId === "starter" ? "Get started" : "Start with Starter";

          return (
            <Card className="flex h-full flex-col" key={plan.name}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-lg tracking-tight">
                    {plan.name}
                  </p>
                  {plan.badge ? (
                    <Badge className="w-fit shrink-0">{plan.badge}</Badge>
                  ) : null}
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
                <Button
                  className="w-full"
                  nativeButton={false}
                  render={<Link href="/onboarding" />}
                >
                  {cta}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <footer className="mt-8 max-w-2xl text-center text-muted-foreground text-xs">
        Upgrade and manage billing inside your account. Use promo code{" "}
        <span className="font-medium text-foreground">{PRO_PROMO_CODE}</span> at
        Polar checkout for Pro intro pricing.
      </footer>
    </main>
  );
}
