import { NextRequest, NextResponse } from 'next/server';
import { getPlaidClient, isPlaidConfigured } from '@/lib/plaid-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!isPlaidConfigured()) {
      return NextResponse.json({
        error: 'Plaid not configured',
        message: 'Set PLAID_CLIENT_ID, PLAID_SECRET, and PLAID_ENV environment variables'
      }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');

    if (!accessToken) {
      return NextResponse.json({
        error: 'Missing access_token parameter'
      }, { status: 400 });
    }

    const plaidClient = getPlaidClient();
    if (!plaidClient) {
      return NextResponse.json({ error: 'Failed to initialize Plaid client' }, { status: 500 });
    }

    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    return NextResponse.json({
      accounts: accountsResponse.data.accounts,
      item: accountsResponse.data.item,
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({
      error: 'Failed to fetch accounts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isPlaidConfigured()) {
      return NextResponse.json({
        error: 'Plaid not configured'
      }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('access_token');

    if (!accessToken) {
      return NextResponse.json({
        error: 'Missing access_token parameter'
      }, { status: 400 });
    }

    const plaidClient = getPlaidClient();
    if (!plaidClient) {
      return NextResponse.json({ error: 'Failed to initialize Plaid client' }, { status: 500 });
    }

    await plaidClient.itemRemove({
      access_token: accessToken,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing item:', error);
    return NextResponse.json({
      error: 'Failed to remove item',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
