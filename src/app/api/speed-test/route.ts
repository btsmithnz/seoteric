import { NextResponse } from "next/server";
import {
  runSpeedTest,
  checkAuth,
  isValidUrl,
  REGIONS,
  type RegionCode,
  type SpeedTestResult,
} from "./_lib/speed-test";

export const preferredRegion = ["iad1"];
export const runtime = "edge";

interface RegionalResult extends SpeedTestResult {
  region: RegionCode;
  regionInfo: (typeof REGIONS)[RegionCode];
}

interface RegionalError {
  region: RegionCode;
  regionInfo: (typeof REGIONS)[RegionCode];
  error: string;
  details?: string;
}

type RegionalResponse = RegionalResult | RegionalError;

async function fetchRegionalEndpoint(
  region: RegionCode,
  url: string,
  authHeader: string,
  baseUrl: string
): Promise<RegionalResponse> {
  try {
    const response = await fetch(`${baseUrl}/api/speed-test/${region}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ url }),
    });

    return await response.json();
  } catch (error) {
    return {
      region,
      regionInfo: REGIONS[region],
      error: "Failed to reach regional endpoint",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, regions } = await req.json();

  if (!url || !isValidUrl(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Multi-region mode
  if (regions) {
    const authHeader = req.headers.get("authorization") ?? "";
    const requestUrl = new URL(req.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

    const regionList: RegionCode[] =
      regions === "all"
        ? (Object.keys(REGIONS) as RegionCode[])
        : (regions as RegionCode[]).filter(
            (r): r is RegionCode => r in REGIONS
          );

    if (regionList.length === 0) {
      return NextResponse.json(
        { error: "No valid regions specified" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      regionList.map((region) =>
        fetchRegionalEndpoint(region, url, authHeader, baseUrl)
      )
    );

    return NextResponse.json({
      url,
      results,
    });
  }

  // Single-region mode (default behavior)
  try {
    const result = await runSpeedTest(url);
    return NextResponse.json({
      region: "iad1",
      regionInfo: REGIONS.iad1,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch URL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
