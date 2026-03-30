import {
  registerServer,
  createToolGroup,
  makeAuthenticatedRequest,
  type ExecuteContext,
} from '@/lib/server-registry';

// ─── Meta Graph API v19.0 Base URL ───
const API_BASE = 'https://graph.facebook.com/v19.0';

// ─── Helpers ───

function qs(params: Record<string, any>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)])).toString();
}

async function metaRequest(userId: string, method: string, path: string, query?: Record<string, any>, body?: any) {
  const url = `${API_BASE}${path}${query ? qs(query) : ''}`;
  const options: RequestInit = { method };
  if (body) options.body = JSON.stringify(body);
  return makeAuthenticatedRequest(userId, 'meta', url, options);
}

// ─── Business Manager ───

async function executeBusiness(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'business_list': return metaRequest(userId, 'GET', '/me/businesses', { limit: p.limit });
    case 'business_get': return metaRequest(userId, 'GET', `/${p.businessId}`, { fields: p.fields });
    case 'business_create': return metaRequest(userId, 'POST', `/${p.parentBusinessId}/owned_businesses`, undefined, { name: p.name, vertical: p.vertical, timezone_id: p.timezone_id, ...p });
    case 'business_users': return metaRequest(userId, 'GET', `/${p.businessId}/business_users`, { fields: p.fields, limit: p.limit });
    case 'business_pages': return metaRequest(userId, 'GET', `/${p.businessId}/owned_pages`, { fields: p.fields, limit: p.limit });
    case 'business_ad_accounts': return metaRequest(userId, 'GET', `/${p.businessId}/owned_ad_accounts`, { fields: p.fields, limit: p.limit });
    case 'business_pixels': return metaRequest(userId, 'GET', `/${p.businessId}/owned_pixels`, { fields: p.fields, limit: p.limit });
    case 'business_product_catalogs': return metaRequest(userId, 'GET', `/${p.businessId}/owned_product_catalogs`, { fields: p.fields, limit: p.limit });
    case 'business_creative_folders': return metaRequest(userId, 'GET', `/${p.businessId}/creative_folders`, { fields: p.fields, limit: p.limit });
    case 'business_system_users': return metaRequest(userId, 'GET', `/${p.businessId}/system_users`, { fields: p.fields, limit: p.limit });
    default: throw new Error(`Unknown meta_business action: ${action}`);
  }
}

// ─── Ad Accounts ───

async function executeAdAccounts(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const act = p.adAccountId ? (p.adAccountId.startsWith('act_') ? p.adAccountId : `act_${p.adAccountId}`) : undefined;
  switch (action) {
    case 'list': return metaRequest(userId, 'GET', `/${p.businessId}/owned_ad_accounts`, { fields: p.fields, limit: p.limit, after: p.after });
    case 'get': return metaRequest(userId, 'GET', `/${act}`, { fields: p.fields });
    case 'create': return metaRequest(userId, 'POST', `/${p.businessId}/adaccount`, undefined, { name: p.name, currency: p.currency, timezone_id: p.timezone_id, end_advertiser: p.end_advertiser, media_agency: p.media_agency, partner: p.partner, ...p });
    case 'campaigns_list': return metaRequest(userId, 'GET', `/${act}/campaigns`, { fields: p.fields, limit: p.limit, after: p.after, effective_status: p.effective_status });
    case 'adsets_list': return metaRequest(userId, 'GET', `/${act}/adsets`, { fields: p.fields, limit: p.limit, after: p.after, effective_status: p.effective_status });
    case 'ads_list': return metaRequest(userId, 'GET', `/${act}/ads`, { fields: p.fields, limit: p.limit, after: p.after, effective_status: p.effective_status });
    case 'insights': return metaRequest(userId, 'GET', `/${act}/insights`, { fields: p.fields, time_range: p.time_range, date_preset: p.date_preset, breakdowns: p.breakdowns, level: p.level, limit: p.limit, filtering: p.filtering, time_increment: p.time_increment });
    case 'activities': return metaRequest(userId, 'GET', `/${act}/activities`, { fields: p.fields, limit: p.limit, after: p.after });
    case 'users': return metaRequest(userId, 'GET', `/${act}/users`, { fields: p.fields, limit: p.limit });
    case 'assigned_pages': return metaRequest(userId, 'GET', `/${act}/assigned_pages`, { fields: p.fields, limit: p.limit });
    case 'assigned_product_catalogs': return metaRequest(userId, 'GET', `/${act}/assigned_product_catalogs`, { fields: p.fields, limit: p.limit });
    case 'reach_estimate': return metaRequest(userId, 'GET', `/${act}/reachestimate`, { targeting_spec: p.targeting_spec, optimize_for: p.optimize_for });
    case 'delivery_estimate': return metaRequest(userId, 'GET', `/${act}/delivery_estimate`, { targeting_spec: p.targeting_spec, optimization_goal: p.optimization_goal });
    case 'targeting_browse': return metaRequest(userId, 'GET', `/${act}/targetingbrowse`, { limit_type: p.limit_type });
    case 'ad_rules': return metaRequest(userId, 'GET', `/${act}/adrules_library`, { fields: p.fields, limit: p.limit });
    default: throw new Error(`Unknown meta_ad_accounts action: ${action}`);
  }
}

