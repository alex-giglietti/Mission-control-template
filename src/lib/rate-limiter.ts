// ---------------------------------------------------------------------------
// In-memory sliding-window rate limiter (per API key, 60-second windows)
// ---------------------------------------------------------------------------

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

interface WindowEntry {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 60_000; // 60 seconds

/**
 * Internal store keyed by API-key ID. Each entry tracks the request count
 * within the current 60-second window.
 *
 * NOTE: This is intentionally in-memory and per-process. For multi-instance
 * deployments, replace this with a Redis-backed implementation.
 */
const windows = new Map<string, WindowEntry>();

/**
 * Check (and consume) one request against the rate limit for the given API key.
 *
 * @param apiKeyId  Unique identifier of the API key being rate-limited.
 * @param rpm       Maximum requests per minute allowed for this key.
 * @returns         Whether the request is allowed, how many requests remain,
 *                  and when the current window resets.
 */
export function checkRateLimit(
  apiKeyId: string,
  rpm: number
): RateLimitResult {
  const now = Date.now();
  let entry = windows.get(apiKeyId);

  // If there is no entry or the current window has expired, start a new one.
  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    entry = { count: 0, windowStart: now };
    windows.set(apiKeyId, entry);
  }

  const resetAt = new Date(entry.windowStart + WINDOW_MS);

  if (entry.count >= rpm) {
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  entry.count += 1;

  return {
    allowed: true,
    remaining: rpm - entry.count,
    resetAt,
  };
}

/**
 * Reset the rate-limit window for a specific key. Useful in tests.
 */
export function resetRateLimit(apiKeyId: string): void {
  windows.delete(apiKeyId);
}
