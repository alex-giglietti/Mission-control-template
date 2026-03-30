import {
  registerServer,
  createToolGroup,
  makeAuthenticatedRequest,
  type ExecuteContext,
} from '@/lib/server-registry';

// ─── GHL API v2 Base URL ───
const GHL_API = 'https://services.leadconnectorhq.com';

// ─── Helpers ───

function qs(params: Record<string, any>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

async function ghlRequest(userId: string, method: string, path: string, query?: Record<string, any>, body?: any) {
  const url = `${GHL_API}${path}${query ? qs(query) : ''}`;
  const options: RequestInit = { method };
  if (body) options.body = JSON.stringify(body);
  return makeAuthenticatedRequest(userId, 'ghl', url, options);
}

// ─── Contacts ───

async function executeContacts(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return ghlRequest(userId, 'GET', '/contacts/', { locationId: p.locationId, limit: p.limit || 20, startAfterId: p.startAfterId, startAfter: p.startAfter, query: p.query });
    case 'get': return ghlRequest(userId, 'GET', `/contacts/${p.contactId}`);
    case 'create': return ghlRequest(userId, 'POST', '/contacts/', undefined, p);
    case 'update': return ghlRequest(userId, 'PUT', `/contacts/${p.contactId}`, undefined, p);
    case 'delete': return ghlRequest(userId, 'DELETE', `/contacts/${p.contactId}`);
    case 'search': return ghlRequest(userId, 'POST', '/contacts/search', undefined, { locationId: p.locationId, ...p });
    case 'search_by_business': return ghlRequest(userId, 'GET', '/contacts/business', { businessId: p.businessId, locationId: p.locationId });
    case 'task_list': return ghlRequest(userId, 'GET', `/contacts/${p.contactId}/tasks`);
    case 'task_get': return ghlRequest(userId, 'GET', `/contacts/${p.contactId}/tasks/${p.taskId}`);
    case 'task_create': return ghlRequest(userId, 'POST', `/contacts/${p.contactId}/tasks`, undefined, p);
    case 'task_update': return ghlRequest(userId, 'PUT', `/contacts/${p.contactId}/tasks/${p.taskId}`, undefined, p);
    case 'task_complete': return ghlRequest(userId, 'PUT', `/contacts/${p.contactId}/tasks/${p.taskId}/completed`, undefined, { completed: true });
    case 'task_delete': return ghlRequest(userId, 'DELETE', `/contacts/${p.contactId}/tasks/${p.taskId}`);
    case 'tag_add': return ghlRequest(userId, 'POST', `/contacts/${p.contactId}/tags`, undefined, { tags: p.tags });
    case 'tag_remove': return ghlRequest(userId, 'DELETE', `/contacts/${p.contactId}/tags`, undefined, { tags: p.tags });
    case 'note_list': return ghlRequest(userId, 'GET', `/contacts/${p.contactId}/notes`);
    case 'note_get': return ghlRequest(userId, 'GET', `/contacts/${p.contactId}/notes/${p.noteId}`);
    case 'note_create': return ghlRequest(userId, 'POST', `/contacts/${p.contactId}/notes`, undefined, { body: p.body, userId: p.userId });
    case 'note_update': return ghlRequest(userId, 'PUT', `/contacts/${p.contactId}/notes/${p.noteId}`, undefined, { body: p.body, userId: p.userId });
    case 'note_delete': return ghlRequest(userId, 'DELETE', `/contacts/${p.contactId}/notes/${p.noteId}`);
    case 'campaign_add': return ghlRequest(userId, 'POST', `/contacts/${p.contactId}/campaigns/${p.campaignId}`);
    case 'campaign_remove': return ghlRequest(userId, 'DELETE', `/contacts/${p.contactId}/campaigns/${p.campaignId}`);
    case 'campaign_remove_all': return ghlRequest(userId, 'DELETE', `/contacts/${p.contactId}/campaigns`);
    case 'workflow_add': return ghlRequest(userId, 'POST', `/contacts/${p.contactId}/workflow/${p.workflowId}`, undefined, { eventStartTime: p.eventStartTime });
    case 'workflow_remove': return ghlRequest(userId, 'DELETE', `/contacts/${p.contactId}/workflow/${p.workflowId}`);
    case 'appointment_list': return ghlRequest(userId, 'GET', `/contacts/${p.contactId}/appointments`);
    default: throw new Error(`Unknown ghl_contacts action: ${action}`);
  }
}

// ─── Conversations ───

async function executeConversations(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return ghlRequest(userId, 'GET', '/conversations/', { locationId: p.locationId, limit: p.limit, startAfterId: p.startAfterId });
    case 'get': return ghlRequest(userId, 'GET', `/conversations/${p.conversationId}`);
    case 'create': return ghlRequest(userId, 'POST', '/conversations/', undefined, p);
    case 'update': return ghlRequest(userId, 'PUT', `/conversations/${p.conversationId}`, undefined, p);
    case 'delete': return ghlRequest(userId, 'DELETE', `/conversations/${p.conversationId}`);
    case 'search': return ghlRequest(userId, 'POST', '/conversations/search', undefined, p);
    case 'message_send': return ghlRequest(userId, 'POST', '/conversations/messages', undefined, p);
    case 'message_inbound': return ghlRequest(userId, 'POST', '/conversations/messages/inbound', undefined, p);
    case 'message_get': return ghlRequest(userId, 'GET', `/conversations/messages/${p.messageId}`);
    case 'message_upload_attachment': return ghlRequest(userId, 'POST', '/conversations/messages/upload', undefined, p);
    case 'message_status_update': return ghlRequest(userId, 'PUT', `/conversations/messages/${p.messageId}/status`, undefined, { status: p.status });
    case 'message_schedule_cancel': return ghlRequest(userId, 'DELETE', `/conversations/messages/${p.messageId}/schedule`);
    case 'email_schedule_cancel': return ghlRequest(userId, 'DELETE', `/conversations/messages/email/${p.emailMessageId}/schedule`);
    case 'recording_get': return ghlRequest(userId, 'GET', `/conversations/messages/${p.messageId}/recording`, { locationId: p.locationId });
    case 'transcription_get': return ghlRequest(userId, 'GET', `/conversations/messages/${p.messageId}/transcription`, { locationId: p.locationId });
    case 'transcription_download': return ghlRequest(userId, 'GET', `/conversations/messages/${p.messageId}/transcription/download`, { locationId: p.locationId });
    default: throw new Error(`Unknown ghl_conversations action: ${action}`);
  }
}

// ─── Calendars ───

