import {
  registerServer,
  createToolGroup,
  makeAuthenticatedRequest,
  type ExecuteContext,
} from '@/lib/server-registry';

// ─── Google API Base URLs ───
const GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me';
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DOCS_API = 'https://docs.googleapis.com/v1/documents';
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const YOUTUBE_API = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_ANALYTICS_API = 'https://youtubeanalytics.googleapis.com/v2/reports';
const GOOGLE_ADS_API = 'https://googleads.googleapis.com/v17';
const BUSINESS_API = 'https://mybusinessbusinessinformation.googleapis.com/v1';
const BUSINESS_REVIEWS_API = 'https://mybusiness.googleapis.com/v4';

// ─── Helpers ───

function qs(params: Record<string, any>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

function buildUrl(base: string, path: string, query?: Record<string, any>): string {
  const url = path ? `${base}/${path}` : base;
  return query ? `${url}${qs(query)}` : url;
}

// ─── Gmail Executor ───

async function executeGmail(action: string, params: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const service = 'google';

  switch (action) {
    // ─ Messages ─
    case 'list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, 'messages', { maxResults: params.maxResults || 20, q: params.q, labelIds: params.labelIds, pageToken: params.pageToken }));

    case 'get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, `messages/${params.id}`, { format: params.format || 'full' }));

    case 'search':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, 'messages', { q: params.query, maxResults: params.maxResults || 20, pageToken: params.pageToken }));

    case 'send': {
      const raw = params.raw || buildRawEmail(params);
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, 'messages/send'), { method: 'POST', body: JSON.stringify({ raw }) });
    }

    case 'reply': {
      const raw = params.raw || buildRawEmail({ ...params, inReplyTo: params.messageId });
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, 'messages/send'), { method: 'POST', body: JSON.stringify({ raw, threadId: params.threadId }) });
    }

    case 'forward': {
      const raw = params.raw || buildRawEmail(params);
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, 'messages/send'), { method: 'POST', body: JSON.stringify({ raw, threadId: params.threadId }) });
    }

    case 'trash':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, `messages/${params.id}/trash`), { method: 'POST' });

    case 'untrash':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, `messages/${params.id}/untrash`), { method: 'POST' });

    case 'delete_permanent':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, `messages/${params.id}`), { method: 'DELETE' });

    case 'batch_modify':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, 'messages/batchModify'), {
          method: 'POST',
          body: JSON.stringify({ ids: params.ids, addLabelIds: params.addLabelIds, removeLabelIds: params.removeLabelIds }),
        });

    case 'attachment_get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, `messages/${params.messageId}/attachments/${params.attachmentId}`));

    case 'history_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, 'history', { startHistoryId: params.startHistoryId, historyTypes: params.historyTypes, pageToken: params.pageToken }));

    // ─ Drafts ─
    case 'draft_create':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, 'drafts'), {
          method: 'POST',
          body: JSON.stringify({ message: { raw: params.raw || buildRawEmail(params) } }),
        });

    case 'draft_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, `drafts/${params.id}`), {
          method: 'PUT',
          body: JSON.stringify({ message: { raw: params.raw || buildRawEmail(params) } }),
        });

    case 'draft_send':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, 'drafts/send'), { method: 'POST', body: JSON.stringify({ id: params.id }) });

    case 'draft_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, `drafts/${params.id}`), { method: 'DELETE' });

    // ─ Labels ─
    case 'label_list':
      return makeAuthenticatedRequest(userId, service, buildUrl(GMAIL_API, 'labels'));

    case 'label_create':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, 'labels'), {
          method: 'POST',
          body: JSON.stringify({ name: params.name, labelListVisibility: params.labelListVisibility, messageListVisibility: params.messageListVisibility }),
        });

    case 'label_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, `labels/${params.id}`), {
          method: 'PUT',
          body: JSON.stringify(params),
        });

    case 'label_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, `labels/${params.id}`), { method: 'DELETE' });

    case 'label_apply':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, `messages/${params.messageId}/modify`), {
          method: 'POST',
          body: JSON.stringify({ addLabelIds: params.labelIds }),
        });

    case 'label_remove':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, `messages/${params.messageId}/modify`), {
          method: 'POST',
          body: JSON.stringify({ removeLabelIds: params.labelIds }),
        });

    // ─ Threads ─
    case 'thread_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, 'threads', { maxResults: params.maxResults || 20, q: params.q, pageToken: params.pageToken }));

    case 'thread_get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, `threads/${params.id}`, { format: params.format || 'full' }));

    case 'thread_trash':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, `threads/${params.id}/trash`), { method: 'POST' });

    case 'thread_untrash':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, `threads/${params.id}/untrash`), { method: 'POST' });

    case 'thread_modify':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, `threads/${params.id}/modify`), {
          method: 'POST',
          body: JSON.stringify({ addLabelIds: params.addLabelIds, removeLabelIds: params.removeLabelIds }),
        });

    // ─ Settings ─
    case 'settings_get_filters':
      return makeAuthenticatedRequest(userId, service, buildUrl(GMAIL_API, 'settings/filters'));

    case 'settings_create_filter':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, 'settings/filters'), { method: 'POST', body: JSON.stringify(params.filter) });

    case 'settings_delete_filter':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, `settings/filters/${params.id}`), { method: 'DELETE' });

    case 'settings_get_forwarding':
      return makeAuthenticatedRequest(userId, service, buildUrl(GMAIL_API, 'settings/forwardingAddresses'));

    case 'settings_update_forwarding':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, 'settings/forwardingAddresses'), { method: 'POST', body: JSON.stringify(params) });

    case 'settings_get_vacation':
      return makeAuthenticatedRequest(userId, service, buildUrl(GMAIL_API, 'settings/vacation'));

    case 'settings_update_vacation':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, 'settings/vacation'), { method: 'PUT', body: JSON.stringify(params) });

    case 'settings_get_signature':
      return makeAuthenticatedRequest(userId, service, buildUrl(GMAIL_API, `settings/sendAs/${params.sendAsEmail || 'me'}`));

    case 'settings_update_signature':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(GMAIL_API, `settings/sendAs/${params.sendAsEmail || 'me'}`), {
          method: 'PATCH',
          body: JSON.stringify({ signature: params.signature }),
        });

    default:
      throw new Error(`Unknown gmail action: ${action}`);
  }
}

