export const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
export const convexSiteUrl = convexUrl.replace(".cloud", ".site");

export const deploymentUrl =
  process.env.VERCEL_PROJECT_PRODUCTION_URL || "http://localhost:3000";
