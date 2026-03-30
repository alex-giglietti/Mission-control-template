// ---------------------------------------------------------------------------
// OAuth state token management
//
// Generates and validates short-lived, HMAC-signed state tokens used during
// the OAuth2 authorization code flow to prevent CSRF attacks and to carry
// the userId + service through the redirect round-trip.
// ---------------------------------------------------------------------------

const STATE_SECRET = process.env.STATE_SECRET;
const TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSecret(): string {
  if (!STATE_SECRET) {
    throw new Error("Missing environment variable STATE_SECRET");
  }
  return STATE_SECRET;
}

/**
 * Import the secret as an HMAC CryptoKey (Web Crypto API).
 */
async function getHmacKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Compute a hex-encoded HMAC-SHA256 signature of the given data.
 */
async function sign(data: string): Promise<string> {
  const key = await getHmacKey();
  const encoder = new TextEncoder();
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(data)
  );
  const sigArray = Array.from(new Uint8Array(sigBuffer));
  return sigArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Timing-safe comparison of two hex strings. Falls back to a constant-time
 * loop when `timingSafeEqual` is unavailable (edge runtimes).
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

// ---------------------------------------------------------------------------
// Base64-URL helpers (no padding, URL-safe alphabet)
// ---------------------------------------------------------------------------

function base64UrlEncode(input: string): string {
  // In Node / edge runtimes, Buffer is available
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input, "utf-8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  // Browser fallback
  return btoa(input)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(input: string): string {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  // Re-add padding
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64, "base64").toString("utf-8");
  }
  return atob(base64);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a signed state token encoding the userId, service, expiry, and a
 * random nonce.
 *
 * Format: `<base64url(payload)>.<hex(hmac)>`
 */
export async function generateStateToken(
  userId: string,
  service: string
): Promise<string> {
  const payload = JSON.stringify({
    userId,
    service,
    exp: Date.now() + TOKEN_TTL_MS,
    nonce: crypto.randomUUID(),
  });

  const encoded = base64UrlEncode(payload);
  const signature = await sign(encoded);

  return `${encoded}.${signature}`;
}

/**
 * Validate a state token: verify the HMAC signature and check expiry.
 *
 * @returns The decoded userId and service.
 * @throws  If the token is malformed, expired, or the signature is invalid.
 */
export async function validateStateToken(
  state: string
): Promise<{ userId: string; service: string }> {
  const dotIndex = state.indexOf(".");
  if (dotIndex === -1) {
    throw new Error("Malformed state token: missing signature separator");
  }

  const encoded = state.slice(0, dotIndex);
  const providedSig = state.slice(dotIndex + 1);

  // Verify signature
  const expectedSig = await sign(encoded);
  if (!safeEqual(expectedSig, providedSig)) {
    throw new Error("Invalid state token signature");
  }

  // Decode payload
  let payload: { userId: string; service: string; exp: number };
  try {
    payload = JSON.parse(base64UrlDecode(encoded));
  } catch {
    throw new Error("Malformed state token payload");
  }

  if (!payload.userId || !payload.service || !payload.exp) {
    throw new Error("Incomplete state token payload");
  }

  // Check expiry
  if (Date.now() > payload.exp) {
    throw new Error("State token has expired");
  }

  return {
    userId: payload.userId,
    service: payload.service,
  };
}
