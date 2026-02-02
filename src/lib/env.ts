const unsafeConvexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!unsafeConvexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}

export const convexUrl = unsafeConvexUrl;
export const convexSiteUrl = convexUrl.replace(".cloud", ".site");

export const deploymentUrl =
  process.env.VERCEL_PROJECT_PRODUCTION_URL || "http://localhost:3000";