async function executeCalendars(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'calendar_list': return ghlRequest(userId, 'GET', '/calendars/', { locationId: p.locationId });
    case 'calendar_get': return ghlRequest(userId, 'GET', `/calendars/${p.calendarId}`);
    case 'calendar_create': return ghlRequest(userId, 'POST', '/calendars/', undefined, p);
    case 'calendar_update': return ghlRequest(userId, 'PUT', `/calendars/${p.calendarId}`, undefined, p);
    case 'calendar_delete': return ghlRequest(userId, 'DELETE', `/calendars/${p.calendarId}`);
    case 'group_list': return ghlRequest(userId, 'GET', '/calendars/groups', { locationId: p.locationId });
    case 'group_get': return ghlRequest(userId, 'GET', `/calendars/groups/${p.groupId}`);
    case 'group_create': return ghlRequest(userId, 'POST', '/calendars/groups', undefined, p);
    case 'group_update': return ghlRequest(userId, 'PUT', `/calendars/groups/${p.groupId}`, undefined, p);
    case 'group_delete': return ghlRequest(userId, 'DELETE', `/calendars/groups/${p.groupId}`);
    case 'group_validate_slug': return ghlRequest(userId, 'POST', '/calendars/groups/validate-slug', undefined, { locationId: p.locationId, slug: p.slug });
    case 'group_status_update': return ghlRequest(userId, 'PUT', `/calendars/groups/${p.groupId}/status`, undefined, { isActive: p.isActive });
    case 'resource_list': return ghlRequest(userId, 'GET', '/calendars/resources', { locationId: p.locationId });
    case 'resource_get': return ghlRequest(userId, 'GET', `/calendars/resources/${p.resourceId}`);
    case 'resource_create': return ghlRequest(userId, 'POST', '/calendars/resources', undefined, p);
    case 'resource_update': return ghlRequest(userId, 'PUT', `/calendars/resources/${p.resourceId}`, undefined, p);
    case 'resource_delete': return ghlRequest(userId, 'DELETE', `/calendars/resources/${p.resourceId}`);
    case 'event_get': return ghlRequest(userId, 'GET', '/calendars/events', { locationId: p.locationId, startTime: p.startTime, endTime: p.endTime, calendarId: p.calendarId });
    case 'event_list': return ghlRequest(userId, 'GET', '/calendars/events', { locationId: p.locationId, startTime: p.startTime, endTime: p.endTime, calendarId: p.calendarId });
    case 'event_create': return ghlRequest(userId, 'POST', '/calendars/events', undefined, p);
    case 'event_update': return ghlRequest(userId, 'PUT', `/calendars/events/${p.eventId}`, undefined, p);
    case 'event_delete': return ghlRequest(userId, 'DELETE', `/calendars/events/${p.eventId}`);
    case 'appointment_create': return ghlRequest(userId, 'POST', '/calendars/events/appointments', undefined, p);
    case 'appointment_update': return ghlRequest(userId, 'PUT', `/calendars/events/appointments/${p.eventId}`, undefined, p);
    case 'blocked_slot_list': return ghlRequest(userId, 'GET', '/calendars/blocked-slots', { locationId: p.locationId, calendarId: p.calendarId, startTime: p.startTime, endTime: p.endTime });
    case 'blocked_slot_create': return ghlRequest(userId, 'POST', '/calendars/blocked-slots', undefined, p);
    case 'blocked_slot_update': return ghlRequest(userId, 'PUT', `/calendars/blocked-slots/${p.eventId}`, undefined, p);
    case 'free_slots_get': return ghlRequest(userId, 'GET', `/calendars/${p.calendarId}/free-slots`, { startDate: p.startDate, endDate: p.endDate, timezone: p.timezone });
    default: throw new Error(`Unknown ghl_calendars action: ${action}`);
  }
}

// ─── Opportunities ───

async function executeOpportunities(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return ghlRequest(userId, 'GET', '/opportunities/search', { location_id: p.locationId, pipeline_id: p.pipelineId, limit: p.limit, page: p.page, status: p.status, q: p.q });
    case 'get': return ghlRequest(userId, 'GET', `/opportunities/${p.id}`);
    case 'search': return ghlRequest(userId, 'POST', '/opportunities/search', undefined, p);
    case 'create': return ghlRequest(userId, 'POST', '/opportunities/', undefined, p);
    case 'update': return ghlRequest(userId, 'PUT', `/opportunities/${p.id}`, undefined, p);
    case 'delete': return ghlRequest(userId, 'DELETE', `/opportunities/${p.id}`);
    case 'status_update': return ghlRequest(userId, 'PUT', `/opportunities/${p.id}/status`, undefined, { status: p.status });
    case 'pipeline_list': return ghlRequest(userId, 'GET', '/opportunities/pipelines', { locationId: p.locationId });
    case 'pipeline_get': return ghlRequest(userId, 'GET', `/opportunities/pipelines/${p.pipelineId}`);
    default: throw new Error(`Unknown ghl_opportunities action: ${action}`);
  }
}

// ─── Campaigns ───

async function executeCampaigns(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return ghlRequest(userId, 'GET', '/campaigns/', { locationId: p.locationId, status: p.status });
    default: throw new Error(`Unknown ghl_campaigns action: ${action}`);
  }
}

// ─── Workflows ───

async function executeWorkflows(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return ghlRequest(userId, 'GET', '/workflows/', { locationId: p.locationId });
    default: throw new Error(`Unknown ghl_workflows action: ${action}`);
  }
}

// ─── Forms ───

async function executeForms(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return ghlRequest(userId, 'GET', '/forms/', { locationId: p.locationId, limit: p.limit, skip: p.skip, type: p.type });
    case 'get_submissions': return ghlRequest(userId, 'GET', '/forms/submissions', { locationId: p.locationId, formId: p.formId, limit: p.limit, page: p.page, startAt: p.startAt, endAt: p.endAt, q: p.q });
    case 'upload_custom_files': return ghlRequest(userId, 'POST', '/forms/upload-custom-files', undefined, p);
    default: throw new Error(`Unknown ghl_forms action: ${action}`);
  }
}

// ─── Surveys ───

async function executeSurveys(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return ghlRequest(userId, 'GET', '/surveys/', { locationId: p.locationId, limit: p.limit, skip: p.skip });
    case 'get_submissions': return ghlRequest(userId, 'GET', '/surveys/submissions', { locationId: p.locationId, surveyId: p.surveyId, limit: p.limit, page: p.page, startAt: p.startAt, endAt: p.endAt, q: p.q });
    default: throw new Error(`Unknown ghl_surveys action: ${action}`);
  }
}

// ─── Funnels ───

async function executeFunnels(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'funnel_list': return ghlRequest(userId, 'GET', '/funnels/funnel/list', { locationId: p.locationId, limit: p.limit, offset: p.offset });
    case 'page_get': return ghlRequest(userId, 'GET', `/funnels/page/${p.funnelPageId}`, { locationId: p.locationId });
    case 'page_count': return ghlRequest(userId, 'GET', '/funnels/page/count', { locationId: p.locationId, funnelId: p.funnelId });
    case 'redirect_list': return ghlRequest(userId, 'GET', '/funnels/lookup/redirect/list', { locationId: p.locationId, limit: p.limit, offset: p.offset });
    case 'redirect_create': return ghlRequest(userId, 'POST', '/funnels/lookup/redirect', undefined, p);
    case 'redirect_update': return ghlRequest(userId, 'PATCH', `/funnels/lookup/redirect/${p.id}`, undefined, p);
    case 'redirect_delete': return ghlRequest(userId, 'DELETE', `/funnels/lookup/redirect/${p.id}`, { locationId: p.locationId });
    default: throw new Error(`Unknown ghl_funnels action: ${action}`);
  }
}

// ─── Invoices ───

