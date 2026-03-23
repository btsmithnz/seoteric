import { tool } from "ai";
import {
  BacklinksSummaryLiveRequestInfo,
  type BacklinksSummaryLiveResultInfo,
  DomainAnalyticsWhoisOverviewLiveRequestInfo,
} from "dataforseo-client";
import { z } from "zod";
import { createBacklinksApi, createDomainAnalyticsApi } from "@/lib/dataforseo";

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

function getDomainAgeYears(
  createdDate: string | null | undefined
): number | null {
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
  backlinksResult: BacklinksSummaryLiveResultInfo | null
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

  const spamScore = backlinksResult?.backlinks_spam_score;
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

      const domainAnalyticsApi = createDomainAnalyticsApi();
      const backlinksApi = createBacklinksApi();

      const [whoisResponse, backlinksResponse] = await Promise.all([
        domainAnalyticsApi.whoisOverviewLive([
          new DomainAnalyticsWhoisOverviewLiveRequestInfo({ target }),
        ]),
        backlinksApi.summaryLive([
          new BacklinksSummaryLiveRequestInfo({
            target,
            include_subdomains: true,
          }),
        ]),
      ]);

      const whoisTask = whoisResponse?.tasks?.[0];
      const backlinksTask = backlinksResponse?.tasks?.[0];

      const whoisItem = whoisTask?.result?.[0]?.items?.[0] ?? null;
      const backlinksResult = backlinksTask?.result?.[0] ?? null;

      const domainAgeYears = getDomainAgeYears(
        whoisItem?.created_datetime ?? null
      );
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
              createdDate: whoisItem.created_datetime,
              expirationDate: whoisItem.expiration_datetime,
              updatedDate: whoisItem.updated_datetime,
              registrar: whoisItem.registrar ?? null,
              status: whoisItem.epp_status_codes ?? [],
              domainAgeYears:
                domainAgeYears === null
                  ? null
                  : Math.round(domainAgeYears * 10) / 10,
            }
          : null,
        backlinks: backlinksResult
          ? {
              domainRank: backlinksResult.rank,
              totalBacklinks: backlinksResult.backlinks,
              referringDomains: backlinksResult.referring_domains,
              referringIps: backlinksResult.referring_ips,
              spamScore: backlinksResult.backlinks_spam_score,
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
