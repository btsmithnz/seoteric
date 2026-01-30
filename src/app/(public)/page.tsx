import { ChatOnboarding } from "./chat";
import {
  Search,
  FileCode,
  Link2,
  FileText,
  Lightbulb,
  Gauge,
} from "lucide-react";

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
    <main className="flex min-h-screen flex-col items-center p-4 pt-16 pb-24">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-medium tracking-tight">Seoteric</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          AI-powered SEO insights
        </p>
      </header>
      <ChatOnboarding />
      <footer className="mt-8 text-xs text-muted-foreground">
        No sign-in required to start
      </footer>

      <section className="mt-16 w-full max-w-4xl">
        <h2 className="mb-8 text-center text-lg font-medium">
          What Seoteric can do for you
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border p-4 text-center"
            >
              <feature.icon className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
              <h3 className="mb-1 text-sm font-medium">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}