async function executeInvoices(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return ghlRequest(userId, 'GET', '/invoices/', { altId: p.locationId, altType: 'location', limit: p.limit, offset: p.offset, status: p.status, startAt: p.startAt, endAt: p.endAt });
    case 'get': return ghlRequest(userId, 'GET', `/invoices/${p.invoiceId}`, { altId: p.locationId, altType: 'location' });
    case 'create': return ghlRequest(userId, 'POST', '/invoices/', undefined, p);
    case 'update': return ghlRequest(userId, 'PUT', `/invoices/${p.invoiceId}`, undefined, p);
    case 'delete': return ghlRequest(userId, 'DELETE', `/invoices/${p.invoiceId}`, { altId: p.locationId, altType: 'location' });
    case 'send': return ghlRequest(userId, 'POST', `/invoices/${p.invoiceId}/send`, undefined, p);
    case 'void': return ghlRequest(userId, 'POST', `/invoices/${p.invoiceId}/void`, undefined, p);
    case 'record_payment': return ghlRequest(userId, 'POST', `/invoices/${p.invoiceId}/record-payment`, undefined, p);
    case 'text2pay': return ghlRequest(userId, 'POST', `/invoices/${p.invoiceId}/text2pay`, undefined, p);
    case 'generate_invoice_number': return ghlRequest(userId, 'GET', '/invoices/generate-invoice-number', { altId: p.locationId, altType: 'location' });
    case 'schedule_list': return ghlRequest(userId, 'GET', '/invoices/schedule/', { altId: p.locationId, altType: 'location', limit: p.limit, offset: p.offset });
    case 'schedule_get': return ghlRequest(userId, 'GET', `/invoices/schedule/${p.scheduleId}`, { altId: p.locationId, altType: 'location' });
    case 'schedule_create': return ghlRequest(userId, 'POST', '/invoices/schedule/', undefined, p);
    case 'schedule_update': return ghlRequest(userId, 'PUT', `/invoices/schedule/${p.scheduleId}`, undefined, p);
    case 'schedule_delete': return ghlRequest(userId, 'DELETE', `/invoices/schedule/${p.scheduleId}`, { altId: p.locationId, altType: 'location' });
    case 'schedule_activate': return ghlRequest(userId, 'POST', `/invoices/schedule/${p.scheduleId}/activate`);
    case 'schedule_auto_payment': return ghlRequest(userId, 'POST', `/invoices/schedule/${p.scheduleId}/auto-payment`, undefined, p);
    case 'schedule_cancel': return ghlRequest(userId, 'POST', `/invoices/schedule/${p.scheduleId}/cancel`);
    case 'template_list': return ghlRequest(userId, 'GET', '/invoices/template/', { altId: p.locationId, altType: 'location', limit: p.limit, offset: p.offset });
    case 'template_get': return ghlRequest(userId, 'GET', `/invoices/template/${p.templateId}`, { altId: p.locationId, altType: 'location' });
    case 'template_create': return ghlRequest(userId, 'POST', '/invoices/template/', undefined, p);
    case 'template_update': return ghlRequest(userId, 'PUT', `/invoices/template/${p.templateId}`, undefined, p);
    case 'template_delete': return ghlRequest(userId, 'DELETE', `/invoices/template/${p.templateId}`, { altId: p.locationId, altType: 'location' });
    case 'estimate_list': return ghlRequest(userId, 'GET', '/invoices/estimate/', { altId: p.locationId, altType: 'location', limit: p.limit, offset: p.offset });
    case 'estimate_get': return ghlRequest(userId, 'GET', `/invoices/estimate/${p.estimateId}`, { altId: p.locationId, altType: 'location' });
    case 'estimate_create': return ghlRequest(userId, 'POST', '/invoices/estimate/', undefined, p);
    case 'estimate_update': return ghlRequest(userId, 'PUT', `/invoices/estimate/${p.estimateId}`, undefined, p);
    case 'estimate_delete': return ghlRequest(userId, 'DELETE', `/invoices/estimate/${p.estimateId}`, { altId: p.locationId, altType: 'location' });
    case 'estimate_send': return ghlRequest(userId, 'POST', `/invoices/estimate/${p.estimateId}/send`, undefined, p);
    case 'estimate_to_invoice': return ghlRequest(userId, 'POST', `/invoices/estimate/${p.estimateId}/convert-to-invoice`);
    default: throw new Error(`Unknown ghl_invoices action: ${action}`);
  }
}

// ─── Payments ───

async function executePayments(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'integration_get': return ghlRequest(userId, 'GET', '/payments/integrations/provider/whitelabel', { altId: p.locationId, altType: 'location' });
    case 'integration_create': return ghlRequest(userId, 'POST', '/payments/integrations/provider/whitelabel', undefined, p);
    case 'order_list': return ghlRequest(userId, 'GET', '/payments/orders', { altId: p.locationId, altType: 'location', limit: p.limit, offset: p.offset });
    case 'order_get': return ghlRequest(userId, 'GET', `/payments/orders/${p.orderId}`, { altId: p.locationId, altType: 'location' });
    case 'order_fulfillment_list': return ghlRequest(userId, 'GET', `/payments/orders/${p.orderId}/fulfillments`, { altId: p.locationId, altType: 'location' });
    case 'order_fulfillment_create': return ghlRequest(userId, 'POST', `/payments/orders/${p.orderId}/fulfillments`, undefined, p);
    case 'transaction_list': return ghlRequest(userId, 'GET', '/payments/transactions', { altId: p.locationId, altType: 'location', limit: p.limit, offset: p.offset, startAt: p.startAt, endAt: p.endAt });
    case 'transaction_get': return ghlRequest(userId, 'GET', `/payments/transactions/${p.transactionId}`, { altId: p.locationId, altType: 'location' });
    case 'subscription_list': return ghlRequest(userId, 'GET', '/payments/subscriptions', { altId: p.locationId, altType: 'location', limit: p.limit, offset: p.offset });
    case 'subscription_get': return ghlRequest(userId, 'GET', `/payments/subscriptions/${p.subscriptionId}`, { altId: p.locationId, altType: 'location' });
    case 'coupon_list': return ghlRequest(userId, 'GET', '/payments/coupons', { altId: p.locationId, altType: 'location' });
    case 'coupon_get': return ghlRequest(userId, 'GET', `/payments/coupons/${p.couponId}`, { altId: p.locationId, altType: 'location' });
    case 'coupon_create': return ghlRequest(userId, 'POST', '/payments/coupons', undefined, p);
    case 'coupon_update': return ghlRequest(userId, 'PUT', `/payments/coupons/${p.couponId}`, undefined, p);
    case 'coupon_delete': return ghlRequest(userId, 'DELETE', `/payments/coupons/${p.couponId}`, { altId: p.locationId, altType: 'location' });
    case 'custom_provider_get': return ghlRequest(userId, 'GET', '/payments/custom-provider/provider', { locationId: p.locationId });
    case 'custom_provider_create': return ghlRequest(userId, 'POST', '/payments/custom-provider/provider', undefined, p);
    case 'custom_provider_connect': return ghlRequest(userId, 'POST', '/payments/custom-provider/connect', undefined, p);
    case 'custom_provider_disconnect': return ghlRequest(userId, 'POST', '/payments/custom-provider/disconnect', undefined, p);
    case 'custom_provider_capabilities': return ghlRequest(userId, 'GET', '/payments/custom-provider/capabilities', { locationId: p.locationId });
    case 'custom_provider_delete': return ghlRequest(userId, 'DELETE', '/payments/custom-provider/provider', { locationId: p.locationId });
    default: throw new Error(`Unknown ghl_payments action: ${action}`);
  }
}

