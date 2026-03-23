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

interface FastSearchOrganicResult {
  description: string;
  displayed_url?: string;
  position?: number;
  title: string;
  url: string;
}

interface FastSearchLocalResult {
  position?: number;
  review?: number;
  review_count?: number;
  title: string;
}

export interface FastSearchResponse {
  local_results?: FastSearchLocalResult[];
  meta_data: {
    number_of_results: number;
    number_of_organic_results: number;
    number_of_ads: number;
  };
  organic_results: FastSearchOrganicResult[];
}

export async function scrapingBeeFastSearch(
  query: string,
  countryCode?: string
): Promise<FastSearchResponse> {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;

  if (!apiKey) {
    throw new Error("SCRAPINGBEE_API_KEY environment variable must be set");
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    search: query,
  });

  if (countryCode) {
    params.set("country_code", countryCode);
  }

  const response = await fetch(`${BASE_URL}/fast_search?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(
      `ScrapingBee Fast Search error: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<FastSearchResponse>;
}
