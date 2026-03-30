import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Generate a random API key with the aim_ prefix.
 */
function generateRawKey(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'aim_';
  for (let i = 0; i < 48; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

/**
 * Compute a hex-encoded SHA-256 hash of the given string.
 */
async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ------------------------------------------------------------------ */
/*  GET /api/portal/keys?user_id=...                                   */
/*  Returns masked API keys for a user                                 */
/* ------------------------------------------------------------------ */

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
    .from('mcp_api_keys')
    .select('id, label, plan, key_preview, rate_limit_rpm, created_at, expires_at')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[portal/keys] Database error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}

/* ------------------------------------------------------------------ */
/*  POST /api/portal/keys                                              */
/*  Generate a new API key                                             */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  let body: { user_id?: string; label?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { user_id, label } = body;

  if (!user_id || !label) {
    return NextResponse.json(
      { error: 'user_id and label are required' },
      { status: 400 }
    );
  }

  // Generate key
  const rawKey = generateRawKey();
  const keyHash = await sha256(rawKey);
  const keyPreview = rawKey.slice(-4); // Last 4 characters

  // Default expiry: 1 year from now
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('mcp_api_keys')
    .insert({
      user_id,
      label,
      key_hash: keyHash,
      key_preview: keyPreview,
      plan: 'free',
      rate_limit_rpm: 60,
      is_active: true,
      allowed_servers: null, // Allow all servers by default
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select('id, label')
    .single();

  if (error) {
    console.error('[portal/keys] Insert error:', error.message);
    return NextResponse.json(
      { error: 'Failed to generate API key' },
      { status: 500 }
    );
  }

  // Return the raw key ONCE -- it will never be shown again
  return NextResponse.json(
    {
      id: data.id,
      label: data.label,
      raw_key: rawKey,
    },
    { status: 201 }
  );
}

/* ------------------------------------------------------------------ */
/*  DELETE /api/portal/keys                                            */
/*  Revoke an API key                                                  */
/* ------------------------------------------------------------------ */

export async function DELETE(req: NextRequest) {
  let body: { user_id?: string; key_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { user_id, key_id } = body;

  if (!user_id || !key_id) {
    return NextResponse.json(
      { error: 'user_id and key_id are required' },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  const { error } = await supabase
    .from('mcp_api_keys')
    .update({
      is_active: false,
    })
    .eq('id', key_id)
    .eq('user_id', user_id);

  if (error) {
    console.error('[portal/keys] Revoke error:', error.message);
    return NextResponse.json(
      { error: 'Failed to revoke API key' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