// ─── Products ───

async function executeProducts(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return ghlRequest(userId, 'GET', '/products/', { locationId: p.locationId, limit: p.limit, offset: p.offset });
    case 'get': return ghlRequest(userId, 'GET', `/products/${p.productId}`, { locationId: p.locationId });
    case 'create': return ghlRequest(userId, 'POST', '/products/', undefined, p);
    case 'update': return ghlRequest(userId, 'PUT', `/products/${p.productId}`, undefined, p);
    case 'delete': return ghlRequest(userId, 'DELETE', `/products/${p.productId}`, { locationId: p.locationId });
    case 'bulk_update': return ghlRequest(userId, 'PATCH', '/products/', undefined, p);
    case 'store_stats': return ghlRequest(userId, 'GET', '/products/store/stats', { locationId: p.locationId });
    case 'store_update': return ghlRequest(userId, 'PUT', '/products/store', undefined, p);
    case 'price_list': return ghlRequest(userId, 'GET', `/products/${p.productId}/price`, { locationId: p.locationId, limit: p.limit, offset: p.offset });
    case 'price_get': return ghlRequest(userId, 'GET', `/products/${p.productId}/price/${p.priceId}`, { locationId: p.locationId });
    case 'price_create': return ghlRequest(userId, 'POST', `/products/${p.productId}/price`, undefined, p);
    case 'price_update': return ghlRequest(userId, 'PUT', `/products/${p.productId}/price/${p.priceId}`, undefined, p);
    case 'price_delete': return ghlRequest(userId, 'DELETE', `/products/${p.productId}/price/${p.priceId}`, { locationId: p.locationId });
    case 'collection_list': return ghlRequest(userId, 'GET', '/products/collections', { locationId: p.locationId, limit: p.limit, offset: p.offset });
    case 'collection_get': return ghlRequest(userId, 'GET', `/products/collections/${p.collectionId}`, { locationId: p.locationId });
    case 'collection_create': return ghlRequest(userId, 'POST', '/products/collections', undefined, p);
    case 'collection_update': return ghlRequest(userId, 'PUT', `/products/collections/${p.collectionId}`, undefined, p);
    case 'collection_delete': return ghlRequest(userId, 'DELETE', `/products/collections/${p.collectionId}`, { locationId: p.locationId });
    case 'review_list': return ghlRequest(userId, 'GET', `/products/${p.productId}/reviews`, { locationId: p.locationId, limit: p.limit, offset: p.offset });
    case 'review_count': return ghlRequest(userId, 'GET', `/products/${p.productId}/reviews/count`, { locationId: p.locationId });
    case 'review_update': return ghlRequest(userId, 'PUT', `/products/${p.productId}/reviews/${p.reviewId}`, undefined, p);
    case 'review_delete': return ghlRequest(userId, 'DELETE', `/products/${p.productId}/reviews/${p.reviewId}`, { locationId: p.locationId });
    case 'review_bulk_update': return ghlRequest(userId, 'PATCH', `/products/${p.productId}/reviews`, undefined, p);
    default: throw new Error(`Unknown ghl_products action: ${action}`);
  }
}

// ─── Locations ───

async function executeLocations(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return ghlRequest(userId, 'GET', '/locations/', { companyId: p.companyId, limit: p.limit, skip: p.skip });
    case 'get': return ghlRequest(userId, 'GET', `/locations/${p.locationId}`);
    case 'search': return ghlRequest(userId, 'POST', '/locations/search', undefined, p);
    case 'create': return ghlRequest(userId, 'POST', '/locations/', undefined, p);
    case 'update': return ghlRequest(userId, 'PUT', `/locations/${p.locationId}`, undefined, p);
    case 'delete': return ghlRequest(userId, 'DELETE', `/locations/${p.locationId}`);
    case 'timezones_get': return ghlRequest(userId, 'GET', '/locations/timezones');
    case 'custom_value_list': return ghlRequest(userId, 'GET', `/locations/${p.locationId}/customValues`);
    case 'custom_value_get': return ghlRequest(userId, 'GET', `/locations/${p.locationId}/customValues/${p.id}`);
    case 'custom_value_create': return ghlRequest(userId, 'POST', `/locations/${p.locationId}/customValues`, undefined, p);
    case 'custom_value_update': return ghlRequest(userId, 'PUT', `/locations/${p.locationId}/customValues/${p.id}`, undefined, p);
    case 'custom_value_delete': return ghlRequest(userId, 'DELETE', `/locations/${p.locationId}/customValues/${p.id}`);
    case 'custom_field_list': return ghlRequest(userId, 'GET', `/locations/${p.locationId}/customFields`, { model: p.model });
    case 'custom_field_get': return ghlRequest(userId, 'GET', `/locations/${p.locationId}/customFields/${p.id}`);
    case 'custom_field_create': return ghlRequest(userId, 'POST', `/locations/${p.locationId}/customFields`, undefined, p);
    case 'custom_field_update': return ghlRequest(userId, 'PUT', `/locations/${p.locationId}/customFields/${p.id}`, undefined, p);
    case 'custom_field_delete': return ghlRequest(userId, 'DELETE', `/locations/${p.locationId}/customFields/${p.id}`);
    case 'tag_list': return ghlRequest(userId, 'GET', `/locations/${p.locationId}/tags`);
    case 'tag_get': return ghlRequest(userId, 'GET', `/locations/${p.locationId}/tags/${p.tagId}`);
    case 'tag_create': return ghlRequest(userId, 'POST', `/locations/${p.locationId}/tags`, undefined, { name: p.name });
    case 'tag_update': return ghlRequest(userId, 'PUT', `/locations/${p.locationId}/tags/${p.tagId}`, undefined, { name: p.name });
    case 'tag_delete': return ghlRequest(userId, 'DELETE', `/locations/${p.locationId}/tags/${p.tagId}`);
    case 'template_list': return ghlRequest(userId, 'GET', `/locations/${p.locationId}/templates`, { type: p.type, originId: p.originId });
    case 'task_search': return ghlRequest(userId, 'GET', `/locations/${p.locationId}/tasks/search`, { contactId: p.contactId, limit: p.limit, skip: p.skip, status: p.status });
    default: throw new Error(`Unknown ghl_locations action: ${action}`);
  }
}

// ─── Businesses ───

async function executeBusinesses(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return ghlRequest(userId, 'GET', '/businesses/', { locationId: p.locationId });
    case 'get': return ghlRequest(userId, 'GET', `/businesses/${p.businessId}`);
    case 'create': return ghlRequest(userId, 'POST', '/businesses/', undefined, p);
    case 'update': return ghlRequest(userId, 'PUT', `/businesses/${p.businessId}`, undefined, p);
    case 'delete': return ghlRequest(userId, 'DELETE', `/businesses/${p.businessId}`);
    default: throw new Error(`Unknown ghl_businesses action: ${action}`);
  }
}

// ─── Users ───