// ─── Campaigns ───

async function executeCampaigns(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const act = p.adAccountId ? (p.adAccountId.startsWith('act_') ? p.adAccountId : `act_${p.adAccountId}`) : undefined;
  switch (action) {
    case 'list': return metaRequest(userId, 'GET', `/${act}/campaigns`, { fields: p.fields, limit: p.limit, after: p.after, effective_status: p.effective_status });
    case 'get': return metaRequest(userId, 'GET', `/${p.campaignId}`, { fields: p.fields });
    case 'create': return metaRequest(userId, 'POST', `/${act}/campaigns`, undefined, { name: p.name, objective: p.objective, status: p.status, special_ad_categories: p.special_ad_categories, buying_type: p.buying_type, daily_budget: p.daily_budget, lifetime_budget: p.lifetime_budget, bid_strategy: p.bid_strategy, ...p.extra });
    case 'update': return metaRequest(userId, 'POST', `/${p.campaignId}`, undefined, { name: p.name, status: p.status, daily_budget: p.daily_budget, lifetime_budget: p.lifetime_budget, bid_strategy: p.bid_strategy, ...p.extra });
    case 'delete': return metaRequest(userId, 'DELETE', `/${p.campaignId}`);
    case 'set_status': return metaRequest(userId, 'POST', `/${p.campaignId}`, undefined, { status: p.status });
    case 'set_budget': return metaRequest(userId, 'POST', `/${p.campaignId}`, undefined, { daily_budget: p.daily_budget, lifetime_budget: p.lifetime_budget });
    case 'set_bid_strategy': return metaRequest(userId, 'POST', `/${p.campaignId}`, undefined, { bid_strategy: p.bid_strategy });
    case 'set_objective': return metaRequest(userId, 'POST', `/${p.campaignId}`, undefined, { objective: p.objective });
    case 'insights': return metaRequest(userId, 'GET', `/${p.campaignId}/insights`, { fields: p.fields, time_range: p.time_range, date_preset: p.date_preset, breakdowns: p.breakdowns, level: p.level, limit: p.limit, time_increment: p.time_increment });
    case 'copies': return metaRequest(userId, 'GET', `/${p.campaignId}/copies`, { fields: p.fields, limit: p.limit });
    case 'ad_studies': return metaRequest(userId, 'GET', `/${p.campaignId}/ad_studies`, { fields: p.fields, limit: p.limit });
    default: throw new Error(`Unknown meta_campaigns action: ${action}`);
  }
}

// ─── Ad Sets ───

async function executeAdsets(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const act = p.adAccountId ? (p.adAccountId.startsWith('act_') ? p.adAccountId : `act_${p.adAccountId}`) : undefined;
  switch (action) {
    case 'list': return metaRequest(userId, 'GET', `/${act}/adsets`, { fields: p.fields, limit: p.limit, after: p.after, effective_status: p.effective_status });
    case 'get': return metaRequest(userId, 'GET', `/${p.adsetId}`, { fields: p.fields });
    case 'create': return metaRequest(userId, 'POST', `/${act}/adsets`, undefined, { name: p.name, campaign_id: p.campaignId, daily_budget: p.daily_budget, lifetime_budget: p.lifetime_budget, targeting: p.targeting, optimization_goal: p.optimization_goal, billing_event: p.billing_event, bid_amount: p.bid_amount, bid_strategy: p.bid_strategy, status: p.status, start_time: p.start_time, end_time: p.end_time, promoted_object: p.promoted_object, ...p.extra });
    case 'update': return metaRequest(userId, 'POST', `/${p.adsetId}`, undefined, { name: p.name, daily_budget: p.daily_budget, lifetime_budget: p.lifetime_budget, targeting: p.targeting, optimization_goal: p.optimization_goal, billing_event: p.billing_event, bid_amount: p.bid_amount, bid_strategy: p.bid_strategy, status: p.status, start_time: p.start_time, end_time: p.end_time, ...p.extra });
    case 'delete': return metaRequest(userId, 'DELETE', `/${p.adsetId}`);
    case 'set_status': return metaRequest(userId, 'POST', `/${p.adsetId}`, undefined, { status: p.status });
    case 'set_budget': return metaRequest(userId, 'POST', `/${p.adsetId}`, undefined, { daily_budget: p.daily_budget, lifetime_budget: p.lifetime_budget });
    case 'set_schedule': return metaRequest(userId, 'POST', `/${p.adsetId}`, undefined, { start_time: p.start_time, end_time: p.end_time });
    case 'set_targeting': return metaRequest(userId, 'POST', `/${p.adsetId}`, undefined, { targeting: p.targeting });
    case 'set_optimization_goal': return metaRequest(userId, 'POST', `/${p.adsetId}`, undefined, { optimization_goal: p.optimization_goal });
    case 'set_billing_event': return metaRequest(userId, 'POST', `/${p.adsetId}`, undefined, { billing_event: p.billing_event });
    case 'set_bid_amount': return metaRequest(userId, 'POST', `/${p.adsetId}`, undefined, { bid_amount: p.bid_amount });
    case 'set_bid_strategy': return metaRequest(userId, 'POST', `/${p.adsetId}`, undefined, { bid_strategy: p.bid_strategy });
    case 'set_placements': return metaRequest(userId, 'POST', `/${p.adsetId}`, undefined, { targeting: { publisher_platforms: p.publisher_platforms, facebook_positions: p.facebook_positions, instagram_positions: p.instagram_positions, audience_network_positions: p.audience_network_positions, messenger_positions: p.messenger_positions } });
    case 'insights': return metaRequest(userId, 'GET', `/${p.adsetId}/insights`, { fields: p.fields, time_range: p.time_range, date_preset: p.date_preset, breakdowns: p.breakdowns, level: p.level, limit: p.limit, time_increment: p.time_increment });
    case 'delivery_estimate': return metaRequest(userId, 'GET', `/${p.adsetId}/delivery_estimate`, { optimization_goal: p.optimization_goal });
    case 'copies': return metaRequest(userId, 'GET', `/${p.adsetId}/copies`, { fields: p.fields, limit: p.limit });
    default: throw new Error(`Unknown meta_adsets action: ${action}`);
  }
}

