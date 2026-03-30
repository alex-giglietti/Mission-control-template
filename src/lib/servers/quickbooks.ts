import {
  registerServer,
  createToolGroup,
  makeAuthenticatedRequest,
  type ExecuteContext,
} from '@/lib/server-registry';

// ─── QuickBooks API Base URL ───
const QB_API = 'https://quickbooks.api.intuit.com/v3/company';

// ─── Helpers ───

function qs(params: Record<string, any>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

/** Build a QuickBooks query SELECT statement from params */
function buildQuery(entity: string, p: Record<string, any>): string {
  let q = `SELECT * FROM ${entity}`;
  if (p.where) q += ` WHERE ${p.where}`;
  if (p.orderBy) q += ` ORDERBY ${p.orderBy}`;
  if (p.startPosition) q += ` STARTPOSITION ${p.startPosition}`;
  if (p.maxResults) q += ` MAXRESULTS ${p.maxResults}`;
  return q;
}

/** Make an authenticated QuickBooks API request */
async function qbRequest(userId: string, realmId: string, method: string, path: string, query?: Record<string, any>, body?: any) {
  const url = `${QB_API}/${realmId}${path}${qs({ ...query, minorversion: '73' })}`;
  return makeAuthenticatedRequest(userId, 'quickbooks', url, {
    method,
    headers: {
      'Accept': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

/** Shorthand for QuickBooks query endpoint */
async function qbQuery(userId: string, realmId: string, queryStr: string, query?: Record<string, any>) {
  return qbRequest(userId, realmId, 'GET', '/query', { ...query, query: queryStr });
}

// ─── Accounts (Chart of Accounts) ───

async function executeAccounts(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('Account', p));
    case 'get': return qbRequest(userId, r, 'GET', `/account/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/account', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/account', undefined, p.body);
    case 'delete': return qbRequest(userId, r, 'POST', '/account', { operation: 'delete' }, p.body);
    default: throw new Error(`Unknown qb_accounts action: ${action}`);
  }
}

// ─── Invoices ───

async function executeInvoices(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('Invoice', p));
    case 'get': return qbRequest(userId, r, 'GET', `/invoice/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/invoice', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/invoice', undefined, p.body);
    case 'delete': return qbRequest(userId, r, 'POST', '/invoice', { operation: 'delete' }, p.body);
    case 'send': return qbRequest(userId, r, 'POST', `/invoice/${p.id}/send`, p.sendTo ? { sendTo: p.sendTo } : undefined);
    case 'void': return qbRequest(userId, r, 'POST', '/invoice', { operation: 'void' }, p.body);
    default: throw new Error(`Unknown qb_invoices action: ${action}`);
  }
}

// ─── Payments ───

async function executePayments(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('Payment', p));
    case 'get': return qbRequest(userId, r, 'GET', `/payment/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/payment', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/payment', undefined, p.body);
    case 'delete': return qbRequest(userId, r, 'POST', '/payment', { operation: 'delete' }, p.body);
    case 'void': return qbRequest(userId, r, 'POST', '/payment', { operation: 'void' }, p.body);
    default: throw new Error(`Unknown qb_payments action: ${action}`);
  }
}

// ─── Estimates ───

async function executeEstimates(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('Estimate', p));
    case 'get': return qbRequest(userId, r, 'GET', `/estimate/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/estimate', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/estimate', undefined, p.body);
    case 'delete': return qbRequest(userId, r, 'POST', '/estimate', { operation: 'delete' }, p.body);
    case 'send': return qbRequest(userId, r, 'POST', `/estimate/${p.id}/send`, p.sendTo ? { sendTo: p.sendTo } : undefined);
    default: throw new Error(`Unknown qb_estimates action: ${action}`);
  }
}

// ─── Credit Memos ───

async function executeCreditMemos(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('CreditMemo', p));
    case 'get': return qbRequest(userId, r, 'GET', `/creditmemo/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/creditmemo', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/creditmemo', undefined, p.body);
    case 'delete': return qbRequest(userId, r, 'POST', '/creditmemo', { operation: 'delete' }, p.body);
    default: throw new Error(`Unknown qb_credit_memos action: ${action}`);
  }
}

// ─── Sales Receipts ───

async function executeSalesReceipts(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('SalesReceipt', p));
    case 'get': return qbRequest(userId, r, 'GET', `/salesreceipt/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/salesreceipt', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/salesreceipt', undefined, p.body);
    case 'delete': return qbRequest(userId, r, 'POST', '/salesreceipt', { operation: 'delete' }, p.body);
    case 'send': return qbRequest(userId, r, 'POST', `/salesreceipt/${p.id}/send`, p.sendTo ? { sendTo: p.sendTo } : undefined);
    default: throw new Error(`Unknown qb_sales_receipts action: ${action}`);
  }
}

