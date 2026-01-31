import { UIMessage } from "ai";
import { Message, MessageResponse } from "../ai-elements/message";
import { MessageContent } from "../ai-elements/message";
import {
  BrainIcon,
  GlobeIcon,
  SearchIcon,
  LightbulbIcon,
  CheckCircleIcon,
  GaugeIcon,
} from "lucide-react";
import { Spinner } from "../ui/spinner";
import { RecommendationCard } from "../../app/(dash)/sites/[site]/chats/recommendations-sidebar/card";
import { CreateRecommendationOutput } from "@/ai/tools/recommendations";
import { SpeedTestRegionResult } from "@/app/api/speed-test/_lib/speed-test";

interface SpeedTestOutput {
  url: string;
  results: SpeedTestRegionResult[];
  error?: string;
}

function getTtfbColor(ttfb: number): string {
  if (ttfb < 200) return "text-green-600 dark:text-green-400";
  if (ttfb < 500) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function SpeedTestResults({ output }: { output: SpeedTestOutput }) {
  if (output.error) {
    return (
      <div className="my-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
        Speed test failed: {output.error}
      </div>
    );
  }

  return (
    <div className="my-2 max-w-lg rounded-lg border bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
        Speed test for <span className="font-mono">{output.url}</span>
      </div>
      <div className="space-y-1">
        {output.results.map((result) => (
          <div
            key={result.region}
            className="flex items-center justify-between rounded bg-white px-2 py-1.5 text-sm dark:bg-gray-900"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{result.regionInfo.name}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {result.regionInfo.country}
              </span>
            </div>
            {result.error ? (
              <span className="text-xs text-red-500 dark:text-red-400">
                {result.error}
              </span>
            ) : result.timing ? (
              <div className="flex items-center gap-3 text-xs">
                <span className={getTtfbColor(result.timing.ttfb)}>
                  {result.timing.ttfb}ms TTFB
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {result.timing.total}ms total
                </span>
                {result.size && (
                  <span className="text-gray-400 dark:text-gray-500">
                    {result.size.formatted}
                  </span>
                )}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolCall({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <p className="text-sm text-gray-500">
      {icon} {children}
    </p>
  );
}

export function SeotericMessages({ messages }: { messages: UIMessage[] }) {
  return (
    <>
      {messages.map((message) => (
        <div key={message.id}>
          {message.parts.map((part, idx) => {
            const partId = `${message.id}-${idx}`;

            switch (part.type) {
              case "text":
                return (
                  <Message key={partId} from={message.role}>
                    <MessageContent>
                      <MessageResponse>{part.text}</MessageResponse>
                    </MessageContent>
                  </Message>
                );

              case "reasoning":
                return (
                  <p key={partId} className="text-sm text-gray-500">
                    <BrainIcon className="size-4 inline" />{" "}
                    {part.text || "Reasoning"}
                  </p>
                );

              case "tool-createAccount":
                return (
                  <ToolCall
                    key={partId}
                    icon={<Spinner className="size-4 inline" />}
                  >
                    Creating your account
                  </ToolCall>
                );

              case "tool-getWebsiteName":
                return (
                  <ToolCall
                    key={partId}
                    icon={<GlobeIcon className="size-4 inline" />}
                  >
                    Looking at your website
                  </ToolCall>
                );

              case "tool-getWebsiteText":
                return (
                  <ToolCall
                    key={partId}
                    icon={<GlobeIcon className="size-4 inline" />}
                  >
                    Reading your website
                  </ToolCall>
                );

              case "tool-inspectDom":
                return (
                  <ToolCall
                    key={partId}
                    icon={<SearchIcon className="size-4 inline" />}
                  >
                    Inspecting your website
                  </ToolCall>
                );

              case "tool-createRecommendation":
                if (part.state === "output-available") {
                  const output = part.output as CreateRecommendationOutput;
                  return (
                    <div key={partId} className="my-2 max-w-md">
                      <RecommendationCard
                        recommendation={{
                          title: output.title,
                          description: output.description,
                          category: output.category,
                          priority: output.priority,
                          pageUrl: output.pageUrl,
                        }}
                        compact
                        showActions={false}
                      />
                    </div>
                  );
                }
                return (
                  <ToolCall
                    key={partId}
                    icon={<LightbulbIcon className="size-4 inline" />}
                  >
                    Creating recommendation...
                  </ToolCall>
                );

              case "tool-updateRecommendation":
                return (
                  <ToolCall
                    key={partId}
                    icon={<CheckCircleIcon className="size-4 inline" />}
                  >
                    {part.state === "output-available"
                      ? "Updated recommendation"
                      : "Updating recommendation..."}
                  </ToolCall>
                );

              case "tool-runSpeedTest":
                if (part.state === "output-available") {
                  const output = part.output as SpeedTestOutput;
                  return <SpeedTestResults key={partId} output={output} />;
                }
                return (
                  <ToolCall
                    key={partId}
                    icon={<GaugeIcon className="size-4 inline animate-pulse" />}
                  >
                    Running speed test...
                  </ToolCall>
                );

              default:
                return null;
            }
          })}
        </div>
      ))}
    </>
  );
}