// ─── Ads ───

async function executeAds(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const act = p.adAccountId ? (p.adAccountId.startsWith('act_') ? p.adAccountId : `act_${p.adAccountId}`) : undefined;
  switch (action) {
    case 'list': return metaRequest(userId, 'GET', `/${act}/ads`, { fields: p.fields, limit: p.limit, after: p.after, effective_status: p.effective_status });
    case 'get': return metaRequest(userId, 'GET', `/${p.adId}`, { fields: p.fields });
    case 'create': return metaRequest(userId, 'POST', `/${act}/ads`, undefined, { name: p.name, adset_id: p.adsetId, creative: p.creative, status: p.status, tracking_specs: p.tracking_specs, ...p.extra });
    case 'update': return metaRequest(userId, 'POST', `/${p.adId}`, undefined, { name: p.name, status: p.status, creative: p.creative, tracking_specs: p.tracking_specs, ...p.extra });
    case 'delete': return metaRequest(userId, 'DELETE', `/${p.adId}`);
    case 'set_status': return metaRequest(userId, 'POST', `/${p.adId}`, undefined, { status: p.status });
    case 'set_creative': return metaRequest(userId, 'POST', `/${p.adId}`, undefined, { creative: p.creative });
    case 'set_tracking_specs': return metaRequest(userId, 'POST', `/${p.adId}`, undefined, { tracking_specs: p.tracking_specs });
    case 'insights': return metaRequest(userId, 'GET', `/${p.adId}/insights`, { fields: p.fields, time_range: p.time_range, date_preset: p.date_preset, breakdowns: p.breakdowns, limit: p.limit, time_increment: p.time_increment });
    case 'copies': return metaRequest(userId, 'GET', `/${p.adId}/copies`, { fields: p.fields, limit: p.limit });
    case 'previews': return metaRequest(userId, 'GET', `/${p.adId}/previews`, { ad_format: p.ad_format });
    case 'leads': return metaRequest(userId, 'GET', `/${p.adId}/leads`, { fields: p.fields, limit: p.limit, after: p.after });
    default: throw new Error(`Unknown meta_ads action: ${action}`);
  }
}

// ─── Creatives ───

async function executeCreatives(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const act = p.adAccountId ? (p.adAccountId.startsWith('act_') ? p.adAccountId : `act_${p.adAccountId}`) : undefined;
  switch (action) {
    case 'list': return metaRequest(userId, 'GET', `/${act}/adcreatives`, { fields: p.fields, limit: p.limit, after: p.after });
    case 'get': return metaRequest(userId, 'GET', `/${p.creativeId}`, { fields: p.fields });
    case 'create': return metaRequest(userId, 'POST', `/${act}/adcreatives`, undefined, { name: p.name, object_story_spec: p.object_story_spec, asset_feed_spec: p.asset_feed_spec, degrees_of_freedom_spec: p.degrees_of_freedom_spec, url_tags: p.url_tags, ...p.extra });
    case 'update': return metaRequest(userId, 'POST', `/${p.creativeId}`, undefined, { name: p.name, url_tags: p.url_tags, ...p.extra });
    case 'delete': return metaRequest(userId, 'DELETE', `/${p.creativeId}`);
    default: throw new Error(`Unknown meta_creatives action: ${action}`);
  }
}

// ─── Audiences ───

