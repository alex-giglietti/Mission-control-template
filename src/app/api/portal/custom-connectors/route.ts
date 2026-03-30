import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

// GET /api/portal/custom-connectors?user_id=...
// Returns all custom connectors for a user
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
    .from('custom_connectors')
    .select(
      'id, name, slug, description, base_url, auth_type, is_connected, created_at'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(
      '[portal/custom-connectors] Database error:',
      error.message
    );
    return NextResponse.json(
      { error: 'Failed to fetch custom connectors' },
      { status: 500 }
    );
  }

  return NextResponse.json(data ?? []);
}

// POST /api/portal/custom-connectors
// Creates a new custom connector
export async function POST(req: NextRequest) {
  let body: {
    user_id?: string;
    name?: string;
    slug?: string;
    description?: string;
    base_url?: string;
    auth_type?: string;
    auth_config?: Record<string, unknown>;
    default_headers?: Record<string, string>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { user_id, name, slug, description, base_url, auth_type, auth_config, default_headers } =
    body;

  // Validate required fields
  if (!user_id || !name || !slug || !base_url || !auth_type) {
    return NextResponse.json(
      { error: 'user_id, name, slug, base_url, and auth_type are required' },
      { status: 400 }
    );
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
      { status: 400 }
    );
  }

  const supabase = getAdminClient();

  // Check for slug uniqueness
  const { data: existing } = await supabase
    .from('custom_connectors')
    .select('id')
    .eq('user_id', user_id)
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'A connector with this slug already exists' },
      { status: 409 }
    );
  }

  // Insert the connector
  const { data, error } = await supabase
    .from('custom_connectors')
    .insert({
      user_id,
      name,
      slug,
      description: description || null,
      base_url,
      auth_type,
      auth_config: auth_config || {},
      default_headers: default_headers || {},
      is_connected: auth_type !== 'oauth2', // API key and bearer are connected immediately
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id, name, slug')
    .single();

  if (error) {
    console.error(
      '[portal/custom-connectors] Insert error:',
      error.message
    );
    return NextResponse.json(
      { error: 'Failed to create custom connector' },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
