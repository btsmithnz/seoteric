import { NextResponse } from "next/server";
import {
  checkAuth,
  isValidUrl,
  parsePageSpeedResponse,
  PageSpeedError,
} from "./_lib/pagespeed";

const PAGESPEED_API_URL =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { url, strategy = "mobile" } = body;

  if (!url || !isValidUrl(url)) {
    return NextResponse.json(
      { error: "Invalid URL provided" },
      { status: 400 }
    );
  }

  if (strategy !== "mobile" && strategy !== "desktop") {
    return NextResponse.json(
      { error: "Strategy must be 'mobile' or 'desktop'" },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams({
      url,
      strategy,
      category: "performance",
    });

    // Add API key
    params.append("key", process.env.GCP_API_KEY!);

    const response = await fetch(`${PAGESPEED_API_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData?.error?.message || `PageSpeed API error: ${response.status}`;
      return NextResponse.json(
        { error: errorMessage } satisfies PageSpeedError,
        { status: response.status }
      );
    }

    const data = await response.json();
    const result = parsePageSpeedResponse(data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("PageSpeed API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch PageSpeed data",
      } satisfies PageSpeedError,
      { status: 500 }
    );
  }
}
