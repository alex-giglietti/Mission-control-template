import { NextRequest, NextResponse } from 'next/server';
import { 
  getPlaidClient,
  isPlaidConfigured, 
  DEFAULT_PRODUCTS, 
  DEFAULT_COUNTRY_CODES,
  Products 
} from '@/lib/plaid-client';
import { LinkTokenCreateRequest } from 'plaid';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check if Plaid is configured
    if (!isPlaidConfigured()) {
      return NextResponse.json(
        { 
          error: 'Plaid not configured',
          message: 'Set PLAID_CLIENT_ID, PLAID_SECRET, and PLAID_ENV environment variables'
        }, 
        { status: 503 }
      );
    }

    const plaidClient = getPlaidClient();
    if (!plaidClient) {
      return NextResponse.json(
        { error: 'Failed to initialize Plaid client' },
        { status: 500 }
      );
    }

    // Parse request body for optional parameters
    let userId = 'user-' + Date.now();
    let products = DEFAULT_PRODUCTS;
    
    try {
      const body = await request.json();
      if (body.user_id) userId = body.user_id;
      if (body.products && Array.isArray(body.products)) {
        products = body.products as Products[];
      }
    } catch {
      // Body is optional, use defaults
    }

    // Create link token request
    const linkTokenRequest: LinkTokenCreateRequest = {
      user: {
        client_user_id: userId,
      },
      client_name: 'Mission Control',
      products: products,
      country_codes: DEFAULT_COUNTRY_CODES,
      language: 'en',
    };

    const response = await plaidClient.linkTokenCreate(linkTokenRequest);

    return NextResponse.json({
      link_token: response.data.link_token,
      expiration: response.data.expiration,
      request_id: response.data.request_id,
    });
  } catch (error) {
    console.error('Error creating link token:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create link token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
