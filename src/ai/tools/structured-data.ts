import { tool } from "ai";
import { load } from "cheerio";
import { z } from "zod";

interface SchemaValidation {
  type: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  data: object;
}

interface StructuredDataResult {
  url: string;
  schemas: SchemaValidation[];
  hasStructuredData: boolean;
  recommendedTypes: string[];
}

interface RequiredField {
  field: string;
  message: string;
}

interface SchemaRequirements {
  required: RequiredField[];
  recommended: RequiredField[];
}

const SCHEMA_REQUIREMENTS: Record<string, SchemaRequirements> = {
  Organization: {
    required: [
      { field: "name", message: "Organization name is required" },
      { field: "url", message: "Organization URL is required" },
    ],
    recommended: [
      { field: "logo", message: "Consider adding organization logo" },
      {
        field: "contactPoint",
        message: "Consider adding contact information",
      },
      { field: "sameAs", message: "Consider adding social media profiles" },
    ],
  },
  Article: {
    required: [
      { field: "headline", message: "Article headline is required" },
      { field: "author", message: "Article author is required" },
      { field: "datePublished", message: "Publication date is required" },
    ],
    recommended: [
      { field: "dateModified", message: "Consider adding modification date" },
      { field: "image", message: "Consider adding article image" },
      { field: "publisher", message: "Consider adding publisher information" },
    ],
  },
  Product: {
    required: [
      { field: "name", message: "Product name is required" },
      {
        field: "offers",
        message: "Product offers/pricing information is required",
      },
    ],
    recommended: [
      { field: "description", message: "Consider adding product description" },
      { field: "image", message: "Consider adding product images" },
      { field: "brand", message: "Consider adding brand information" },
      { field: "sku", message: "Consider adding product SKU" },
      {
        field: "aggregateRating",
        message: "Consider adding aggregate rating",
      },
    ],
  },
  LocalBusiness: {
    required: [
      { field: "name", message: "Business name is required" },
      { field: "address", message: "Business address is required" },
    ],
    recommended: [
      { field: "telephone", message: "Consider adding phone number" },
      { field: "openingHours", message: "Consider adding opening hours" },
      { field: "geo", message: "Consider adding geographic coordinates" },
      { field: "priceRange", message: "Consider adding price range" },
    ],
  },
  BreadcrumbList: {
    required: [
      {
        field: "itemListElement",
        message: "BreadcrumbList requires itemListElement array",
      },
    ],
    recommended: [],
  },
  FAQPage: {
    required: [
      { field: "mainEntity", message: "FAQPage requires mainEntity with Q&A" },
    ],
    recommended: [],
  },
  WebSite: {
    required: [
      { field: "name", message: "Website name is required" },
      { field: "url", message: "Website URL is required" },
    ],
    recommended: [
      {
        field: "potentialAction",
        message:
          "Consider adding SearchAction for sitelinks searchbox in Google",
      },
    ],
  },
  WebPage: {
    required: [{ field: "name", message: "WebPage name is required" }],
    recommended: [
      { field: "description", message: "Consider adding page description" },
      { field: "breadcrumb", message: "Consider adding breadcrumb" },
    ],
  },
};

function getSchemaType(data: object): string {
  const typed = data as { "@type"?: string | string[] };
  if (Array.isArray(typed["@type"])) {
    return typed["@type"][0] || "Unknown";
  }
  return typed["@type"] || "Unknown";
}

function hasField(data: object, field: string): boolean {
  const typed = data as Record<string, unknown>;
  return (
    typed[field] !== undefined && typed[field] !== null && typed[field] !== ""
  );
}