async function executeAudiences(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const act = p.adAccountId ? (p.adAccountId.startsWith('act_') ? p.adAccountId : `act_${p.adAccountId}`) : undefined;
  switch (action) {
    case 'custom_audience_list': return metaRequest(userId, 'GET', `/${act}/customaudiences`, { fields: p.fields, limit: p.limit, after: p.after });
    case 'custom_audience_get': return metaRequest(userId, 'GET', `/${p.audienceId}`, { fields: p.fields });
    case 'custom_audience_create': return metaRequest(userId, 'POST', `/${act}/customaudiences`, undefined, { name: p.name, subtype: p.subtype, description: p.description, customer_file_source: p.customer_file_source, rule: p.rule, lookalike_spec: p.lookalike_spec, ...p.extra });
    case 'custom_audience_delete': return metaRequest(userId, 'DELETE', `/${p.audienceId}`);
    case 'custom_audience_add_users': return metaRequest(userId, 'POST', `/${p.audienceId}/users`, undefined, { payload: p.payload, schema: p.schema });
    case 'custom_audience_remove_users': return metaRequest(userId, 'DELETE', `/${p.audienceId}/users`, undefined, { payload: p.payload, schema: p.schema });
    case 'custom_audience_share': return metaRequest(userId, 'POST', `/${p.audienceId}/adaccounts`, undefined, { adaccounts: p.adaccounts });
    case 'custom_audience_unshare': return metaRequest(userId, 'DELETE', `/${p.audienceId}/adaccounts`, undefined, { adaccounts: p.adaccounts });
    case 'lookalike_create': return metaRequest(userId, 'POST', `/${act}/customaudiences`, undefined, { name: p.name, subtype: 'LOOKALIKE', origin_audience_id: p.origin_audience_id, lookalike_spec: { type: p.type, ratio: p.ratio, country: p.country, ...p.lookalike_spec } });
    case 'lookalike_update': return metaRequest(userId, 'POST', `/${p.audienceId}`, undefined, { name: p.name, description: p.description, ...p.extra });
    case 'saved_audience_create': return metaRequest(userId, 'POST', `/${act}/saved_audiences`, undefined, { name: p.name, targeting: p.targeting, ...p.extra });
    case 'saved_audience_update': return metaRequest(userId, 'POST', `/${p.audienceId}`, undefined, { name: p.name, targeting: p.targeting, ...p.extra });
    case 'saved_audience_delete': return metaRequest(userId, 'DELETE', `/${p.audienceId}`);
    case 'reach_estimate': return metaRequest(userId, 'GET', `/${act}/reachestimate`, { targeting_spec: p.targeting_spec });
    default: throw new Error(`Unknown meta_audiences action: ${action}`);
  }
}

// ─── Pixels ───

async function executePixels(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const act = p.adAccountId ? (p.adAccountId.startsWith('act_') ? p.adAccountId : `act_${p.adAccountId}`) : undefined;
  switch (action) {
    case 'pixel_list': return metaRequest(userId, 'GET', `/${act}/adspixels`, { fields: p.fields, limit: p.limit });
    case 'pixel_get': return metaRequest(userId, 'GET', `/${p.pixelId}`, { fields: p.fields });
    case 'pixel_create': return metaRequest(userId, 'POST', `/${act}/adspixels`, undefined, { name: p.name, ...p.extra });
    case 'pixel_stats': return metaRequest(userId, 'GET', `/${p.pixelId}/stats`, { aggregation: p.aggregation, start_time: p.start_time, end_time: p.end_time, event: p.event });
    case 'server_event_send': return metaRequest(userId, 'POST', `/${p.pixelId}/events`, undefined, { data: p.data, test_event_code: p.test_event_code });
    case 'custom_conversion_list': return metaRequest(userId, 'GET', `/${act}/customconversions`, { fields: p.fields, limit: p.limit });
    case 'custom_conversion_create': return metaRequest(userId, 'POST', `/${act}/customconversions`, undefined, { name: p.name, event_source_id: p.event_source_id, custom_event_type: p.custom_event_type, rule: p.rule, default_conversion_value: p.default_conversion_value, ...p.extra });
    case 'custom_conversion_update': return metaRequest(userId, 'POST', `/${p.customConversionId}`, undefined, { name: p.name, default_conversion_value: p.default_conversion_value, ...p.extra });
    case 'custom_conversion_delete': return metaRequest(userId, 'DELETE', `/${p.customConversionId}`);
    default: throw new Error(`Unknown meta_pixels action: ${action}`);
  }
}

// ─── Catalogs ───

async function executeCatalogs(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'catalog_list': return metaRequest(userId, 'GET', `/${p.businessId}/owned_product_catalogs`, { fields: p.fields, limit: p.limit });
    case 'catalog_get': return metaRequest(userId, 'GET', `/${p.catalogId}`, { fields: p.fields });
    case 'catalog_create': return metaRequest(userId, 'POST', `/${p.businessId}/owned_product_catalogs`, undefined, { name: p.name, vertical: p.vertical, ...p.extra });
    case 'catalog_update': return metaRequest(userId, 'POST', `/${p.catalogId}`, undefined, { name: p.name, ...p.extra });
    case 'catalog_delete': return metaRequest(userId, 'DELETE', `/${p.catalogId}`);
    case 'product_list': return metaRequest(userId, 'GET', `/${p.catalogId}/products`, { fields: p.fields, limit: p.limit, after: p.after, filter: p.filter });
    case 'product_get': return metaRequest(userId, 'GET', `/${p.productId}`, { fields: p.fields });
    case 'product_create': return metaRequest(userId, 'POST', `/${p.catalogId}/products`, undefined, { retailer_id: p.retailer_id, name: p.name, description: p.description, availability: p.availability, condition: p.condition, price: p.price, url: p.url, image_url: p.image_url, brand: p.brand, category: p.category, ...p.extra });
    case 'product_update': return metaRequest(userId, 'POST', `/${p.productId}`, undefined, { name: p.name, description: p.description, availability: p.availability, price: p.price, url: p.url, image_url: p.image_url, ...p.extra });
    case 'product_delete': return metaRequest(userId, 'DELETE', `/${p.productId}`);
    case 'product_set_list': return metaRequest(userId, 'GET', `/${p.catalogId}/product_sets`, { fields: p.fields, limit: p.limit });
    case 'product_set_create': return metaRequest(userId, 'POST', `/${p.catalogId}/product_sets`, undefined, { name: p.name, filter: p.filter, ...p.extra });
    case 'product_set_update': return metaRequest(userId, 'POST', `/${p.productSetId}`, undefined, { name: p.name, filter: p.filter, ...p.extra });
    case 'product_set_delete': return metaRequest(userId, 'DELETE', `/${p.productSetId}`);
    case 'product_feed_list': return metaRequest(userId, 'GET', `/${p.catalogId}/product_feeds`, { fields: p.fields, limit: p.limit });
    case 'product_feed_create': return metaRequest(userId, 'POST', `/${p.catalogId}/product_feeds`, undefined, { name: p.name, schedule: p.schedule, ...p.extra });
    case 'product_feed_update': return metaRequest(userId, 'POST', `/${p.feedId}`, undefined, { name: p.name, schedule: p.schedule, ...p.extra });
    case 'product_feed_delete': return metaRequest(userId, 'DELETE', `/${p.feedId}`);
    case 'product_feed_upload': return metaRequest(userId, 'POST', `/${p.feedId}/uploads`, undefined, { url: p.url, ...p.extra });
    case 'product_group_list': return metaRequest(userId, 'GET', `/${p.catalogId}/product_groups`, { fields: p.fields, limit: p.limit });
    default: throw new Error(`Unknown meta_catalogs action: ${action}`);
  }
}

