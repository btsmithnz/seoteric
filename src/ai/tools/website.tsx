import { tool } from "ai";
import { z } from "zod";
import { JSDOM } from "jsdom";

async function loadSiteHtml(url: string) {
  const response = await fetch(url);
  return response.text();
}

async function loadSiteDom(url: string) {
  const document = await loadSiteHtml(url);
  return new JSDOM(document).window.document;
}

export const getWebsiteName = tool({
  description: "Load a website and return the name (title)",
  inputSchema: z.object({
    url: z.url().describe("The URL of the website to load"),
  }),
  execute: async ({ url }) => {
    const document = await loadSiteDom(url);
    return document.title;
  },
});

export const getWebsiteText = tool({
  description: "Load a website and return the text",
  inputSchema: z.object({
    url: z.url().describe("The URL of the website to load"),
    length: z
      .number()
      .max(2000)
      .describe("The length of the text to return")
      .default(1000),
  }),
  execute: async ({ url }) => {
    const document = await loadSiteDom(url);
    return document.body.textContent;
  },
});
