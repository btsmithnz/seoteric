import Link from "next/link";
import { CheckIcon } from "lucide-react";
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

export default function PricingPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-4">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-medium tracking-tight">Pricing</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Simple, transparent pricing
        </p>
      </header>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            Early Access
          </Badge>
          <CardTitle className="text-2xl">$0/month</CardTitle>
          <CardDescription>Free while we&apos;re building</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <CheckIcon className="size-3.5 text-muted-foreground" />
              <span>Unlimited site analysis</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="size-3.5 text-muted-foreground" />
              <span>AI-powered SEO insights</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="size-3.5 text-muted-foreground" />
              <span>Keyword tracking</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="size-3.5 text-muted-foreground" />
              <span>Competitor analysis</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            render={<Link href="/onboarding" />}
            nativeButton={false}
            className="w-full"
          >
            Get started for free
          </Button>
        </CardFooter>
      </Card>

      <footer className="mt-8 max-w-sm text-center text-xs text-muted-foreground">
        Paid plans will be introduced later. Early access users will be
        grandfathered in with special pricing.
      </footer>
    </main>
  );
}
