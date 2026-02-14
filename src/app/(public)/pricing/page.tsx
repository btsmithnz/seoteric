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

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with SEO basics",
    features: [
      "1 site",
      "100 messages/month",
      "3 active recommendations",
      "5 PageSpeed tests/month",
      "AI-powered SEO insights",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$8",
    originalPrice: "$16",
    priceNote: "/mo for first 3 months",
    description: "For growing sites that need more",
    badge: "Popular",
    features: [
      "5 sites",
      "1,000 messages/month",
      "Unlimited recommendations",
      "50 PageSpeed tests/month",
      "Sonnet 4.5 AI model",
    ],
    cta: "Get started",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$49",
    priceNote: "/mo",
    description: "For agencies managing many clients",
    features: [
      "50 sites",
      "10,000 messages/month",
      "Unlimited recommendations",
      "200 PageSpeed tests/month",
      "Sonnet 4.5 AI model",
    ],
    cta: "Get started",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-4">
      <header className="mb-8 text-center">
        <h1 className="font-medium text-2xl tracking-tight">Pricing</h1>
        <p className="mt-1 text-muted-foreground text-xs">
          Simple, transparent pricing
        </p>
      </header>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            className={plan.highlighted ? "ring-2 ring-primary" : ""}
            key={plan.name}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>{plan.name}</CardTitle>
                {plan.badge && <Badge variant="secondary">{plan.badge}</Badge>}
              </div>
              <div className="flex items-baseline gap-1">
                {plan.originalPrice && (
                  <span className="text-muted-foreground text-sm line-through">
                    {plan.originalPrice}
                  </span>
                )}
                <span className="font-medium text-2xl">{plan.price}</span>
                {plan.priceNote && (
                  <span className="text-muted-foreground text-xs">
                    {plan.priceNote}
                  </span>
                )}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li className="flex items-center gap-2" key={feature}>
                    <CheckIcon className="size-3.5 text-muted-foreground" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                nativeButton={false}
                render={<Link href="/onboarding" />}
                variant={plan.highlighted ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
