import {
  registerServer,
  createToolGroup,
  makeApiKeyRequest,
  type ExecuteContext,
} from '@/lib/server-registry';

// ─── Klaviyo API Base URL ───
const KLAVIYO_API = 'https://a.klaviyo.com/api';

// ─── Helpers ───

function qs(params: Record<string, any>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

/** Wrap body in JSON:API envelope if not already wrapped */
function jsonapi(type: string, attrs: Record<string, any>, id?: string): any {
  if (attrs.data) return attrs;
  const d: any = { type, attributes: attrs };
  if (id) d.id = id;
  return { data: d };
}

/** Build standard Klaviyo list query params from user params */
function listQuery(p: Record<string, any>): Record<string, any> {
  const q: Record<string, any> = {};
  if (p.filter) q['filter'] = p.filter;
  if (p.sort) q['sort'] = p.sort;
  if (p.page_cursor) q['page[cursor]'] = p.page_cursor;
  if (p.page_size) q['page[size]'] = p.page_size;
  if (p.fields) q['fields[' + (p.fields_type || 'profile') + ']'] = Array.isArray(p.fields) ? p.fields.join(',') : p.fields;
  if (p.include) q['include'] = Array.isArray(p.include) ? p.include.join(',') : p.include;
  return q;
}

// Klaviyo uses API key auth — requires revision header on all requests
async function klaviyoRequest(userId: string, method: string, path: string, query?: Record<string, any>, body?: any) {
  const url = `${KLAVIYO_API}${path}${query ? qs(query) : ''}`;
  const options: RequestInit = {
    method,
    headers: {
      'revision': '2024-10-15',
      'Accept': 'application/json',
    } as Record<string, string>,
  };
  if (body) options.body = JSON.stringify(body);
  return makeApiKeyRequest(userId, 'klaviyo', url, options, 'Authorization', 'Klaviyo-API-Key');
}

// ─── Campaigns ───

async function executeCampaigns(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return klaviyoRequest(userId, 'GET', '/campaigns', listQuery(p));
    case 'get': return klaviyoRequest(userId, 'GET', `/campaigns/${p.id}`);
    case 'create': return klaviyoRequest(userId, 'POST', '/campaigns', undefined, jsonapi('campaign', p));
    case 'update': return klaviyoRequest(userId, 'PATCH', `/campaigns/${p.id}`, undefined, jsonapi('campaign', p, p.id));
    case 'delete': return klaviyoRequest(userId, 'DELETE', `/campaigns/${p.id}`);
    case 'send': return klaviyoRequest(userId, 'POST', '/campaign-send-jobs', undefined, { data: { type: 'campaign-send-job', id: p.id } });
    case 'cancel': return klaviyoRequest(userId, 'POST', '/campaign-send-jobs', undefined, { data: { type: 'campaign-send-job', attributes: { action: 'cancel', id: p.id } } });
    case 'message_get': return klaviyoRequest(userId, 'GET', `/campaign-messages/${p.message_id}`);
    case 'message_update': return klaviyoRequest(userId, 'PATCH', `/campaign-messages/${p.message_id}`, undefined, jsonapi('campaign-message', p, p.message_id));
    case 'message_assign_template': return klaviyoRequest(userId, 'POST', `/campaign-messages/${p.message_id}/relationships/template`, undefined, { data: { type: 'template', id: p.template_id } });
    case 'report': return klaviyoRequest(userId, 'POST', '/campaign-values-reports', undefined, { data: { type: 'campaign-values-report', attributes: { statistics: p.statistics || ['opens', 'clicks', 'recipients'], filter: p.filter, timeframe: p.timeframe } } });
    default: throw new Error(`Unknown klaviyo_campaigns action: ${action}`);
  }
}

// ─── Flows ───