// ─── Calendar Executor ───

async function executeCalendar(action: string, params: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const service = 'google';
  const calendarId = params.calendarId || 'primary';

  switch (action) {
    case 'event_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `calendars/${encodeURIComponent(calendarId)}/events`, {
          maxResults: params.maxResults || 50, timeMin: params.timeMin, timeMax: params.timeMax,
          q: params.q, singleEvents: params.singleEvents, orderBy: params.orderBy, pageToken: params.pageToken,
        }));

    case 'event_get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `calendars/${encodeURIComponent(calendarId)}/events/${params.eventId}`));

    case 'event_create':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `calendars/${encodeURIComponent(calendarId)}/events`, {
          sendUpdates: params.sendUpdates, conferenceDataVersion: params.conferenceDataVersion,
        }), {
          method: 'POST',
          body: JSON.stringify(params.event || params),
        });

    case 'event_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `calendars/${encodeURIComponent(calendarId)}/events/${params.eventId}`, {
          sendUpdates: params.sendUpdates,
        }), {
          method: 'PUT',
          body: JSON.stringify(params.event || params),
        });

    case 'event_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `calendars/${encodeURIComponent(calendarId)}/events/${params.eventId}`, {
          sendUpdates: params.sendUpdates,
        }), { method: 'DELETE' });

    case 'event_move':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `calendars/${encodeURIComponent(calendarId)}/events/${params.eventId}/move`, {
          destination: params.destination,
        }), { method: 'POST' });

    case 'event_instances':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `calendars/${encodeURIComponent(calendarId)}/events/${params.eventId}/instances`, {
          maxResults: params.maxResults, pageToken: params.pageToken, timeMin: params.timeMin, timeMax: params.timeMax,
        }));

    case 'event_quick_add':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `calendars/${encodeURIComponent(calendarId)}/events/quickAdd`, {
          text: params.text, sendUpdates: params.sendUpdates,
        }), { method: 'POST' });

    case 'calendar_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, 'users/me/calendarList', { pageToken: params.pageToken }));

    case 'calendar_get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `users/me/calendarList/${encodeURIComponent(calendarId)}`));

    case 'calendar_create':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, 'calendars'), {
          method: 'POST',
          body: JSON.stringify({ summary: params.summary, description: params.description, timeZone: params.timeZone }),
        });

    case 'calendar_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `calendars/${encodeURIComponent(calendarId)}`), {
          method: 'PUT',
          body: JSON.stringify(params),
        });

    case 'calendar_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `calendars/${encodeURIComponent(calendarId)}`), { method: 'DELETE' });

    case 'calendar_clear':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `calendars/${encodeURIComponent(calendarId)}/clear`), { method: 'POST' });

    case 'acl_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `calendars/${encodeURIComponent(calendarId)}/acl`));

    case 'acl_get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `calendars/${encodeURIComponent(calendarId)}/acl/${params.ruleId}`));

    case 'acl_create':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `calendars/${encodeURIComponent(calendarId)}/acl`), {
          method: 'POST',
          body: JSON.stringify(params.rule || params),
        });

    case 'acl_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `calendars/${encodeURIComponent(calendarId)}/acl/${params.ruleId}`), {
          method: 'PUT',
          body: JSON.stringify(params.rule || params),
        });

    case 'acl_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `calendars/${encodeURIComponent(calendarId)}/acl/${params.ruleId}`), { method: 'DELETE' });

    case 'freebusy_query':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, 'freeBusy'), {
          method: 'POST',
          body: JSON.stringify({
            timeMin: params.timeMin, timeMax: params.timeMax,
            items: params.items || [{ id: calendarId }],
          }),
        });

    case 'settings_list':
      return makeAuthenticatedRequest(userId, service, buildUrl(CALENDAR_API, 'users/me/settings'));

    case 'settings_get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(CALENDAR_API, `users/me/settings/${params.setting}`));

    case 'colors_get':
      return makeAuthenticatedRequest(userId, service, buildUrl(CALENDAR_API, 'colors'));

    default:
      throw new Error(`Unknown calendar action: ${action}`);
  }
}

// ─── Drive Executor ───