// ─── Pages ───

async function executePages(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return metaRequest(userId, 'GET', '/me/accounts', { fields: p.fields, limit: p.limit });
    case 'get': return metaRequest(userId, 'GET', `/${p.pageId}`, { fields: p.fields });
    case 'post_list': return metaRequest(userId, 'GET', `/${p.pageId}/feed`, { fields: p.fields, limit: p.limit, after: p.after });
    case 'post_get': return metaRequest(userId, 'GET', `/${p.postId}`, { fields: p.fields });
    case 'post_create': return metaRequest(userId, 'POST', `/${p.pageId}/feed`, undefined, { message: p.message, link: p.link, published: p.published, scheduled_publish_time: p.scheduled_publish_time, targeting: p.targeting, ...p.extra });
    case 'post_update': return metaRequest(userId, 'POST', `/${p.postId}`, undefined, { message: p.message, ...p.extra });
    case 'post_delete': return metaRequest(userId, 'DELETE', `/${p.postId}`);
    case 'post_insights': return metaRequest(userId, 'GET', `/${p.postId}/insights`, { metric: p.metric, period: p.period });
    case 'photo_upload': return metaRequest(userId, 'POST', `/${p.pageId}/photos`, undefined, { url: p.url, caption: p.caption, published: p.published, ...p.extra });
    case 'video_upload': return metaRequest(userId, 'POST', `/${p.pageId}/videos`, undefined, { file_url: p.file_url, title: p.title, description: p.description, ...p.extra });
    case 'comment_list': return metaRequest(userId, 'GET', `/${p.objectId}/comments`, { fields: p.fields, limit: p.limit, after: p.after, filter: p.filter });
    case 'comment_create': return metaRequest(userId, 'POST', `/${p.objectId}/comments`, undefined, { message: p.message, attachment_url: p.attachment_url });
    case 'comment_update': return metaRequest(userId, 'POST', `/${p.commentId}`, undefined, { message: p.message });
    case 'comment_delete': return metaRequest(userId, 'DELETE', `/${p.commentId}`);
    case 'comment_hide': return metaRequest(userId, 'POST', `/${p.commentId}`, undefined, { is_hidden: p.is_hidden ?? true });
    case 'message_list': return metaRequest(userId, 'GET', `/${p.pageId}/conversations`, { fields: p.fields, limit: p.limit, after: p.after });
    case 'message_send': return metaRequest(userId, 'POST', `/${p.pageId}/messages`, undefined, { recipient: p.recipient, message: p.messageBody, messaging_type: p.messaging_type || 'RESPONSE', ...p.extra });
    case 'conversation_list': return metaRequest(userId, 'GET', `/${p.pageId}/conversations`, { fields: p.fields, limit: p.limit, after: p.after });
    case 'insights': return metaRequest(userId, 'GET', `/${p.pageId}/insights`, { metric: p.metric, period: p.period, since: p.since, until: p.until, date_preset: p.date_preset });
    case 'fan_count': return metaRequest(userId, 'GET', `/${p.pageId}`, { fields: 'fan_count' });
    case 'page_views': return metaRequest(userId, 'GET', `/${p.pageId}/insights`, { metric: 'page_views_total', period: p.period || 'day', since: p.since, until: p.until });
    case 'lead_gen_form_list': return metaRequest(userId, 'GET', `/${p.pageId}/leadgen_forms`, { fields: p.fields, limit: p.limit });
    case 'lead_gen_form_create': return metaRequest(userId, 'POST', `/${p.pageId}/leadgen_forms`, undefined, { name: p.name, questions: p.questions, privacy_policy: p.privacy_policy, follow_up_action_url: p.follow_up_action_url, ...p.extra });
    case 'cta_update': return metaRequest(userId, 'POST', `/${p.pageId}`, undefined, { cta: p.cta });
    case 'tab_list': return metaRequest(userId, 'GET', `/${p.pageId}/tabs`, { fields: p.fields });
    case 'tab_create': return metaRequest(userId, 'POST', `/${p.pageId}/tabs`, undefined, { tab: p.tab, app_id: p.app_id, ...p.extra });
    case 'tab_update': return metaRequest(userId, 'POST', `/${p.pageId}/tabs/${p.tabId}`, undefined, { position: p.position, is_non_connection_landing_tab: p.is_non_connection_landing_tab, custom_name: p.custom_name, ...p.extra });
    default: throw new Error(`Unknown meta_pages action: ${action}`);
  }
}

