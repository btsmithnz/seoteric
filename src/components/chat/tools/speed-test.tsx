import { GaugeIcon } from "lucide-react";
import { ToolCall } from "./tool-call";
import { SpeedTestOutput } from "@/ai/tools/speed-test";

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

interface SpeedTestToolProps {
  state: string;
  output?: SpeedTestOutput;
}

export function SpeedTestTool({ state, output }: SpeedTestToolProps) {
  if (state === "output-available" && output) {
    return <SpeedTestResults output={output} />;
  }

  return (
    <ToolCall icon={<GaugeIcon className="size-4 inline animate-pulse" />}>
      Running speed test...
    </ToolCall>
  );
}
