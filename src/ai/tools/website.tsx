import { tool } from "ai";
import { z } from "zod";
import { load } from "cheerio";

async function loadSiteHtml(url: string) {
  const response = await fetch(url);
  return response.text();
}

async function loadSiteDom(url: string) {
  const html = await loadSiteHtml(url);
  return load(html);
}

async function getWebsiteName(url: string) {
  const $ = await loadSiteDom(url);
  return $("title").text();
}

export const getWebsiteNameTool = tool({
  description: "Load a website and return the name (title)",
  inputSchema: z.object({
    url: z.url().describe("The URL of the website to load"),
  }),
  execute: async ({ url }) => getWebsiteName(url),
});

export async function getWebsiteText(url: string, length: number) {
  const $ = await loadSiteDom(url);
  const text = $("body").text();
  return text.slice(0, length);
}

export const getWebsiteTextTool = tool({
  description: "Load a website and return the text",
  inputSchema: z.object({
    url: z.url().describe("The URL of the website to load"),
    length: z
      .number()
      .max(2000)
      .describe("The length of the text to return")
      .default(1000),
  }),
  execute: async ({ url, length }) => getWebsiteText(url, length),
});

export async function inspectDom(url: string, selector: string) {
  const $ = await loadSiteDom(url);
  return $(selector)
    .map((_, el) => $(el).prop("outerHTML"))
    .slice(0, 20)
    .get();
}

export const inspectDomTool = tool({
  description: "Inspect a website and return the text of a selector.",
  inputSchema: z.object({
    url: z.url().describe("The URL of the website to load"),
    selector: z
      .string()
      .describe("The selector to inspect. Use the jQuery syntax."),
  }),
  execute: async ({ url, selector }) => inspectDom(url, selector),
});
