// POST /api/oauth/disconnect
// Body: { userId, service }

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { userId, service } = await req.json() as {
      userId?: string;
      service?: string;
    };

    if (!userId || !service) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Delete stored tokens
    await supabase.from('oauth_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('service', service);

    // Update connection status
    await supabase.from('connection_status').upsert({
      user_id: userId,
      service,
      status: 'disconnected',
      connected_at: null,
      scopes_granted: [],
      last_error: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,service' });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Disconnect error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
