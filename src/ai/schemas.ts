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