async function executeFlows(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return klaviyoRequest(userId, 'GET', '/flows', listQuery(p));
    case 'get': return klaviyoRequest(userId, 'GET', `/flows/${p.id}`);
    case 'update': return klaviyoRequest(userId, 'PATCH', `/flows/${p.id}`, undefined, jsonapi('flow', p, p.id));
    case 'delete': return klaviyoRequest(userId, 'DELETE', `/flows/${p.id}`);
    case 'action_list': return klaviyoRequest(userId, 'GET', `/flows/${p.id}/flow-actions`, listQuery(p));
    case 'action_get': return klaviyoRequest(userId, 'GET', `/flow-actions/${p.action_id}`);
    case 'action_update': return klaviyoRequest(userId, 'PATCH', `/flow-actions/${p.action_id}`, undefined, jsonapi('flow-action', p, p.action_id));
    case 'message_list': return klaviyoRequest(userId, 'GET', `/flow-actions/${p.action_id}/flow-messages`, listQuery(p));
    case 'message_get': return klaviyoRequest(userId, 'GET', `/flow-messages/${p.message_id}`);
    case 'message_update': return klaviyoRequest(userId, 'PATCH', `/flow-messages/${p.message_id}`, undefined, jsonapi('flow-message', p, p.message_id));
    case 'report': return klaviyoRequest(userId, 'POST', '/flow-values-reports', undefined, { data: { type: 'flow-values-report', attributes: { statistics: p.statistics || ['opens', 'clicks', 'recipients'], filter: p.filter, timeframe: p.timeframe } } });
    default: throw new Error(`Unknown klaviyo_flows action: ${action}`);
  }
}

// ─── Profiles ───

async function executeProfiles(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return klaviyoRequest(userId, 'GET', '/profiles', listQuery(p));
    case 'get': return klaviyoRequest(userId, 'GET', `/profiles/${p.id}`);
    case 'create': return klaviyoRequest(userId, 'POST', '/profiles', undefined, jsonapi('profile', p));
    case 'update': return klaviyoRequest(userId, 'PATCH', `/profiles/${p.id}`, undefined, jsonapi('profile', p, p.id));
    case 'bulk_create': return klaviyoRequest(userId, 'POST', '/profile-bulk-import-jobs', undefined, { data: { type: 'profile-bulk-import-job', attributes: { profiles: { data: p.profiles } } } });
    case 'bulk_update': return klaviyoRequest(userId, 'POST', '/profile-bulk-import-jobs', undefined, { data: { type: 'profile-bulk-import-job', attributes: { profiles: { data: p.profiles } } } });
    case 'subscribe': return klaviyoRequest(userId, 'POST', '/profile-subscription-bulk-create-jobs', undefined, { data: { type: 'profile-subscription-bulk-create-job', attributes: { custom_source: p.custom_source, profiles: { data: p.profiles }, historical_import: p.historical_import }, relationships: { list: { data: { type: 'list', id: p.list_id } } } } });
    case 'unsubscribe': return klaviyoRequest(userId, 'POST', '/profile-subscription-bulk-delete-jobs', undefined, { data: { type: 'profile-subscription-bulk-delete-job', attributes: { profiles: { data: p.profiles } }, relationships: { list: { data: { type: 'list', id: p.list_id } } } } });
    case 'suppress': return klaviyoRequest(userId, 'POST', '/profile-suppression-bulk-create-jobs', undefined, { data: { type: 'profile-suppression-bulk-create-job', attributes: { profiles: { data: p.profiles } } } });
    case 'unsuppress': return klaviyoRequest(userId, 'POST', '/profile-suppression-bulk-delete-jobs', undefined, { data: { type: 'profile-suppression-bulk-delete-job', attributes: { profiles: { data: p.profiles } } } });
    case 'merge_profiles': return klaviyoRequest(userId, 'POST', '/profile-merge', undefined, { data: { type: 'profile-merge', relationships: p.relationships } });
    case 'segment_memberships': return klaviyoRequest(userId, 'GET', `/profiles/${p.id}/segments`, listQuery(p));
    case 'list_memberships': return klaviyoRequest(userId, 'GET', `/profiles/${p.id}/lists`, listQuery(p));
    default: throw new Error(`Unknown klaviyo_profiles action: ${action}`);
  }
}

// ─── Segments ───

async function executeSegments(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return klaviyoRequest(userId, 'GET', '/segments', listQuery(p));
    case 'get': return klaviyoRequest(userId, 'GET', `/segments/${p.id}`);
    case 'create': return klaviyoRequest(userId, 'POST', '/segments', undefined, jsonapi('segment', p));
    case 'update': return klaviyoRequest(userId, 'PATCH', `/segments/${p.id}`, undefined, jsonapi('segment', p, p.id));
    case 'delete': return klaviyoRequest(userId, 'DELETE', `/segments/${p.id}`);
    case 'members_list': return klaviyoRequest(userId, 'GET', `/segments/${p.id}/profiles`, listQuery(p));
    case 'members_add': return klaviyoRequest(userId, 'POST', `/segments/${p.id}/relationships/profiles`, undefined, { data: (p.profile_ids || []).map((pid: string) => ({ type: 'profile', id: pid })) });
    default: throw new Error(`Unknown klaviyo_segments action: ${action}`);
  }
}

