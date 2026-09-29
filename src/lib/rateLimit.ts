import "server-only";

import crypto from "crypto";
import { headers } from "next/headers";

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  wardrobeRateLimits?: Map<string, RateLimitRecord>;
};

const records =
  globalForRateLimit.wardrobeRateLimits ??
  new Map<string, RateLimitRecord>();

globalForRateLimit.wardrobeRateLimits = records;

const hashIdentifier = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

export const getRequestIdentifier = async (additionalValue = "") => {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address =
    forwardedFor ||
    requestHeaders.get("x-real-ip") ||
    requestHeaders.get("cf-connecting-ip") ||
    "unknown";

  return hashIdentifier(`${address}:${additionalValue.trim().toLowerCase()}`);
};

export const checkRateLimit = (
  scope: string,
  identifier: string,
  options: RateLimitOptions
) => {
  const now = Date.now();
  const key = `${scope}:${identifier}`;
  const current = records.get(key);

  if (!current || current.resetAt <= now) {
    records.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  records.set(key, current);

  if (records.size > 2_000) {
    for (const [recordKey, record] of records) {
      if (record.resetAt <= now) {
        records.delete(recordKey);
      }
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
};

export const enforceRateLimit = async (
  scope: string,
  additionalValue: string,
  options: RateLimitOptions
) => {
  const identifier = await getRequestIdentifier(additionalValue);
  return checkRateLimit(scope, identifier, options);
};
