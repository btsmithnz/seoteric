const BASE_URL = "https://app.scrapingbee.com/api/v1";

export async function scrapingBeeFetch(url: string): Promise<string> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;

  if (!apiKey) {
    throw new Error("SCRAPINGBEE_API_KEY environment variable must be set");
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    url,
    render_js: "true",
  });

  const response = await fetch(`${BASE_URL}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(
      `ScrapingBee API error: ${response.status} ${response.statusText}`
    );
  }

  return response.text();
}