// ─── Lists ───

async function executeLists(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return klaviyoRequest(userId, 'GET', '/lists', listQuery(p));
    case 'get': return klaviyoRequest(userId, 'GET', `/lists/${p.id}`);
    case 'create': return klaviyoRequest(userId, 'POST', '/lists', undefined, jsonapi('list', p));
    case 'update': return klaviyoRequest(userId, 'PATCH', `/lists/${p.id}`, undefined, jsonapi('list', p, p.id));
    case 'delete': return klaviyoRequest(userId, 'DELETE', `/lists/${p.id}`);
    case 'members_list': return klaviyoRequest(userId, 'GET', `/lists/${p.id}/profiles`, listQuery(p));
    case 'members_add': return klaviyoRequest(userId, 'POST', `/lists/${p.id}/relationships/profiles`, undefined, { data: (p.profile_ids || []).map((pid: string) => ({ type: 'profile', id: pid })) });
    case 'members_remove': return klaviyoRequest(userId, 'DELETE', `/lists/${p.id}/relationships/profiles`, undefined, { data: (p.profile_ids || []).map((pid: string) => ({ type: 'profile', id: pid })) });
    default: throw new Error(`Unknown klaviyo_lists action: ${action}`);
  }
}

// ─── Templates ───

async function executeTemplates(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return klaviyoRequest(userId, 'GET', '/templates', listQuery(p));
    case 'get': return klaviyoRequest(userId, 'GET', `/templates/${p.id}`);
    case 'create': return klaviyoRequest(userId, 'POST', '/templates', undefined, jsonapi('template', p));
    case 'update': return klaviyoRequest(userId, 'PATCH', `/templates/${p.id}`, undefined, jsonapi('template', p, p.id));
    case 'delete': return klaviyoRequest(userId, 'DELETE', `/templates/${p.id}`);
    case 'clone': return klaviyoRequest(userId, 'POST', '/template-clone', undefined, jsonapi('template', p, p.id));
    case 'render': return klaviyoRequest(userId, 'POST', '/template-render', undefined, jsonapi('template', { id: p.id, context: p.context || {} }, p.id));
    default: throw new Error(`Unknown klaviyo_templates action: ${action}`);
  }
}

// ─── Metrics ───

async function executeMetrics(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return klaviyoRequest(userId, 'GET', '/metrics', listQuery(p));
    case 'get': return klaviyoRequest(userId, 'GET', `/metrics/${p.id}`);
    case 'aggregate_query': return klaviyoRequest(userId, 'POST', '/metric-aggregates', undefined, { data: { type: 'metric-aggregate', attributes: { metric_id: p.metric_id, measurements: p.measurements || ['count'], interval: p.interval, filter: p.filter, page_size: p.page_size, page_cursor: p.page_cursor, by: p.by, timezone: p.timezone, sort: p.sort } } });
    case 'timeline_query': return klaviyoRequest(userId, 'GET', '/events', { ...listQuery(p), filter: p.filter || `equals(metric_id,"${p.metric_id}")` });
    default: throw new Error(`Unknown klaviyo_metrics action: ${action}`);
  }
}

// ─── Events ───

async function executeEvents(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return klaviyoRequest(userId, 'GET', '/events', listQuery(p));
    case 'get': return klaviyoRequest(userId, 'GET', `/events/${p.id}`);
    case 'create': return klaviyoRequest(userId, 'POST', '/events', undefined, jsonapi('event', p));
    case 'bulk_create': return klaviyoRequest(userId, 'POST', '/event-bulk-create-jobs', undefined, { data: { type: 'event-bulk-create-job', attributes: { events: { data: p.events } } } });
    default: throw new Error(`Unknown klaviyo_events action: ${action}`);
  }
}

// ─── Catalogs ───

