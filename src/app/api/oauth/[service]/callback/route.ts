// GET /api/oauth/[service]/callback
// Generic OAuth callback that works for all services

import { NextRequest } from 'next/server';
import { getOAuthConfig, BASE_URL } from '@/lib/oauth-config';
import { validateStateToken } from '@/lib/state-tokens';
import { createServiceClient } from '@/lib/supabase';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ service: string }> }
) {
  const { service } = await params;
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return Response.redirect(`${BASE_URL}/portal?error=${encodeURIComponent(error)}&service=${service}`);
  }

  if (!code || !state) {
    return Response.redirect(`${BASE_URL}/portal?error=missing_params&service=${service}`);
  }

  try {
    // Validate state and extract userId
    const { userId } = await validateStateToken(state);

    // Load OAuth config
    const config = await getOAuthConfig(service, userId);
    if (!config) {
      throw new Error(`Unknown service: ${service}`);
    }

    // Exchange code for tokens
    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: config.client_id,
      client_secret: config.client_secret,
      redirect_uri: `${BASE_URL}/api/oauth/${service}/callback`,
    });

    const tokenResponse = await fetch(config.token_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody,
    });

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error(`Token exchange failed for ${service}:`, errBody);
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    // Parse tokens - handle both JSON and form-encoded responses
    let tokens: Record<string, unknown>;
    const contentType = tokenResponse.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      tokens = await tokenResponse.json();
    } else {
      const text = await tokenResponse.text();
      try {
        tokens = JSON.parse(text);
      } catch {
        tokens = Object.fromEntries(new URLSearchParams(text));
      }
    }

    const supabase = createServiceClient();

    // Calculate expiry
    const expiresIn = tokens.expires_in as number | undefined;
    const expiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    // Store tokens
    await supabase.from('oauth_tokens').upsert({
      user_id: userId,
      service,
      access_token: tokens.access_token as string,
      refresh_token: (tokens.refresh_token as string) || null,
      token_type: (tokens.token_type as string) || 'Bearer',
      expires_at: expiresAt,
      scopes: config.scopes,
      metadata: {
        // Store any extra fields from token response (like GHL locationId, etc.)
        ...(tokens.locationId ? { locationId: tokens.locationId } : {}),
        ...(tokens.companyId ? { companyId: tokens.companyId } : {}),
        ...(tokens.userId ? { serviceUserId: tokens.userId } : {}),
      },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,service' });

    // Update connection status
    await supabase.from('connection_status').upsert({
      user_id: userId,
      service,
      status: 'connected',
      connected_at: new Date().toISOString(),
      scopes_granted: config.scopes,
      last_error: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,service' });

    // Redirect back to portal with success
    return Response.redirect(`${BASE_URL}/portal?connected=${service}`);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'callback_failed';
    console.error(`OAuth callback error for ${service}:`, err);
    return Response.redirect(
      `${BASE_URL}/portal?error=${encodeURIComponent(message)}&service=${service}`
    );
  }
}
