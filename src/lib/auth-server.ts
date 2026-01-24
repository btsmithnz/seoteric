import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";
import { convexSiteUrl, convexUrl } from "./env";

export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({ convexUrl, convexSiteUrl });