// ─── Instagram ───

async function executeInstagram(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'account_get': return metaRequest(userId, 'GET', `/${p.igUserId}`, { fields: p.fields || 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website' });
    case 'account_insights': return metaRequest(userId, 'GET', `/${p.igUserId}/insights`, { metric: p.metric, period: p.period, since: p.since, until: p.until });
    case 'media_list': return metaRequest(userId, 'GET', `/${p.igUserId}/media`, { fields: p.fields, limit: p.limit, after: p.after });
    case 'media_get': return metaRequest(userId, 'GET', `/${p.mediaId}`, { fields: p.fields });
    case 'media_publish': return metaRequest(userId, 'POST', `/${p.igUserId}/media_publish`, undefined, { creation_id: p.creation_id });
    case 'media_insights': return metaRequest(userId, 'GET', `/${p.mediaId}/insights`, { metric: p.metric });
    case 'comment_list': return metaRequest(userId, 'GET', `/${p.mediaId}/comments`, { fields: p.fields, limit: p.limit, after: p.after });
    case 'comment_create': return metaRequest(userId, 'POST', `/${p.mediaId}/comments`, undefined, { message: p.message });
    case 'comment_delete': return metaRequest(userId, 'DELETE', `/${p.commentId}`);
    case 'comment_hide': return metaRequest(userId, 'POST', `/${p.commentId}`, undefined, { hide: p.hide ?? true });
    case 'comment_reply': return metaRequest(userId, 'POST', `/${p.commentId}/replies`, undefined, { message: p.message });
    case 'hashtag_search': return metaRequest(userId, 'GET', '/ig_hashtag_search', { user_id: p.igUserId, q: p.q });
    case 'hashtag_top_media': return metaRequest(userId, 'GET', `/${p.hashtagId}/top_media`, { user_id: p.igUserId, fields: p.fields });
    case 'hashtag_recent_media': return metaRequest(userId, 'GET', `/${p.hashtagId}/recent_media`, { user_id: p.igUserId, fields: p.fields });
    case 'story_list': return metaRequest(userId, 'GET', `/${p.igUserId}/stories`, { fields: p.fields, limit: p.limit });
    case 'story_insights': return metaRequest(userId, 'GET', `/${p.mediaId}/insights`, { metric: p.metric || 'exits,impressions,reach,replies,taps_forward,taps_back' });
    case 'shopping_product_tag': return metaRequest(userId, 'POST', `/${p.mediaId}`, undefined, { product_tags: p.product_tags });
    case 'mention_list': return metaRequest(userId, 'GET', `/${p.igUserId}/tags`, { fields: p.fields, limit: p.limit });
    case 'follower_demographics': return metaRequest(userId, 'GET', `/${p.igUserId}/insights`, { metric: 'follower_demographics', period: 'lifetime', metric_type: 'total_value', breakdown: p.breakdown || 'city' });
    case 'content_publishing_limit': return metaRequest(userId, 'GET', `/${p.igUserId}/content_publishing_limit`, { fields: 'config,quota_usage' });
    default: throw new Error(`Unknown meta_instagram action: ${action}`);
  }
}

// ─── Reporting ───

async function executeReporting(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'insights_get': return metaRequest(userId, 'GET', `/${p.objectId}/insights`, { fields: p.fields, time_range: p.time_range, date_preset: p.date_preset, breakdowns: p.breakdowns, level: p.level, limit: p.limit, filtering: p.filtering, time_increment: p.time_increment, action_breakdowns: p.action_breakdowns, action_attribution_windows: p.action_attribution_windows });
    case 'async_report_create': {
      const act = p.adAccountId ? (p.adAccountId.startsWith('act_') ? p.adAccountId : `act_${p.adAccountId}`) : undefined;
      return metaRequest(userId, 'POST', `/${act}/insights`, undefined, { fields: p.fields, time_range: p.time_range, date_preset: p.date_preset, breakdowns: p.breakdowns, level: p.level, filtering: p.filtering, time_increment: p.time_increment, action_breakdowns: p.action_breakdowns, ...p.extra });
    }
    case 'async_report_status': return metaRequest(userId, 'GET', `/${p.reportRunId}`, { fields: 'async_status,async_percent_completion' });
    case 'async_report_download': return metaRequest(userId, 'GET', `/${p.reportRunId}/insights`, { fields: p.fields, limit: p.limit, after: p.after });
    default: throw new Error(`Unknown meta_reporting action: ${action}`);
  }
}

// ─── Ad Library ───

