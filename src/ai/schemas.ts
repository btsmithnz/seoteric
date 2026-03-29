import { z } from "zod";

export const siteContextSchema = z.object({
  siteCountry: z.string(),
  siteDomain: z.string(),
  siteGoogleLocationId: z.number().optional(),
  siteIndustry: z.string(),
  siteLatitude: z.number().optional(),
  siteLocation: z.string().optional(),
  siteLongitude: z.number().optional(),
  siteName: z.string(),
  siteObjective: z.string().optional(),
});

export type SiteContext = z.infer<typeof siteContextSchema>;

export const existingRecommendationSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  priority: z.string(),
  status: z.string(),
  pageUrl: z.string().optional(),
});

export type ExistingRecommendation = z.infer<
  typeof existingRecommendationSchema
>;
