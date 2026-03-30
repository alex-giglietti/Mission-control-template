import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

// GET /api/portal/status?user_id=...
// Returns connection statuses for all services for a given user
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json(
      { error: 'user_id query parameter is required' },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('connection_status')
    .select('service, status, connected_at, last_used_at, last_error')
    .eq('user_id', userId);

  if (error) {
    console.error('[portal/status] Database error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch connection statuses' },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}

// DELETE /api/portal/status
// Disconnects a service for a user
export async function DELETE(req: NextRequest) {
  let body: { user_id?: string; service?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { user_id, service } = body;

  if (!user_id || !service) {
    return NextResponse.json(
      { error: 'user_id and service are required' },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  // Update connection status to disconnected
  const { error: statusError } = await supabase
    .from('connection_status')
    .update({
      status: 'disconnected',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user_id)
    .eq('service', service);

  if (statusError) {
    console.error('[portal/status] Disconnect error:', statusError.message);
    return NextResponse.json(
      { error: 'Failed to disconnect service' },
      { status: 500 }
    );
  }

  // Remove stored tokens
  const { error: tokenError } = await supabase
    .from('oauth_tokens')
    .delete()
    .eq('user_id', user_id)
    .eq('service', service);

  if (tokenError) {
    console.error('[portal/status] Token deletion error:', tokenError.message);
    // Non-fatal -- status already updated
  }

  return NextResponse.json({ success: true });
}
