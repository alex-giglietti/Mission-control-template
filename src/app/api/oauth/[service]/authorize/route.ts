// GET /api/oauth/[service]/authorize
// Generic OAuth initiator that works for all services

import { NextRequest } from 'next/server';
import { getOAuthConfig, BASE_URL } from '@/lib/oauth-config';
import { generateStateToken } from '@/lib/state-tokens';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ service: string }> }
) {
  // Get the service from params
  const { service } = await params;

  // Get user from session (via cookie or query param aim_token)
  // For the portal flow, check for aim_user_id in searchParams as fallback
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id');
  if (!userId) {
    return new Response('Unauthorized - user_id required', { status: 401 });
  }

  // Load OAuth config for this service
  const config = await getOAuthConfig(service, userId);

  if (!config) {
    return new Response(`Unknown service: ${service}`, { status: 404 });
  }

  // Generate state token
  const state = await generateStateToken(userId, service);

  // Build authorization URL
  const authUrl = new URL(config.authorize_url);
  authUrl.searchParams.set('client_id', config.client_id);
  authUrl.searchParams.set('redirect_uri', `${BASE_URL}/api/oauth/${service}/callback`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', config.scopes.join(' '));
  authUrl.searchParams.set('state', state);

  // Google-specific params for refresh tokens
  if (service === 'google') {
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
  }

  // GHL-specific: no special params needed beyond standard
  // Meta-specific: no special params needed
  // Zoom-specific: no special params needed
  // QuickBooks-specific: no special params needed

  return Response.redirect(authUrl.toString());
}