async function executeCatalogs(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'item_list': return klaviyoRequest(userId, 'GET', '/catalog-items', listQuery(p));
    case 'item_get': return klaviyoRequest(userId, 'GET', `/catalog-items/${p.id}`);
    case 'item_create': return klaviyoRequest(userId, 'POST', '/catalog-items', undefined, jsonapi('catalog-item', p));
    case 'item_update': return klaviyoRequest(userId, 'PATCH', `/catalog-items/${p.id}`, undefined, jsonapi('catalog-item', p, p.id));
    case 'item_delete': return klaviyoRequest(userId, 'DELETE', `/catalog-items/${p.id}`);
    case 'item_bulk': return klaviyoRequest(userId, 'POST', '/catalog-item-bulk-create-jobs', undefined, { data: { type: 'catalog-item-bulk-create-job', attributes: { items: { data: p.items } } } });
    case 'variant_list': return klaviyoRequest(userId, 'GET', '/catalog-variants', listQuery(p));
    case 'variant_get': return klaviyoRequest(userId, 'GET', `/catalog-variants/${p.id}`);
    case 'variant_create': return klaviyoRequest(userId, 'POST', '/catalog-variants', undefined, jsonapi('catalog-variant', p));
    case 'variant_update': return klaviyoRequest(userId, 'PATCH', `/catalog-variants/${p.id}`, undefined, jsonapi('catalog-variant', p, p.id));
    case 'variant_delete': return klaviyoRequest(userId, 'DELETE', `/catalog-variants/${p.id}`);
    case 'category_list': return klaviyoRequest(userId, 'GET', '/catalog-categories', listQuery(p));
    case 'category_get': return klaviyoRequest(userId, 'GET', `/catalog-categories/${p.id}`);
    case 'category_create': return klaviyoRequest(userId, 'POST', '/catalog-categories', undefined, jsonapi('catalog-category', p));
    case 'category_update': return klaviyoRequest(userId, 'PATCH', `/catalog-categories/${p.id}`, undefined, jsonapi('catalog-category', p, p.id));
    case 'category_delete': return klaviyoRequest(userId, 'DELETE', `/catalog-categories/${p.id}`);
    default: throw new Error(`Unknown klaviyo_catalogs action: ${action}`);
  }
}

// ─── Images ───

async function executeImages(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return klaviyoRequest(userId, 'GET', '/images', listQuery(p));
    case 'get': return klaviyoRequest(userId, 'GET', `/images/${p.id}`);
    case 'upload': return klaviyoRequest(userId, 'POST', '/images', undefined, jsonapi('image', p));
    case 'upload_from_url': return klaviyoRequest(userId, 'POST', '/images', undefined, jsonapi('image', { import_from_url: p.url, name: p.name, hidden: p.hidden }));
    default: throw new Error(`Unknown klaviyo_images action: ${action}`);
  }
}

// ─── Tags ───

async function executeTags(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return klaviyoRequest(userId, 'GET', '/tags', listQuery(p));
    case 'get': return klaviyoRequest(userId, 'GET', `/tags/${p.id}`);
    case 'create': return klaviyoRequest(userId, 'POST', '/tags', undefined, { data: { type: 'tag', attributes: { name: p.name }, relationships: { 'tag-group': { data: { type: 'tag-group', id: p.tag_group_id } } } } });
    case 'update': return klaviyoRequest(userId, 'PATCH', `/tags/${p.id}`, undefined, jsonapi('tag', p, p.id));
    case 'delete': return klaviyoRequest(userId, 'DELETE', `/tags/${p.id}`);
    case 'tag_group_list': return klaviyoRequest(userId, 'GET', '/tag-groups', listQuery(p));
    case 'tag_group_create': return klaviyoRequest(userId, 'POST', '/tag-groups', undefined, jsonapi('tag-group', p));
    default: throw new Error(`Unknown klaviyo_tags action: ${action}`);
  }
}

// ─── Coupons ───

async function executeCoupons(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return klaviyoRequest(userId, 'GET', '/coupons', listQuery(p));
    case 'get': return klaviyoRequest(userId, 'GET', `/coupons/${p.id}`);
    case 'create': return klaviyoRequest(userId, 'POST', '/coupons', undefined, jsonapi('coupon', p));
    case 'update': return klaviyoRequest(userId, 'PATCH', `/coupons/${p.id}`, undefined, jsonapi('coupon', p, p.id));
    case 'delete': return klaviyoRequest(userId, 'DELETE', `/coupons/${p.id}`);
    case 'code_list': return klaviyoRequest(userId, 'GET', '/coupon-codes', listQuery(p));
    case 'code_create': return klaviyoRequest(userId, 'POST', '/coupon-codes', undefined, jsonapi('coupon-code', p));
    case 'code_bulk_create': return klaviyoRequest(userId, 'POST', '/coupon-code-bulk-create-jobs', undefined, { data: { type: 'coupon-code-bulk-create-job', attributes: { codes: p.codes }, relationships: { coupon: { data: { type: 'coupon', id: p.coupon_id } } } } });
    default: throw new Error(`Unknown klaviyo_coupons action: ${action}`);
  }
}