async function executeAdLibrary(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'search': return metaRequest(userId, 'GET', '/ads_archive', { search_terms: p.search_terms, ad_type: p.ad_type || 'ALL', ad_reached_countries: p.ad_reached_countries, ad_active_status: p.ad_active_status, publisher_platforms: p.publisher_platforms, search_page_ids: p.search_page_ids, fields: p.fields || 'id,ad_creation_time,ad_delivery_start_time,ad_delivery_stop_time,ad_snapshot_url,page_id,page_name,spend,impressions,currency', limit: p.limit });
    case 'ad_details': return metaRequest(userId, 'GET', `/${p.adArchiveId}`, { fields: p.fields || 'id,ad_creation_time,ad_delivery_start_time,ad_delivery_stop_time,ad_snapshot_url,page_id,page_name,spend,impressions,currency,demographic_distribution,delivery_by_region' });
    default: throw new Error(`Unknown meta_ad_library action: ${action}`);
  }
}

// ─── Main Router ───

async function execute(toolName: string, args: Record<string, any>, ctx: ExecuteContext) {
  const action = args.action as string;
  const params = (args.params || {}) as Record<string, any>;

  if (!action) throw new Error(`Missing "action" parameter for tool ${toolName}`);

  switch (toolName) {
    case 'meta_business': return executeBusiness(action, params, ctx);
    case 'meta_ad_accounts': return executeAdAccounts(action, params, ctx);
    case 'meta_campaigns': return executeCampaigns(action, params, ctx);
    case 'meta_adsets': return executeAdsets(action, params, ctx);
    case 'meta_ads': return executeAds(action, params, ctx);
    case 'meta_creatives': return executeCreatives(action, params, ctx);
    case 'meta_audiences': return executeAudiences(action, params, ctx);
    case 'meta_pixels': return executePixels(action, params, ctx);
    case 'meta_catalogs': return executeCatalogs(action, params, ctx);
    case 'meta_pages': return executePages(action, params, ctx);
    case 'meta_instagram': return executeInstagram(action, params, ctx);
    case 'meta_reporting': return executeReporting(action, params, ctx);
    case 'meta_ad_library': return executeAdLibrary(action, params, ctx);
    default:
      throw new Error(`Unknown Meta tool: ${toolName}`);
  }
}

// ─── Tool Definitions (ALL 13 categories) ───

