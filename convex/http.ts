import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { authComponent, createAuth } from "./auth";
import { polar } from "./polar";

const http = httpRouter();

// Auth
authComponent.registerRoutes(http, createAuth);

// Polar
polar.registerRoutes(http, {
  onSubscriptionUpdated: async (ctx, event) => {
    const { status, currentPeriodEnd } = event.data;
    const userId = event.data.customer.metadata.userId;

    if (
      typeof userId === "string" &&
      status === "canceled" &&
      currentPeriodEnd
    ) {
      await ctx.runMutation(internal.usage.setBillingAnchor, {
        userId,
        anchorDate: currentPeriodEnd.toISOString(),
      });
    }
  },
});

export default http;
