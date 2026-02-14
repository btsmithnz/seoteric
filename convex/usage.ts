import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { internalMutation, query } from "./_generated/server";
import type { PlanLimits } from "./limits";
import { getPlanLimits } from "./limits";
import { polar } from "./polar";
import { getUser } from "./utils";

/**
 * Calculate the current billing period start date from an anchor date.
 * The anchor day-of-month is extracted and used to determine when the
 * current period started.
 */
export function calculatePeriodStart(anchorDate: Date, now: Date): string {
  const anchorDay = anchorDate.getDate();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Clamp anchor day to the last day of the current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const clampedDay = Math.min(anchorDay, daysInMonth);

  const candidateThisMonth = new Date(year, month, clampedDay);

  if (now >= candidateThisMonth) {
    return candidateThisMonth.toISOString().split("T")[0];
  }

  // We're before the anchor day this month, so period started last month
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
  const clampedPrevDay = Math.min(anchorDay, daysInPrevMonth);

  return new Date(prevYear, prevMonth, clampedPrevDay)
    .toISOString()
    .split("T")[0];
}

/**
 * Resolve the user's current plan tier and billing period.
 */
export async function getUserTier(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<{
  productKey: string;
  limits: PlanLimits;
  periodStart: string;
}> {
  const subscription = await polar.getCurrentSubscription(ctx, { userId });

  if (subscription) {
    const productKey = (subscription.productKey as string) ?? "free";
    const limits = getPlanLimits(productKey);
    const periodStart = subscription.currentPeriodStart.split("T")[0];
    return { productKey, limits, periodStart };
  }

  // No active subscription — determine period from billing anchor or account creation
  const now = new Date();

  const anchor = await ctx.db
    .query("billingAnchors")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (anchor) {
    const periodStart = calculatePeriodStart(new Date(anchor.anchorDate), now);
    return { productKey: "free", limits: getPlanLimits("free"), periodStart };
  }

  // Fall back to user creation date
  const user = await getUser(ctx);
  const createdAt = new Date(user.createdAt);
  const periodStart = calculatePeriodStart(createdAt, now);
  return { productKey: "free", limits: getPlanLimits("free"), periodStart };
}

export function getUsageRecord(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  periodStart: string
) {
  return ctx.db
    .query("usage")
    .withIndex("by_user_period", (q) =>
      q.eq("userId", userId).eq("periodStart", periodStart)
    )
    .first();
}

export async function getMessageCount(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  periodStart: string
): Promise<number> {
  const record = await getUsageRecord(ctx, userId, periodStart);
  return record?.messageCount ?? 0;
}

export async function getPageSpeedCount(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  periodStart: string
): Promise<number> {
  const record = await getUsageRecord(ctx, userId, periodStart);
  return record?.pageSpeedCount ?? 0;
}

export async function incrementMessageCount(
  ctx: MutationCtx,
  userId: string,
  periodStart: string
) {
  const record = await getUsageRecord(ctx, userId, periodStart);
  if (record) {
    await ctx.db.patch(record._id, {
      messageCount: record.messageCount + 1,
    });
  } else {
    await ctx.db.insert("usage", {
      userId,
      periodStart,
      messageCount: 1,
      pageSpeedCount: 0,
    });
  }
}

export async function incrementPageSpeedCount(
  ctx: MutationCtx,
  userId: string,
  periodStart: string,
  count = 1
) {
  const record = await getUsageRecord(ctx, userId, periodStart);
  if (record) {
    await ctx.db.patch(record._id, {
      pageSpeedCount: record.pageSpeedCount + count,
    });
  } else {
    await ctx.db.insert("usage", {
      userId,
      periodStart,
      messageCount: 0,
      pageSpeedCount: count,
    });
  }
}

export async function getUserSiteCount(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<number> {
  const sites = await ctx.db
    .query("sites")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  return sites.length;
}

export async function getUserActiveRecommendationCount(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<number> {
  const sites = await ctx.db
    .query("sites")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  let count = 0;
  for (const site of sites) {
    const open = await ctx.db
      .query("recommendations")
      .withIndex("by_site_status", (q) =>
        q.eq("siteId", site._id).eq("status", "open")
      )
      .collect();
    const inProgress = await ctx.db
      .query("recommendations")
      .withIndex("by_site_status", (q) =>
        q.eq("siteId", site._id).eq("status", "in_progress")
      )
      .collect();
    count += open.length + inProgress.length;
  }
  return count;
}

// --- Exported query ---

export const getUserUsage = query({
  handler: async (ctx) => {
    const user = await getUser(ctx);
    const { productKey, limits, periodStart } = await getUserTier(
      ctx,
      user._id
    );
    const messages = await getMessageCount(ctx, user._id, periodStart);
    const sites = await getUserSiteCount(ctx, user._id);
    const activeRecommendations = await getUserActiveRecommendationCount(
      ctx,
      user._id
    );
    const pageSpeedTests = await getPageSpeedCount(ctx, user._id, periodStart);

    return {
      plan: productKey,
      limits: {
        sites: limits.sites,
        messagesPerMonth: limits.messagesPerMonth,
        activeRecommendations: limits.activeRecommendations,
        pageSpeedTestsPerMonth: limits.pageSpeedTestsPerMonth,
      },
      current: {
        messages,
        sites,
        activeRecommendations,
        pageSpeedTests,
      },
    };
  },
});

// --- Internal mutation for webhook ---

export const setBillingAnchor = internalMutation({
  args: {
    userId: v.string(),
    anchorDate: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("billingAnchors")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { anchorDate: args.anchorDate });
    } else {
      await ctx.db.insert("billingAnchors", {
        userId: args.userId,
        anchorDate: args.anchorDate,
      });
    }
  },
});