async function executeDrive(action: string, params: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const service = 'google';

  switch (action) {
    case 'file_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, 'files', {
          q: params.q, pageSize: params.pageSize || 50, pageToken: params.pageToken,
          fields: params.fields || 'files(id,name,mimeType,size,modifiedTime,parents),nextPageToken',
          orderBy: params.orderBy, spaces: params.spaces,
        }));

    case 'file_get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}`, {
          fields: params.fields || 'id,name,mimeType,size,modifiedTime,parents,webViewLink,webContentLink',
        }));

    case 'file_get_content':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}`, { alt: 'media' }));

    case 'file_create':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, 'files', { uploadType: params.uploadType }), {
          method: 'POST',
          body: JSON.stringify({ name: params.name, mimeType: params.mimeType, parents: params.parents, ...params.metadata }),
        });

    case 'file_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}`), {
          method: 'PATCH',
          body: JSON.stringify(params.metadata || params),
        });

    case 'file_copy':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}/copy`), {
          method: 'POST',
          body: JSON.stringify({ name: params.name, parents: params.parents }),
        });

    case 'file_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}`), { method: 'DELETE' });

    case 'file_trash':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}`), {
          method: 'PATCH',
          body: JSON.stringify({ trashed: true }),
        });

    case 'file_untrash':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}`), {
          method: 'PATCH',
          body: JSON.stringify({ trashed: false }),
        });

    case 'file_empty_trash':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, 'files/trash'), { method: 'DELETE' });

    case 'file_export':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}/export`, { mimeType: params.mimeType }));

    case 'file_generate_ids':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, 'files/generateIds', { count: params.count || 10 }));

    case 'permission_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}/permissions`));

    case 'permission_get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}/permissions/${params.permissionId}`));

    case 'permission_create':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}/permissions`, {
          sendNotificationEmail: params.sendNotificationEmail,
        }), {
          method: 'POST',
          body: JSON.stringify({ role: params.role, type: params.type, emailAddress: params.emailAddress, domain: params.domain }),
        });

    case 'permission_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}/permissions/${params.permissionId}`), {
          method: 'PATCH',
          body: JSON.stringify({ role: params.role }),
        });

    case 'permission_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}/permissions/${params.permissionId}`), { method: 'DELETE' });

    case 'comment_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}/comments`, { fields: '*', pageToken: params.pageToken }));

    case 'comment_get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}/comments/${params.commentId}`, { fields: '*' }));

    case 'comment_create':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}/comments`), {
          method: 'POST',
          body: JSON.stringify({ content: params.content }),
        });

    case 'comment_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}/comments/${params.commentId}`), {
          method: 'PATCH',
          body: JSON.stringify({ content: params.content }),
        });

    case 'comment_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}/comments/${params.commentId}`), { method: 'DELETE' });

    case 'reply_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}/comments/${params.commentId}/replies`, { fields: '*' }));

    case 'reply_create':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}/comments/${params.commentId}/replies`), {
          method: 'POST',
          body: JSON.stringify({ content: params.content }),
        });

    case 'revision_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}/revisions`));

    case 'revision_get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}/revisions/${params.revisionId}`));

    case 'revision_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}/revisions/${params.revisionId}`), { method: 'DELETE' });

    case 'change_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, 'changes', { pageToken: params.pageToken, spaces: params.spaces }));

    case 'change_get_start_page_token':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, 'changes/startPageToken'));

    case 'shared_drive_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, 'drives', { pageSize: params.pageSize, pageToken: params.pageToken }));

    case 'shared_drive_get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `drives/${params.driveId}`));

    case 'shared_drive_create':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, 'drives', { requestId: params.requestId || crypto.randomUUID() }), {
          method: 'POST',
          body: JSON.stringify({ name: params.name }),
        });

    case 'shared_drive_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `drives/${params.driveId}`), {
          method: 'PATCH',
          body: JSON.stringify(params),
        });

    case 'shared_drive_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `drives/${params.driveId}`), { method: 'DELETE' });

    case 'folder_create':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, 'files'), {
          method: 'POST',
          body: JSON.stringify({
            name: params.name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: params.parents,
          }),
        });

    case 'folder_move':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(DRIVE_API, `files/${params.fileId}`, {
          addParents: params.addParents,
          removeParents: params.removeParents,
        }), { method: 'PATCH', body: JSON.stringify({}) });

    default:
      throw new Error(`Unknown drive action: ${action}`);
  }
}

// ─── Docs Executor ───

async function executeDocs(action: string, params: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const service = 'google';

  switch (action) {
    case 'create':
      return makeAuthenticatedRequest(userId, service,
        DOCS_API, { method: 'POST', body: JSON.stringify({ title: params.title }) });

    case 'get':
      return makeAuthenticatedRequest(userId, service,
        `${DOCS_API}/${params.documentId}`);

    case 'batch_update':
      return makeAuthenticatedRequest(userId, service,
        `${DOCS_API}/${params.documentId}:batchUpdate`, {
          method: 'POST',
          body: JSON.stringify({ requests: params.requests }),
        });

    case 'insert_text':
      return makeAuthenticatedRequest(userId, service,
        `${DOCS_API}/${params.documentId}:batchUpdate`, {
          method: 'POST',
          body: JSON.stringify({
            requests: [{
              insertText: {
                location: { index: params.index || 1 },
                text: params.text,
              },
            }],
          }),
        });

    case 'delete_content':
      return makeAuthenticatedRequest(userId, service,
        `${DOCS_API}/${params.documentId}:batchUpdate`, {
          method: 'POST',
          body: JSON.stringify({
            requests: [{
              deleteContentRange: {
                range: { startIndex: params.startIndex, endIndex: params.endIndex },
              },
            }],
          }),
        });

    case 'replace_all_text':
      return makeAuthenticatedRequest(userId, service,
        `${DOCS_API}/${params.documentId}:batchUpdate`, {
          method: 'POST',
          body: JSON.stringify({
            requests: [{
              replaceAllText: {
                containsText: { text: params.findText, matchCase: params.matchCase ?? true },
                replaceText: params.replaceText,
              },
            }],
          }),
        });

    default:
      throw new Error(`Unknown docs action: ${action}`);
  }
}