async function executeUsers(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return ghlRequest(userId, 'GET', '/users/', { companyId: p.companyId, locationId: p.locationId });
    case 'get': return ghlRequest(userId, 'GET', `/users/${p.userId}`);
    case 'create': return ghlRequest(userId, 'POST', '/users/', undefined, p);
    case 'update': return ghlRequest(userId, 'PUT', `/users/${p.userId}`, undefined, p);
    case 'delete': return ghlRequest(userId, 'DELETE', `/users/${p.userId}`);
    default: throw new Error(`Unknown ghl_users action: ${action}`);
  }
}

// ─── Social Planner ───

async function executeSocialPlanner(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'account_list': return ghlRequest(userId, 'GET', '/social-media-posting', { locationId: p.locationId });
    case 'account_delete': return ghlRequest(userId, 'DELETE', `/social-media-posting/${p.accountId}`, { locationId: p.locationId });
    case 'post_list': return ghlRequest(userId, 'GET', '/social-media-posting/post', { locationId: p.locationId, limit: p.limit, offset: p.offset, type: p.type, fromDate: p.fromDate, toDate: p.toDate });
    case 'post_get': return ghlRequest(userId, 'GET', `/social-media-posting/post/${p.postId}`, { locationId: p.locationId });
    case 'post_create': return ghlRequest(userId, 'POST', '/social-media-posting/post', undefined, p);
    case 'post_update': return ghlRequest(userId, 'PUT', `/social-media-posting/post/${p.postId}`, undefined, p);
    case 'post_delete': return ghlRequest(userId, 'DELETE', `/social-media-posting/post/${p.postId}`, { locationId: p.locationId });
    case 'post_patch': return ghlRequest(userId, 'PATCH', `/social-media-posting/post/${p.postId}`, undefined, p);
    case 'csv_list': return ghlRequest(userId, 'GET', '/social-media-posting/csv', { locationId: p.locationId, limit: p.limit, offset: p.offset });
    case 'csv_get': return ghlRequest(userId, 'GET', `/social-media-posting/csv/${p.csvId}`, { locationId: p.locationId });
    case 'csv_create': return ghlRequest(userId, 'POST', '/social-media-posting/csv', undefined, p);
    case 'csv_update': return ghlRequest(userId, 'PUT', `/social-media-posting/csv/${p.csvId}`, undefined, p);
    case 'csv_delete': return ghlRequest(userId, 'DELETE', `/social-media-posting/csv/${p.csvId}`, { locationId: p.locationId });
    case 'csv_delete_post': return ghlRequest(userId, 'DELETE', `/social-media-posting/csv/${p.csvId}/post/${p.postId}`, { locationId: p.locationId });
    case 'csv_set_accounts': return ghlRequest(userId, 'PUT', `/social-media-posting/csv/${p.csvId}/set-accounts`, undefined, p);
    case 'category_list': return ghlRequest(userId, 'GET', '/social-media-posting/category', { locationId: p.locationId });
    case 'category_get': return ghlRequest(userId, 'GET', `/social-media-posting/category/${p.categoryId}`, { locationId: p.locationId });
    case 'tag_list': return ghlRequest(userId, 'GET', '/social-media-posting/tags', { locationId: p.locationId });
    case 'tag_details': return ghlRequest(userId, 'GET', `/social-media-posting/tags/${p.tagId}`, { locationId: p.locationId });
    case 'statistics_get': return ghlRequest(userId, 'GET', '/social-media-posting/statistics', { locationId: p.locationId, fromDate: p.fromDate, toDate: p.toDate, accountId: p.accountId });
    case 'oauth_start': return ghlRequest(userId, 'POST', '/social-media-posting/oauth', undefined, { type: p.type, locationId: p.locationId });
    case 'oauth_accounts_get': return ghlRequest(userId, 'GET', '/social-media-posting/oauth/accounts', { type: p.type, locationId: p.locationId });
    case 'oauth_accounts_connect': return ghlRequest(userId, 'POST', '/social-media-posting/oauth/accounts/connect', undefined, p);
    default: throw new Error(`Unknown ghl_social_planner action: ${action}`);
  }
}

// ─── Email Builder ───

async function executeEmailBuilder(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'template_list': return ghlRequest(userId, 'GET', '/emails/builder', { locationId: p.locationId, limit: p.limit, offset: p.offset });
    case 'template_create': return ghlRequest(userId, 'POST', '/emails/builder', undefined, p);
    case 'template_create_with_data': return ghlRequest(userId, 'POST', '/emails/builder/with-data', undefined, p);
    case 'template_delete': return ghlRequest(userId, 'DELETE', `/emails/builder/${p.templateId}`, { locationId: p.locationId });
    case 'schedule_list': return ghlRequest(userId, 'GET', '/emails/schedule', { locationId: p.locationId, limit: p.limit, offset: p.offset });
    default: throw new Error(`Unknown ghl_email_builder action: ${action}`);
  }
}

// ─── Media ───

async function executeMedia(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'file_list': return ghlRequest(userId, 'GET', '/medias/files', { altId: p.locationId, altType: 'location', sortBy: p.sortBy, sortOrder: p.sortOrder, limit: p.limit, offset: p.offset, type: p.type, query: p.query });
    case 'file_upload': return ghlRequest(userId, 'POST', '/medias/upload-file', undefined, p);
    case 'file_delete': return ghlRequest(userId, 'DELETE', `/medias/${p.id}`, { altId: p.locationId, altType: 'location' });
    default: throw new Error(`Unknown ghl_media action: ${action}`);
  }
}

// ─── Links ───

async function executeLinks(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return ghlRequest(userId, 'GET', '/links/', { locationId: p.locationId });
    case 'create': return ghlRequest(userId, 'POST', '/links/', undefined, p);
    case 'update': return ghlRequest(userId, 'PUT', `/links/${p.linkId}`, undefined, p);
    case 'delete': return ghlRequest(userId, 'DELETE', `/links/${p.linkId}`);
    default: throw new Error(`Unknown ghl_links action: ${action}`);
  }
}

// ─── Snapshots ───

async function executeSnapshots(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return ghlRequest(userId, 'GET', '/snapshots/', { companyId: p.companyId });
    case 'status_get': return ghlRequest(userId, 'GET', `/snapshots/snapshot-status/${p.snapshotId}`, { companyId: p.companyId });
    case 'location_status_get': return ghlRequest(userId, 'GET', `/snapshots/snapshot-status/${p.snapshotId}/location/${p.locationId}`, { companyId: p.companyId });
    case 'share_link_create': return ghlRequest(userId, 'POST', `/snapshots/share/link`, undefined, p);
    default: throw new Error(`Unknown ghl_snapshots action: ${action}`);
  }
}

// ─── Companies ───

async function executeCompanies(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'get': return ghlRequest(userId, 'GET', `/companies/${p.companyId}`);
    default: throw new Error(`Unknown ghl_companies action: ${action}`);
  }
}

// ─── Objects (Custom Objects) ───

