import { getAdminClient } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface MCPAuthResult {
  userId: string;
  apiKeyId: string;
  plan: string;
  rateLimitRpm: number;
}

export interface UsageLogParams {
  userId: string;
  apiKeyId: string;
  server: string;
  toolName: string;
  action: string;
  status: "success" | "error";
  latencyMs: number;
  requestSummary?: Record<string, any> | string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute a hex-encoded SHA-256 hash of the given string using the Web
 * Crypto API (available in Node 18+ and all modern edge runtimes).
 */
async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------------------------------------------------------------------------
// validateMCPRequest
// ---------------------------------------------------------------------------

/**
 * Validates an incoming MCP request by:
 *  1. Extracting the Bearer token from the Authorization header
 *  2. Hashing it with SHA-256
 *  3. Looking it up in the `mcp_api_keys` table (active + not expired)
 *  4. Checking the requested server is allowed
 *
 * Returns auth context on success; throws on failure.
 */
export async function validateMCPRequest(
  req: Request,
  server: string
): Promise<MCPAuthResult> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("[auth] Missing or malformed Authorization header");
    throw new AuthError("Missing or malformed Authorization header", 401);
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    console.error("[auth] Empty bearer token");
    throw new AuthError("Empty bearer token", 401);
  }

  const keyHash = await sha256(token);
  console.log(`[auth] Token prefix: ${token.slice(0, 8)}... hash prefix: ${keyHash.slice(0, 8)}... server: ${server}`);

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("mcp_api_keys")
    .select("id, user_id, plan, rate_limit_rpm, allowed_servers")
    .eq("key_hash", keyHash)
    .eq("is_active", true)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error("[auth] DB error:", error.message);
    throw new AuthError("Database error while validating API key", 500);
  }

  if (!data) {
    console.error(`[auth] No key found for hash prefix: ${keyHash.slice(0, 8)}...`);
    throw new AuthError("Invalid, expired, or revoked API key", 401);
  }

  console.log(`[auth] Key found! user_id: ${data.user_id}, plan: ${data.plan}`);

  // Check server restriction
  const allowedServers: string[] | null = data.allowed_servers;
  if (
    allowedServers &&
    allowedServers.length > 0 &&
    !allowedServers.includes(server)
  ) {
    throw new AuthError(
      `API key is not authorized for server "${server}"`,
      403
    );
  }

  return {
    userId: data.user_id,
    apiKeyId: data.id,
    plan: data.plan ?? "free",
    rateLimitRpm: data.rate_limit_rpm ?? 60,
  };
}

// ---------------------------------------------------------------------------
// getUserFromSession
// ---------------------------------------------------------------------------

/**
 * Extracts the current user from a Supabase session token (JWT) carried in
 * the request. Useful for dashboard / UI endpoints that rely on cookie-based
 * auth rather than API keys.
 *
 * Looks for the token in the `Authorization` header (Bearer) or in the
 * `sb-access-token` cookie.
 */
export async function getUserFromSession(req: Request): Promise<string> {
  const supabase = getAdminClient();

  // Try Authorization header first
  let token: string | null = null;
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice("Bearer ".length).trim();
  }

  // Fall back to cookie
  if (!token) {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const match = cookieHeader.match(
      /(?:^|;\s*)sb-access-token=([^;]+)/
    );
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  if (!token) {
    throw new AuthError("No session token found", 401);
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new AuthError("Invalid or expired session", 401);
  }

  return user.id;
}

// ---------------------------------------------------------------------------
// logUsage
// ---------------------------------------------------------------------------

/**
 * Inserts a usage record into the `mcp_usage_logs` table. Failures are
 * logged to the console but never thrown -- usage logging should not block
 * the request path.
 */
export async function logUsage(params: UsageLogParams): Promise<void> {
  try {
    const supabase = getAdminClient();
    const { error } = await supabase.from("mcp_usage_logs").insert({
      user_id: params.userId,
      api_key_id: params.apiKeyId,
      server: params.server,
      tool_name: params.toolName,
      action: params.action,
      status: params.status,
      latency_ms: params.latencyMs,
      request_summary: params.requestSummary
        ? (typeof params.requestSummary === 'string' ? params.requestSummary : JSON.stringify(params.requestSummary))
        : null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[logUsage] Failed to insert usage log:", error.message);
    }
  } catch (err) {
    console.error("[logUsage] Unexpected error:", err);
  }
}

// ---------------------------------------------------------------------------
// AuthError
// ---------------------------------------------------------------------------

export class AuthError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}