// ─── Sheets Executor ───

async function executeSheets(action: string, params: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const service = 'google';

  switch (action) {
    case 'spreadsheet_create':
      return makeAuthenticatedRequest(userId, service,
        SHEETS_API, { method: 'POST', body: JSON.stringify({ properties: { title: params.title }, sheets: params.sheets }) });

    case 'spreadsheet_get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(SHEETS_API, params.spreadsheetId, { includeGridData: params.includeGridData, ranges: params.ranges }));

    case 'spreadsheet_batch_update':
      return makeAuthenticatedRequest(userId, service,
        `${SHEETS_API}/${params.spreadsheetId}:batchUpdate`, {
          method: 'POST',
          body: JSON.stringify({ requests: params.requests }),
        });

    case 'values_get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(SHEETS_API, `${params.spreadsheetId}/values/${encodeURIComponent(params.range)}`, {
          valueRenderOption: params.valueRenderOption, dateTimeRenderOption: params.dateTimeRenderOption,
        }));

    case 'values_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(SHEETS_API, `${params.spreadsheetId}/values/${encodeURIComponent(params.range)}`, {
          valueInputOption: params.valueInputOption || 'USER_ENTERED',
        }), {
          method: 'PUT',
          body: JSON.stringify({ values: params.values }),
        });

    case 'values_append':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(SHEETS_API, `${params.spreadsheetId}/values/${encodeURIComponent(params.range)}:append`, {
          valueInputOption: params.valueInputOption || 'USER_ENTERED',
          insertDataOption: params.insertDataOption,
        }), {
          method: 'POST',
          body: JSON.stringify({ values: params.values }),
        });

    case 'values_clear':
      return makeAuthenticatedRequest(userId, service,
        `${SHEETS_API}/${params.spreadsheetId}/values/${encodeURIComponent(params.range)}:clear`, {
          method: 'POST',
          body: JSON.stringify({}),
        });

    case 'values_batch_get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(SHEETS_API, `${params.spreadsheetId}/values:batchGet`, {
          ranges: params.ranges, valueRenderOption: params.valueRenderOption,
        }));

    case 'values_batch_update':
      return makeAuthenticatedRequest(userId, service,
        `${SHEETS_API}/${params.spreadsheetId}/values:batchUpdate`, {
          method: 'POST',
          body: JSON.stringify({
            valueInputOption: params.valueInputOption || 'USER_ENTERED',
            data: params.data,
          }),
        });

    case 'values_batch_clear':
      return makeAuthenticatedRequest(userId, service,
        `${SHEETS_API}/${params.spreadsheetId}/values:batchClear`, {
          method: 'POST',
          body: JSON.stringify({ ranges: params.ranges }),
        });

    default:
      // All other sheet operations go through batchUpdate requests
      throw new Error(`Unknown sheets action: ${action}. Use spreadsheet_batch_update with the appropriate request object for advanced operations.`);
  }
}

// ─── YouTube Executor ───