async function executeObjects(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'schema_list': return ghlRequest(userId, 'GET', '/objects/schema', { locationId: p.locationId });
    case 'schema_get': return ghlRequest(userId, 'GET', `/objects/schema/${p.schemaKey}`, { locationId: p.locationId });
    case 'record_get': return ghlRequest(userId, 'GET', `/objects/records/${p.schemaKey}/${p.recordId}`, { locationId: p.locationId });
    case 'record_create': return ghlRequest(userId, 'POST', `/objects/records/${p.schemaKey}`, undefined, { locationId: p.locationId, ...p });
    case 'record_update': return ghlRequest(userId, 'PUT', `/objects/records/${p.schemaKey}/${p.recordId}`, undefined, p);
    case 'record_delete': return ghlRequest(userId, 'DELETE', `/objects/records/${p.schemaKey}/${p.recordId}`, { locationId: p.locationId });
    default: throw new Error(`Unknown ghl_objects action: ${action}`);
  }
}

// ─── Associations ───

async function executeAssociations(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return ghlRequest(userId, 'GET', '/associations', { locationId: p.locationId });
    case 'get': return ghlRequest(userId, 'GET', `/associations/${p.id}`, { locationId: p.locationId });
    case 'get_by_key': return ghlRequest(userId, 'GET', `/associations/key/${p.key}`, { locationId: p.locationId });
    case 'get_by_object_key': return ghlRequest(userId, 'GET', `/associations/object/${p.objectKey}`, { locationId: p.locationId });
    case 'create': return ghlRequest(userId, 'POST', '/associations', undefined, p);
    case 'update': return ghlRequest(userId, 'PUT', `/associations/${p.id}`, undefined, p);
    case 'delete': return ghlRequest(userId, 'DELETE', `/associations/${p.id}`, { locationId: p.locationId });
    case 'relation_list': return ghlRequest(userId, 'GET', '/associations/relations', { locationId: p.locationId, associationId: p.associationId, recordId: p.recordId });
    case 'relation_create': return ghlRequest(userId, 'POST', '/associations/relations', undefined, p);
    default: throw new Error(`Unknown ghl_associations action: ${action}`);
  }
}

// ─── Courses ───

async function executeCourses(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'import_course': return ghlRequest(userId, 'POST', '/courses/import', undefined, p);
    default: throw new Error(`Unknown ghl_courses action: ${action}`);
  }
}

// ─── Blogs ───

async function executeBlogs(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'post_create': return ghlRequest(userId, 'POST', '/blogs/posts', undefined, p);
    case 'post_update': return ghlRequest(userId, 'PUT', `/blogs/posts/${p.postId}`, undefined, p);
    case 'slug_check': return ghlRequest(userId, 'GET', '/blogs/check-slug', { locationId: p.locationId, slug: p.slug, postId: p.postId });
    case 'category_list': return ghlRequest(userId, 'GET', '/blogs/categories', { locationId: p.locationId, limit: p.limit, offset: p.offset });
    case 'author_list': return ghlRequest(userId, 'GET', '/blogs/authors', { locationId: p.locationId, limit: p.limit, offset: p.offset });
    default: throw new Error(`Unknown ghl_blogs action: ${action}`);
  }
}

// ─── Voice AI ───

async function executeVoiceAI(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'call_logs_list': return ghlRequest(userId, 'GET', '/voice-ai/call-logs', { locationId: p.locationId, limit: p.limit, offset: p.offset });
    case 'call_log_get': return ghlRequest(userId, 'GET', `/voice-ai/call-logs/${p.callId}`, { locationId: p.locationId });
    case 'agent_list': return ghlRequest(userId, 'GET', '/voice-ai/agents', { locationId: p.locationId });
    case 'agent_get': return ghlRequest(userId, 'GET', `/voice-ai/agents/${p.agentId}`, { locationId: p.locationId });
    case 'agent_create': return ghlRequest(userId, 'POST', '/voice-ai/agents', undefined, p);
    case 'agent_update': return ghlRequest(userId, 'PUT', `/voice-ai/agents/${p.agentId}`, undefined, p);
    case 'agent_delete': return ghlRequest(userId, 'DELETE', `/voice-ai/agents/${p.agentId}`, { locationId: p.locationId });
    case 'action_get': return ghlRequest(userId, 'GET', `/voice-ai/agents/${p.agentId}/actions/${p.actionId}`, { locationId: p.locationId });
    case 'action_create': return ghlRequest(userId, 'POST', `/voice-ai/agents/${p.agentId}/actions`, undefined, p);
    case 'action_update': return ghlRequest(userId, 'PUT', `/voice-ai/agents/${p.agentId}/actions/${p.actionId}`, undefined, p);
    case 'action_delete': return ghlRequest(userId, 'DELETE', `/voice-ai/agents/${p.agentId}/actions/${p.actionId}`, { locationId: p.locationId });
    default: throw new Error(`Unknown ghl_voice_ai action: ${action}`);
  }
}

// ─── Phone System ───

async function executePhoneSystem(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'number_list': return ghlRequest(userId, 'GET', '/phone-numbers', { locationId: p.locationId });
    case 'number_pool_list': return ghlRequest(userId, 'GET', '/phone-numbers/pools', { locationId: p.locationId });
    default: throw new Error(`Unknown ghl_phone_system action: ${action}`);
  }
}

// ─── Documents ───

async function executeDocuments(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'document_list': return ghlRequest(userId, 'GET', '/documents-contracts', { locationId: p.locationId, limit: p.limit, offset: p.offset });
    case 'document_send': return ghlRequest(userId, 'POST', '/documents-contracts/send', undefined, p);
    case 'template_list': return ghlRequest(userId, 'GET', '/documents-contracts/templates', { locationId: p.locationId, limit: p.limit, offset: p.offset });
    case 'template_send': return ghlRequest(userId, 'POST', '/documents-contracts/templates/send', undefined, p);
    default: throw new Error(`Unknown ghl_documents action: ${action}`);
  }
}

// ─── SaaS ───

async function executeSaaS(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'location_list': return ghlRequest(userId, 'GET', '/saas-api/public-api/locations', { companyId: p.companyId, limit: p.limit, skip: p.skip });
    case 'subscription_update': return ghlRequest(userId, 'PUT', `/saas-api/public-api/update-subscription/${p.locationId}`, undefined, p);
    case 'enable_saas': return ghlRequest(userId, 'POST', `/saas-api/public-api/enable-saas/${p.locationId}`, undefined, p);
    case 'bulk_disable': return ghlRequest(userId, 'POST', '/saas-api/public-api/bulk-disable-saas', undefined, p);
    default: throw new Error(`Unknown ghl_saas action: ${action}`);
  }
}

// ─── Custom Menus ───

async function executeCustomMenus(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return ghlRequest(userId, 'GET', '/custom-menu-links', { locationId: p.locationId });
    case 'get': return ghlRequest(userId, 'GET', `/custom-menu-links/${p.id}`, { locationId: p.locationId });
    case 'create': return ghlRequest(userId, 'POST', '/custom-menu-links', undefined, p);
    case 'update': return ghlRequest(userId, 'PUT', `/custom-menu-links/${p.id}`, undefined, p);
    case 'delete': return ghlRequest(userId, 'DELETE', `/custom-menu-links/${p.id}`, { locationId: p.locationId });
    default: throw new Error(`Unknown ghl_custom_menus action: ${action}`);
  }
}

// ─── Marketplace ───

