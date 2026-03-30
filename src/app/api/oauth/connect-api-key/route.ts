// POST /api/oauth/connect-api-key
// Handles connecting API-key-based services (Stripe, Klaviyo, etc.)
// Body: { userId, service, apiKey }

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { userId, service, apiKey } = await req.json() as {
      userId?: string;
      service?: string;
      apiKey?: string;
    };

    if (!userId || !service || !apiKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Store the API key as access_token
    await supabase.from('oauth_tokens').upsert({
      user_id: userId,
      service,
      access_token: apiKey,
      refresh_token: null,
      token_type: 'Bearer',
      expires_at: null, // API keys don't expire
      scopes: [],
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,service' });

    // Update connection status
    await supabase.from('connection_status').upsert({
      user_id: userId,
      service,
      status: 'connected',
      connected_at: new Date().toISOString(),
      scopes_granted: [],
      last_error: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,service' });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Connect API key error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
