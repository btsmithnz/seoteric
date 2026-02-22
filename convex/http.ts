import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { authComponent, createAuth } from "./auth";
import { polar } from "./polar";

const http = httpRouter();

function toTimestampMs(value: unknown): number {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "string") {
    return Date.parse(value);
  }
  return Number.NaN;
}

// Auth
authComponent.registerRoutes(http, createAuth);

// Polar
polar.registerRoutes(http, {
  onSubscriptionCreated: async (ctx, event) => {
    const userId = event.data.customer.metadata?.userId;
    const anchorMs = toTimestampMs(event.data.currentPeriodStart);
    if (typeof userId !== "string") {
      return;
    }
    if (!Number.isFinite(anchorMs)) {
      return;
    }
    await ctx.runMutation(internal.billing.upsertBillingAnchorInternal, {
      userId,
      anchorMs,
    });
  },
  onSubscriptionUpdated: async (ctx, event) => {
    const userId = event.data.customer.metadata?.userId;
    const anchorMs = toTimestampMs(event.data.currentPeriodStart);
    if (typeof userId !== "string") {
      return;
    }
    if (!Number.isFinite(anchorMs)) {
      return;
    }
    await ctx.runMutation(internal.billing.upsertBillingAnchorInternal, {
      userId,
      anchorMs,
    });
  },
});

export default http;
