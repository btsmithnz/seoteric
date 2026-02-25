import { tool } from "ai";
import { z } from "zod";
import { dataforseoPost } from "@/lib/dataforseo";

interface DfsWhoisItem {
  created_date: string | null;
  domain: string;
  expiration_date: string | null;
  registrar: { registrar_name: string | null } | null;
  status: string[] | null;
  updated_date: string | null;
}

interface DfsWhoisResponse {
  tasks: Array<{
    status_code: number;
    status_message: string;
    result: Array<{
      items: DfsWhoisItem[];
    }> | null;
  }>;
}

interface DfsBacklinksResult {
  backlinks: number | null;
  broken_backlinks: number | null;
  rank: number | null;
  referring_domains: number | null;
  referring_ips: number | null;
  spam_score: number | null;
  target: string;
}

interface DfsBacklinksResponse {
  tasks: Array<{
    status_code: number;
    status_message: string;
    result: DfsBacklinksResult[] | null;
  }>;
}

const LOW_DOMAIN_AGE_YEARS = 1;
const LOW_REFERRING_DOMAINS = 10;
const HIGH_SPAM_SCORE = 30;
const LOW_RANK_THRESHOLD = 100;
const WWW_REGEX = /^www\./;
const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25;

function extractDomain(input: string): string {
  try {
    const url = input.includes("://") ? input : `https://${input}`;
    return new URL(url).hostname.replace(WWW_REGEX, "");
  } catch {
    return input.replace(WWW_REGEX, "");
  }
}

function getDomainAgeYears(createdDate: string | null): number | null {
  if (!createdDate) {
    return null;
  }
  const created = new Date(createdDate);
  if (Number.isNaN(created.getTime())) {
    return null;
  }
  return (Date.now() - created.getTime()) / MS_PER_YEAR;
}

function buildTrustFlags(
  domainAgeYears: number | null,
  backlinksResult: DfsBacklinksResult | null
): string[] {
  const flags: string[] = [];

  if (domainAgeYears !== null && domainAgeYears < LOW_DOMAIN_AGE_YEARS) {
    flags.push(
      `Low domain age: ${domainAgeYears.toFixed(1)} years (under ${LOW_DOMAIN_AGE_YEARS} year)`
    );
  }

  const refDomains = backlinksResult?.referring_domains;
  if (refDomains != null && refDomains < LOW_REFERRING_DOMAINS) {
    flags.push(
      `Low referring domains: ${refDomains} (under ${LOW_REFERRING_DOMAINS})`
    );
  }

  const spamScore = backlinksResult?.spam_score;
  if (spamScore != null && spamScore > HIGH_SPAM_SCORE) {
    flags.push(`High spam score: ${spamScore}/100 (over ${HIGH_SPAM_SCORE})`);
  }

  const rank = backlinksResult?.rank;
  if (rank != null && rank < LOW_RANK_THRESHOLD) {
    flags.push(`Very low domain rank: ${rank} (DataForSEO rank scale 0–1000)`);
  }

  return flags;
}

export const checkTrustSignalsTool = tool({
  description:
    "Check E-E-A-T trust signals for a domain: domain age and registration details (WHOIS), backlink profile quality (referring domains, domain rank, spam score). Use for authority and trustworthiness assessment.",
  inputSchema: z.object({
    domain: z
      .string()
      .describe(
        "Domain name or URL to check trust signals for (e.g. example.com)"
      ),
  }),
  execute: async ({ domain }) => {
    try {
      const target = extractDomain(domain);

      const [whoisResponse, backlinksResponse] = await Promise.all([
        dataforseoPost<DfsWhoisResponse>(
          "/domain_analytics/whois/overview/live",
          [{ target }]
        ),
        dataforseoPost<DfsBacklinksResponse>("/backlinks/overview/live", [
          { target, include_subdomains: true },
        ]),
      ]);

      const whoisTask = whoisResponse.tasks[0];
      const backlinksTask = backlinksResponse.tasks[0];

      const whoisItem = whoisTask?.result?.[0]?.items?.[0] ?? null;
      const backlinksResult = backlinksTask?.result?.[0] ?? null;

      const domainAgeYears = getDomainAgeYears(whoisItem?.created_date ?? null);
      const trustFlags = buildTrustFlags(domainAgeYears, backlinksResult);

      const errors: string[] = [];
      if (whoisTask?.status_code !== 20_000) {
        errors.push(`WHOIS: ${whoisTask?.status_message}`);
      }
      if (backlinksTask?.status_code !== 20_000) {
        errors.push(`Backlinks: ${backlinksTask?.status_message}`);
      }

      return {
        domain: target,
        whois: whoisItem
          ? {
              createdDate: whoisItem.created_date,
              expirationDate: whoisItem.expiration_date,
              updatedDate: whoisItem.updated_date,
              registrar: whoisItem.registrar?.registrar_name ?? null,
              status: whoisItem.status ?? [],
              domainAgeYears:
                domainAgeYears !== null
                  ? Math.round(domainAgeYears * 10) / 10
                  : null,
            }
          : null,
        backlinks: backlinksResult
          ? {
              domainRank: backlinksResult.rank,
              totalBacklinks: backlinksResult.backlinks,
              referringDomains: backlinksResult.referring_domains,
              referringIps: backlinksResult.referring_ips,
              spamScore: backlinksResult.spam_score,
              brokenBacklinks: backlinksResult.broken_backlinks,
            }
          : null,
        trustFlags,
        errors,
      };
    } catch (error) {
      return {
        error: `Error checking trust signals: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