async function executeYouTube(action: string, params: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const service = 'google';

  switch (action) {
    case 'video_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'videos', {
          part: params.part || 'snippet,contentDetails,statistics',
          id: params.id, chart: params.chart, myRating: params.myRating,
          maxResults: params.maxResults || 25, pageToken: params.pageToken,
        }));

    case 'video_get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'videos', {
          part: params.part || 'snippet,contentDetails,statistics,status',
          id: params.id,
        }));

    case 'video_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'videos', { part: params.part || 'snippet,status' }), {
          method: 'PUT',
          body: JSON.stringify(params.video || params),
        });

    case 'video_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'videos', { id: params.id }), { method: 'DELETE' });

    case 'video_rate':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'videos/rate', { id: params.id, rating: params.rating }), { method: 'POST' });

    case 'channel_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'channels', {
          part: params.part || 'snippet,contentDetails,statistics',
          mine: params.mine ?? true, id: params.id,
        }));

    case 'channel_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'channels', { part: params.part || 'brandingSettings' }), {
          method: 'PUT',
          body: JSON.stringify(params.channel || params),
        });

    case 'playlist_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'playlists', {
          part: params.part || 'snippet,contentDetails',
          mine: params.mine ?? true, channelId: params.channelId, id: params.id,
          maxResults: params.maxResults || 25, pageToken: params.pageToken,
        }));

    case 'playlist_insert':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'playlists', { part: 'snippet,status' }), {
          method: 'POST',
          body: JSON.stringify(params.playlist || params),
        });

    case 'playlist_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'playlists', { part: 'snippet,status' }), {
          method: 'PUT',
          body: JSON.stringify(params.playlist || params),
        });

    case 'playlist_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'playlists', { id: params.id }), { method: 'DELETE' });

    case 'playlist_item_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'playlistItems', {
          part: params.part || 'snippet,contentDetails',
          playlistId: params.playlistId, maxResults: params.maxResults || 50, pageToken: params.pageToken,
        }));

    case 'playlist_item_insert':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'playlistItems', { part: 'snippet' }), {
          method: 'POST',
          body: JSON.stringify(params.playlistItem || params),
        });

    case 'playlist_item_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'playlistItems', { part: 'snippet' }), {
          method: 'PUT',
          body: JSON.stringify(params.playlistItem || params),
        });

    case 'playlist_item_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'playlistItems', { id: params.id }), { method: 'DELETE' });

    case 'search':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'search', {
          part: 'snippet', q: params.q, type: params.type, channelId: params.channelId,
          maxResults: params.maxResults || 25, pageToken: params.pageToken,
          order: params.order, publishedAfter: params.publishedAfter, publishedBefore: params.publishedBefore,
        }));

    case 'comment_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'comments', {
          part: 'snippet', parentId: params.parentId, maxResults: params.maxResults, pageToken: params.pageToken,
        }));

    case 'comment_insert':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'comments', { part: 'snippet' }), {
          method: 'POST',
          body: JSON.stringify(params.comment || params),
        });

    case 'comment_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'comments', { part: 'snippet' }), {
          method: 'PUT',
          body: JSON.stringify(params.comment || params),
        });

    case 'comment_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'comments', { id: params.id }), { method: 'DELETE' });

    case 'comment_thread_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'commentThreads', {
          part: 'snippet,replies', videoId: params.videoId, channelId: params.channelId,
          maxResults: params.maxResults, pageToken: params.pageToken, order: params.order,
        }));

    case 'comment_thread_insert':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'commentThreads', { part: 'snippet' }), {
          method: 'POST',
          body: JSON.stringify(params.commentThread || params),
        });

    case 'subscription_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'subscriptions', {
          part: 'snippet,contentDetails', mine: params.mine ?? true,
          maxResults: params.maxResults, pageToken: params.pageToken,
        }));

    case 'subscription_insert':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'subscriptions', { part: 'snippet' }), {
          method: 'POST',
          body: JSON.stringify(params.subscription || params),
        });

    case 'subscription_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'subscriptions', { id: params.id }), { method: 'DELETE' });

    case 'caption_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'captions', { part: 'snippet', videoId: params.videoId }));

    case 'caption_download':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, `captions/${params.id}`, { tfmt: params.format }));

    case 'live_broadcast_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'liveBroadcasts', {
          part: params.part || 'snippet,contentDetails,status',
          broadcastStatus: params.broadcastStatus, mine: params.mine ?? true,
          maxResults: params.maxResults, pageToken: params.pageToken,
        }));

    case 'live_broadcast_insert':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'liveBroadcasts', { part: 'snippet,contentDetails,status' }), {
          method: 'POST',
          body: JSON.stringify(params.broadcast || params),
        });

    case 'live_broadcast_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'liveBroadcasts', { part: 'snippet,contentDetails,status' }), {
          method: 'PUT',
          body: JSON.stringify(params.broadcast || params),
        });

    case 'live_broadcast_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'liveBroadcasts', { id: params.id }), { method: 'DELETE' });

    case 'live_broadcast_bind':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'liveBroadcasts/bind', { id: params.id, part: 'id,contentDetails', streamId: params.streamId }), { method: 'POST' });

    case 'live_broadcast_transition':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'liveBroadcasts/transition', { broadcastStatus: params.broadcastStatus, id: params.id, part: 'id,status' }), { method: 'POST' });

    case 'live_stream_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'liveStreams', { part: 'snippet,cdn,status', mine: true }));

    case 'live_stream_insert':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'liveStreams', { part: 'snippet,cdn' }), {
          method: 'POST',
          body: JSON.stringify(params.stream || params),
        });

    case 'live_stream_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'liveStreams', { part: 'snippet,cdn' }), {
          method: 'PUT',
          body: JSON.stringify(params.stream || params),
        });

    case 'live_stream_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'liveStreams', { id: params.id }), { method: 'DELETE' });

    case 'thumbnail_set':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_API, 'thumbnails/set', { videoId: params.videoId }), {
          method: 'POST',
          headers: { 'Content-Type': params.mimeType || 'image/jpeg' } as any,
          body: params.imageData,
        });

    case 'analytics_query':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(YOUTUBE_ANALYTICS_API, '', {
          ids: params.ids || 'channel==MINE',
          startDate: params.startDate, endDate: params.endDate,
          metrics: params.metrics, dimensions: params.dimensions,
          filters: params.filters, sort: params.sort,
        }));

    default:
      throw new Error(`Unknown youtube action: ${action}`);
  }
}

// ─── Google Ads Executor ───