// ─── Refund Receipts ───

async function executeRefundReceipts(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('RefundReceipt', p));
    case 'get': return qbRequest(userId, r, 'GET', `/refundreceipt/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/refundreceipt', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/refundreceipt', undefined, p.body);
    case 'delete': return qbRequest(userId, r, 'POST', '/refundreceipt', { operation: 'delete' }, p.body);
    default: throw new Error(`Unknown qb_refund_receipts action: ${action}`);
  }
}

// ─── Customers ───

async function executeCustomers(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('Customer', p));
    case 'get': return qbRequest(userId, r, 'GET', `/customer/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/customer', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/customer', undefined, p.body);
    default: throw new Error(`Unknown qb_customers action: ${action}`);
  }
}

// ─── Vendors ───

async function executeVendors(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('Vendor', p));
    case 'get': return qbRequest(userId, r, 'GET', `/vendor/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/vendor', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/vendor', undefined, p.body);
    default: throw new Error(`Unknown qb_vendors action: ${action}`);
  }
}

// ─── Items (Products/Services) ───

async function executeItems(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('Item', p));
    case 'get': return qbRequest(userId, r, 'GET', `/item/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/item', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/item', undefined, p.body);
    default: throw new Error(`Unknown qb_items action: ${action}`);
  }
}

// ─── Expenses (Purchases) ───

async function executeExpenses(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'purchase_list': return qbQuery(userId, r, buildQuery('Purchase', p));
    case 'purchase_get': return qbRequest(userId, r, 'GET', `/purchase/${p.id}`);
    case 'purchase_create': return qbRequest(userId, r, 'POST', '/purchase', undefined, p.body);
    case 'purchase_update': return qbRequest(userId, r, 'POST', '/purchase', undefined, p.body);
    case 'purchase_delete': return qbRequest(userId, r, 'POST', '/purchase', { operation: 'delete' }, p.body);
    default: throw new Error(`Unknown qb_expenses action: ${action}`);
  }
}

// ─── Bills ───

async function executeBills(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('Bill', p));
    case 'get': return qbRequest(userId, r, 'GET', `/bill/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/bill', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/bill', undefined, p.body);
    case 'delete': return qbRequest(userId, r, 'POST', '/bill', { operation: 'delete' }, p.body);
    default: throw new Error(`Unknown qb_bills action: ${action}`);
  }
}

// ─── Bill Payments ───

async function executeBillPayments(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('BillPayment', p));
    case 'get': return qbRequest(userId, r, 'GET', `/billpayment/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/billpayment', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/billpayment', undefined, p.body);
    case 'delete': return qbRequest(userId, r, 'POST', '/billpayment', { operation: 'delete' }, p.body);
    default: throw new Error(`Unknown qb_bill_payments action: ${action}`);
  }
}

// ─── Journal Entries ───

async function executeJournalEntries(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('JournalEntry', p));
    case 'get': return qbRequest(userId, r, 'GET', `/journalentry/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/journalentry', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/journalentry', undefined, p.body);
    case 'delete': return qbRequest(userId, r, 'POST', '/journalentry', { operation: 'delete' }, p.body);
    default: throw new Error(`Unknown qb_journal_entries action: ${action}`);
  }
}

// ─── Transfers ───

async function executeTransfers(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('Transfer', p));
    case 'get': return qbRequest(userId, r, 'GET', `/transfer/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/transfer', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/transfer', undefined, p.body);
    case 'delete': return qbRequest(userId, r, 'POST', '/transfer', { operation: 'delete' }, p.body);
    default: throw new Error(`Unknown qb_transfers action: ${action}`);
  }
}

