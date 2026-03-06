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
    const days = parseInt(searchParams.get('days') || '30', 10);

    if (!accessToken) {
      return NextResponse.json({
        error: 'Missing access_token parameter'
      }, { status: 400 });
    }

    const plaidClient = getPlaidClient();
    if (!plaidClient) {
      return NextResponse.json({ error: 'Failed to initialize Plaid client' }, { status: 500 });
    }

    const endDate = new Date().toISOString().slice(0, 10);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
    });

    return NextResponse.json({
      transactions: transactionsResponse.data.transactions,
      accounts: transactionsResponse.data.accounts,
      total_transactions: transactionsResponse.data.total_transactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({
      error: 'Failed to fetch transactions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