function validateSchema(data: object): SchemaValidation {
  const type = getSchemaType(data);
  const errors: string[] = [];
  const warnings: string[] = [];

  const typed = data as { "@context"?: string };

  // Check for @context
  if (!typed["@context"]) {
    errors.push("Missing @context - should be https://schema.org");
  } else if (
    !typed["@context"].includes("schema.org") &&
    typeof typed["@context"] === "string"
  ) {
    errors.push("Invalid @context - should reference schema.org");
  }

  // Check type-specific requirements
  const requirements = SCHEMA_REQUIREMENTS[type];
  if (requirements) {
    for (const req of requirements.required) {
      if (!hasField(data, req.field)) {
        errors.push(req.message);
      }
    }
    for (const rec of requirements.recommended) {
      if (!hasField(data, rec.field)) {
        warnings.push(rec.message);
      }
    }
  } else {
    warnings.push(
      `Schema type "${type}" is not commonly validated - ensure it follows schema.org specifications`
    );
  }

  return {
    type,
    valid: errors.length === 0,
    errors,
    warnings,
    data,
  };
}

function detectRecommendedTypes(
  html: string,
  existingTypes: string[]
): string[] {
  const recommendations: string[] = [];
  const lowerHtml = html.toLowerCase();

  // Check for common page patterns
  const patterns: { type: string; indicators: string[] }[] = [
    {
      type: "Organization",
      indicators: ["about us", "our company", "contact us", "our team"],
    },
    {
      type: "Article",
      indicators: ["article", "blog post", "news", "author:", "published:"],
    },
    {
      type: "Product",
      indicators: [
        "add to cart",
        "buy now",
        "price",
        "$",
        "€",
        "£",
        "in stock",
      ],
    },
    {
      type: "LocalBusiness",
      indicators: [
        "opening hours",
        "visit us",
        "our location",
        "directions",
        "store hours",
      ],
    },
    {
      type: "FAQPage",
      indicators: [
        "frequently asked",
        "faq",
        "questions and answers",
        "common questions",
      ],
    },
    {
      type: "BreadcrumbList",
      indicators: ["breadcrumb", "home >", "home /", "›"],
    },
  ];

  for (const pattern of patterns) {
    if (existingTypes.includes(pattern.type)) {
      continue;
    }
    const hasIndicator = pattern.indicators.some((indicator) =>
      lowerHtml.includes(indicator)
    );
    if (hasIndicator) {
      recommendations.push(pattern.type);
    }
  }

  // Always recommend WebSite schema if not present
  if (!existingTypes.includes("WebSite")) {
    recommendations.push("WebSite");
  }

  return recommendations;
}

export const validateStructuredDataTool = tool({
  description:
    "Validate JSON-LD structured data on a page against schema.org requirements. Checks for required fields, common errors, and suggests additional schema types.",
  inputSchema: z.object({
    url: z.string().url().describe("The URL to validate structured data for"),
  }),
  execute: async ({
    url,
  }): Promise<StructuredDataResult | { error: string }> => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        return { error: `Failed to fetch page: HTTP ${response.status}` };
      }

      const html = await response.text();
      const $ = load(html);

      const schemas: SchemaValidation[] = [];

      // Extract and validate all JSON-LD scripts
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const content = $(el).html();
          if (content) {
            const parsed = JSON.parse(content);

            // Handle @graph arrays
            const typed = parsed as { "@graph"?: object[] };
            if (typed["@graph"] && Array.isArray(typed["@graph"])) {
              for (const item of typed["@graph"]) {
                schemas.push(validateSchema(item));
              }
            } else {
              schemas.push(validateSchema(parsed));
            }
          }
        } catch {
          schemas.push({
            type: "Invalid",
            valid: false,
            errors: ["Failed to parse JSON-LD - invalid JSON syntax"],
            warnings: [],
            data: {},
          });
        }
      });

      const existingTypes = schemas.map((s) => s.type);
      const recommendedTypes = detectRecommendedTypes(html, existingTypes);

      return {
        url,
        schemas,
        hasStructuredData: schemas.length > 0,
        recommendedTypes,
      };
    } catch (error) {
      return {
        error: `Error validating structured data: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  },
});
