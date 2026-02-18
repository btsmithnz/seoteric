import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";
import { convexSiteUrl, convexUrl } from "./env.client";
import { isAuthError } from "./utils";

export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl,
  convexSiteUrl,
  jwtCache: {
    enabled: true,
    isAuthError,
    expirationToleranceSeconds: 60 * 60 * 24 * 7, // 7 days
  },
});
