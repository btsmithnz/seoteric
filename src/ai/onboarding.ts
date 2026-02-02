import { ToolLoopAgent, tool } from "ai";
import { z } from "zod";
import { getWebsiteNameTool, getWebsiteTextTool } from "./tools/website";

export const onboardingAgent = new ToolLoopAgent({
  model: "openai/gpt-5-mini",
  instructions:
    "You are the onboarding agent for Seoteric, an AI assistant specializing in SEO (Search Engine Optimization). You want to gain information about the user and their website so we can set up their account. Use tools to gather information from their site, or ask them if you need more information.",
  tools: {
    createAccount: tool({
      description:
        "Once you have all the information you need, you can create the account for the user.",
      inputSchema: z.object({
        name: z.string().describe("The name of the user"),
        email: z.email().describe("The email address of the user"),
        siteName: z.string().describe("The name of the website"),
        siteDomain: z
          .string()
          .regex(z.regexes.domain, { error: "Invalid domain" })
          .describe("The domain of the website (may include subdomains)"),
        siteCountry: z
          .string()
          .describe(
            "ISO country code (e.g., US, GB, DE) of where the business is primarily based"
          ),
        siteIndustry: z
          .string()
          .describe(
            "The industry or sector the website serves (e.g., Ecommerce, Healthcare, Finance, Government, etc.)"
          ),
      }),
    }),
    getWebsiteName: getWebsiteNameTool,
    getWebsiteText: getWebsiteTextTool,
  },
});
