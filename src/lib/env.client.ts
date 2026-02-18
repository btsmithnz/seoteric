const unsafeConvexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!unsafeConvexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
}
export const convexUrl = unsafeConvexUrl;

const unsafeConvexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
if (!unsafeConvexSiteUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_SITE_URL is not set");
}
export const convexSiteUrl = unsafeConvexSiteUrl;
