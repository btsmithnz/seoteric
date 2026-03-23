import {
  BacklinksApi,
  DomainAnalyticsApi,
  OnPageApi,
  SerpApi,
} from "dataforseo-client";

const BASE_URL = "https://api.dataforseo.com";

function createAuthFetch(): (
  url: RequestInfo,
  init?: RequestInit
) => Promise<Response> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  if (!(login && password)) {
    throw new Error(
      "DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables must be set"
    );
  }

  const token = Buffer.from(`${login}:${password}`).toString("base64");

  return (url: RequestInfo, init?: RequestInit) =>
    fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Basic ${token}`,
      },
    });
}

function createHttpClient() {
  return { fetch: createAuthFetch() };
}

export function createSerpApi() {
  return new SerpApi(BASE_URL, createHttpClient());
}

export function createOnPageApi() {
  return new OnPageApi(BASE_URL, createHttpClient());
}

export function createDomainAnalyticsApi() {
  return new DomainAnalyticsApi(BASE_URL, createHttpClient());
}

export function createBacklinksApi() {
  return new BacklinksApi(BASE_URL, createHttpClient());
}
