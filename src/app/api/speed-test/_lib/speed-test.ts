export interface SpeedTestResult {
  url: string;
  finalUrl: string;
  status: number;
  redirected: boolean;
  timing: { ttfb: number; total: number };
  size: { bytes: number; formatted: string };
  headers: {
    contentType: string | null;
    contentEncoding: string | null;
    cacheControl: string | null;
    server: string | null;
  };
  error?: string;
}

export interface SpeedTestRegionResult extends SpeedTestResult {
  region: string;
  regionInfo: { name: string; country: string };
}

export const REGIONS = {
  iad1: { name: "Washington, D.C.", country: "USA" },
  sfo1: { name: "San Francisco", country: "USA" },
  lhr1: { name: "London", country: "UK" },
  hnd1: { name: "Tokyo", country: "Japan" },
  sin1: { name: "Singapore", country: "Singapore" },
  syd1: { name: "Sydney", country: "Australia" },
} as const;

export type RegionCode = keyof typeof REGIONS;

export function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

export function checkAuth(req: Request): boolean {
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.INTERNAL_API_KEY;
  return !!expectedToken && authHeader === `Bearer ${expectedToken}`;
}

export async function runSpeedTest(url: string): Promise<SpeedTestResult> {
  const startTime = performance.now();

  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "SeotericSpeedTest/1.0",
      Accept: "text/html,application/xhtml+xml,*/*",
      "Accept-Encoding": "gzip, deflate, br",
    },
  });

  const ttfb = performance.now() - startTime;

  // Read full body to get total time
  const body = await response.arrayBuffer();
  const total = performance.now() - startTime;

  return {
    url,
    finalUrl: response.url,
    status: response.status,
    redirected: response.redirected,
    timing: {
      ttfb: Math.round(ttfb),
      total: Math.round(total),
    },
    size: {
      bytes: body.byteLength,
      formatted: formatBytes(body.byteLength),
    },
    headers: {
      contentType: response.headers.get("content-type"),
      contentEncoding: response.headers.get("content-encoding"),
      cacheControl: response.headers.get("cache-control"),
      server: response.headers.get("server"),
    },
  };
}
