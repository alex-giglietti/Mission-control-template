import { getAdminClient } from "@/lib/supabase";
import { getOAuthConfig } from "@/lib/oauth-config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ValidToken {
  accessToken: string;
  tokenType: string;
}

// ---------------------------------------------------------------------------
// getValidToken
// ---------------------------------------------------------------------------

/**
 * Retrieves a valid OAuth2 access token for a user + service pair.
 *
 * - If the stored token has not expired (or has no expiry), returns it
 *   immediately.
 * - If expired and a refresh token is available, performs a token refresh
 *   against the service's token endpoint, persists the new tokens, and
 *   returns the fresh access token.
 * - If the refresh fails, marks the connection as "expired" and throws.
 */
export async function getValidToken(
  userId: string,
  service: string
): Promise<ValidToken> {
  const supabase = getAdminClient();

  const { data: tokenRow, error } = await supabase
    .from("oauth_tokens")
    .select(
      "id, access_token, refresh_token, token_type, expires_at, connection_status"
    )
    .eq("user_id", userId)
    .eq("service", service)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Database error loading token for ${service}: ${error.message}`
    );
  }

  if (!tokenRow) {
    throw new Error(
      `No OAuth token found for user ${userId} and service "${service}". ` +
        "The user needs to connect this service first."
    );
  }

  // Check whether the token is still valid
  const now = Date.now();
  const expiresAt = tokenRow.expires_at
    ? new Date(tokenRow.expires_at).getTime()
    : null;

  if (expiresAt === null || expiresAt > now) {
    return {
      accessToken: tokenRow.access_token,
      tokenType: tokenRow.token_type ?? "Bearer",
    };
  }

  // Token is expired -- attempt refresh
  if (!tokenRow.refresh_token) {
    await updateConnectionStatus(supabase, tokenRow.id, "expired");
    throw new Error(
      `Access token for "${service}" has expired and no refresh token is available. ` +
        "The user needs to re-authorize."
    );
  }

  try {
    const oauthConfig = await getOAuthConfig(service, userId);

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokenRow.refresh_token,
      client_id: oauthConfig.client_id,
      client_secret: oauthConfig.client_secret,
    });

    const response = await fetch(oauthConfig.token_url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Token refresh request failed (${response.status}): ${errorText}`
      );
    }

    const tokens = await response.json();

    const newAccessToken: string = tokens.access_token;
    const newRefreshToken: string | undefined = tokens.refresh_token;
    const expiresIn: number | undefined = tokens.expires_in;
    const newTokenType: string = tokens.token_type ?? "Bearer";

    const newExpiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    const updatePayload: Record<string, unknown> = {
      access_token: newAccessToken,
      token_type: newTokenType,
      expires_at: newExpiresAt,
      connection_status: "connected",
      updated_at: new Date().toISOString(),
    };

    // Only overwrite the refresh token if the provider issued a new one
    if (newRefreshToken) {
      updatePayload.refresh_token = newRefreshToken;
    }

    const { error: updateError } = await supabase
      .from("oauth_tokens")
      .update(updatePayload)
      .eq("id", tokenRow.id);

    if (updateError) {
      console.error(
        "[token-refresh] Failed to persist refreshed token:",
        updateError.message
      );
    }

    return {
      accessToken: newAccessToken,
      tokenType: newTokenType,
    };
  } catch (err) {
    // Mark connection as expired so the UI can prompt re-auth
    await updateConnectionStatus(supabase, tokenRow.id, "expired");
    throw new Error(
      `Failed to refresh token for "${service}": ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

// ---------------------------------------------------------------------------
// getApiKeyToken
// ---------------------------------------------------------------------------

/**
 * Retrieves an API-key-based token for services that use static keys rather
 * than OAuth2 flows. The key is stored in the `access_token` column of the
 * `oauth_tokens` table.
 */
export async function getApiKeyToken(
  userId: string,
  service: string
): Promise<string> {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("oauth_tokens")
    .select("access_token")
    .eq("user_id", userId)
    .eq("service", service)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Database error loading API key for ${service}: ${error.message}`
    );
  }

  if (!data?.access_token) {
    throw new Error(
      `No API key found for user ${userId} and service "${service}". ` +
        "The user needs to add their API key first."
    );
  }

  return data.access_token;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function updateConnectionStatus(
  supabase: ReturnType<typeof getAdminClient>,
  tokenId: string,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from("oauth_tokens")
    .update({
      connection_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", tokenId);

  if (error) {
    console.error(
      `[token-refresh] Failed to update connection_status to "${status}":`,
      error.message
    );
  }
}