async function executeMarketplace(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'app_installations_get': return ghlRequest(userId, 'GET', '/marketplace/app-installations', { appId: p.appId, companyId: p.companyId });
    case 'charges_list': return ghlRequest(userId, 'GET', '/marketplace/charges', { subscriptionId: p.subscriptionId });
    case 'charges_get': return ghlRequest(userId, 'GET', `/marketplace/charges/${p.chargeId}`);
    case 'charges_has_funds': return ghlRequest(userId, 'GET', '/marketplace/charges/has-funds', { companyId: p.companyId, amount: p.amount });
    case 'charges_create': return ghlRequest(userId, 'POST', '/marketplace/charges', undefined, p);
    case 'charges_delete': return ghlRequest(userId, 'DELETE', `/marketplace/charges/${p.chargeId}`);
    default: throw new Error(`Unknown ghl_marketplace action: ${action}`);
  }
}

// ─── Main Router ───

async function execute(toolName: string, args: Record<string, any>, ctx: ExecuteContext) {
  const action = args.action as string;
  const params = (args.params || {}) as Record<string, any>;

  if (!action) throw new Error(`Missing "action" parameter for tool ${toolName}`);

  switch (toolName) {
    case 'ghl_contacts': return executeContacts(action, params, ctx);
    case 'ghl_conversations': return executeConversations(action, params, ctx);
    case 'ghl_calendars': return executeCalendars(action, params, ctx);
    case 'ghl_opportunities': return executeOpportunities(action, params, ctx);
    case 'ghl_campaigns': return executeCampaigns(action, params, ctx);
    case 'ghl_workflows': return executeWorkflows(action, params, ctx);
    case 'ghl_forms': return executeForms(action, params, ctx);
    case 'ghl_surveys': return executeSurveys(action, params, ctx);
    case 'ghl_funnels': return executeFunnels(action, params, ctx);
    case 'ghl_invoices': return executeInvoices(action, params, ctx);
    case 'ghl_payments': return executePayments(action, params, ctx);
    case 'ghl_products': return executeProducts(action, params, ctx);
    case 'ghl_locations': return executeLocations(action, params, ctx);
    case 'ghl_businesses': return executeBusinesses(action, params, ctx);
    case 'ghl_users': return executeUsers(action, params, ctx);
    case 'ghl_social_planner': return executeSocialPlanner(action, params, ctx);
    case 'ghl_email_builder': return executeEmailBuilder(action, params, ctx);
    case 'ghl_media': return executeMedia(action, params, ctx);
    case 'ghl_links': return executeLinks(action, params, ctx);
    case 'ghl_snapshots': return executeSnapshots(action, params, ctx);
    case 'ghl_companies': return executeCompanies(action, params, ctx);
    case 'ghl_objects': return executeObjects(action, params, ctx);
    case 'ghl_associations': return executeAssociations(action, params, ctx);
    case 'ghl_courses': return executeCourses(action, params, ctx);
    case 'ghl_blogs': return executeBlogs(action, params, ctx);
    case 'ghl_voice_ai': return executeVoiceAI(action, params, ctx);
    case 'ghl_phone_system': return executePhoneSystem(action, params, ctx);
    case 'ghl_documents': return executeDocuments(action, params, ctx);
    case 'ghl_saas': return executeSaaS(action, params, ctx);
    case 'ghl_custom_menus': return executeCustomMenus(action, params, ctx);
    case 'ghl_marketplace': return executeMarketplace(action, params, ctx);
    default:
      throw new Error(`Unknown GHL tool: ${toolName}`);
  }
}

// ─── Tool Definitions (ALL 36 categories) ───

