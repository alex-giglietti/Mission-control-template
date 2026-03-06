import { NextRequest, NextResponse } from 'next/server';
import { getPlaidClient, isPlaidConfigured, CountryCode } from '@/lib/plaid-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!isPlaidConfigured()) {
      return NextResponse.json({
        error: 'Plaid not configured',
        message: 'Set PLAID_CLIENT_ID, PLAID_SECRET, and PLAID_ENV environment variables'
      }, { status: 503 });
    }

    const body = await request.json();
    const { public_token, institution_id } = body;

    if (!public_token) {
      return NextResponse.json({
        error: 'Missing public_token in request body'
      }, { status: 400 });
    }

    const plaidClient = getPlaidClient();
    if (!plaidClient) {
      return NextResponse.json({ error: 'Failed to initialize Plaid client' }, { status: 500 });
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get institution details if institution_id provided
    let institutionName = 'Unknown Institution';
    if (institution_id) {
      try {
        const instResponse = await plaidClient.institutionsGetById({
          institution_id,
          country_codes: [CountryCode.Us],
        });
        institutionName = instResponse.data.institution.name;
      } catch {
        // Ignore institution lookup errors
      }
    }

    // Get initial account data
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    return NextResponse.json({
      access_token: accessToken,
      item_id: itemId,
      institution_name: institutionName,
      accounts: accountsResponse.data.accounts,
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    return NextResponse.json({
      error: 'Failed to exchange token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
