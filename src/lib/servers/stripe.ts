import {
  registerServer,
  createToolGroup,
  makeApiKeyRequest,
  type ExecuteContext,
} from '@/lib/server-registry';

// ─── Stripe API Base URL ───
const STRIPE_API = 'https://api.stripe.com/v1';

// ─── Helpers ───

/** Flatten nested objects/arrays into Stripe bracket-notation key-value pairs */
function flattenParams(obj: Record<string, any>, prefix?: string): [string, string][] {
  const entries: [string, string][] = [];
  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (val === undefined || val === null) continue;
    if (typeof val === 'object' && !Array.isArray(val)) {
      entries.push(...flattenParams(val, fullKey));
    } else if (Array.isArray(val)) {
      val.forEach((item, i) => {
        if (typeof item === 'object') {
          entries.push(...flattenParams(item, `${fullKey}[${i}]`));
        } else {
          entries.push([`${fullKey}[${i}]`, String(item)]);
        }
      });
    } else {
      entries.push([fullKey, String(val)]);
    }
  }
  return entries;
}

/** Make an authenticated request to the Stripe API */
async function stripeRequest(userId: string, method: string, path: string, params?: Record<string, any>) {
  const url = method === 'GET' && params
    ? `${STRIPE_API}${path}?${new URLSearchParams(flattenParams(params)).toString()}`
    : `${STRIPE_API}${path}`;

  const options: RequestInit = {
    method,
    headers: {} as Record<string, string>,
  };

  if (method !== 'GET' && method !== 'DELETE' && params) {
    (options.headers as Record<string, string>)['Content-Type'] = 'application/x-www-form-urlencoded';
    options.body = new URLSearchParams(flattenParams(params)).toString();
  }

  return makeApiKeyRequest(userId, 'stripe', url, options, 'Authorization', 'Bearer');
}

// ─── Customers ───

async function executeCustomers(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/customers', p);
    case 'get': return stripeRequest(userId, 'GET', `/customers/${p.id}`);
    case 'create': return stripeRequest(userId, 'POST', '/customers', p);
    case 'update': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/customers/${id}`, rest);
    }
    case 'delete': return stripeRequest(userId, 'DELETE', `/customers/${p.id}`);
    case 'search': return stripeRequest(userId, 'GET', '/customers/search', { query: p.query, limit: p.limit, page: p.page });
    default: throw new Error(`Unknown stripe_customers action: ${action}`);
  }
}

// ─── Payment Intents ───

async function executePaymentIntents(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/payment_intents', p);
    case 'get': return stripeRequest(userId, 'GET', `/payment_intents/${p.id}`);
    case 'create': return stripeRequest(userId, 'POST', '/payment_intents', p);
    case 'confirm': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/payment_intents/${id}/confirm`, rest);
    }
    case 'capture': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/payment_intents/${id}/capture`, rest);
    }
    case 'cancel': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/payment_intents/${id}/cancel`, rest);
    }
    default: throw new Error(`Unknown stripe_payment_intents action: ${action}`);
  }
}

// ─── Charges ───

async function executeCharges(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/charges', p);
    case 'get': return stripeRequest(userId, 'GET', `/charges/${p.id}`);
    case 'create': return stripeRequest(userId, 'POST', '/charges', p);
    case 'capture': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/charges/${id}/capture`, rest);
    }
    case 'refund': return stripeRequest(userId, 'POST', '/refunds', { charge: p.charge || p.id, amount: p.amount, reason: p.reason, metadata: p.metadata });
    default: throw new Error(`Unknown stripe_charges action: ${action}`);
  }
}

// ─── Subscriptions ───

async function executeSubscriptions(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/subscriptions', p);
    case 'get': return stripeRequest(userId, 'GET', `/subscriptions/${p.id}`);
    case 'create': return stripeRequest(userId, 'POST', '/subscriptions', p);
    case 'update': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/subscriptions/${id}`, rest);
    }
    case 'cancel': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'DELETE', `/subscriptions/${id}`, rest);
    }
    case 'resume': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/subscriptions/${id}/resume`, rest);
    }
    case 'pause': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/subscriptions/${id}`, { pause_collection: { behavior: p.behavior || 'void' }, ...p });
    }
    default: throw new Error(`Unknown stripe_subscriptions action: ${action}`);
  }
}