// ─── Deposits ───

async function executeDeposits(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('Deposit', p));
    case 'get': return qbRequest(userId, r, 'GET', `/deposit/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/deposit', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/deposit', undefined, p.body);
    case 'delete': return qbRequest(userId, r, 'POST', '/deposit', { operation: 'delete' }, p.body);
    default: throw new Error(`Unknown qb_deposits action: ${action}`);
  }
}

// ─── Tax ───

async function executeTax(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'code_list': return qbQuery(userId, r, buildQuery('TaxCode', p));
    case 'code_get': return qbRequest(userId, r, 'GET', `/taxcode/${p.id}`);
    case 'rate_list': return qbQuery(userId, r, buildQuery('TaxRate', p));
    case 'rate_get': return qbRequest(userId, r, 'GET', `/taxrate/${p.id}`);
    case 'agency_list': return qbQuery(userId, r, buildQuery('TaxAgency', p));
    case 'agency_get': return qbRequest(userId, r, 'GET', `/taxagency/${p.id}`);
    default: throw new Error(`Unknown qb_tax action: ${action}`);
  }
}

// ─── Classes ───

async function executeClasses(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('Class', p));
    case 'get': return qbRequest(userId, r, 'GET', `/class/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/class', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/class', undefined, p.body);
    default: throw new Error(`Unknown qb_classes action: ${action}`);
  }
}

// ─── Departments ───

async function executeDepartments(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('Department', p));
    case 'get': return qbRequest(userId, r, 'GET', `/department/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/department', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/department', undefined, p.body);
    default: throw new Error(`Unknown qb_departments action: ${action}`);
  }
}

// ─── Employees ───

async function executeEmployees(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('Employee', p));
    case 'get': return qbRequest(userId, r, 'GET', `/employee/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/employee', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/employee', undefined, p.body);
    default: throw new Error(`Unknown qb_employees action: ${action}`);
  }
}

// ─── Attachments ───

async function executeAttachments(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('Attachable', p));
    case 'get': return qbRequest(userId, r, 'GET', `/attachable/${p.id}`);
    case 'upload': return qbRequest(userId, r, 'POST', '/upload', undefined, p.body);
    case 'delete': return qbRequest(userId, r, 'POST', '/attachable', { operation: 'delete' }, p.body);
    default: throw new Error(`Unknown qb_attachments action: ${action}`);
  }
}

// ─── Reports ───