async function executeGoogleAds(action: string, params: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const service = 'google';
  const customerId = params.customerId;

  if (!customerId && action !== 'customer_list') {
    throw new Error('Google Ads requires a customerId parameter');
  }

  switch (action) {
    case 'google_ads_search':
    case 'reporting':
      return makeAuthenticatedRequest(userId, service,
        `${GOOGLE_ADS_API}/customers/${customerId}/googleAds:searchStream`, {
          method: 'POST',
          body: JSON.stringify({ query: params.query }),
        });

    case 'customer_list':
      return makeAuthenticatedRequest(userId, service,
        `${GOOGLE_ADS_API}/customers:listAccessibleCustomers`);

    case 'customer_get':
      return makeAuthenticatedRequest(userId, service,
        `${GOOGLE_ADS_API}/customers/${customerId}/googleAds:searchStream`, {
          method: 'POST',
          body: JSON.stringify({ query: `SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer WHERE customer.id = ${customerId}` }),
        });

    case 'campaign_list':
      return makeAuthenticatedRequest(userId, service,
        `${GOOGLE_ADS_API}/customers/${customerId}/googleAds:searchStream`, {
          method: 'POST',
          body: JSON.stringify({ query: params.query || 'SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type FROM campaign ORDER BY campaign.id' }),
        });

    case 'campaign_get':
      return makeAuthenticatedRequest(userId, service,
        `${GOOGLE_ADS_API}/customers/${customerId}/googleAds:searchStream`, {
          method: 'POST',
          body: JSON.stringify({ query: `SELECT campaign.id, campaign.name, campaign.status, campaign.start_date, campaign.end_date, campaign_budget.amount_micros FROM campaign WHERE campaign.id = ${params.campaignId}` }),
        });

    case 'campaign_create':
    case 'campaign_update':
    case 'campaign_remove':
    case 'campaign_budget_create':
    case 'campaign_budget_update':
    case 'ad_group_create':
    case 'ad_group_update':
    case 'ad_group_remove':
    case 'ad_group_ad_create':
    case 'ad_group_ad_update':
    case 'ad_group_ad_remove':
    case 'asset_create':
    case 'conversion_action_create':
    case 'conversion_action_update':
    case 'bidding_strategy_create':
    case 'bidding_strategy_update':
    case 'keyword_plan_create':
    case 'batch_job_create':
    case 'batch_job_add_operations':
    case 'batch_job_run':
      return makeAuthenticatedRequest(userId, service,
        `${GOOGLE_ADS_API}/customers/${customerId}/googleAds:mutate`, {
          method: 'POST',
          body: JSON.stringify({ mutateOperations: params.operations }),
        });

    case 'geo_target_constant_suggest':
      return makeAuthenticatedRequest(userId, service,
        `${GOOGLE_ADS_API}/geoTargetConstants:suggest`, {
          method: 'POST',
          body: JSON.stringify({ locale: params.locale, countryCode: params.countryCode, locationNames: params.locationNames }),
        });

    case 'offline_conversion_upload':
      return makeAuthenticatedRequest(userId, service,
        `${GOOGLE_ADS_API}/customers/${customerId}:uploadClickConversions`, {
          method: 'POST',
          body: JSON.stringify({ conversions: params.conversions, partialFailure: params.partialFailure ?? true }),
        });

    default:
      // For any list query not explicitly handled, use GAQL
      if (action.endsWith('_list')) {
        const resource = action.replace('_list', '').replace(/_/g, '_');
        return makeAuthenticatedRequest(userId, service,
          `${GOOGLE_ADS_API}/customers/${customerId}/googleAds:searchStream`, {
            method: 'POST',
            body: JSON.stringify({ query: params.query || `SELECT ${resource}.id, ${resource}.name FROM ${resource}` }),
          });
      }
      throw new Error(`Unknown google_ads action: ${action}. Use google_ads_search with a GAQL query for custom operations.`);
  }
}

// ─── Google Business Profile Executor ───