// ─── Invoices ───

async function executeInvoices(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/invoices', p);
    case 'get': return stripeRequest(userId, 'GET', `/invoices/${p.id}`);
    case 'create': return stripeRequest(userId, 'POST', '/invoices', p);
    case 'update': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/invoices/${id}`, rest);
    }
    case 'delete': return stripeRequest(userId, 'DELETE', `/invoices/${p.id}`);
    case 'send': return stripeRequest(userId, 'POST', `/invoices/${p.id}/send`);
    case 'pay': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/invoices/${id}/pay`, rest);
    }
    case 'void': return stripeRequest(userId, 'POST', `/invoices/${p.id}/void`);
    case 'finalize': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/invoices/${id}/finalize`, rest);
    }
    case 'mark_uncollectible': return stripeRequest(userId, 'POST', `/invoices/${p.id}/mark_uncollectible`);
    default: throw new Error(`Unknown stripe_invoices action: ${action}`);
  }
}

// ─── Products ───

async function executeProducts(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/products', p);
    case 'get': return stripeRequest(userId, 'GET', `/products/${p.id}`);
    case 'create': return stripeRequest(userId, 'POST', '/products', p);
    case 'update': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/products/${id}`, rest);
    }
    case 'delete': return stripeRequest(userId, 'DELETE', `/products/${p.id}`);
    case 'archive': return stripeRequest(userId, 'POST', `/products/${p.id}`, { active: 'false' });
    default: throw new Error(`Unknown stripe_products action: ${action}`);
  }
}

// ─── Prices ───

async function executePrices(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/prices', p);
    case 'get': return stripeRequest(userId, 'GET', `/prices/${p.id}`);
    case 'create': return stripeRequest(userId, 'POST', '/prices', p);
    case 'update': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/prices/${id}`, rest);
    }
    default: throw new Error(`Unknown stripe_prices action: ${action}`);
  }
}

// ─── Coupons ───

async function executeCoupons(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/coupons', p);
    case 'get': return stripeRequest(userId, 'GET', `/coupons/${p.id}`);
    case 'create': return stripeRequest(userId, 'POST', '/coupons', p);
    case 'update': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/coupons/${id}`, rest);
    }
    case 'delete': return stripeRequest(userId, 'DELETE', `/coupons/${p.id}`);
    default: throw new Error(`Unknown stripe_coupons action: ${action}`);
  }
}

// ─── Promotion Codes ───

async function executePromotionCodes(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/promotion_codes', p);
    case 'get': return stripeRequest(userId, 'GET', `/promotion_codes/${p.id}`);
    case 'create': return stripeRequest(userId, 'POST', '/promotion_codes', p);
    case 'update': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/promotion_codes/${id}`, rest);
    }
    default: throw new Error(`Unknown stripe_promotion_codes action: ${action}`);
  }
}

// ─── Payment Methods ───

async function executePaymentMethods(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/payment_methods', p);
    case 'get': return stripeRequest(userId, 'GET', `/payment_methods/${p.id}`);
    case 'attach': return stripeRequest(userId, 'POST', `/payment_methods/${p.id}/attach`, { customer: p.customer });
    case 'detach': return stripeRequest(userId, 'POST', `/payment_methods/${p.id}/detach`);
    case 'update': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/payment_methods/${id}`, rest);
    }
    default: throw new Error(`Unknown stripe_payment_methods action: ${action}`);
  }
}

// ─── Payment Links ───

