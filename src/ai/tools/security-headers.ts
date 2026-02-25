import { tool } from "ai";
import { z } from "zod";

interface HeaderCheck {
  present: boolean;
  recommendation: string | null;
  value: string | null;
}

interface SecurityHeadersResult {
  headers: {
    strictTransportSecurity: HeaderCheck;
    contentSecurityPolicy: HeaderCheck;
    xContentTypeOptions: HeaderCheck;
    xFrameOptions: HeaderCheck;
    referrerPolicy: HeaderCheck;
    permissionsPolicy: HeaderCheck;
  };
  missingCritical: string[];
  score: number;
  url: string;
}

interface HeaderConfig {
  critical: boolean;
  headerName: string;
  name: string;
  validate: (value: string | null) => {
    valid: boolean;
    recommendation: string | null;
  };
  weight: number;
}

const MAX_AGE_REGEX = /max-age=\d+/;
const MAX_AGE_CAPTURE_REGEX = /max-age=(\d+)/;

const HEADER_CONFIGS: HeaderConfig[] = [
  {
    name: "strictTransportSecurity",
    headerName: "strict-transport-security",
    weight: 25,
    critical: true,
    validate: (value) => {
      if (!value) {
        return {
          valid: false,
          recommendation:
            'Add Strict-Transport-Security header with "max-age=31536000; includeSubDomains"',
        };
      }
      const hasMaxAge = MAX_AGE_REGEX.test(value);
      const maxAgeMatch = value.match(MAX_AGE_CAPTURE_REGEX);
      const maxAge = maxAgeMatch ? Number.parseInt(maxAgeMatch[1], 10) : 0;

      if (!hasMaxAge || maxAge < 31_536_000) {
        return {
          valid: false,
          recommendation:
            "Increase max-age to at least 31536000 (1 year) and consider adding includeSubDomains",
        };
      }
      return { valid: true, recommendation: null };
    },
  },
  {
    name: "contentSecurityPolicy",
    headerName: "content-security-policy",
    weight: 20,
    critical: true,
    validate: (value) => {
      if (!value) {
        return {
          valid: false,
          recommendation:
            "Add Content-Security-Policy header to prevent XSS and injection attacks",
        };
      }
      // Basic check for unsafe-inline in script-src
      if (value.includes("'unsafe-inline'") && value.includes("script-src")) {
        return {
          valid: false,
          recommendation:
            "Remove 'unsafe-inline' from script-src and use nonces or hashes instead",
        };
      }
      return { valid: true, recommendation: null };
    },
  },
  {
    name: "xContentTypeOptions",
    headerName: "x-content-type-options",
    weight: 15,
    critical: true,
    validate: (value) => {
      if (!value) {
        return {
          valid: false,
          recommendation:
            'Add X-Content-Type-Options header with value "nosniff"',
        };
      }
      if (value.toLowerCase() !== "nosniff") {
        return {
          valid: false,
          recommendation: 'Set X-Content-Type-Options value to "nosniff"',
        };
      }
      return { valid: true, recommendation: null };
    },
  },
  {
    name: "xFrameOptions",
    headerName: "x-frame-options",
    weight: 15,
    critical: false,
    validate: (value) => {
      if (!value) {
        return {
          valid: false,
          recommendation:
            'Add X-Frame-Options header with "DENY" or "SAMEORIGIN" to prevent clickjacking',
        };
      }
      const upperValue = value.toUpperCase();
      if (upperValue !== "DENY" && upperValue !== "SAMEORIGIN") {
        return {
          valid: false,
          recommendation: 'Set X-Frame-Options to "DENY" or "SAMEORIGIN"',
        };
      }
      return { valid: true, recommendation: null };
    },
  },
  {
    name: "referrerPolicy",
    headerName: "referrer-policy",
    weight: 15,
    critical: false,
    validate: (value) => {
      if (!value) {
        return {
          valid: false,
          recommendation:
            'Add Referrer-Policy header (recommended: "strict-origin-when-cross-origin")',
        };
      }
      const validPolicies = [
        "no-referrer",
        "no-referrer-when-downgrade",
        "origin",
        "origin-when-cross-origin",
        "same-origin",
        "strict-origin",
        "strict-origin-when-cross-origin",
      ];
      if (!validPolicies.includes(value.toLowerCase())) {
        return {
          valid: false,
          recommendation: `Invalid Referrer-Policy value. Use one of: ${validPolicies.join(", ")}`,
        };
      }
      return { valid: true, recommendation: null };
    },
  },
  {
    name: "permissionsPolicy",
    headerName: "permissions-policy",
    weight: 10,
    critical: false,
    validate: (value) => {
      if (!value) {
        return {
          valid: false,
          recommendation:
            "Add Permissions-Policy header to control browser features (e.g., camera, microphone, geolocation)",
        };
      }
      return { valid: true, recommendation: null };
    },
  },
];

export const checkSecurityHeadersTool = tool({
  description:
    "Check security headers that affect SEO trust signals. Analyzes HSTS, CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and Permissions-Policy.",
  inputSchema: z.object({
    url: z.string().describe("The URL to check security headers for"),
  }),
  execute: async ({
    url,
  }): Promise<SecurityHeadersResult | { error: string }> => {
    try {
      const response = await fetch(url, { method: "HEAD" });

      const headers: Record<string, HeaderCheck> = {};
      const missingCritical: string[] = [];
      let totalScore = 0;

      for (const config of HEADER_CONFIGS) {
        const value = response.headers.get(config.headerName);
        const validation = config.validate(value);

        headers[config.name] = {
          present: value !== null,
          value,
          recommendation: validation.recommendation,
        };

        if (validation.valid) {
          totalScore += config.weight;
        }

        if (!value && config.critical) {
          missingCritical.push(config.headerName);
        }
      }

      return {
        url,
        score: totalScore,
        headers: headers as SecurityHeadersResult["headers"],
        missingCritical,
      };
    } catch (error) {
      return {
        error: `Error checking security headers: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