async function executeReports(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  const rq: Record<string, any> = {};
  if (p.start_date) rq['start_date'] = p.start_date;
  if (p.end_date) rq['end_date'] = p.end_date;
  if (p.date_macro) rq['date_macro'] = p.date_macro;
  if (p.accounting_method) rq['accounting_method'] = p.accounting_method;
  if (p.summarize_column_by) rq['summarize_column_by'] = p.summarize_column_by;
  if (p.customer) rq['customer'] = p.customer;
  if (p.vendor) rq['vendor'] = p.vendor;
  if (p.item) rq['item'] = p.item;
  if (p.classid) rq['classid'] = p.classid;
  if (p.department) rq['department'] = p.department;
  if (p.columns) rq['columns'] = p.columns;
  if (p.sort_by) rq['sort_by'] = p.sort_by;
  if (p.sort_order) rq['sort_order'] = p.sort_order;
  if (p.report_date) rq['report_date'] = p.report_date;
  if (p.aging_period) rq['aging_period'] = p.aging_period;
  if (p.num_periods) rq['num_periods'] = p.num_periods;
  if (p.past_due) rq['past_due'] = p.past_due;
  if (p.term) rq['term'] = p.term;
  if (p.shipvia) rq['shipvia'] = p.shipvia;
  if (p.source_account_type) rq['source_account_type'] = p.source_account_type;
  if (p.account) rq['account'] = p.account;
  if (p.source_account) rq['source_account'] = p.source_account;
  if (p.createdate_macro) rq['createdate_macro'] = p.createdate_macro;
  if (p.moddate_macro) rq['moddate_macro'] = p.moddate_macro;
  if (p.qzurl) rq['qzurl'] = p.qzurl;
  if (p.subcol_pct_inc) rq['subcol_pct_inc'] = p.subcol_pct_inc;
  if (p.subcol_pct_exp) rq['subcol_pct_exp'] = p.subcol_pct_exp;

  switch (action) {
    case 'profit_and_loss': return qbRequest(userId, r, 'GET', '/reports/ProfitAndLoss', rq);
    case 'profit_and_loss_detail': return qbRequest(userId, r, 'GET', '/reports/ProfitAndLossDetail', rq);
    case 'balance_sheet': return qbRequest(userId, r, 'GET', '/reports/BalanceSheet', rq);
    case 'balance_sheet_detail': return qbRequest(userId, r, 'GET', '/reports/BalanceSheetDetail', rq);
    case 'cash_flow': return qbRequest(userId, r, 'GET', '/reports/CashFlow', rq);
    case 'trial_balance': return qbRequest(userId, r, 'GET', '/reports/TrialBalance', rq);
    case 'general_ledger': return qbRequest(userId, r, 'GET', '/reports/GeneralLedger', rq);
    case 'ar_aging_summary': return qbRequest(userId, r, 'GET', '/reports/AgedReceivables', rq);
    case 'ar_aging_detail': return qbRequest(userId, r, 'GET', '/reports/AgedReceivableDetail', rq);
    case 'ap_aging_summary': return qbRequest(userId, r, 'GET', '/reports/AgedPayables', rq);
    case 'ap_aging_detail': return qbRequest(userId, r, 'GET', '/reports/AgedPayableDetail', rq);
    case 'sales_by_customer': return qbRequest(userId, r, 'GET', '/reports/CustomerSales', rq);
    case 'sales_by_product': return qbRequest(userId, r, 'GET', '/reports/ItemSales', rq);
    case 'expenses_by_vendor': return qbRequest(userId, r, 'GET', '/reports/VendorExpenses', rq);
    case 'tax_summary': return qbRequest(userId, r, 'GET', '/reports/TaxSummary', rq);
    case 'custom_report': {
      const reportName = p.report_name;
      if (!reportName) throw new Error('custom_report requires report_name param');
      return qbRequest(userId, r, 'GET', `/reports/${reportName}`, rq);
    }
    default: throw new Error(`Unknown qb_reports action: ${action}`);
  }
}

// ─── Preferences ───

async function executePreferences(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'get': return qbRequest(userId, r, 'GET', '/preferences');
    case 'update': return qbRequest(userId, r, 'POST', '/preferences', undefined, p.body);
    default: throw new Error(`Unknown qb_preferences action: ${action}`);
  }
}

// ─── Company Info ───

async function executeCompanyInfo(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'get': return qbRequest(userId, r, 'GET', `/companyinfo/${r}`);
    case 'update': return qbRequest(userId, r, 'POST', `/companyinfo`, undefined, p.body);
    default: throw new Error(`Unknown qb_company_info action: ${action}`);
  }
}

// ─── Batch ───

async function executeBatch(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'execute': return qbRequest(userId, r, 'POST', '/batch', undefined, { BatchItemRequest: p.requests });
    default: throw new Error(`Unknown qb_batch action: ${action}`);
  }
}

// ─── Query ───

async function executeQuery(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'execute': return qbQuery(userId, r, p.query);
    default: throw new Error(`Unknown qb_query action: ${action}`);
  }
}

// ─── Change Data Capture ───

async function executeChangeDataCapture(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'get_changes': return qbRequest(userId, r, 'GET', '/cdc', { entities: Array.isArray(p.entities) ? p.entities.join(',') : p.entities, changedSince: p.changed_since });
    default: throw new Error(`Unknown qb_change_data_capture action: ${action}`);
  }
}

// ─── Webhooks ───

