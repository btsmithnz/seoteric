import {
  FileCode,
  FileText,
  Gauge,
  Lightbulb,
  Link2,
  Search,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ChatOnboarding, ChatOnboardingSkeleton } from "./chat";

const features = [
  {
    icon: Search,
    title: "Website Analysis",
    description: "Deep inspection of your site's content and structure",
  },
  {
    icon: FileCode,
    title: "Technical SEO Audit",
    description: "Robots.txt and sitemap validation",
  },
  {
    icon: Link2,
    title: "Link Health Check",
    description: "Find and fix broken links",
  },
  {
    icon: FileText,
    title: "On-Page SEO Analysis",
    description: "Meta tags, headings, and content optimization",
  },
  {
    icon: Lightbulb,
    title: "AI Recommendations",
    description: "Actionable improvement suggestions",
  },
  {
    icon: Gauge,
    title: "Performance Insights",
    description: "Speed and Core Web Vitals analysis",
  },
];

export default function Page() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center p-4 pb-24">
        {/* Hero */}
        <section className="flex flex-col items-center gap-8 pt-28 pb-20 text-center md:pt-40 md:pb-28">
          <h1 className="font-bold text-5xl tracking-tighter md:text-7xl">
            SEO made <span className="text-gradient">easy</span>
          </h1>
          <p className="max-w-lg text-balance text-muted-foreground text-xl">
            AI-powered insights to help your website rank higher
          </p>
          <div className="flex gap-3">
            <Button
              nativeButton={false}
              render={<Link href="/onboarding" />}
              size="lg"
            >
              Get started
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="#features" />}
              size="lg"
              variant="outline"
            >
              Learn more
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="w-full max-w-4xl" id="features">
          <h2 className="mb-8 text-center font-medium text-lg">
            What Seoteric can do for you
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                className="rounded-lg border p-4 text-center"
                key={feature.title}
              >
                <feature.icon className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
                <h3 className="mb-1 font-medium text-sm">{feature.title}</h3>
                <p className="text-muted-foreground text-xs">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Suspense fallback={<ChatOnboardingSkeleton />}>
        <ChatOnboarding />
      </Suspense>
    </>
  );
}
