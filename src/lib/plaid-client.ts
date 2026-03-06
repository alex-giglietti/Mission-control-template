import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

// Get Plaid config from environment variables
function getPlaidConfig(): { client_id: string; secret: string; environment: string } {
  return {
    client_id: process.env.PLAID_CLIENT_ID || '',
    secret: process.env.PLAID_SECRET || '',
    environment: process.env.PLAID_ENV || 'sandbox',
  };
}

// Map environment string to Plaid environment URL
const envMap: Record<string, string> = {
  sandbox: PlaidEnvironments.sandbox,
  development: PlaidEnvironments.development,
  production: PlaidEnvironments.production,
};

// Helper to check if Plaid is configured
export function isPlaidConfigured(): boolean {
  const config = getPlaidConfig();
  return (
    config.client_id.length > 0 &&
    config.secret.length > 0
  );
}

// Lazy-initialize Plaid client only when called
export function getPlaidClient(): PlaidApi | null {
  if (!isPlaidConfigured()) {
    return null;
  }
  
  const config = getPlaidConfig();
  const configuration = new Configuration({
    basePath: envMap[config.environment] || PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': config.client_id,
        'PLAID-SECRET': config.secret,
      },
    },
  });
  
  return new PlaidApi(configuration);
}

// Re-export useful types and constants
export { Products, CountryCode };

// Default products to request
export const DEFAULT_PRODUCTS: Products[] = [
  Products.Transactions,
  Products.Auth,
];

// Default country codes
export const DEFAULT_COUNTRY_CODES: CountryCode[] = [
  CountryCode.Us,
];