const tools = [
  createToolGroup('ghl_contacts', 'Full GHL contact management — CRUD, tasks, tags, notes, campaigns, workflows, appointments', [
    'list', 'get', 'search', 'create', 'update', 'delete', 'search_by_business',
    'task_list', 'task_get', 'task_create', 'task_update', 'task_complete', 'task_delete',
    'tag_add', 'tag_remove',
    'note_list', 'note_get', 'note_create', 'note_update', 'note_delete',
    'campaign_add', 'campaign_remove', 'campaign_remove_all',
    'workflow_add', 'workflow_remove',
    'appointment_list',
  ], 'Params: {locationId, contactId, email, phone, name, tags[], body, taskId, noteId, campaignId, workflowId}'),

  createToolGroup('ghl_conversations', 'Full GHL messaging — SMS, email, FB, IG, WhatsApp, GMB, live chat, recordings, transcriptions', [
    'list', 'get', 'create', 'update', 'delete', 'search',
    'message_send', 'message_inbound', 'message_get', 'message_upload_attachment',
    'message_status_update', 'message_schedule_cancel', 'email_schedule_cancel',
    'recording_get', 'transcription_get', 'transcription_download',
  ], 'Params: {locationId, conversationId, type (SMS|Email|FB|IG|WhatsApp|GMB|Live_Chat), contactId, message, messageId}'),

  createToolGroup('ghl_calendars', 'Full GHL calendar + booking — calendars, groups, resources, events, appointments, blocked slots, free slots', [
    'calendar_list', 'calendar_get', 'calendar_create', 'calendar_update', 'calendar_delete',
    'group_list', 'group_get', 'group_create', 'group_update', 'group_delete', 'group_validate_slug', 'group_status_update',
    'resource_list', 'resource_get', 'resource_create', 'resource_update', 'resource_delete',
    'event_get', 'event_list', 'event_create', 'event_update', 'event_delete',
    'appointment_create', 'appointment_update',
    'blocked_slot_list', 'blocked_slot_create', 'blocked_slot_update',
    'free_slots_get',
  ], 'Params: {locationId, calendarId, groupId, resourceId, eventId, startTime, endTime, startDate, endDate, timezone, slug}'),

  createToolGroup('ghl_opportunities', 'Full GHL sales pipeline — opportunities, pipelines, stages', [
    'list', 'get', 'search', 'create', 'update', 'delete',
    'status_update', 'pipeline_list', 'pipeline_get',
  ], 'Params: {locationId, id, pipelineId, status (open|won|lost|abandoned), monetaryValue, contactId, stageId}'),

  createToolGroup('ghl_campaigns', 'GHL campaigns (read-only per API)', ['list'], 'Params: {locationId, status}'),

  createToolGroup('ghl_workflows', 'GHL workflows (read-only, add/remove contacts via ghl_contacts)', ['list'], 'Params: {locationId}'),

  createToolGroup('ghl_forms', 'GHL form management — list forms, get submissions, upload files', [
    'list', 'get_submissions', 'upload_custom_files',
  ], 'Params: {locationId, formId, limit, page, startAt, endAt, q}'),

  createToolGroup('ghl_surveys', 'GHL survey management — list surveys, get submissions', [
    'list', 'get_submissions',
  ], 'Params: {locationId, surveyId, limit, page}'),

  createToolGroup('ghl_funnels', 'GHL funnel management — funnels, pages, redirects', [
    'funnel_list', 'page_get', 'page_count',
    'redirect_list', 'redirect_create', 'redirect_update', 'redirect_delete',
  ], 'Params: {locationId, funnelPageId, funnelId, id, target, action (redirect or funnel)}'),

  createToolGroup('ghl_invoices', 'Full GHL invoicing — invoices, schedules, templates, estimates', [
    'list', 'get', 'create', 'update', 'delete',
    'send', 'void', 'record_payment', 'text2pay', 'generate_invoice_number',
    'schedule_list', 'schedule_get', 'schedule_create', 'schedule_update', 'schedule_delete',
    'schedule_activate', 'schedule_auto_payment', 'schedule_cancel',
    'template_list', 'template_get', 'template_create', 'template_update', 'template_delete',
    'estimate_list', 'estimate_get', 'estimate_create', 'estimate_update', 'estimate_delete',
    'estimate_send', 'estimate_to_invoice',
  ], 'Params: {locationId, invoiceId, scheduleId, templateId, estimateId, contactId, items[], currency}'),

  createToolGroup('ghl_payments', 'Full GHL payment management — orders, transactions, subscriptions, coupons, custom providers', [
    'integration_get', 'integration_create',
    'order_list', 'order_get', 'order_fulfillment_list', 'order_fulfillment_create',
    'transaction_list', 'transaction_get',
    'subscription_list', 'subscription_get',
    'coupon_list', 'coupon_get', 'coupon_create', 'coupon_update', 'coupon_delete',
    'custom_provider_get', 'custom_provider_create', 'custom_provider_connect',
    'custom_provider_disconnect', 'custom_provider_capabilities', 'custom_provider_delete',
  ], 'Params: {locationId, orderId, transactionId, subscriptionId, couponId}'),

  createToolGroup('ghl_products', 'Full GHL product/store management — products, prices, collections, reviews', [
    'list', 'get', 'create', 'update', 'delete', 'bulk_update',
    'store_stats', 'store_update',
    'price_list', 'price_get', 'price_create', 'price_update', 'price_delete',
    'collection_list', 'collection_get', 'collection_create', 'collection_update', 'collection_delete',
    'review_list', 'review_count', 'review_update', 'review_delete', 'review_bulk_update',
  ], 'Params: {locationId, productId, priceId, collectionId, reviewId, name, amount, currency}'),

  createToolGroup('ghl_locations', 'Full GHL sub-account management — locations, custom values/fields, tags, templates, tasks', [
    'list', 'get', 'search', 'create', 'update', 'delete', 'timezones_get',
    'custom_value_list', 'custom_value_get', 'custom_value_create', 'custom_value_update', 'custom_value_delete',
    'custom_field_list', 'custom_field_get', 'custom_field_create', 'custom_field_update', 'custom_field_delete',
    'tag_list', 'tag_get', 'tag_create', 'tag_update', 'tag_delete',
    'template_list', 'task_search',
  ], 'Params: {locationId, companyId, id, name, model (contact|opportunity), type}'),

  createToolGroup('ghl_businesses', 'GHL business management', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {locationId, businessId, name, phone, email, website}'),

  createToolGroup('ghl_users', 'GHL user management', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {companyId, locationId, userId, firstName, lastName, email, role}'),

  createToolGroup('ghl_social_planner', 'Full GHL social media management — accounts, posts, CSV bulk, categories, tags, stats, OAuth', [
    'account_list', 'account_delete',
    'post_list', 'post_get', 'post_create', 'post_update', 'post_delete', 'post_patch',
    'csv_list', 'csv_get', 'csv_create', 'csv_update', 'csv_delete', 'csv_delete_post', 'csv_set_accounts',
    'category_list', 'category_get', 'tag_list', 'tag_details',
    'statistics_get',
    'oauth_start', 'oauth_accounts_get', 'oauth_accounts_connect',
  ], 'Params: {locationId, accountId, postId, csvId, type (facebook|google|instagram|linkedin|tiktok|twitter), fromDate, toDate}'),

  createToolGroup('ghl_email_builder', 'GHL email builder — templates, scheduling', [
    'template_list', 'template_create', 'template_create_with_data', 'template_delete',
    'schedule_list',
  ], 'Params: {locationId, templateId, name, html}'),

  createToolGroup('ghl_media', 'GHL media/file management', [
    'file_list', 'file_upload', 'file_delete',
  ], 'Params: {locationId, id, type, query, file (base64 or URL)}'),

  createToolGroup('ghl_links', 'GHL trigger links', [
    'list', 'create', 'update', 'delete',
  ], 'Params: {locationId, linkId, name, redirectTo}'),

  createToolGroup('ghl_snapshots', 'GHL snapshots — list, status, share', [
    'list', 'status_get', 'location_status_get', 'share_link_create',
  ], 'Params: {companyId, snapshotId, locationId}'),

  createToolGroup('ghl_companies', 'GHL company management (agency level)', ['get'], 'Params: {companyId}'),

  createToolGroup('ghl_objects', 'GHL custom objects — schemas and records', [
    'schema_list', 'schema_get',
    'record_get', 'record_create', 'record_update', 'record_delete',
  ], 'Params: {locationId, schemaKey, recordId, properties: {...}}'),

  createToolGroup('ghl_associations', 'GHL object associations — link records together', [
    'list', 'get', 'get_by_key', 'get_by_object_key', 'create', 'update', 'delete',
    'relation_list', 'relation_create',
  ], 'Params: {locationId, id, key, objectKey, associationId, recordId}'),

  createToolGroup('ghl_courses', 'GHL courses — import courses', ['import_course'], 'Params: {locationId, courseData}'),

  createToolGroup('ghl_blogs', 'GHL blogs — create/update posts, check slugs, list categories/authors', [
    'post_create', 'post_update', 'slug_check', 'category_list', 'author_list',
  ], 'Params: {locationId, postId, slug, title, content, categoryId, authorId}'),

  createToolGroup('ghl_voice_ai', 'GHL Voice AI agents — call logs, agents, actions', [
    'call_logs_list', 'call_log_get',
    'agent_list', 'agent_get', 'agent_create', 'agent_update', 'agent_delete',
    'action_get', 'action_create', 'action_update', 'action_delete',
  ], 'Params: {locationId, callId, agentId, actionId, name, prompt}'),

  createToolGroup('ghl_phone_system', 'GHL phone numbers and number pools', [
    'number_list', 'number_pool_list',
  ], 'Params: {locationId}'),

  createToolGroup('ghl_documents', 'GHL documents/contracts — proposals, templates', [
    'document_list', 'document_send', 'template_list', 'template_send',
  ], 'Params: {locationId, contactId, documentId, templateId}'),

  createToolGroup('ghl_saas', 'GHL SaaS configurator — manage sub-account subscriptions', [
    'location_list', 'subscription_update', 'enable_saas', 'bulk_disable',
  ], 'Params: {companyId, locationId, subscriptionId, planId}'),

  createToolGroup('ghl_custom_menus', 'GHL custom menu links', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {locationId, id, name, url, iconUrl}'),

  createToolGroup('ghl_marketplace', 'GHL marketplace — app installations, charges', [
    'app_installations_get',
    'charges_list', 'charges_get', 'charges_has_funds', 'charges_create', 'charges_delete',
  ], 'Params: {appId, companyId, subscriptionId, chargeId, amount}'),
];

// ─── Register Server ───

export function registerGHLServer() {
  registerServer('ghl', {
    name: 'AIM GoHighLevel',
    description: 'Full GHL API v2 access — ALL 36 API categories, 413+ operations. Contacts, conversations, calendars, opportunities, payments, products, social planner, voice AI, and more.',
    tools,
    execute,
  });
}
