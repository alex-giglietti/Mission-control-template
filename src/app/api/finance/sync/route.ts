import { NextRequest, NextResponse } from 'next/server';
import { isPlaidConfigured, getPlaidClient } from '@/lib/plaid-client';

export const dynamic = 'force-dynamic';

// This route syncs financial data from Plaid
// Requires PLAID_CLIENT_ID, PLAID_SECRET, and PLAID_ENV environment variables

export async function POST(request: NextRequest) {
  // Check if Plaid is configured
  if (!isPlaidConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Plaid not configured',
      message: 'Set PLAID_CLIENT_ID, PLAID_SECRET, and PLAID_ENV environment variables',
    }, { status: 400 });
  }

  const plaidClient = getPlaidClient();
  if (!plaidClient) {
    return NextResponse.json({
      success: false,
      error: 'Failed to initialize Plaid client',
    }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { access_token, action = 'accounts' } = body;

    if (!access_token) {
      return NextResponse.json({
        success: false,
        error: 'Missing access_token in request body',
      }, { status: 400 });
    }

    if (action === 'accounts') {
      const response = await plaidClient.accountsBalanceGet({
        access_token,
      });

      return NextResponse.json({
        success: true,
        accounts: response.data.accounts,
      });
    }

    if (action === 'transactions') {
      const endDate = new Date().toISOString().slice(0, 10);
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const response = await plaidClient.transactionsGet({
        access_token,
        start_date: startDate,
        end_date: endDate,
      });

      return NextResponse.json({
        success: true,
        transactions: response.data.transactions,
        accounts: response.data.accounts,
      });
    }

    return NextResponse.json({
      success: false,
      error: `Unknown action: ${action}. Use 'accounts' or 'transactions'`,
    }, { status: 400 });

  } catch (error) {
    console.error('Finance sync error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    configured: isPlaidConfigured(),
    message: isPlaidConfigured() 
      ? 'Plaid is configured. POST with access_token to sync.' 
      : 'Set PLAID_CLIENT_ID, PLAID_SECRET, and PLAID_ENV environment variables.',
  });
}