async function executePaymentLinks(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/payment_links', p);
    case 'get': return stripeRequest(userId, 'GET', `/payment_links/${p.id}`);
    case 'create': return stripeRequest(userId, 'POST', '/payment_links', p);
    case 'update': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/payment_links/${id}`, rest);
    }
    default: throw new Error(`Unknown stripe_payment_links action: ${action}`);
  }
}

// ─── Checkout Sessions ───

async function executeCheckoutSessions(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/checkout/sessions', p);
    case 'get': return stripeRequest(userId, 'GET', `/checkout/sessions/${p.id}`);
    case 'create': return stripeRequest(userId, 'POST', '/checkout/sessions', p);
    case 'expire': return stripeRequest(userId, 'POST', `/checkout/sessions/${p.id}/expire`);
    case 'line_items': return stripeRequest(userId, 'GET', `/checkout/sessions/${p.id}/line_items`, { limit: p.limit, starting_after: p.starting_after, ending_before: p.ending_before });
    default: throw new Error(`Unknown stripe_checkout_sessions action: ${action}`);
  }
}

// ─── Refunds ───

async function executeRefunds(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/refunds', p);
    case 'get': return stripeRequest(userId, 'GET', `/refunds/${p.id}`);
    case 'create': return stripeRequest(userId, 'POST', '/refunds', p);
    case 'update': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/refunds/${id}`, rest);
    }
    case 'cancel': return stripeRequest(userId, 'POST', `/refunds/${p.id}/cancel`);
    default: throw new Error(`Unknown stripe_refunds action: ${action}`);
  }
}

// ─── Disputes ───

async function executeDisputes(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/disputes', p);
    case 'get': return stripeRequest(userId, 'GET', `/disputes/${p.id}`);
    case 'update': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/disputes/${id}`, rest);
    }
    case 'close': return stripeRequest(userId, 'POST', `/disputes/${p.id}/close`);
    default: throw new Error(`Unknown stripe_disputes action: ${action}`);
  }
}

// ─── Payouts ───

async function executePayouts(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/payouts', p);
    case 'get': return stripeRequest(userId, 'GET', `/payouts/${p.id}`);
    case 'create': return stripeRequest(userId, 'POST', '/payouts', p);
    case 'cancel': return stripeRequest(userId, 'POST', `/payouts/${p.id}/cancel`);
    case 'reverse': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/payouts/${id}/reverse`, rest);
    }
    default: throw new Error(`Unknown stripe_payouts action: ${action}`);
  }
}

// ─── Balance ───

async function executeBalance(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'get': return stripeRequest(userId, 'GET', '/balance');
    case 'transaction_list': return stripeRequest(userId, 'GET', '/balance_transactions', p);
    default: throw new Error(`Unknown stripe_balance action: ${action}`);
  }
}

// ─── Transfers (Connect) ───

async function executeTransfers(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/transfers', p);
    case 'get': return stripeRequest(userId, 'GET', `/transfers/${p.id}`);
    case 'create': return stripeRequest(userId, 'POST', '/transfers', p);
    default: throw new Error(`Unknown stripe_transfers action: ${action}`);
  }
}

// ─── Accounts (Connect) ───

async function executeAccounts(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/accounts', p);
    case 'get': return stripeRequest(userId, 'GET', `/accounts/${p.id}`);
    case 'create': return stripeRequest(userId, 'POST', '/accounts', p);
    case 'update': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/accounts/${id}`, rest);
    }
    case 'delete': return stripeRequest(userId, 'DELETE', `/accounts/${p.id}`);
    default: throw new Error(`Unknown stripe_accounts action: ${action}`);
  }
}

// ─── Webhook Endpoints ───

async function executeWebhookEndpoints(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/webhook_endpoints', p);
    case 'get': return stripeRequest(userId, 'GET', `/webhook_endpoints/${p.id}`);
    case 'create': return stripeRequest(userId, 'POST', '/webhook_endpoints', p);
    case 'update': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/webhook_endpoints/${id}`, rest);
    }
    case 'delete': return stripeRequest(userId, 'DELETE', `/webhook_endpoints/${p.id}`);
    default: throw new Error(`Unknown stripe_webhook_endpoints action: ${action}`);
  }
}