async function executeWebhooks(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const r = p.realm_id;
  switch (action) {
    case 'list': return qbQuery(userId, r, buildQuery('Webhook', p));
    case 'get': return qbRequest(userId, r, 'GET', `/webhook/${p.id}`);
    case 'create': return qbRequest(userId, r, 'POST', '/webhook', undefined, p.body);
    case 'update': return qbRequest(userId, r, 'POST', '/webhook', undefined, p.body);
    case 'delete': return qbRequest(userId, r, 'POST', '/webhook', { operation: 'delete' }, p.body);
    default: throw new Error(`Unknown qb_webhooks action: ${action}`);
  }
}

// ─── Main Router ───

async function execute(toolName: string, args: Record<string, any>, ctx: ExecuteContext) {
  const action = args.action as string;
  const params = (args.params || {}) as Record<string, any>;

  if (!action) throw new Error(`Missing "action" parameter for tool ${toolName}`);
  if (!params.realm_id) throw new Error(`Missing "realm_id" in params for tool ${toolName}. The QuickBooks company ID (realm_id) is required.`);

  switch (toolName) {
    case 'qb_accounts': return executeAccounts(action, params, ctx);
    case 'qb_invoices': return executeInvoices(action, params, ctx);
    case 'qb_payments': return executePayments(action, params, ctx);
    case 'qb_estimates': return executeEstimates(action, params, ctx);
    case 'qb_credit_memos': return executeCreditMemos(action, params, ctx);
    case 'qb_sales_receipts': return executeSalesReceipts(action, params, ctx);
    case 'qb_refund_receipts': return executeRefundReceipts(action, params, ctx);
    case 'qb_customers': return executeCustomers(action, params, ctx);
    case 'qb_vendors': return executeVendors(action, params, ctx);
    case 'qb_items': return executeItems(action, params, ctx);
    case 'qb_expenses': return executeExpenses(action, params, ctx);
    case 'qb_bills': return executeBills(action, params, ctx);
    case 'qb_bill_payments': return executeBillPayments(action, params, ctx);
    case 'qb_journal_entries': return executeJournalEntries(action, params, ctx);
    case 'qb_transfers': return executeTransfers(action, params, ctx);
    case 'qb_deposits': return executeDeposits(action, params, ctx);
    case 'qb_tax': return executeTax(action, params, ctx);
    case 'qb_classes': return executeClasses(action, params, ctx);
    case 'qb_departments': return executeDepartments(action, params, ctx);
    case 'qb_employees': return executeEmployees(action, params, ctx);
    case 'qb_attachments': return executeAttachments(action, params, ctx);
    case 'qb_reports': return executeReports(action, params, ctx);
    case 'qb_preferences': return executePreferences(action, params, ctx);
    case 'qb_company_info': return executeCompanyInfo(action, params, ctx);
    case 'qb_batch': return executeBatch(action, params, ctx);
    case 'qb_query': return executeQuery(action, params, ctx);
    case 'qb_change_data_capture': return executeChangeDataCapture(action, params, ctx);
    case 'qb_webhooks': return executeWebhooks(action, params, ctx);
    default:
      throw new Error(`Unknown QuickBooks tool: ${toolName}`);
  }
}

// ─── Tool Definitions (ALL 28 categories) ───