// ─── Forms ───

async function executeForms(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return klaviyoRequest(userId, 'GET', '/forms', listQuery(p));
    case 'get': return klaviyoRequest(userId, 'GET', `/forms/${p.id}`);
    case 'version_list': return klaviyoRequest(userId, 'GET', `/forms/${p.id}/form-versions`, listQuery(p));
    case 'version_get': return klaviyoRequest(userId, 'GET', `/form-versions/${p.version_id}`);
    default: throw new Error(`Unknown klaviyo_forms action: ${action}`);
  }
}

// ─── Webhooks ───

async function executeWebhooks(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return klaviyoRequest(userId, 'GET', '/webhooks', listQuery(p));
    case 'get': return klaviyoRequest(userId, 'GET', `/webhooks/${p.id}`);
    case 'create': return klaviyoRequest(userId, 'POST', '/webhooks', undefined, jsonapi('webhook', p));
    case 'update': return klaviyoRequest(userId, 'PATCH', `/webhooks/${p.id}`, undefined, jsonapi('webhook', p, p.id));
    case 'delete': return klaviyoRequest(userId, 'DELETE', `/webhooks/${p.id}`);
    default: throw new Error(`Unknown klaviyo_webhooks action: ${action}`);
  }
}

// ─── Data Privacy ───

async function executeDataPrivacy(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'deletion_request_create': return klaviyoRequest(userId, 'POST', '/data-privacy-deletion-jobs', undefined, jsonapi('data-privacy-deletion-job', p));
    default: throw new Error(`Unknown klaviyo_data_privacy action: ${action}`);
  }
}

// ─── Main Router ───

async function execute(toolName: string, args: Record<string, any>, ctx: ExecuteContext) {
  const action = args.action as string;
  const params = (args.params || {}) as Record<string, any>;

  if (!action) throw new Error(`Missing "action" parameter for tool ${toolName}`);

  switch (toolName) {
    case 'klaviyo_campaigns': return executeCampaigns(action, params, ctx);
    case 'klaviyo_flows': return executeFlows(action, params, ctx);
    case 'klaviyo_profiles': return executeProfiles(action, params, ctx);
    case 'klaviyo_segments': return executeSegments(action, params, ctx);
    case 'klaviyo_lists': return executeLists(action, params, ctx);
    case 'klaviyo_templates': return executeTemplates(action, params, ctx);
    case 'klaviyo_metrics': return executeMetrics(action, params, ctx);
    case 'klaviyo_events': return executeEvents(action, params, ctx);
    case 'klaviyo_catalogs': return executeCatalogs(action, params, ctx);
    case 'klaviyo_images': return executeImages(action, params, ctx);
    case 'klaviyo_tags': return executeTags(action, params, ctx);
    case 'klaviyo_coupons': return executeCoupons(action, params, ctx);
    case 'klaviyo_forms': return executeForms(action, params, ctx);
    case 'klaviyo_webhooks': return executeWebhooks(action, params, ctx);
    case 'klaviyo_data_privacy': return executeDataPrivacy(action, params, ctx);
    default:
      throw new Error(`Unknown Klaviyo tool: ${toolName}`);
  }
}

// ─── Tool Definitions (ALL 15 categories) ───

