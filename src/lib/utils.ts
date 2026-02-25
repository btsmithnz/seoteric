import { type ClassValue, clsx } from "clsx";
import { ConvexError } from "convex/values";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AUTH_ERROR_REGEX = /auth/i;
export const isAuthError = (error: unknown) => {
  // This broadly matches potentially auth related errors, can be rewritten to
  // work with your app's own error handling.
  const message =
    (error instanceof ConvexError && error.data) ||
    (error instanceof Error && error.message) ||
    "";
  return AUTH_ERROR_REGEX.test(message);
};

const DOMAIN_REGEX = /^https?:\/\//;
const SLASH_REGEX = /\//;
export function cleanDomain(domain: string) {
  return domain.replace(DOMAIN_REGEX, "").replace(SLASH_REGEX, "");
}

export function parseFloatSafe(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}
