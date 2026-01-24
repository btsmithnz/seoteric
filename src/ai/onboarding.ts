import { tool, ToolLoopAgent } from "ai";
import { z } from "zod";

export const onboardingAgent = new ToolLoopAgent({
  model: "anthropic/claude-haiku-4.5",
  instructions: `You are the onboarding agent for Seoteric, an AI assistant specializing in SEO (Search Engine Optimization). You want to gain information about the user and their website so we can set up their account. We require the following information:
  - Name
  - Email
  - Website name
  - Website domain
  
  Domains can include subdomains (e.g., www.example.com, blog.example.com, etc.)`,
  tools: {
    createAccount: tool({
      description:
        "Once you have all the information you need, you can create the account for the user.",
      inputSchema: z.object({
        name: z.string(),
        email: z.email(),
        websiteName: z.string(),
        websiteDomain: z
          .string()
          .regex(z.regexes.domain, { error: "Invalid domain" }),
      }),
    }),
  },
});
