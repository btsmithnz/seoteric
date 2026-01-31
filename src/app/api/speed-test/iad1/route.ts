import { NextResponse } from "next/server";
import {
  runSpeedTest,
  checkAuth,
  isValidUrl,
  REGIONS,
} from "../_lib/speed-test";

export const preferredRegion = ["iad1"];

export async function POST(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url } = await req.json();
  if (!url || !isValidUrl(url)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

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
