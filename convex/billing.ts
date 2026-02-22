import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import {
  internalMutation,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { PLAN_PRODUCT_IDS, polar } from "./polar";
import { getUser } from "./utils";

export type PlanKey = "starter" | "pro" | "agency";
export type ModelTier = "basic" | "premium";

export const PLAN_LIMITS = {
  starter: {
    sites: 1,
    messages: 100,
    pageSpeedReports: 5,
    modelTier: "basic" as const,
  },
  pro: {
    sites: 3,
    messages: 1000,
    pageSpeedReports: 20,
    modelTier: "premium" as const,
  },
  agency: {
    sites: 50,
    messages: 5000,
    pageSpeedReports: 100,
    modelTier: "premium" as const,
  },
} as const;

const LIMIT_EXCEEDED_CODE = "LIMIT_EXCEEDED";

const PRODUCT_TO_PLAN: Record<string, Exclude<PlanKey, "starter">> = {
  [PLAN_PRODUCT_IDS.proMonthly]: "pro",
  [PLAN_PRODUCT_IDS.agencyMonthly]: "agency",
};

type BillingCtx = QueryCtx | MutationCtx;

interface BillingUser {
  _id: string;
  createdAt?: number | null;
  _creationTime?: number;
}

type ResolvedSubscription = {
  productId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  productName: string;
} | null;

interface BillingState {
  user: BillingUser;
  plan: PlanKey;
  limits: (typeof PLAN_LIMITS)[PlanKey];
  cycleStartMs: number;
  cycleEndMs: number;
  subscription: ResolvedSubscription;
}

interface CycleUsage {
  messagesUsed: number;
  pageSpeedReportsUsed: number;
}

interface PolarSubscriptionLike {
  productId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  product?: { name?: string | null } | null;
}

const FEATURE_LABELS = {
  sites: "sites",
  messages: "messages",
  pageSpeedReports: "PageSpeed reports",
} as const;

function toMs(value: string | null | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function monthLengthUtc(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function offsetYearMonth(
  year: number,
  month: number,
  delta: number
): {
  year: number;
  month: number;
} {
  const total = year * 12 + month + delta;
  const nextYear = Math.floor(total / 12);
  const nextMonth = ((total % 12) + 12) % 12;
  return { year: nextYear, month: nextMonth };
}

function getAnchorParts(anchorMs: number) {
  const anchor = new Date(anchorMs);
  return {
    day: anchor.getUTCDate(),
    hour: anchor.getUTCHours(),
    minute: anchor.getUTCMinutes(),
    second: anchor.getUTCSeconds(),
    millisecond: anchor.getUTCMilliseconds(),
  };
}

function buildAnchoredMonthTimestamp(
  year: number,
  month: number,
  anchorMs: number
): number {
  const parts = getAnchorParts(anchorMs);
  const clampedDay = Math.min(parts.day, monthLengthUtc(year, month));

  return Date.UTC(
    year,
    month,
    clampedDay,
    parts.hour,
    parts.minute,
    parts.second,
    parts.millisecond
  );
}

function shiftAnchoredMonth(anchorMs: number, deltaMonths: number): number {
  const base = new Date(anchorMs);
  const { year, month } = offsetYearMonth(
    base.getUTCFullYear(),
    base.getUTCMonth(),
    deltaMonths
  );
  return buildAnchoredMonthTimestamp(year, month, anchorMs);
}

function cycleWindowFromAnchor(
  anchorMs: number,
  nowMs: number
): {
  cycleStartMs: number;
  cycleEndMs: number;
} {
  const now = new Date(nowMs);
  const thisMonthAnchor = buildAnchoredMonthTimestamp(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    anchorMs
  );

  if (nowMs < thisMonthAnchor) {
    return {
      cycleStartMs: shiftAnchoredMonth(thisMonthAnchor, -1),
      cycleEndMs: thisMonthAnchor,
    };
  }

  return {
    cycleStartMs: thisMonthAnchor,
    cycleEndMs: shiftAnchoredMonth(thisMonthAnchor, 1),
  };
}

async function getBillingProfile(
  ctx: BillingCtx,
  userId: string
): Promise<{ _id: string; lastPaidAnchorMs: number } | null> {
  const profile = await ctx.db
    .query("billingProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

  if (!profile) {
    return null;
  }

  return {
    _id: profile._id,
    lastPaidAnchorMs: profile.lastPaidAnchorMs,
  };
}

async function getCycleUsage(
  ctx: BillingCtx,
  userId: string,
  cycleStartMs: number
): Promise<CycleUsage> {
  const bucket = await ctx.db
    .query("usageBuckets")
    .withIndex("by_user_cycle_start", (q) =>
      q.eq("userId", userId).eq("cycleStartMs", cycleStartMs)
    )
    .unique();

  return {
    messagesUsed: bucket?.messagesUsed ?? 0,
    pageSpeedReportsUsed: bucket?.pageSpeedReportsUsed ?? 0,
  };
}

async function countSites(ctx: BillingCtx, userId: string): Promise<number> {
  const sites = await ctx.db
    .query("sites")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  return sites.length;
}

function getDefaultStarterAnchor(user: BillingUser): number {
  return user.createdAt ?? user._creationTime ?? Date.now();
}

function asResolvedSubscription(
  subscription: PolarSubscriptionLike | null | undefined
): ResolvedSubscription {
  if (!subscription) {
    return null;
  }

  return {
    productId: subscription.productId,
    status: subscription.status,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    productName: subscription.product?.name ?? "",
  };
}

async function resolveBillingState(
  ctx: BillingCtx,
  user: BillingUser,
  nowMs: number
): Promise<BillingState> {
  const subscription = asResolvedSubscription(
    await polar.getCurrentSubscription(ctx, {
      userId: user._id,
    })
  );

  const paidPlan =
    subscription != null ? PRODUCT_TO_PLAN[subscription.productId] : undefined;

  if (paidPlan && subscription) {
    const cycleStartMs = toMs(subscription.currentPeriodStart, nowMs);
    const cycleEndMs = toMs(
      subscription.currentPeriodEnd,
      shiftAnchoredMonth(cycleStartMs, 1)
    );

    return {
      user,
      plan: paidPlan,
      limits: PLAN_LIMITS[paidPlan],
      cycleStartMs,
      cycleEndMs,
      subscription,
    };
  }

  const profile = await getBillingProfile(ctx, user._id);
  const starterAnchorMs =
    profile?.lastPaidAnchorMs ?? getDefaultStarterAnchor(user);
  const { cycleStartMs, cycleEndMs } = cycleWindowFromAnchor(
    starterAnchorMs,
    nowMs
  );

  return {
    user,
    plan: "starter",
    limits: PLAN_LIMITS.starter,
    cycleStartMs,
    cycleEndMs,
    subscription,
  };
}

function buildLimitMessage(
  feature: keyof typeof FEATURE_LABELS,
  plan: PlanKey,
  limit: number
): string {
  return `You've reached your ${limit} ${FEATURE_LABELS[feature]} on the ${plan} plan. Upgrade to continue.`;
}

function throwLimitExceeded(options: {
  feature: keyof typeof FEATURE_LABELS;
  plan: PlanKey;
  limit: number;
  used: number;
  cycleStartMs?: number;
  cycleEndMs?: number;
}): never {
  throw new ConvexError({
    code: LIMIT_EXCEEDED_CODE,
    feature: options.feature,
    plan: options.plan,
    limit: options.limit,
    used: options.used,
    cycleStartMs: options.cycleStartMs,
    cycleEndMs: options.cycleEndMs,
    cta: "upgrade",
    message: buildLimitMessage(options.feature, options.plan, options.limit),
  });
}

async function upsertBillingAnchor(
  ctx: MutationCtx,
  userId: string,
  anchorMs: number
) {
  const profile = await ctx.db
    .query("billingProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

  if (!profile) {
    await ctx.db.insert("billingProfiles", {
      userId,
      lastPaidAnchorMs: anchorMs,
    });
    return;
  }

  if (profile.lastPaidAnchorMs !== anchorMs) {
    await ctx.db.patch(profile._id, {
      lastPaidAnchorMs: anchorMs,
    });
  }
}

async function maybePersistPaidAnchor(ctx: MutationCtx, state: BillingState) {
  if (state.plan === "starter") {
    return;
  }

  await upsertBillingAnchor(ctx, state.user._id, state.cycleStartMs);
}

async function getOrCreateUsageBucket(
  ctx: MutationCtx,
  state: BillingState
): Promise<{
  _id: Id<"usageBuckets">;
  messagesUsed: number;
  pageSpeedReportsUsed: number;
}> {
  const existing = await ctx.db
    .query("usageBuckets")
    .withIndex("by_user_cycle_start", (q) =>
      q.eq("userId", state.user._id).eq("cycleStartMs", state.cycleStartMs)
    )
    .unique();

  if (existing) {
    return {
      _id: existing._id,
      messagesUsed: existing.messagesUsed,
      pageSpeedReportsUsed: existing.pageSpeedReportsUsed,
    };
  }

  const createdId = await ctx.db.insert("usageBuckets", {
    userId: state.user._id,
    cycleStartMs: state.cycleStartMs,
    cycleEndMs: state.cycleEndMs,
    messagesUsed: 0,
    pageSpeedReportsUsed: 0,
  });

  return {
    _id: createdId,
    messagesUsed: 0,
    pageSpeedReportsUsed: 0,
  };
}

async function getEntitlementsForUser(
  ctx: BillingCtx,
  user: BillingUser
): Promise<{
  plan: PlanKey;
  modelTier: ModelTier;
  limits: {
    sites: number;
    messages: number;
    pageSpeedReports: number;
  };
  usage: {
    sites: number;
    messages: number;
    pageSpeedReports: number;
  };
  remaining: {
    sites: number;
    messages: number;
    pageSpeedReports: number;
  };
  cycle: {
    startMs: number;
    endMs: number;
  };
  subscription: ResolvedSubscription;
}> {
  const state = await resolveBillingState(ctx, user, Date.now());
  const [cycleUsage, sitesUsed] = await Promise.all([
    getCycleUsage(ctx, user._id, state.cycleStartMs),
    countSites(ctx, user._id),
  ]);

  const usage = {
    sites: sitesUsed,
    messages: cycleUsage.messagesUsed,
    pageSpeedReports: cycleUsage.pageSpeedReportsUsed,
  };

  const limits = {
    sites: state.limits.sites,
    messages: state.limits.messages,
    pageSpeedReports: state.limits.pageSpeedReports,
  };

  return {
    plan: state.plan,
    modelTier: state.limits.modelTier,
    limits,
    usage,
    remaining: {
      sites: Math.max(0, limits.sites - usage.sites),
      messages: Math.max(0, limits.messages - usage.messages),
      pageSpeedReports: Math.max(
        0,
        limits.pageSpeedReports - usage.pageSpeedReports
      ),
    },
    cycle: {
      startMs: state.cycleStartMs,
      endMs: state.cycleEndMs,
    },
    subscription: state.subscription,
  };
}

export async function assertCanCreateSiteForUser(
  ctx: MutationCtx,
  user: BillingUser
) {
  const entitlements = await getEntitlementsForUser(ctx, user);

  if (entitlements.usage.sites >= entitlements.limits.sites) {
    throwLimitExceeded({
      feature: "sites",
      plan: entitlements.plan,
      limit: entitlements.limits.sites,
      used: entitlements.usage.sites,
      cycleStartMs: entitlements.cycle.startMs,
      cycleEndMs: entitlements.cycle.endMs,
    });
  }

  return entitlements;
}

export const getEntitlements = query({
  args: {},
  handler: async (ctx) => {
    const user = (await getUser(ctx)) as BillingUser;
    return getEntitlementsForUser(ctx, user);
  },
});

export const assertCanCreateSite = query({
  args: {},
  handler: async (ctx) => {
    const user = (await getUser(ctx)) as BillingUser;
    const entitlements = await getEntitlementsForUser(ctx, user);
    const allowed = entitlements.usage.sites < entitlements.limits.sites;

    return {
      allowed,
      entitlements,
      ...(allowed
        ? {}
        : {
            error: {
              code: LIMIT_EXCEEDED_CODE,
              feature: "sites",
              message: buildLimitMessage(
                "sites",
                entitlements.plan,
                entitlements.limits.sites
              ),
              cta: "upgrade",
            },
          }),
    };
  },
});

export const consumeChatMessage = mutation({
  args: {},
  handler: async (ctx) => {
    const user = (await getUser(ctx)) as BillingUser;
    const state = await resolveBillingState(ctx, user, Date.now());

    await maybePersistPaidAnchor(ctx, state);

    const usageBucket = await getOrCreateUsageBucket(ctx, state);

    if (usageBucket.messagesUsed >= state.limits.messages) {
      throwLimitExceeded({
        feature: "messages",
        plan: state.plan,
        limit: state.limits.messages,
        used: usageBucket.messagesUsed,
        cycleStartMs: state.cycleStartMs,
        cycleEndMs: state.cycleEndMs,
      });
    }

    const nextUsage = usageBucket.messagesUsed + 1;

    await ctx.db.patch(usageBucket._id, {
      messagesUsed: nextUsage,
      cycleEndMs: state.cycleEndMs,
    });

    return {
      used: nextUsage,
      remaining: Math.max(0, state.limits.messages - nextUsage),
      limit: state.limits.messages,
      plan: state.plan,
      cycleStartMs: state.cycleStartMs,
      cycleEndMs: state.cycleEndMs,
    };
  },
});

export const consumePageSpeedReport = mutation({
  args: {},
  handler: async (ctx) => {
    const user = (await getUser(ctx)) as BillingUser;
    const state = await resolveBillingState(ctx, user, Date.now());

    await maybePersistPaidAnchor(ctx, state);

    const usageBucket = await getOrCreateUsageBucket(ctx, state);

    if (usageBucket.pageSpeedReportsUsed >= state.limits.pageSpeedReports) {
      throwLimitExceeded({
        feature: "pageSpeedReports",
        plan: state.plan,
        limit: state.limits.pageSpeedReports,
        used: usageBucket.pageSpeedReportsUsed,
        cycleStartMs: state.cycleStartMs,
        cycleEndMs: state.cycleEndMs,
      });
    }

    const nextUsage = usageBucket.pageSpeedReportsUsed + 1;

    await ctx.db.patch(usageBucket._id, {
      pageSpeedReportsUsed: nextUsage,
      cycleEndMs: state.cycleEndMs,
    });

    return {
      used: nextUsage,
      remaining: Math.max(0, state.limits.pageSpeedReports - nextUsage),
      limit: state.limits.pageSpeedReports,
      plan: state.plan,
      cycleStartMs: state.cycleStartMs,
      cycleEndMs: state.cycleEndMs,
    };
  },
});

export const upsertBillingAnchorInternal = internalMutation({
  args: {
    userId: v.string(),
    anchorMs: v.number(),
  },
  handler: async (ctx, args) => {
    await upsertBillingAnchor(ctx, args.userId, args.anchorMs);
  },
});