async function executeGoogleBusinessProfile(action: string, params: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const service = 'google';

  switch (action) {
    case 'account_list':
      return makeAuthenticatedRequest(userId, service,
        'https://mybusinessaccountmanagement.googleapis.com/v1/accounts');

    case 'account_get':
      return makeAuthenticatedRequest(userId, service,
        `https://mybusinessaccountmanagement.googleapis.com/v1/${params.name}`);

    case 'location_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(BUSINESS_API, `${params.parent}/locations`, { readMask: params.readMask, pageSize: params.pageSize, pageToken: params.pageToken }));

    case 'location_get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(BUSINESS_API, params.name, { readMask: params.readMask }));

    case 'location_create':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(BUSINESS_API, `${params.parent}/locations`), {
          method: 'POST',
          body: JSON.stringify(params.location || params),
        });

    case 'location_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(BUSINESS_API, params.name, { updateMask: params.updateMask }), {
          method: 'PATCH',
          body: JSON.stringify(params.location || params),
        });

    case 'location_delete':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(BUSINESS_API, params.name), { method: 'DELETE' });

    case 'review_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(BUSINESS_REVIEWS_API, `${params.parent}/reviews`, { pageSize: params.pageSize, pageToken: params.pageToken }));

    case 'review_get':
      return makeAuthenticatedRequest(userId, service,
        `${BUSINESS_REVIEWS_API}/${params.name}`);

    case 'review_reply':
      return makeAuthenticatedRequest(userId, service,
        `${BUSINESS_REVIEWS_API}/${params.name}/reply`, {
          method: 'PUT',
          body: JSON.stringify({ comment: params.comment }),
        });

    case 'review_delete_reply':
      return makeAuthenticatedRequest(userId, service,
        `${BUSINESS_REVIEWS_API}/${params.name}/reply`, { method: 'DELETE' });

    case 'post_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(BUSINESS_REVIEWS_API, `${params.parent}/localPosts`, { pageSize: params.pageSize, pageToken: params.pageToken }));

    case 'post_create':
      return makeAuthenticatedRequest(userId, service,
        `${BUSINESS_REVIEWS_API}/${params.parent}/localPosts`, {
          method: 'POST',
          body: JSON.stringify(params.post || params),
        });

    case 'post_update':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(BUSINESS_REVIEWS_API, params.name, { updateMask: params.updateMask }), {
          method: 'PATCH',
          body: JSON.stringify(params.post || params),
        });

    case 'post_delete':
      return makeAuthenticatedRequest(userId, service,
        `${BUSINESS_REVIEWS_API}/${params.name}`, { method: 'DELETE' });

    case 'media_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(BUSINESS_REVIEWS_API, `${params.parent}/media`, { pageSize: params.pageSize, pageToken: params.pageToken }));

    case 'media_get':
      return makeAuthenticatedRequest(userId, service,
        `${BUSINESS_REVIEWS_API}/${params.name}`);

    case 'media_create':
      return makeAuthenticatedRequest(userId, service,
        `${BUSINESS_REVIEWS_API}/${params.parent}/media`, {
          method: 'POST',
          body: JSON.stringify(params.media || params),
        });

    case 'media_delete':
      return makeAuthenticatedRequest(userId, service,
        `${BUSINESS_REVIEWS_API}/${params.name}`, { method: 'DELETE' });

    case 'insights_get':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(BUSINESS_REVIEWS_API, `${params.name}/reportInsights`, {}), {
          method: 'POST',
          body: JSON.stringify({
            locationNames: params.locationNames,
            basicRequest: {
              metricRequests: params.metricRequests || [{ metric: 'ALL' }],
              timeRange: params.timeRange,
            },
          }),
        });

    case 'category_list':
      return makeAuthenticatedRequest(userId, service,
        buildUrl(BUSINESS_API, 'categories', {
          regionCode: params.regionCode || 'US',
          languageCode: params.languageCode || 'en',
          filter: params.filter,
          pageSize: params.pageSize,
          pageToken: params.pageToken,
        }));

    default:
      throw new Error(`Unknown google_business_profile action: ${action}`);
  }
}

// ─── Email builder helper ───

function buildRawEmail(params: Record<string, any>): string {
  const headers: string[] = [];
  if (params.to) headers.push(`To: ${params.to}`);
  if (params.from) headers.push(`From: ${params.from}`);
  if (params.subject) headers.push(`Subject: ${params.subject}`);
  if (params.cc) headers.push(`Cc: ${params.cc}`);
  if (params.bcc) headers.push(`Bcc: ${params.bcc}`);
  if (params.inReplyTo) headers.push(`In-Reply-To: ${params.inReplyTo}`);
  headers.push('Content-Type: text/html; charset=utf-8');
  headers.push('MIME-Version: 1.0');

  const email = headers.join('\r\n') + '\r\n\r\n' + (params.body || params.htmlBody || '');

  // base64url encode
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(email).toString('base64url');
  }
  return btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ─── Main Router ───

async function execute(toolName: string, args: Record<string, any>, ctx: ExecuteContext) {
  const action = args.action as string;
  const params = (args.params || {}) as Record<string, any>;

  if (!action) throw new Error(`Missing "action" parameter for tool ${toolName}`);

  switch (toolName) {
    case 'gmail': return executeGmail(action, params, ctx);
    case 'calendar': return executeCalendar(action, params, ctx);
    case 'drive': return executeDrive(action, params, ctx);
    case 'docs': return executeDocs(action, params, ctx);
    case 'sheets': return executeSheets(action, params, ctx);
    case 'youtube': return executeYouTube(action, params, ctx);
    case 'google_ads': return executeGoogleAds(action, params, ctx);
    case 'google_business_profile': return executeGoogleBusinessProfile(action, params, ctx);
    default:
      throw new Error(`Unknown Google tool: ${toolName}`);
  }
}

// ─── Tool Definitions ───