const tools = [
  createToolGroup('klaviyo_campaigns', 'Full Klaviyo campaign lifecycle — CRUD, send, cancel, messages, template assignment, reporting', [
    'list', 'get', 'create', 'update', 'delete',
    'send', 'cancel',
    'message_get', 'message_update', 'message_assign_template',
    'report',
  ], 'Params: {id, message_id, template_id, name, channel (email|sms), audiences, send_strategy, statistics[], filter, timeframe}'),

  createToolGroup('klaviyo_flows', 'Full Klaviyo flow management — CRUD, actions, messages, reporting', [
    'list', 'get', 'update', 'delete',
    'action_list', 'action_get', 'action_update',
    'message_list', 'message_get', 'message_update',
    'report',
  ], 'Params: {id, action_id, message_id, name, status (draft|manual|live), trigger_type, statistics[], filter, timeframe}'),

  createToolGroup('klaviyo_profiles', 'Full Klaviyo profile management — CRUD, bulk ops, subscribe/unsubscribe, suppress, merge, memberships', [
    'list', 'get', 'create', 'update',
    'bulk_create', 'bulk_update',
    'subscribe', 'unsubscribe',
    'suppress', 'unsuppress',
    'merge_profiles',
    'segment_memberships', 'list_memberships',
  ], 'Params: {id, email, phone_number, external_id, first_name, last_name, properties, list_id, profiles[], custom_source}'),

  createToolGroup('klaviyo_segments', 'Klaviyo segment management — CRUD, member listing and adding', [
    'list', 'get', 'create', 'update', 'delete',
    'members_list', 'members_add',
  ], 'Params: {id, name, definition, profile_ids[], filter, sort, page_cursor, page_size}'),

  createToolGroup('klaviyo_lists', 'Klaviyo list management — CRUD, member listing, adding, and removing', [
    'list', 'get', 'create', 'update', 'delete',
    'members_list', 'members_add', 'members_remove',
  ], 'Params: {id, name, profile_ids[], filter, sort, page_cursor, page_size}'),

  createToolGroup('klaviyo_templates', 'Klaviyo email template management — CRUD, clone, render', [
    'list', 'get', 'create', 'update', 'delete',
    'clone', 'render',
  ], 'Params: {id, name, html, text, editor_type, context}'),

  createToolGroup('klaviyo_metrics', 'Klaviyo analytics — list/get metrics, aggregate queries, timeline queries', [
    'list', 'get', 'aggregate_query', 'timeline_query',
  ], 'Params: {id, metric_id, measurements[] (count|sum_value|unique), interval (day|week|month), by[], filter, timezone, sort}'),

  createToolGroup('klaviyo_events', 'Klaviyo event tracking — list, get, create, bulk create events', [
    'list', 'get', 'create', 'bulk_create',
  ], 'Params: {id, metric: {data: {type, attributes: {name}}}, profile: {data: {type, attributes: {email}}}, properties, time, value, events[]}'),

  createToolGroup('klaviyo_catalogs', 'Klaviyo product catalog — items, variants, categories with full CRUD and bulk ops', [
    'item_list', 'item_get', 'item_create', 'item_update', 'item_delete', 'item_bulk',
    'variant_list', 'variant_get', 'variant_create', 'variant_update', 'variant_delete',
    'category_list', 'category_get', 'category_create', 'category_update', 'category_delete',
  ], 'Params: {id, external_id, title, description, url, image_full_url, price, items[], filter, sort, page_cursor}'),

  createToolGroup('klaviyo_images', 'Klaviyo image management — list, get, upload, upload from URL', [
    'list', 'get', 'upload', 'upload_from_url',
  ], 'Params: {id, name, url, hidden, file (base64)}'),

  createToolGroup('klaviyo_tags', 'Klaviyo tag management — tags and tag groups', [
    'list', 'get', 'create', 'update', 'delete',
    'tag_group_list', 'tag_group_create',
  ], 'Params: {id, name, tag_group_id, exclusive}'),

  createToolGroup('klaviyo_coupons', 'Klaviyo coupon management — coupons and coupon codes', [
    'list', 'get', 'create', 'update', 'delete',
    'code_list', 'code_create', 'code_bulk_create',
  ], 'Params: {id, coupon_id, description, codes[], unique_code_prefix}'),

  createToolGroup('klaviyo_forms', 'Klaviyo form management — list forms, get form details and versions', [
    'list', 'get', 'version_list', 'version_get',
  ], 'Params: {id, version_id, filter, sort, page_cursor, page_size}'),

  createToolGroup('klaviyo_webhooks', 'Klaviyo webhook management — CRUD for webhooks', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {id, name, endpoint_url, description, enabled, secret_key}'),

  createToolGroup('klaviyo_data_privacy', 'Klaviyo data privacy — create deletion requests for GDPR/CCPA compliance', [
    'deletion_request_create',
  ], 'Params: {email, phone_number, profile_id}'),
];

// ─── Register Server ───

export function registerKlaviyoServer() {
  registerServer('klaviyo', {
    name: 'AIM Klaviyo',
    description: 'Full Klaviyo API access — ALL 15 API categories, 100+ operations. Campaigns, flows, profiles, segments, lists, templates, metrics, events, catalogs, images, tags, coupons, forms, webhooks, and data privacy.',
    tools,
    execute,
  });
}
