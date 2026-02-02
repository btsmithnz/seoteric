import { ActivityIcon, ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import type { PageSpeedOutput } from "@/ai/tools/pagespeed";
import { cn } from "@/lib/utils";
import { ToolCall } from "./tool-call";

function getScoreColor(score: number): string {
  if (score >= 90) {
    return "text-green-600 dark:text-green-400";
  }
  if (score >= 50) {
    return "text-yellow-600 dark:text-yellow-400";
  }
  return "text-red-600 dark:text-red-400";
}

function getScoreBgColor(score: number): string {
  if (score >= 90) {
    return "bg-green-500";
  }
  if (score >= 50) {
    return "bg-yellow-500";
  }
  return "bg-red-500";
}

function getRatingColor(rating: "good" | "needs-improvement" | "poor"): string {
  switch (rating) {
    case "good":
      return "text-green-600 dark:text-green-400";
    case "needs-improvement":
      return "text-yellow-600 dark:text-yellow-400";
    case "poor":
      return "text-red-600 dark:text-red-400";
    default:
      return "";
  }
}

function getRatingBadgeColor(
  rating: "good" | "needs-improvement" | "poor"
): string {
  switch (rating) {
    case "good":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "needs-improvement":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "poor":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "";
  }
}

function ScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="size-20 -rotate-90" viewBox="0 0 100 100">
        <circle
          className="fill-none stroke-gray-200 dark:stroke-gray-700"
          cx="50"
          cy="50"
          r="40"
          strokeWidth="8"
        />
        <circle
          className={cn("fill-none", getScoreBgColor(score))}
          cx="50"
          cy="50"
          r="40"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="8"
          style={{ stroke: "currentColor" }}
        />
      </svg>
      <span className={cn("absolute font-bold text-xl", getScoreColor(score))}>
        {score}
      </span>
    </div>
  );
}

function MetricCard({
  label,
  value,
  rating,
}: {
  label: string;
  value: string;
  rating: "good" | "needs-improvement" | "poor";
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-gray-500 text-xs dark:text-gray-400">{label}</span>
      <span className={cn("font-medium text-sm", getRatingColor(rating))}>
        {value}
      </span>
    </div>
  );
}

function ExpandableSection({
  title,
  items,
  defaultOpen = false,
}: {
  title: string;
  items: Array<{ id: string; title: string; savings: string | null }>;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="border-gray-200 border-t pt-2 dark:border-gray-700">
      <button
        className="flex w-full items-center justify-between text-left font-medium text-gray-600 text-xs hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>
          {title} ({items.length})
        </span>
        <ChevronDownIcon
          className={cn("size-4 transition-transform", isOpen && "rotate-180")}
        />
      </button>
      {isOpen && (
        <ul className="mt-2 space-y-1.5">
          {items.map((item) => (
            <li
              className="flex items-start justify-between gap-2 text-xs"
              key={item.id}
            >
              <span className="text-gray-700 dark:text-gray-300">
                {item.title}
              </span>
              {item.savings && (
                <span className="shrink-0 text-gray-500 dark:text-gray-400">
                  {item.savings}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PageSpeedResults({ output }: { output: PageSpeedOutput }) {
  if (output.error) {
    return (
      <div className="my-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm dark:border-red-800 dark:bg-red-950 dark:text-red-300">
        PageSpeed analysis failed: {output.error}
      </div>
    );
  }

  const {
    coreWebVitals,
    performanceScore,
    strategy,
    opportunities,
    diagnostics,
  } = output;

  return (
    <div className="my-2 max-w-lg space-y-3 rounded-lg border bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-gray-500 text-xs dark:text-gray-400">
            PageSpeed analysis for
          </div>
          <div className="font-mono text-sm">{output.url}</div>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-medium text-xs",
            getRatingBadgeColor(
              strategy === "mobile" ? "needs-improvement" : "good"
            )
          )}
        >
          {strategy}
        </span>
      </div>

      {/* Score and Core Web Vitals */}
      <div className="flex items-center gap-4">
        <ScoreGauge score={performanceScore} />
        <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2">
          {coreWebVitals.lcp && (
            <MetricCard
              label="LCP"
              rating={coreWebVitals.lcp.rating}
              value={coreWebVitals.lcp.displayValue}
            />
          )}
          {coreWebVitals.fcp && (
            <MetricCard
              label="FCP"
              rating={coreWebVitals.fcp.rating}
              value={coreWebVitals.fcp.displayValue}
            />
          )}
          {coreWebVitals.cls && (
            <MetricCard
              label="CLS"
              rating={coreWebVitals.cls.rating}
              value={coreWebVitals.cls.displayValue}
            />
          )}
          {coreWebVitals.inp && (
            <MetricCard
              label="INP"
              rating={coreWebVitals.inp.rating}
              value={coreWebVitals.inp.displayValue}
            />
          )}
          {coreWebVitals.ttfb && (
            <MetricCard
              label="TTFB"
              rating={coreWebVitals.ttfb.rating}
              value={coreWebVitals.ttfb.displayValue}
            />
          )}
        </div>
      </div>

      {/* Opportunities */}
      <ExpandableSection
        defaultOpen={opportunities.length > 0 && opportunities.length <= 3}
        items={opportunities}
        title="Opportunities"
      />

      {/* Diagnostics */}
      <ExpandableSection items={diagnostics} title="Diagnostics" />
    </div>
  );
}

interface PageSpeedToolProps {
  state: string;
  output?: PageSpeedOutput;
}

export function PageSpeedTool({ state, output }: PageSpeedToolProps) {
  if (state === "output-available" && output) {
    return <PageSpeedResults output={output} />;
  }

  return (
    <ToolCall icon={<ActivityIcon className="inline size-4 animate-pulse" />}>
      Running PageSpeed analysis...
    </ToolCall>
  );
}