const tools = [
  createToolGroup('gmail', 'Full Gmail API — send, read, search, label, draft, thread, settings management', [
    'send', 'reply', 'forward',
    'draft_create', 'draft_update', 'draft_send', 'draft_delete',
    'list', 'get', 'search', 'trash', 'untrash', 'delete_permanent',
    'label_list', 'label_create', 'label_update', 'label_delete', 'label_apply', 'label_remove',
    'thread_list', 'thread_get', 'thread_trash', 'thread_untrash', 'thread_modify',
    'settings_get_filters', 'settings_create_filter', 'settings_delete_filter',
    'settings_get_forwarding', 'settings_update_forwarding',
    'settings_get_vacation', 'settings_update_vacation',
    'settings_get_signature', 'settings_update_signature',
    'batch_modify', 'attachment_get', 'history_list',
  ], 'Params vary by action. For send/reply: {to, subject, body, cc, bcc}. For list/search: {q, maxResults, pageToken}. For label ops: {id, name, messageId, labelIds}. For settings: varies per setting type.'),

  createToolGroup('calendar', 'Full Google Calendar API — events, calendars, ACL, freebusy, settings', [
    'event_list', 'event_get', 'event_create', 'event_update', 'event_delete', 'event_move',
    'event_instances', 'event_quick_add',
    'calendar_list', 'calendar_get', 'calendar_create', 'calendar_update', 'calendar_delete', 'calendar_clear',
    'acl_list', 'acl_get', 'acl_create', 'acl_update', 'acl_delete',
    'freebusy_query', 'settings_list', 'settings_get', 'colors_get',
  ], 'Params: {calendarId (default: primary), eventId, event: {summary, start, end, attendees, ...}, timeMin, timeMax, q}'),

  createToolGroup('drive', 'Full Google Drive API — files, folders, permissions, comments, revisions, shared drives', [
    'file_list', 'file_get', 'file_get_content', 'file_create', 'file_update', 'file_copy',
    'file_delete', 'file_trash', 'file_untrash', 'file_empty_trash',
    'file_export', 'file_generate_ids',
    'permission_list', 'permission_get', 'permission_create', 'permission_update', 'permission_delete',
    'comment_list', 'comment_get', 'comment_create', 'comment_update', 'comment_delete',
    'reply_list', 'reply_create',
    'revision_list', 'revision_get', 'revision_delete',
    'change_list', 'change_get_start_page_token',
    'shared_drive_list', 'shared_drive_get', 'shared_drive_create', 'shared_drive_update', 'shared_drive_delete',
    'folder_create', 'folder_move',
  ], 'Params: {fileId, name, mimeType, parents, q (Drive query), role, type, emailAddress, content}'),

  createToolGroup('docs', 'Full Google Docs API — create, read, batch update, text operations', [
    'create', 'get', 'batch_update',
    'insert_text', 'delete_content', 'replace_all_text',
  ], 'Params: {documentId, title, text, index, startIndex, endIndex, findText, replaceText, requests (for batch_update)}'),

  createToolGroup('sheets', 'Full Google Sheets API — spreadsheets, values, batch operations', [
    'spreadsheet_create', 'spreadsheet_get', 'spreadsheet_batch_update',
    'values_get', 'values_update', 'values_append', 'values_clear',
    'values_batch_get', 'values_batch_update', 'values_batch_clear',
  ], 'Params: {spreadsheetId, range (e.g. "Sheet1!A1:C10"), values (2D array), valueInputOption, requests (for batch_update)}'),

  createToolGroup('youtube', 'Full YouTube API — videos, channels, playlists, comments, live, analytics', [
    'video_list', 'video_get', 'video_update', 'video_delete', 'video_rate',
    'channel_list', 'channel_update',
    'playlist_list', 'playlist_insert', 'playlist_update', 'playlist_delete',
    'playlist_item_list', 'playlist_item_insert', 'playlist_item_update', 'playlist_item_delete',
    'comment_list', 'comment_insert', 'comment_update', 'comment_delete',
    'comment_thread_list', 'comment_thread_insert',
    'subscription_list', 'subscription_insert', 'subscription_delete',
    'search', 'caption_list', 'caption_download',
    'live_broadcast_list', 'live_broadcast_insert', 'live_broadcast_update', 'live_broadcast_delete',
    'live_broadcast_bind', 'live_broadcast_transition',
    'live_stream_list', 'live_stream_insert', 'live_stream_update', 'live_stream_delete',
    'thumbnail_set', 'analytics_query',
  ], 'Params vary. For lists: {maxResults, pageToken}. For video ops: {id, video: {...}}. For search: {q, type}. For analytics: {startDate, endDate, metrics, dimensions}.'),

  createToolGroup('google_ads', 'Full Google Ads API — campaigns, ad groups, ads, audiences, keywords, reporting via GAQL', [
    'customer_list', 'customer_get',
    'campaign_list', 'campaign_get', 'campaign_create', 'campaign_update', 'campaign_remove',
    'campaign_budget_create', 'campaign_budget_update',
    'ad_group_create', 'ad_group_update', 'ad_group_remove',
    'ad_group_ad_create', 'ad_group_ad_update', 'ad_group_ad_remove',
    'asset_create', 'conversion_action_create', 'conversion_action_update',
    'bidding_strategy_create', 'bidding_strategy_update',
    'keyword_plan_create', 'geo_target_constant_suggest',
    'google_ads_search', 'reporting',
    'batch_job_create', 'batch_job_add_operations', 'batch_job_run',
    'offline_conversion_upload',
  ], 'Params: {customerId (required), query (GAQL for search/reporting), operations (for mutations), campaignId}. Use google_ads_search with GAQL for any custom query.'),

  createToolGroup('google_business_profile', 'Full Google Business Profile API — locations, reviews, posts, media, insights', [
    'account_list', 'account_get',
    'location_list', 'location_get', 'location_create', 'location_update', 'location_delete',
    'review_list', 'review_get', 'review_reply', 'review_delete_reply',
    'post_list', 'post_create', 'post_update', 'post_delete',
    'media_list', 'media_get', 'media_create', 'media_delete',
    'insights_get', 'category_list',
  ], 'Params: {parent (accounts/123/locations), name (resource name), location: {...}, comment, timeRange}'),
];

// ─── Register Server ───

export function registerGoogleServer() {
  registerServer('google', {
    name: 'AIM Google Workspace + Business',
    description: 'Full Google API access — Gmail, Calendar, Drive, Docs, Sheets, YouTube, Google Ads, Business Profile. Every endpoint, every operation.',
    tools,
    execute,
  });
}
