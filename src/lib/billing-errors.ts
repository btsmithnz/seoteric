export const LIMIT_EXCEEDED_CODE = "LIMIT_EXCEEDED";
const LIMIT_JSON_BLOCK_REGEX =
  /\{[\s\S]*"code"\s*:\s*"LIMIT_EXCEEDED"[\s\S]*\}/;

export type BillingLimitFeature = "sites" | "messages" | "pageSpeedReports";

export interface LimitExceededErrorData {
  code: typeof LIMIT_EXCEEDED_CODE;
  feature: BillingLimitFeature;
  plan: "starter" | "pro" | "agency";
  limit: number;
  used: number;
  message: string;
  cycleStartMs?: number;
  cycleEndMs?: number;
  cta?: "upgrade";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeLimitData(value: unknown): LimitExceededErrorData | null {
  if (!isRecord(value)) {
    return null;
  }

  if (value.code !== LIMIT_EXCEEDED_CODE) {
    return null;
  }

  const feature = value.feature;
  if (
    feature !== "sites" &&
    feature !== "messages" &&
    feature !== "pageSpeedReports"
  ) {
    return null;
  }

  const plan = value.plan;
  if (plan !== "starter" && plan !== "pro" && plan !== "agency") {
    return null;
  }

  return {
    code: LIMIT_EXCEEDED_CODE,
    feature,
    plan,
    limit: Number(value.limit ?? 0),
    used: Number(value.used ?? 0),
    message:
      typeof value.message === "string"
        ? value.message
        : "Usage limit reached. Upgrade to continue.",
    cycleStartMs:
      typeof value.cycleStartMs === "number" ? value.cycleStartMs : undefined,
    cycleEndMs:
      typeof value.cycleEndMs === "number" ? value.cycleEndMs : undefined,
    cta: value.cta === "upgrade" ? "upgrade" : undefined,
  };
}

function parseJsonFromString(text: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(text);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function parseLimitDataFromMessage(
  message: string
): LimitExceededErrorData | null {
  const parsedMessage = parseJsonFromString(message);
  if (parsedMessage) {
    const fromMessage = normalizeLimitData(parsedMessage);
    if (fromMessage) {
      return fromMessage;
    }
  }

  const jsonMatch = message.match(LIMIT_JSON_BLOCK_REGEX);
  if (!jsonMatch?.[0]) {
    return null;
  }

  const parsedBlock = parseJsonFromString(jsonMatch[0]);
  if (!parsedBlock) {
    return null;
  }

  return normalizeLimitData(parsedBlock);
}

export function parseLimitExceededError(
  error: unknown
): LimitExceededErrorData | null {
  const direct = normalizeLimitData(error);
  if (direct) {
    return direct;
  }

  if (typeof error === "string") {
    return parseLimitDataFromMessage(error);
  }

  if (!isRecord(error)) {
    return null;
  }

  const fromData = normalizeLimitData(error.data);
  if (fromData) {
    return fromData;
  }

  return typeof error.message === "string"
    ? parseLimitDataFromMessage(error.message)
    : null;
}

export function getLimitToastMessage(data: LimitExceededErrorData): string {
  if (data.feature === "sites") {
    return "Site limit reached. Upgrade your plan to add more sites.";
  }

  if (data.feature === "messages") {
    return "Message limit reached for this cycle. Upgrade to keep chatting.";
  }

  return "PageSpeed report limit reached for this cycle. Upgrade to run more reports.";
}