// ─── Events ───

async function executeEvents(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return stripeRequest(userId, 'GET', '/events', p);
    case 'get': return stripeRequest(userId, 'GET', `/events/${p.id}`);
    default: throw new Error(`Unknown stripe_events action: ${action}`);
  }
}

// ─── Reporting ───

async function executeReporting(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'report_run_create': return stripeRequest(userId, 'POST', '/reporting/report_runs', p);
    case 'report_run_list': return stripeRequest(userId, 'GET', '/reporting/report_runs', p);
    case 'report_type_list': return stripeRequest(userId, 'GET', '/reporting/report_types', p);
    default: throw new Error(`Unknown stripe_reporting action: ${action}`);
  }
}

// ─── Tax ───

async function executeTax(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'rate_list': return stripeRequest(userId, 'GET', '/tax_rates', p);
    case 'rate_get': return stripeRequest(userId, 'GET', `/tax_rates/${p.id}`);
    case 'rate_create': return stripeRequest(userId, 'POST', '/tax_rates', p);
    case 'rate_update': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/tax_rates/${id}`, rest);
    }
    case 'code_list': return stripeRequest(userId, 'GET', '/tax_codes', p);
    case 'calculation_create': return stripeRequest(userId, 'POST', '/tax/calculations', p);
    default: throw new Error(`Unknown stripe_tax action: ${action}`);
  }
}

// ─── Billing Portal ───

async function executeBillingPortal(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'session_create': return stripeRequest(userId, 'POST', '/billing_portal/sessions', p);
    case 'configuration_create': return stripeRequest(userId, 'POST', '/billing_portal/configurations', p);
    case 'configuration_list': return stripeRequest(userId, 'GET', '/billing_portal/configurations', p);
    case 'configuration_get': return stripeRequest(userId, 'GET', `/billing_portal/configurations/${p.id}`);
    case 'configuration_update': {
      const { id, ...rest } = p;
      return stripeRequest(userId, 'POST', `/billing_portal/configurations/${id}`, rest);
    }
    default: throw new Error(`Unknown stripe_billing_portal action: ${action}`);
  }
}

// ─── Main Router ───

async function execute(toolName: string, args: Record<string, any>, ctx: ExecuteContext) {
  const action = args.action as string;
  const params = (args.params || {}) as Record<string, any>;

  if (!action) throw new Error(`Missing "action" parameter for tool ${toolName}`);

  switch (toolName) {
    case 'stripe_customers': return executeCustomers(action, params, ctx);
    case 'stripe_payment_intents': return executePaymentIntents(action, params, ctx);
    case 'stripe_charges': return executeCharges(action, params, ctx);
    case 'stripe_subscriptions': return executeSubscriptions(action, params, ctx);
    case 'stripe_invoices': return executeInvoices(action, params, ctx);
    case 'stripe_products': return executeProducts(action, params, ctx);
    case 'stripe_prices': return executePrices(action, params, ctx);
    case 'stripe_coupons': return executeCoupons(action, params, ctx);
    case 'stripe_promotion_codes': return executePromotionCodes(action, params, ctx);
    case 'stripe_payment_methods': return executePaymentMethods(action, params, ctx);
    case 'stripe_payment_links': return executePaymentLinks(action, params, ctx);
    case 'stripe_checkout_sessions': return executeCheckoutSessions(action, params, ctx);
    case 'stripe_refunds': return executeRefunds(action, params, ctx);
    case 'stripe_disputes': return executeDisputes(action, params, ctx);
    case 'stripe_payouts': return executePayouts(action, params, ctx);
    case 'stripe_balance': return executeBalance(action, params, ctx);
    case 'stripe_transfers': return executeTransfers(action, params, ctx);
    case 'stripe_accounts': return executeAccounts(action, params, ctx);
    case 'stripe_webhook_endpoints': return executeWebhookEndpoints(action, params, ctx);
    case 'stripe_events': return executeEvents(action, params, ctx);
    case 'stripe_reporting': return executeReporting(action, params, ctx);
    case 'stripe_tax': return executeTax(action, params, ctx);
    case 'stripe_billing_portal': return executeBillingPortal(action, params, ctx);
    default:
      throw new Error(`Unknown Stripe tool: ${toolName}`);
  }
}

// ─── Tool Definitions (ALL 23 categories) ───

const tools = [
  createToolGroup('stripe_customers', 'Full Stripe customer management — CRUD, search', [
    'list', 'get', 'create', 'update', 'delete', 'search',
  ], 'Params: {id, email, name, description, phone, address, metadata, payment_method, query, limit, starting_after, ending_before}'),

  createToolGroup('stripe_payment_intents', 'Stripe payment intents — create, confirm, capture, cancel, list, get', [
    'create', 'confirm', 'capture', 'cancel', 'list', 'get',
  ], 'Params: {id, amount, currency, customer, payment_method, confirmation_method, capture_method, automatic_payment_methods, metadata, limit, starting_after}'),

  createToolGroup('stripe_charges', 'Stripe charges — list, get, create, capture, refund', [
    'list', 'get', 'create', 'capture', 'refund',
  ], 'Params: {id, amount, currency, customer, source, description, charge, reason, metadata, limit, starting_after}'),

  createToolGroup('stripe_subscriptions', 'Stripe subscriptions — full lifecycle: create, update, cancel, resume, pause', [
    'list', 'get', 'create', 'update', 'cancel', 'resume', 'pause',
  ], 'Params: {id, customer, items[{price, quantity}], cancel_at_period_end, trial_period_days, default_payment_method, behavior, metadata, limit, starting_after, status}'),

  createToolGroup('stripe_invoices', 'Stripe invoices — full lifecycle: CRUD, send, pay, void, finalize, mark uncollectible', [
    'list', 'get', 'create', 'update', 'delete', 'send', 'pay', 'void', 'finalize', 'mark_uncollectible',
  ], 'Params: {id, customer, subscription, collection_method, auto_advance, days_until_due, description, metadata, limit, starting_after, status}'),

  createToolGroup('stripe_products', 'Stripe products — CRUD and archive', [
    'list', 'get', 'create', 'update', 'delete', 'archive',
  ], 'Params: {id, name, description, active, default_price_data, images[], url, metadata, limit, starting_after}'),

  createToolGroup('stripe_prices', 'Stripe prices — list, get, create, update', [
    'list', 'get', 'create', 'update',
  ], 'Params: {id, product, unit_amount, currency, recurring{interval, interval_count}, type (one_time|recurring), active, metadata, limit, starting_after, lookup_keys[]}'),

  createToolGroup('stripe_coupons', 'Stripe coupons — CRUD', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {id, percent_off, amount_off, currency, duration (once|repeating|forever), duration_in_months, max_redemptions, redeem_by, name, metadata, limit, starting_after}'),

  createToolGroup('stripe_promotion_codes', 'Stripe promotion codes — list, get, create, update', [
    'list', 'get', 'create', 'update',
  ], 'Params: {id, coupon, code, active, customer, expires_at, max_redemptions, restrictions, metadata, limit, starting_after}'),

  createToolGroup('stripe_payment_methods', 'Stripe payment methods — list, get, attach, detach, update', [
    'list', 'get', 'attach', 'detach', 'update',
  ], 'Params: {id, customer, type (card|bank_account|...), card, billing_details, metadata, limit, starting_after}'),

  createToolGroup('stripe_payment_links', 'Stripe payment links — list, get, create, update', [
    'list', 'get', 'create', 'update',
  ], 'Params: {id, line_items[{price, quantity}], after_completion, allow_promotion_codes, metadata, active, limit, starting_after}'),

  createToolGroup('stripe_checkout_sessions', 'Stripe checkout sessions — list, get, create, expire, line_items', [
    'list', 'get', 'create', 'expire', 'line_items',
  ], 'Params: {id, mode (payment|setup|subscription), line_items[{price, quantity}], success_url, cancel_url, customer, payment_method_types[], metadata, limit, starting_after}'),

  createToolGroup('stripe_refunds', 'Stripe refunds — list, get, create, update, cancel', [
    'list', 'get', 'create', 'update', 'cancel',
  ], 'Params: {id, charge, payment_intent, amount, reason (duplicate|fraudulent|requested_by_customer), metadata, limit, starting_after}'),

  createToolGroup('stripe_disputes', 'Stripe disputes — list, get, update, close', [
    'list', 'get', 'update', 'close',
  ], 'Params: {id, evidence, metadata, submit, limit, starting_after}'),

  createToolGroup('stripe_payouts', 'Stripe payouts — list, get, create, cancel, reverse', [
    'list', 'get', 'create', 'cancel', 'reverse',
  ], 'Params: {id, amount, currency, description, destination, method (standard|instant), source_type, metadata, limit, starting_after, status}'),

  createToolGroup('stripe_balance', 'Stripe balance — get current balance and list balance transactions', [
    'get', 'transaction_list',
  ], 'Params: {limit, starting_after, ending_before, type, payout, source, currency, created}'),

  createToolGroup('stripe_transfers', 'Stripe Connect transfers — list, get, create', [
    'list', 'get', 'create',
  ], 'Params: {id, amount, currency, destination, description, source_transaction, transfer_group, metadata, limit, starting_after}'),

  createToolGroup('stripe_accounts', 'Stripe Connect accounts — CRUD for connected accounts', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {id, type (standard|express|custom), country, email, capabilities, business_type, company, individual, tos_acceptance, metadata, limit, starting_after}'),

  createToolGroup('stripe_webhook_endpoints', 'Stripe webhook endpoints — CRUD', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {id, url, enabled_events[], description, disabled, api_version, metadata, limit, starting_after}'),

  createToolGroup('stripe_events', 'Stripe events — list and retrieve events for audit/debugging', [
    'list', 'get',
  ], 'Params: {id, type, created, delivery_success, limit, starting_after, ending_before}'),

  createToolGroup('stripe_reporting', 'Stripe reporting — create and list report runs, list report types', [
    'report_run_create', 'report_run_list', 'report_type_list',
  ], 'Params: {report_type, parameters{interval_start, interval_end, columns[], connected_account}, limit, starting_after}'),

  createToolGroup('stripe_tax', 'Stripe tax — tax rates CRUD, tax codes listing, tax calculations', [
    'rate_list', 'rate_get', 'rate_create', 'rate_update', 'code_list', 'calculation_create',
  ], 'Params: {id, display_name, percentage, inclusive, jurisdiction, description, active, country, tax_code, line_items[], customer, currency, shipping_cost, metadata, limit, starting_after}'),

  createToolGroup('stripe_billing_portal', 'Stripe billing portal — session creation and configuration management', [
    'session_create', 'configuration_create', 'configuration_list', 'configuration_get', 'configuration_update',
  ], 'Params: {id, customer, return_url, configuration, features, business_profile, default_return_url, metadata, limit, starting_after}'),
];

// ─── Register Server ───

export function registerStripeServer() {
  registerServer('stripe', {
    name: 'AIM Stripe',
    description: 'Full Stripe API access — ALL 23 API categories, 100+ operations. Customers, payments, subscriptions, invoices, products, prices, coupons, checkout, refunds, disputes, payouts, balance, transfers, accounts, webhooks, events, reporting, tax, and billing portal.',
    tools,
    execute,
  });
}
