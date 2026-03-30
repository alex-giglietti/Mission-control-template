import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ---------------------------------------------------------------------------
// Server-side service-role client (singleton)
// ---------------------------------------------------------------------------
let _adminClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client authenticated with the **service-role** key.
 * This client bypasses RLS and should only be used in server-side code
 * (API routes, middleware, background jobs).
 */
export function getAdminClient(): SupabaseClient {
  if (_adminClient) return _adminClient;

  if (!SUPABASE_URL) {
    throw new Error(
      "Missing environment variable NEXT_PUBLIC_SUPABASE_URL"
    );
  }
  if (!SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing environment variable SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  _adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _adminClient;
}

// ---------------------------------------------------------------------------
// Browser / anon client (singleton)
// ---------------------------------------------------------------------------
let _browserClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client authenticated with the **anon** (public) key.
 * Safe to use in browser code; respects RLS policies.
 */
export function getBrowserClient(): SupabaseClient {
  if (_browserClient) return _browserClient;

  if (!SUPABASE_URL) {
    throw new Error(
      "Missing environment variable NEXT_PUBLIC_SUPABASE_URL"
    );
  }
  if (!ANON_KEY) {
    throw new Error(
      "Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  _browserClient = createClient(SUPABASE_URL, ANON_KEY);

  return _browserClient;
}

// ---------------------------------------------------------------------------
// Alias used by API route handlers
// ---------------------------------------------------------------------------

/**
 * Returns a Supabase client for use in server-side API routes.
 * This is an alias for `getAdminClient()` to provide a consistent
 * interface expected by the OAuth route handlers.
 */
export function createServiceClient(): SupabaseClient {
  return getAdminClient();
}