const tools = [
  createToolGroup('meta_business', 'Meta Business Manager — list, get, create businesses, view users, pages, ad accounts, pixels, catalogs, creative folders, system users', [
    'business_list', 'business_get', 'business_create', 'business_users', 'business_pages',
    'business_ad_accounts', 'business_pixels', 'business_product_catalogs',
    'business_creative_folders', 'business_system_users',
  ], 'Params: {businessId, parentBusinessId, name, vertical, timezone_id, fields, limit}'),

  createToolGroup('meta_ad_accounts', 'Meta ad account management — list, get, create ad accounts, list campaigns/adsets/ads, insights, activities, users, assigned pages/catalogs, reach/delivery estimates, targeting browse, ad rules', [
    'list', 'get', 'create', 'campaigns_list', 'adsets_list', 'ads_list',
    'insights', 'activities', 'users', 'assigned_pages', 'assigned_product_catalogs',
    'reach_estimate', 'delivery_estimate', 'targeting_browse', 'ad_rules',
  ], 'Params: {businessId, adAccountId (act_ prefix auto-added), fields, limit, after, effective_status, time_range, date_preset, breakdowns, level, targeting_spec}'),

  createToolGroup('meta_campaigns', 'Full Meta campaign CRUD — create, update, delete, set status/budget/bid/objective, insights, copies, ad studies', [
    'list', 'get', 'create', 'update', 'delete',
    'set_status', 'set_budget', 'set_bid_strategy', 'set_objective',
    'insights', 'copies', 'ad_studies',
  ], 'Params: {adAccountId, campaignId, name, objective, status (ACTIVE|PAUSED|DELETED|ARCHIVED), daily_budget, lifetime_budget, bid_strategy, special_ad_categories[], fields, time_range}'),

  createToolGroup('meta_adsets', 'Full Meta ad set management — CRUD, status, budget, schedule, targeting, optimization, billing, bid, placements, insights, delivery estimates', [
    'list', 'get', 'create', 'update', 'delete',
    'set_status', 'set_budget', 'set_schedule', 'set_targeting',
    'set_optimization_goal', 'set_billing_event', 'set_bid_amount', 'set_bid_strategy', 'set_placements',
    'insights', 'delivery_estimate', 'copies',
  ], 'Params: {adAccountId, adsetId, campaignId, name, status, daily_budget, lifetime_budget, targeting, optimization_goal, billing_event, bid_amount, bid_strategy, start_time, end_time, promoted_object, fields, time_range}'),

  createToolGroup('meta_ads', 'Full Meta ad management — CRUD, status, creative, tracking, insights, copies, previews, leads', [
    'list', 'get', 'create', 'update', 'delete',
    'set_status', 'set_creative', 'set_tracking_specs',
    'insights', 'copies', 'previews', 'leads',
  ], 'Params: {adAccountId, adId, adsetId, name, status, creative: {creative_id}, tracking_specs, ad_format, fields, time_range}'),

  createToolGroup('meta_creatives', 'Meta ad creative management — list, get, create, update, delete creatives', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {adAccountId, creativeId, name, object_story_spec, asset_feed_spec, degrees_of_freedom_spec, url_tags, fields}'),

  createToolGroup('meta_audiences', 'Meta audience management — custom audiences CRUD, add/remove users, share/unshare, lookalike create/update, saved audiences, reach estimates', [
    'custom_audience_list', 'custom_audience_get', 'custom_audience_create',
    'custom_audience_delete', 'custom_audience_add_users', 'custom_audience_remove_users',
    'custom_audience_share', 'custom_audience_unshare',
    'lookalike_create', 'lookalike_update',
    'saved_audience_create', 'saved_audience_update', 'saved_audience_delete',
    'reach_estimate',
  ], 'Params: {adAccountId, audienceId, name, subtype, description, payload, schema, adaccounts[], origin_audience_id, ratio, country, targeting, targeting_spec, fields}'),

  createToolGroup('meta_pixels', 'Meta conversion tracking — pixels CRUD, stats, Conversions API server events, custom conversions CRUD', [
    'pixel_list', 'pixel_get', 'pixel_create', 'pixel_stats',
    'server_event_send',
    'custom_conversion_list', 'custom_conversion_create', 'custom_conversion_update', 'custom_conversion_delete',
  ], 'Params: {adAccountId, pixelId, customConversionId, name, data (event array for CAPI), test_event_code, event_source_id, custom_event_type, rule, fields, start_time, end_time}'),

  createToolGroup('meta_catalogs', 'Meta product catalog management — catalogs CRUD, products CRUD, product sets CRUD, product feeds CRUD with upload, product groups', [
    'catalog_list', 'catalog_get', 'catalog_create', 'catalog_update', 'catalog_delete',
    'product_list', 'product_get', 'product_create', 'product_update', 'product_delete',
    'product_set_list', 'product_set_create', 'product_set_update', 'product_set_delete',
    'product_feed_list', 'product_feed_create', 'product_feed_update', 'product_feed_delete', 'product_feed_upload',
    'product_group_list',
  ], 'Params: {businessId, catalogId, productId, productSetId, feedId, retailer_id, name, description, availability, condition, price, url, image_url, brand, category, schedule, filter, fields}'),

  createToolGroup('meta_pages', 'Meta Page management — pages list/get, posts CRUD with insights, photos/videos upload, comments CRUD/hide, messages, conversations, page insights, fan count, page views, lead gen forms, CTA, tabs', [
    'list', 'get', 'post_list', 'post_get', 'post_create', 'post_update', 'post_delete', 'post_insights',
    'photo_upload', 'video_upload',
    'comment_list', 'comment_create', 'comment_update', 'comment_delete', 'comment_hide',
    'message_list', 'message_send', 'conversation_list',
    'insights', 'fan_count', 'page_views',
    'lead_gen_form_list', 'lead_gen_form_create',
    'cta_update', 'tab_list', 'tab_create', 'tab_update',
  ], 'Params: {pageId, postId, objectId, commentId, tabId, message, link, published, scheduled_publish_time, url, caption, file_url, recipient, messaging_type, metric, period, since, until, questions, privacy_policy, cta, app_id, fields}'),

  createToolGroup('meta_instagram', 'Meta Instagram management — account info/insights, media list/get/publish/insights, comments CRUD/hide/reply, hashtag search/top/recent, stories, shopping tags, mentions, follower demographics, publishing limits', [
    'account_get', 'account_insights',
    'media_list', 'media_get', 'media_publish', 'media_insights',
    'comment_list', 'comment_create', 'comment_delete', 'comment_hide', 'comment_reply',
    'hashtag_search', 'hashtag_top_media', 'hashtag_recent_media',
    'story_list', 'story_insights',
    'shopping_product_tag', 'mention_list', 'follower_demographics', 'content_publishing_limit',
  ], 'Params: {igUserId, mediaId, commentId, hashtagId, q, message, metric, period, since, until, breakdown, creation_id, product_tags, hide, fields}'),

  createToolGroup('meta_reporting', 'Meta reporting and analytics — get insights for any object, create/check/download async reports', [
    'insights_get', 'async_report_create', 'async_report_status', 'async_report_download',
  ], 'Params: {objectId, adAccountId, reportRunId, fields, time_range, date_preset, breakdowns, level, filtering, time_increment, action_breakdowns, action_attribution_windows}'),

  createToolGroup('meta_ad_library', 'Meta Ad Library — search ads across advertisers for competitive research, get ad details', [
    'search', 'ad_details',
  ], 'Params: {search_terms, ad_type (ALL|POLITICAL_AND_ISSUE_ADS), ad_reached_countries[], ad_active_status, publisher_platforms[], search_page_ids[], adArchiveId, fields, limit}'),
];

// ─── Register Server ───

export function registerMetaServer() {
  registerServer('meta', {
    name: 'AIM Meta Business',
    description: 'Full Meta Business API access — ALL 13 API categories, 180+ operations. Business Manager, Ad Accounts, Campaigns, Ad Sets, Ads, Creatives, Audiences, Pixels/CAPI, Product Catalogs, Pages, Instagram, Reporting, and Ad Library.',
    tools,
    execute,
  });
}
