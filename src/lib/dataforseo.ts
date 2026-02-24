const BASE_URL = "https://api.dataforseo.com/v3";

function getAuthHeader(): string {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  if (!(login && password)) {
    throw new Error(
      "DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables must be set"
    );
  }

  return `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
}

export async function dataforseoPost<T = unknown>(
  path: string,
  body: unknown[]
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `DataForSEO API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}