const tools = [
  createToolGroup('qb_accounts', 'QuickBooks Chart of Accounts — list, get, create, update, delete accounts', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {realm_id, id, body: {Name, AccountType, AccountSubType, Description, AcctNum, ...}, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_invoices', 'QuickBooks Invoicing — full lifecycle: list, get, create, update, delete, send email, void', [
    'list', 'get', 'create', 'update', 'delete', 'send', 'void',
  ], 'Params: {realm_id, id, body: {CustomerRef, Line[], TxnDate, DueDate, SyncToken, ...}, sendTo (email), where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_payments', 'QuickBooks Payments — list, get, create, update, delete, void payments', [
    'list', 'get', 'create', 'update', 'delete', 'void',
  ], 'Params: {realm_id, id, body: {CustomerRef, TotalAmt, PaymentMethodRef, Line[], SyncToken, ...}, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_estimates', 'QuickBooks Estimates — list, get, create, update, delete, send email', [
    'list', 'get', 'create', 'update', 'delete', 'send',
  ], 'Params: {realm_id, id, body: {CustomerRef, Line[], TxnDate, ExpirationDate, SyncToken, ...}, sendTo (email), where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_credit_memos', 'QuickBooks Credit Memos — list, get, create, update, delete', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {realm_id, id, body: {CustomerRef, Line[], TxnDate, SyncToken, ...}, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_sales_receipts', 'QuickBooks Sales Receipts (Point of Sale) — list, get, create, update, delete, send email', [
    'list', 'get', 'create', 'update', 'delete', 'send',
  ], 'Params: {realm_id, id, body: {CustomerRef, Line[], TxnDate, PaymentMethodRef, DepositToAccountRef, SyncToken, ...}, sendTo (email), where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_refund_receipts', 'QuickBooks Refund Receipts — list, get, create, update, delete refunds', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {realm_id, id, body: {CustomerRef, Line[], TxnDate, DepositToAccountRef, SyncToken, ...}, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_customers', 'QuickBooks Customer management — list, get, create, update customers', [
    'list', 'get', 'create', 'update',
  ], 'Params: {realm_id, id, body: {DisplayName, PrimaryEmailAddr, PrimaryPhone, BillAddr, CompanyName, GivenName, FamilyName, SyncToken, ...}, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_vendors', 'QuickBooks Vendor management — list, get, create, update vendors', [
    'list', 'get', 'create', 'update',
  ], 'Params: {realm_id, id, body: {DisplayName, PrimaryEmailAddr, PrimaryPhone, BillAddr, CompanyName, GivenName, FamilyName, SyncToken, ...}, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_items', 'QuickBooks Products/Services (Items) — list, get, create, update items', [
    'list', 'get', 'create', 'update',
  ], 'Params: {realm_id, id, body: {Name, Type (Inventory|Service|NonInventory), IncomeAccountRef, ExpenseAccountRef, UnitPrice, QtyOnHand, TrackQtyOnHand, SyncToken, ...}, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_expenses', 'QuickBooks Expense tracking (Purchases) — list, get, create, update, delete purchases', [
    'purchase_list', 'purchase_get', 'purchase_create', 'purchase_update', 'purchase_delete',
  ], 'Params: {realm_id, id, body: {AccountRef, PaymentType (Cash|Check|CreditCard), Line[], EntityRef, TxnDate, SyncToken, ...}, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_bills', 'QuickBooks AP Bills — list, get, create, update, delete bills', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {realm_id, id, body: {VendorRef, Line[], TxnDate, DueDate, APAccountRef, SyncToken, ...}, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_bill_payments', 'QuickBooks Bill Payments — list, get, create, update, delete bill payments', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {realm_id, id, body: {VendorRef, TotalAmt, PayType (Check|CreditCard), Line[], CheckPayment/CreditCardPayment, SyncToken, ...}, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_journal_entries', 'QuickBooks Journal Entries — list, get, create, update, delete journal entries', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {realm_id, id, body: {Line[] (JournalEntryLineDetail with PostingType Debit|Credit, AccountRef, Amount), TxnDate, SyncToken, ...}, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_transfers', 'QuickBooks Bank Transfers — list, get, create, update, delete transfers between accounts', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {realm_id, id, body: {FromAccountRef, ToAccountRef, Amount, TxnDate, SyncToken, ...}, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_deposits', 'QuickBooks Bank Deposits — list, get, create, update, delete deposits', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {realm_id, id, body: {DepositToAccountRef, Line[], TxnDate, SyncToken, ...}, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_tax', 'QuickBooks Tax management — tax codes, tax rates, tax agencies', [
    'code_list', 'code_get', 'rate_list', 'rate_get', 'agency_list', 'agency_get',
  ], 'Params: {realm_id, id, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_classes', 'QuickBooks Class tracking — list, get, create, update classes for categorization', [
    'list', 'get', 'create', 'update',
  ], 'Params: {realm_id, id, body: {Name, SubClass, ParentRef, Active, SyncToken, ...}, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_departments', 'QuickBooks Location/Department tracking — list, get, create, update departments', [
    'list', 'get', 'create', 'update',
  ], 'Params: {realm_id, id, body: {Name, SubDepartment, ParentRef, Active, SyncToken, ...}, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_employees', 'QuickBooks Employee records — list, get, create, update employees', [
    'list', 'get', 'create', 'update',
  ], 'Params: {realm_id, id, body: {GivenName, FamilyName, DisplayName, PrimaryPhone, PrimaryEmailAddr, SSN, PrimaryAddr, SyncToken, ...}, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_attachments', 'QuickBooks File Attachments — list, get, upload, delete attachable objects', [
    'list', 'get', 'upload', 'delete',
  ], 'Params: {realm_id, id, body: {FileName, ContentType, AttachableRef[] (EntityRef with value and type), Note, ...}, where, orderBy, startPosition, maxResults}'),

  createToolGroup('qb_reports', 'QuickBooks Reports — ALL financial reports: P&L, balance sheet, cash flow, trial balance, general ledger, aging, sales, expenses, tax, custom', [
    'profit_and_loss', 'profit_and_loss_detail', 'balance_sheet', 'balance_sheet_detail',
    'cash_flow', 'trial_balance', 'general_ledger',
    'ar_aging_summary', 'ar_aging_detail', 'ap_aging_summary', 'ap_aging_detail',
    'sales_by_customer', 'sales_by_product', 'expenses_by_vendor',
    'tax_summary', 'custom_report',
  ], 'Params: {realm_id, start_date, end_date, date_macro (e.g. Last Month), accounting_method (Cash|Accrual), summarize_column_by (Month|Week|Days|...), customer, vendor, item, classid, department, columns, sort_by, sort_order, report_date, aging_period, num_periods, report_name (for custom_report)}'),

  createToolGroup('qb_preferences', 'QuickBooks Company Preferences/Settings — get and update company preferences', [
    'get', 'update',
  ], 'Params: {realm_id, body: {AccountingInfoPrefs, ProductAndServicesPrefs, SalesFormsPrefs, EmailMessagesPrefs, VendorAndPurchasesPrefs, TaxPrefs, SyncToken, ...}}'),

  createToolGroup('qb_company_info', 'QuickBooks Company Information — get and update company details', [
    'get', 'update',
  ], 'Params: {realm_id, body: {CompanyName, LegalName, CompanyAddr, Email, Phone, FiscalYearStartMonth, SyncToken, ...}}'),

  createToolGroup('qb_batch', 'QuickBooks Batch Operations — execute up to 30 operations in a single API call', [
    'execute',
  ], 'Params: {realm_id, requests: [{bId, operation (create|update|delete|query), Entity/Query, ...}]}'),

  createToolGroup('qb_query', 'QuickBooks Query Language — execute raw SQL-like queries against any QBO entity', [
    'execute',
  ], 'Params: {realm_id, query: "SELECT * FROM Invoice WHERE TotalAmt > \'100.00\' ORDERBY TxnDate STARTPOSITION 1 MAXRESULTS 10"}'),

  createToolGroup('qb_change_data_capture', 'QuickBooks Change Data Capture — sync all changes since a given timestamp', [
    'get_changes',
  ], 'Params: {realm_id, entities: ["Invoice","Customer","Payment",...] or comma-separated string, changed_since: ISO timestamp e.g. "2024-01-01T00:00:00Z"}'),

  createToolGroup('qb_webhooks', 'QuickBooks Webhook management — CRUD for webhook subscriptions', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {realm_id, id, body: {WebhookEndpoint, EventNotifications[], ...}, where, orderBy, startPosition, maxResults}'),
];

// ─── Register Server ───

export function registerQuickBooksServer() {
  registerServer('quickbooks', {
    name: 'AIM QuickBooks',
    description: 'Full QuickBooks Online API access — ALL 28 API categories, 130+ operations. Accounts, invoices, payments, estimates, credit memos, sales receipts, refund receipts, customers, vendors, items, expenses, bills, bill payments, journal entries, transfers, deposits, tax, classes, departments, employees, attachments, reports, preferences, company info, batch operations, raw query language, change data capture, and webhooks.',
    tools,
    execute,
  });
}
