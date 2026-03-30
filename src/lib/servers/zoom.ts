import {
  registerServer,
  createToolGroup,
  makeAuthenticatedRequest,
  type ExecuteContext,
} from '@/lib/server-registry';

// ─── Zoom API v2 Base URL ───
const ZOOM_API = 'https://api.zoom.us/v2';

// ─── Helpers ───

function qs(params: Record<string, any>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

async function zoomRequest(userId: string, method: string, path: string, query?: Record<string, any>, body?: any) {
  const url = `${ZOOM_API}${path}${query ? qs(query) : ''}`;
  const options: RequestInit = { method };
  if (body) options.body = JSON.stringify(body);
  return makeAuthenticatedRequest(userId, 'zoom', url, options);
}

// ─── Meetings ───

async function executeMeetings(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const u = p.userId || 'me';
  switch (action) {
    case 'list': return zoomRequest(userId, 'GET', `/users/${u}/meetings`, { type: p.type, page_size: p.page_size, next_page_token: p.next_page_token, page_number: p.page_number });
    case 'get': return zoomRequest(userId, 'GET', `/meetings/${p.meetingId}`, { occurrence_id: p.occurrence_id, show_previous_occurrences: p.show_previous_occurrences });
    case 'create': return zoomRequest(userId, 'POST', `/users/${u}/meetings`, undefined, p.body || p);
    case 'update': return zoomRequest(userId, 'PATCH', `/meetings/${p.meetingId}`, { occurrence_id: p.occurrence_id }, p.body || p);
    case 'delete': return zoomRequest(userId, 'DELETE', `/meetings/${p.meetingId}`, { occurrence_id: p.occurrence_id, schedule_for_reminder: p.schedule_for_reminder, cancel_meeting_reminder: p.cancel_meeting_reminder });
    case 'end': return zoomRequest(userId, 'PUT', `/meetings/${p.meetingId}/status`, undefined, { action: 'end' });
    case 'registrant_list': return zoomRequest(userId, 'GET', `/meetings/${p.meetingId}/registrants`, { occurrence_id: p.occurrence_id, status: p.status, page_size: p.page_size, next_page_token: p.next_page_token, page_number: p.page_number });
    case 'registrant_create': return zoomRequest(userId, 'POST', `/meetings/${p.meetingId}/registrants`, { occurrence_ids: p.occurrence_ids }, p.body || p);
    case 'registrant_update': return zoomRequest(userId, 'PUT', `/meetings/${p.meetingId}/registrants/status`, { occurrence_id: p.occurrence_id }, p.body || p);
    case 'participant_list': return zoomRequest(userId, 'GET', `/past_meetings/${p.meetingId}/participants`, { page_size: p.page_size, next_page_token: p.next_page_token });
    case 'poll_list': return zoomRequest(userId, 'GET', `/meetings/${p.meetingId}/polls`);
    case 'poll_get': return zoomRequest(userId, 'GET', `/meetings/${p.meetingId}/polls/${p.pollId}`);
    case 'poll_create': return zoomRequest(userId, 'POST', `/meetings/${p.meetingId}/polls`, undefined, p.body || p);
    case 'poll_update': return zoomRequest(userId, 'PUT', `/meetings/${p.meetingId}/polls/${p.pollId}`, undefined, p.body || p);
    case 'poll_delete': return zoomRequest(userId, 'DELETE', `/meetings/${p.meetingId}/polls/${p.pollId}`);
    case 'poll_results': return zoomRequest(userId, 'GET', `/past_meetings/${p.meetingId}/polls`);
    case 'invitation_get': return zoomRequest(userId, 'GET', `/meetings/${p.meetingId}/invitation`);
    case 'live_stream_start': return zoomRequest(userId, 'PATCH', `/meetings/${p.meetingId}/livestream`, undefined, p.body || p);
    case 'live_stream_stop': return zoomRequest(userId, 'PATCH', `/meetings/${p.meetingId}/livestream/status`, undefined, p.body || { action: 'stop' });
    case 'live_stream_update': return zoomRequest(userId, 'PATCH', `/meetings/${p.meetingId}/livestream`, undefined, p.body || p);
    case 'batch_create': return zoomRequest(userId, 'POST', `/users/${u}/meetings/batch`, undefined, p.body || p);
    case 'template_list': return zoomRequest(userId, 'GET', `/users/${u}/meeting_templates`);
    case 'template_create': return zoomRequest(userId, 'POST', `/users/${u}/meeting_templates`, undefined, p.body || p);
    case 'occurrence_update': return zoomRequest(userId, 'PATCH', `/meetings/${p.meetingId}/occurrences/${p.occurrenceId}`, undefined, p.body || p);
    case 'occurrence_delete': return zoomRequest(userId, 'DELETE', `/meetings/${p.meetingId}`, { occurrence_id: p.occurrenceId });
    case 'registrant_questions_get': return zoomRequest(userId, 'GET', `/meetings/${p.meetingId}/registrants/questions`);
    case 'registrant_questions_update': return zoomRequest(userId, 'PATCH', `/meetings/${p.meetingId}/registrants/questions`, undefined, p.body || p);
    case 'meeting_summary_get': return zoomRequest(userId, 'GET', `/meetings/${p.meetingId}/meeting_summary`);
    case 'join_token_get': return zoomRequest(userId, 'POST', `/meetings/${p.meetingId}/jointoken/local_recording`);
    case 'sip_dialing_get': return zoomRequest(userId, 'GET', `/meetings/${p.meetingId}/sip_dialing`);
    case 'batch_registrants_create': return zoomRequest(userId, 'POST', `/meetings/${p.meetingId}/batch_registrants`, undefined, p.body || p);
    default: throw new Error(`Unknown zoom_meetings action: ${action}`);
  }
}

// ─── Webinars ───

async function executeWebinars(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const u = p.userId || 'me';
  switch (action) {
    case 'list': return zoomRequest(userId, 'GET', `/users/${u}/webinars`, { page_size: p.page_size, next_page_token: p.next_page_token, page_number: p.page_number });
    case 'get': return zoomRequest(userId, 'GET', `/webinars/${p.webinarId}`, { occurrence_id: p.occurrence_id, show_previous_occurrences: p.show_previous_occurrences });
    case 'create': return zoomRequest(userId, 'POST', `/users/${u}/webinars`, undefined, p.body || p);
    case 'update': return zoomRequest(userId, 'PATCH', `/webinars/${p.webinarId}`, { occurrence_id: p.occurrence_id }, p.body || p);
    case 'delete': return zoomRequest(userId, 'DELETE', `/webinars/${p.webinarId}`, { occurrence_id: p.occurrence_id, cancel_webinar_reminder: p.cancel_webinar_reminder });
    case 'registrant_list': return zoomRequest(userId, 'GET', `/webinars/${p.webinarId}/registrants`, { occurrence_id: p.occurrence_id, status: p.status, page_size: p.page_size, next_page_token: p.next_page_token, page_number: p.page_number });
    case 'registrant_create': return zoomRequest(userId, 'POST', `/webinars/${p.webinarId}/registrants`, { occurrence_ids: p.occurrence_ids }, p.body || p);
    case 'registrant_update': return zoomRequest(userId, 'PUT', `/webinars/${p.webinarId}/registrants/status`, { occurrence_id: p.occurrence_id }, p.body || p);
    case 'registrant_questions_get': return zoomRequest(userId, 'GET', `/webinars/${p.webinarId}/registrants/questions`);
    case 'registrant_questions_update': return zoomRequest(userId, 'PATCH', `/webinars/${p.webinarId}/registrants/questions`, undefined, p.body || p);
    case 'batch_registrants_create': return zoomRequest(userId, 'POST', `/webinars/${p.webinarId}/batch_registrants`, undefined, p.body || p);
    case 'panelist_list': return zoomRequest(userId, 'GET', `/webinars/${p.webinarId}/panelists`);
    case 'panelist_create': return zoomRequest(userId, 'POST', `/webinars/${p.webinarId}/panelists`, undefined, p.body || p);
    case 'panelist_delete': return zoomRequest(userId, 'DELETE', `/webinars/${p.webinarId}/panelists/${p.panelistId}`);
    case 'participant_list': return zoomRequest(userId, 'GET', `/past_webinars/${p.webinarId}/participants`, { page_size: p.page_size, next_page_token: p.next_page_token });
    case 'poll_list': return zoomRequest(userId, 'GET', `/webinars/${p.webinarId}/polls`);
    case 'poll_get': return zoomRequest(userId, 'GET', `/webinars/${p.webinarId}/polls/${p.pollId}`);
    case 'poll_create': return zoomRequest(userId, 'POST', `/webinars/${p.webinarId}/polls`, undefined, p.body || p);
    case 'poll_update': return zoomRequest(userId, 'PUT', `/webinars/${p.webinarId}/polls/${p.pollId}`, undefined, p.body || p);
    case 'poll_delete': return zoomRequest(userId, 'DELETE', `/webinars/${p.webinarId}/polls/${p.pollId}`);
    case 'poll_results': return zoomRequest(userId, 'GET', `/past_webinars/${p.webinarId}/polls`);
    case 'qa_list': return zoomRequest(userId, 'GET', `/past_webinars/${p.webinarId}/qa`);
    case 'absentee_list': return zoomRequest(userId, 'GET', `/past_webinars/${p.webinarId}/absentees`, { occurrence_id: p.occurrence_id, page_size: p.page_size, next_page_token: p.next_page_token });
    case 'tracking_sources_get': return zoomRequest(userId, 'GET', `/webinars/${p.webinarId}/tracking_sources`);
    case 'live_stream_start': return zoomRequest(userId, 'PATCH', `/webinars/${p.webinarId}/livestream`, undefined, p.body || p);
    case 'live_stream_stop': return zoomRequest(userId, 'PATCH', `/webinars/${p.webinarId}/livestream/status`, undefined, p.body || { action: 'stop' });
    case 'live_stream_update': return zoomRequest(userId, 'PATCH', `/webinars/${p.webinarId}/livestream`, undefined, p.body || p);
    case 'occurrence_update': return zoomRequest(userId, 'PATCH', `/webinars/${p.webinarId}/occurrences/${p.occurrenceId}`, undefined, p.body || p);
    case 'occurrence_delete': return zoomRequest(userId, 'DELETE', `/webinars/${p.webinarId}`, { occurrence_id: p.occurrenceId });
    case 'survey_get': return zoomRequest(userId, 'GET', `/webinars/${p.webinarId}/survey`);
    case 'template_list': return zoomRequest(userId, 'GET', `/users/${u}/webinar_templates`);
    case 'template_create': return zoomRequest(userId, 'POST', `/users/${u}/webinar_templates`, undefined, p.body || p);
    case 'branding_get': return zoomRequest(userId, 'GET', `/webinars/${p.webinarId}/branding`);
    case 'branding_update': return zoomRequest(userId, 'PATCH', `/webinars/${p.webinarId}/branding`, undefined, p.body || p);
    case 'invitation_get': return zoomRequest(userId, 'GET', `/webinars/${p.webinarId}/invitation`);
    default: throw new Error(`Unknown zoom_webinars action: ${action}`);
  }
}

// ─── Recordings ───

async function executeRecordings(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const u = p.userId || 'me';
  switch (action) {
    case 'list': return zoomRequest(userId, 'GET', `/users/${u}/recordings`, { from: p.from, to: p.to, page_size: p.page_size, next_page_token: p.next_page_token, trash: p.trash, trash_type: p.trash_type, mc: p.mc });
    case 'get': return zoomRequest(userId, 'GET', `/meetings/${p.meetingId}/recordings`);
    case 'delete': return p.recordingId
      ? zoomRequest(userId, 'DELETE', `/meetings/${p.meetingId}/recordings/${p.recordingId}`, { action: p.action })
      : zoomRequest(userId, 'DELETE', `/meetings/${p.meetingId}/recordings`, { action: p.action });
    case 'recover': return zoomRequest(userId, 'PUT', `/meetings/${p.meetingId}/recordings/status`, undefined, { action: 'recover' });
    case 'settings_get': return zoomRequest(userId, 'GET', `/meetings/${p.meetingId}/recordings/settings`);
    case 'settings_update': return zoomRequest(userId, 'PATCH', `/meetings/${p.meetingId}/recordings/settings`, undefined, p.body || p);
    case 'registrant_list': return zoomRequest(userId, 'GET', `/meetings/${p.meetingId}/recordings/registrants`, { status: p.status, page_size: p.page_size, next_page_token: p.next_page_token, page_number: p.page_number });
    case 'registrant_create': return zoomRequest(userId, 'POST', `/meetings/${p.meetingId}/recordings/registrants`, undefined, p.body || p);
    case 'registrant_update': return zoomRequest(userId, 'PUT', `/meetings/${p.meetingId}/recordings/registrants/status`, undefined, p.body || p);
    case 'registrant_questions_get': return zoomRequest(userId, 'GET', `/meetings/${p.meetingId}/recordings/registrants/questions`);
    case 'registrant_questions_update': return zoomRequest(userId, 'PATCH', `/meetings/${p.meetingId}/recordings/registrants/questions`, undefined, p.body || p);
    case 'analytics_summary': return zoomRequest(userId, 'GET', `/meetings/${p.meetingId}/recordings/analytics_summary`);
    case 'analytics_details': return zoomRequest(userId, 'GET', `/meetings/${p.meetingId}/recordings/analytics_details`, { page_size: p.page_size, next_page_token: p.next_page_token });
    case 'download': return zoomRequest(userId, 'GET', `/meetings/${p.meetingId}/recordings/${p.recordingId}`);
    case 'transcript_get': return zoomRequest(userId, 'GET', `/meetings/${p.meetingId}/recordings/${p.recordingId}/transcript`);
    default: throw new Error(`Unknown zoom_recordings action: ${action}`);
  }
}

// ─── Phone ───

async function executePhone(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const u = p.userId || 'me';
  switch (action) {
    case 'user_list': return zoomRequest(userId, 'GET', '/phone/users', { page_size: p.page_size, next_page_token: p.next_page_token, site_id: p.site_id, status: p.status });
    case 'user_get': return zoomRequest(userId, 'GET', `/phone/users/${u}`);
    case 'user_update': return zoomRequest(userId, 'PATCH', `/phone/users/${u}`, undefined, p.body || p);
    case 'call_log_list': return zoomRequest(userId, 'GET', `/phone/users/${u}/call_logs`, { from: p.from, to: p.to, type: p.type, page_size: p.page_size, next_page_token: p.next_page_token });
    case 'call_log_get': return zoomRequest(userId, 'GET', `/phone/call_logs/${p.callLogId}`);
    case 'recording_list': return zoomRequest(userId, 'GET', `/phone/users/${u}/recordings`, { page_size: p.page_size, next_page_token: p.next_page_token });
    case 'recording_get': return zoomRequest(userId, 'GET', `/phone/recordings/${p.recordingId}`);
    case 'recording_delete': return zoomRequest(userId, 'DELETE', `/phone/recordings/${p.recordingId}`);
    case 'voicemail_list': return zoomRequest(userId, 'GET', `/phone/users/${u}/voice_mails`, { status: p.status, page_size: p.page_size, next_page_token: p.next_page_token });
    case 'voicemail_get': return zoomRequest(userId, 'GET', `/phone/voice_mails/${p.voicemailId}`);
    case 'voicemail_delete': return zoomRequest(userId, 'DELETE', `/phone/voice_mails/${p.voicemailId}`);
    case 'sms_session_list': return zoomRequest(userId, 'GET', `/phone/users/${u}/sms/sessions`, { from: p.from, to: p.to, page_size: p.page_size, next_page_token: p.next_page_token });
    case 'sms_get': return zoomRequest(userId, 'GET', `/phone/sms/sessions/${p.sessionId}/messages`, { from: p.from, to: p.to, page_size: p.page_size, next_page_token: p.next_page_token });
    case 'sms_send': return zoomRequest(userId, 'POST', `/phone/users/${u}/sms`, undefined, p.body || p);
    case 'call_queue_list': return zoomRequest(userId, 'GET', '/phone/call_queues', { page_size: p.page_size, next_page_token: p.next_page_token });
    case 'call_queue_get': return zoomRequest(userId, 'GET', `/phone/call_queues/${p.callQueueId}`);
    case 'call_queue_create': return zoomRequest(userId, 'POST', '/phone/call_queues', undefined, p.body || p);
    case 'call_queue_update': return zoomRequest(userId, 'PATCH', `/phone/call_queues/${p.callQueueId}`, undefined, p.body || p);
    case 'call_queue_delete': return zoomRequest(userId, 'DELETE', `/phone/call_queues/${p.callQueueId}`);
    case 'call_queue_members_list': return zoomRequest(userId, 'GET', `/phone/call_queues/${p.callQueueId}/members`, { page_size: p.page_size, next_page_token: p.next_page_token });
    case 'call_queue_members_add': return zoomRequest(userId, 'POST', `/phone/call_queues/${p.callQueueId}/members`, undefined, p.body || p);
    case 'call_queue_members_remove': return zoomRequest(userId, 'DELETE', `/phone/call_queues/${p.callQueueId}/members/${p.memberId}`);
    case 'auto_receptionist_list': return zoomRequest(userId, 'GET', '/phone/auto_receptionists', { page_size: p.page_size, next_page_token: p.next_page_token });
    case 'auto_receptionist_get': return zoomRequest(userId, 'GET', `/phone/auto_receptionists/${p.autoReceptionistId}`);
    case 'auto_receptionist_update': return zoomRequest(userId, 'PATCH', `/phone/auto_receptionists/${p.autoReceptionistId}`, undefined, p.body || p);
    case 'blocked_list_get': return zoomRequest(userId, 'GET', '/phone/blocked_list', { page_size: p.page_size, next_page_token: p.next_page_token });
    case 'blocked_list_add': return zoomRequest(userId, 'POST', '/phone/blocked_list', undefined, p.body || p);
    case 'blocked_list_remove': return zoomRequest(userId, 'DELETE', `/phone/blocked_list/${p.blockedListId}`);
    case 'common_area_phone_list': return zoomRequest(userId, 'GET', '/phone/common_area_phones', { page_size: p.page_size, next_page_token: p.next_page_token });
    case 'common_area_phone_get': return zoomRequest(userId, 'GET', `/phone/common_area_phones/${p.commonAreaPhoneId}`);
    case 'number_list': return zoomRequest(userId, 'GET', '/phone/numbers', { page_size: p.page_size, next_page_token: p.next_page_token, type: p.type });
    case 'number_get': return zoomRequest(userId, 'GET', `/phone/numbers/${p.numberId}`);
    case 'number_assign': return zoomRequest(userId, 'POST', `/phone/numbers/${p.numberId}/assign`, undefined, p.body || p);
    case 'number_unassign': return zoomRequest(userId, 'POST', `/phone/numbers/${p.numberId}/unassign`, undefined, p.body || p);
    case 'site_list': return zoomRequest(userId, 'GET', '/phone/sites', { page_size: p.page_size, next_page_token: p.next_page_token });
    case 'site_get': return zoomRequest(userId, 'GET', `/phone/sites/${p.siteId}`);
    case 'site_create': return zoomRequest(userId, 'POST', '/phone/sites', undefined, p.body || p);
    case 'site_update': return zoomRequest(userId, 'PATCH', `/phone/sites/${p.siteId}`, undefined, p.body || p);
    case 'site_delete': return zoomRequest(userId, 'DELETE', `/phone/sites/${p.siteId}`);
    default: throw new Error(`Unknown zoom_phone action: ${action}`);
  }
}

// ─── Chat ───

async function executeChat(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'channel_list': return zoomRequest(userId, 'GET', '/chat/users/me/channels', { page_size: p.page_size, next_page_token: p.next_page_token });
    case 'channel_get': return zoomRequest(userId, 'GET', `/chat/channels/${p.channelId}`);
    case 'channel_create': return zoomRequest(userId, 'POST', '/chat/users/me/channels', undefined, p.body || p);
    case 'channel_update': return zoomRequest(userId, 'PATCH', `/chat/channels/${p.channelId}`, undefined, p.body || p);
    case 'channel_delete': return zoomRequest(userId, 'DELETE', `/chat/channels/${p.channelId}`);
    case 'channel_members_list': return zoomRequest(userId, 'GET', `/chat/channels/${p.channelId}/members`, { page_size: p.page_size, next_page_token: p.next_page_token });
    case 'channel_member_invite': return zoomRequest(userId, 'POST', `/chat/channels/${p.channelId}/members`, undefined, p.body || p);
    case 'channel_member_remove': return zoomRequest(userId, 'DELETE', `/chat/channels/${p.channelId}/members/${p.memberId}`);
    case 'message_list': return zoomRequest(userId, 'GET', '/chat/users/me/messages', { to_channel: p.to_channel, to_contact: p.to_contact, date: p.date, from: p.from, to: p.to, page_size: p.page_size, next_page_token: p.next_page_token, include_deleted_and_edited_message: p.include_deleted_and_edited_message });
    case 'message_get': return zoomRequest(userId, 'GET', `/chat/users/me/messages/${p.messageId}`, { to_channel: p.to_channel, to_contact: p.to_contact });
    case 'message_send': return zoomRequest(userId, 'POST', '/chat/users/me/messages', undefined, p.body || p);
    case 'message_update': return zoomRequest(userId, 'PUT', `/chat/users/me/messages/${p.messageId}`, undefined, p.body || p);
    case 'message_delete': return zoomRequest(userId, 'DELETE', `/chat/users/me/messages/${p.messageId}`, { to_channel: p.to_channel, to_contact: p.to_contact });
    case 'message_reply': return zoomRequest(userId, 'POST', `/chat/users/me/messages/${p.messageId}/reply`, undefined, p.body || p);
    case 'message_react': return zoomRequest(userId, 'POST', `/chat/users/me/messages/${p.messageId}/reactions`, undefined, p.body || p);
    case 'file_send': return zoomRequest(userId, 'POST', '/chat/users/me/messages/files', undefined, p.body || p);
    case 'user_contacts_list': return zoomRequest(userId, 'GET', '/chat/users/me/contacts', { type: p.type, page_size: p.page_size, next_page_token: p.next_page_token });
    case 'user_contacts_get': return zoomRequest(userId, 'GET', `/chat/users/me/contacts/${p.contactId}`);
    case 'user_presence_get': return zoomRequest(userId, 'GET', '/chat/users/me/presence');
    case 'user_presence_update': return zoomRequest(userId, 'PUT', '/chat/users/me/presence/status', undefined, p.body || p);
    case 'search_messages': return zoomRequest(userId, 'GET', '/chat/users/me/messages/search', { search_key: p.search_key, page_size: p.page_size, next_page_token: p.next_page_token });
    default: throw new Error(`Unknown zoom_chat action: ${action}`);
  }
}

// ─── Users ───

async function executeUsers(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const u = p.userId || 'me';
  switch (action) {
    case 'list': return zoomRequest(userId, 'GET', '/users', { status: p.status, page_size: p.page_size, page_number: p.page_number, next_page_token: p.next_page_token, role_id: p.role_id });
    case 'get': return zoomRequest(userId, 'GET', `/users/${u}`);
    case 'create': return zoomRequest(userId, 'POST', '/users', undefined, p.body || p);
    case 'update': return zoomRequest(userId, 'PATCH', `/users/${u}`, undefined, p.body || p);
    case 'delete': return zoomRequest(userId, 'DELETE', `/users/${u}`, { action: p.action, transfer_email: p.transfer_email, transfer_meeting: p.transfer_meeting, transfer_webinar: p.transfer_webinar, transfer_recording: p.transfer_recording });
    case 'pending_list': return zoomRequest(userId, 'GET', '/users', { status: 'pending', page_size: p.page_size, page_number: p.page_number, next_page_token: p.next_page_token });
    case 'settings_get': return zoomRequest(userId, 'GET', `/users/${u}/settings`, { login_type: p.login_type, option: p.option, custom_query_fields: p.custom_query_fields });
    case 'settings_update': return zoomRequest(userId, 'PATCH', `/users/${u}/settings`, { option: p.option }, p.body || p);
    case 'permissions_get': return zoomRequest(userId, 'GET', `/users/${u}/permissions`);
    case 'token_get': return zoomRequest(userId, 'GET', `/users/${u}/token`, { type: p.type, ttl: p.ttl });
    case 'token_delete': return zoomRequest(userId, 'DELETE', `/users/${u}/token`);
    case 'password_update': return zoomRequest(userId, 'PUT', `/users/${u}/password`, undefined, p.body || p);
    case 'email_update': return zoomRequest(userId, 'PUT', `/users/${u}/email`, undefined, p.body || p);
    case 'status_update': return zoomRequest(userId, 'PUT', `/users/${u}/status`, undefined, p.body || p);
    case 'assistants_list': return zoomRequest(userId, 'GET', `/users/${u}/assistants`);
    case 'assistants_add': return zoomRequest(userId, 'POST', `/users/${u}/assistants`, undefined, p.body || p);
    case 'assistants_delete': return zoomRequest(userId, 'DELETE', `/users/${u}/assistants/${p.assistantId}`);
    case 'schedulers_list': return zoomRequest(userId, 'GET', `/users/${u}/schedulers`);
    case 'schedulers_delete': return zoomRequest(userId, 'DELETE', `/users/${u}/schedulers/${p.schedulerId}`);
    case 'meetings_list': return zoomRequest(userId, 'GET', `/users/${u}/meetings`, { type: p.type, page_size: p.page_size, next_page_token: p.next_page_token, page_number: p.page_number });
    case 'webinars_list': return zoomRequest(userId, 'GET', `/users/${u}/webinars`, { page_size: p.page_size, next_page_token: p.next_page_token, page_number: p.page_number });
    case 'recordings_list': return zoomRequest(userId, 'GET', `/users/${u}/recordings`, { from: p.from, to: p.to, page_size: p.page_size, next_page_token: p.next_page_token, trash: p.trash, trash_type: p.trash_type });
    default: throw new Error(`Unknown zoom_users action: ${action}`);
  }
}

// ─── Reports ───

async function executeReports(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const u = p.userId || 'me';
  switch (action) {
    case 'daily_usage': return zoomRequest(userId, 'GET', '/report/daily', { year: p.year, month: p.month });
    case 'meeting_list': return zoomRequest(userId, 'GET', `/report/users/${u}/meetings`, { from: p.from, to: p.to, page_size: p.page_size, next_page_token: p.next_page_token, type: p.type });
    case 'meeting_details': return zoomRequest(userId, 'GET', `/report/meetings/${p.meetingId}`);
    case 'meeting_participants': return zoomRequest(userId, 'GET', `/report/meetings/${p.meetingId}/participants`, { page_size: p.page_size, next_page_token: p.next_page_token, include_fields: p.include_fields });
    case 'webinar_list': return zoomRequest(userId, 'GET', `/report/users/${u}/webinars`, { from: p.from, to: p.to, page_size: p.page_size, next_page_token: p.next_page_token, type: p.type });
    case 'webinar_details': return zoomRequest(userId, 'GET', `/report/webinars/${p.webinarId}`);
    case 'webinar_participants': return zoomRequest(userId, 'GET', `/report/webinars/${p.webinarId}/participants`, { page_size: p.page_size, next_page_token: p.next_page_token, include_fields: p.include_fields });
    case 'webinar_qa': return zoomRequest(userId, 'GET', `/report/webinars/${p.webinarId}/qa`);
    case 'webinar_polls': return zoomRequest(userId, 'GET', `/report/webinars/${p.webinarId}/polls`);
    case 'telephone_report': return zoomRequest(userId, 'GET', '/report/telephone', { from: p.from, to: p.to, type: p.type, page_size: p.page_size, next_page_token: p.next_page_token, query_date_type: p.query_date_type });
    case 'cloud_recording_usage': return zoomRequest(userId, 'GET', '/report/cloud_recording', { from: p.from, to: p.to, page_size: p.page_size, next_page_token: p.next_page_token });
    case 'operation_logs': return zoomRequest(userId, 'GET', '/report/operationlogs', { from: p.from, to: p.to, page_size: p.page_size, next_page_token: p.next_page_token, category_type: p.category_type });
    case 'upcoming_events': return zoomRequest(userId, 'GET', '/report/upcoming_events', { from: p.from, to: p.to, page_size: p.page_size, next_page_token: p.next_page_token, type: p.type });
    case 'active_hosts': return zoomRequest(userId, 'GET', '/report/users', { from: p.from, to: p.to, type: p.type, page_size: p.page_size, next_page_token: p.next_page_token, page_number: p.page_number });
    default: throw new Error(`Unknown zoom_reports action: ${action}`);
  }
}

// ─── Groups ───

async function executeGroups(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return zoomRequest(userId, 'GET', '/groups');
    case 'get': return zoomRequest(userId, 'GET', `/groups/${p.groupId}`);
    case 'create': return zoomRequest(userId, 'POST', '/groups', undefined, p.body || p);
    case 'update': return zoomRequest(userId, 'PATCH', `/groups/${p.groupId}`, undefined, p.body || p);
    case 'delete': return zoomRequest(userId, 'DELETE', `/groups/${p.groupId}`);
    case 'members_list': return zoomRequest(userId, 'GET', `/groups/${p.groupId}/members`, { page_size: p.page_size, next_page_token: p.next_page_token, page_number: p.page_number });
    case 'members_add': return zoomRequest(userId, 'POST', `/groups/${p.groupId}/members`, undefined, p.body || p);
    case 'members_delete': return zoomRequest(userId, 'DELETE', `/groups/${p.groupId}/members/${p.memberId}`);
    case 'settings_get': return zoomRequest(userId, 'GET', `/groups/${p.groupId}/settings`, { option: p.option });
    case 'settings_update': return zoomRequest(userId, 'PATCH', `/groups/${p.groupId}/settings`, { option: p.option }, p.body || p);
    default: throw new Error(`Unknown zoom_groups action: ${action}`);
  }
}

// ─── Contacts ───

async function executeContacts(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return zoomRequest(userId, 'GET', '/contacts', { type: p.type, page_size: p.page_size, next_page_token: p.next_page_token, search_key: p.search_key });
    case 'get': return zoomRequest(userId, 'GET', `/contacts/${p.contactId}`, { query_presence_status: p.query_presence_status });
    case 'search': return zoomRequest(userId, 'GET', '/contacts/search', { search_key: p.search_key, page_size: p.page_size, next_page_token: p.next_page_token, contact_types: p.contact_types });
    default: throw new Error(`Unknown zoom_contacts action: ${action}`);
  }
}

// ─── Rooms ───

async function executeRooms(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return zoomRequest(userId, 'GET', '/rooms', { page_size: p.page_size, next_page_token: p.next_page_token, status: p.status, type: p.type, location_id: p.location_id });
    case 'get': return zoomRequest(userId, 'GET', `/rooms/${p.roomId}`);
    case 'create': return zoomRequest(userId, 'POST', '/rooms', undefined, p.body || p);
    case 'update': return zoomRequest(userId, 'PATCH', `/rooms/${p.roomId}`, undefined, p.body || p);
    case 'delete': return zoomRequest(userId, 'DELETE', `/rooms/${p.roomId}`);
    case 'devices_list': return zoomRequest(userId, 'GET', `/rooms/${p.roomId}/devices`);
    case 'settings_get': return zoomRequest(userId, 'GET', `/rooms/${p.roomId}/settings`, { setting_type: p.setting_type });
    case 'settings_update': return zoomRequest(userId, 'PATCH', `/rooms/${p.roomId}/settings`, { setting_type: p.setting_type }, p.body || p);
    default: throw new Error(`Unknown zoom_rooms action: ${action}`);
  }
}

// ─── Events ───

async function executeEvents(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'hub_list': return zoomRequest(userId, 'GET', '/events/hubs', { page_size: p.page_size, next_page_token: p.next_page_token });
    case 'hub_get': return zoomRequest(userId, 'GET', `/events/hubs/${p.hubId}`);
    case 'event_list': return zoomRequest(userId, 'GET', `/events/hubs/${p.hubId}/events`, { page_size: p.page_size, next_page_token: p.next_page_token });
    case 'event_get': return zoomRequest(userId, 'GET', `/events/${p.eventId}`);
    case 'session_list': return zoomRequest(userId, 'GET', `/events/${p.eventId}/sessions`, { page_size: p.page_size, next_page_token: p.next_page_token });
    case 'session_get': return zoomRequest(userId, 'GET', `/events/${p.eventId}/sessions/${p.sessionId}`);
    case 'ticket_list': return zoomRequest(userId, 'GET', `/events/${p.eventId}/tickets`, { page_size: p.page_size, next_page_token: p.next_page_token });
    case 'ticket_get': return zoomRequest(userId, 'GET', `/events/${p.eventId}/tickets/${p.ticketId}`);
    case 'registration_list': return zoomRequest(userId, 'GET', `/events/${p.eventId}/registrations`, { page_size: p.page_size, next_page_token: p.next_page_token, status: p.status });
    case 'registration_get': return zoomRequest(userId, 'GET', `/events/${p.eventId}/registrations/${p.registrationId}`);
    default: throw new Error(`Unknown zoom_events action: ${action}`);
  }
}

// ─── Account ───

async function executeAccount(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  const acct = p.accountId || 'me';
  switch (action) {
    case 'settings_get': return zoomRequest(userId, 'GET', `/accounts/${acct}/settings`, { option: p.option });
    case 'settings_update': return zoomRequest(userId, 'PATCH', `/accounts/${acct}/settings`, { option: p.option }, p.body || p);
    case 'trusted_domains_get': return zoomRequest(userId, 'GET', `/accounts/${acct}/trusted_domains`);
    case 'vanity_name_check': return zoomRequest(userId, 'GET', '/users/vanity_name', { vanity_name: p.vanity_name });
    case 'plan_list': return zoomRequest(userId, 'GET', `/accounts/${acct}/plans`);
    case 'plan_subscribe': return zoomRequest(userId, 'POST', `/accounts/${acct}/plans`, undefined, p.body || p);
    case 'plan_update': return zoomRequest(userId, 'PUT', `/accounts/${acct}/plans`, undefined, p.body || p);
    default: throw new Error(`Unknown zoom_account action: ${action}`);
  }
}

// ─── Main Router ───

async function execute(toolName: string, args: Record<string, any>, ctx: ExecuteContext) {
  const action = args.action as string;
  const params = (args.params || {}) as Record<string, any>;

  if (!action) throw new Error(`Missing "action" parameter for tool ${toolName}`);

  switch (toolName) {
    case 'zoom_meetings': return executeMeetings(action, params, ctx);
    case 'zoom_webinars': return executeWebinars(action, params, ctx);
    case 'zoom_recordings': return executeRecordings(action, params, ctx);
    case 'zoom_phone': return executePhone(action, params, ctx);
    case 'zoom_chat': return executeChat(action, params, ctx);
    case 'zoom_users': return executeUsers(action, params, ctx);
    case 'zoom_reports': return executeReports(action, params, ctx);
    case 'zoom_groups': return executeGroups(action, params, ctx);
    case 'zoom_contacts': return executeContacts(action, params, ctx);
    case 'zoom_rooms': return executeRooms(action, params, ctx);
    case 'zoom_events': return executeEvents(action, params, ctx);
    case 'zoom_account': return executeAccount(action, params, ctx);
    default:
      throw new Error(`Unknown Zoom tool: ${toolName}`);
  }
}

// ─── Tool Definitions (ALL 12 categories) ───

const tools = [
  createToolGroup('zoom_meetings', 'Full Zoom meeting lifecycle — create, update, delete, end, registrants, participants, polls, invitations, live streaming, templates, occurrences, summaries, batch operations', [
    'list', 'get', 'create', 'update', 'delete', 'end',
    'registrant_list', 'registrant_create', 'registrant_update',
    'participant_list',
    'poll_list', 'poll_get', 'poll_create', 'poll_update', 'poll_delete', 'poll_results',
    'invitation_get',
    'live_stream_start', 'live_stream_stop', 'live_stream_update',
    'batch_create', 'template_list', 'template_create',
    'occurrence_update', 'occurrence_delete',
    'registrant_questions_get', 'registrant_questions_update',
    'meeting_summary_get', 'join_token_get', 'sip_dialing_get',
    'batch_registrants_create',
  ], 'Params: {userId, meetingId, pollId, occurrenceId, body, type, page_size, next_page_token, page_number, occurrence_id, status}'),

  createToolGroup('zoom_webinars', 'Full Zoom webinar management — create, update, registrants, panelists, polls, Q&A, absentees, tracking, live streaming, branding, surveys, templates', [
    'list', 'get', 'create', 'update', 'delete',
    'registrant_list', 'registrant_create', 'registrant_update',
    'registrant_questions_get', 'registrant_questions_update',
    'batch_registrants_create',
    'panelist_list', 'panelist_create', 'panelist_delete',
    'participant_list',
    'poll_list', 'poll_get', 'poll_create', 'poll_update', 'poll_delete', 'poll_results',
    'qa_list', 'absentee_list', 'tracking_sources_get',
    'live_stream_start', 'live_stream_stop', 'live_stream_update',
    'occurrence_update', 'occurrence_delete',
    'survey_get', 'template_list', 'template_create',
    'branding_get', 'branding_update', 'invitation_get',
  ], 'Params: {userId, webinarId, pollId, panelistId, occurrenceId, body, page_size, next_page_token, page_number, status}'),

  createToolGroup('zoom_recordings', 'Zoom cloud recording management — list, get, delete, recover, settings, registrants, analytics, transcripts', [
    'list', 'get', 'delete', 'recover',
    'settings_get', 'settings_update',
    'registrant_list', 'registrant_create', 'registrant_update',
    'registrant_questions_get', 'registrant_questions_update',
    'analytics_summary', 'analytics_details',
    'download', 'transcript_get',
  ], 'Params: {userId, meetingId, recordingId, body, from, to, page_size, next_page_token, trash, trash_type, action, status}'),

  createToolGroup('zoom_phone', 'Zoom Phone system — users, call logs, recordings, voicemail, SMS, call queues, auto receptionists, blocked list, common area phones, numbers, sites', [
    'user_list', 'user_get', 'user_update',
    'call_log_list', 'call_log_get',
    'recording_list', 'recording_get', 'recording_delete',
    'voicemail_list', 'voicemail_get', 'voicemail_delete',
    'sms_session_list', 'sms_get', 'sms_send',
    'call_queue_list', 'call_queue_get', 'call_queue_create', 'call_queue_update', 'call_queue_delete',
    'call_queue_members_list', 'call_queue_members_add', 'call_queue_members_remove',
    'auto_receptionist_list', 'auto_receptionist_get', 'auto_receptionist_update',
    'blocked_list_get', 'blocked_list_add', 'blocked_list_remove',
    'common_area_phone_list', 'common_area_phone_get',
    'number_list', 'number_get', 'number_assign', 'number_unassign',
    'site_list', 'site_get', 'site_create', 'site_update', 'site_delete',
  ], 'Params: {userId, callLogId, recordingId, voicemailId, sessionId, callQueueId, memberId, autoReceptionistId, blockedListId, commonAreaPhoneId, numberId, siteId, body, from, to, type, status, page_size, next_page_token, site_id}'),

  createToolGroup('zoom_chat', 'Zoom Team Chat — channels, members, messages, replies, reactions, files, contacts, presence, search', [
    'channel_list', 'channel_get', 'channel_create', 'channel_update', 'channel_delete',
    'channel_members_list', 'channel_member_invite', 'channel_member_remove',
    'message_list', 'message_get', 'message_send', 'message_update', 'message_delete',
    'message_reply', 'message_react', 'file_send',
    'user_contacts_list', 'user_contacts_get',
    'user_presence_get', 'user_presence_update',
    'search_messages',
  ], 'Params: {channelId, memberId, messageId, contactId, body, to_channel, to_contact, date, search_key, type, page_size, next_page_token}'),

  createToolGroup('zoom_users', 'Zoom user management — CRUD, settings, permissions, tokens, passwords, emails, status, assistants, schedulers, list meetings/webinars/recordings', [
    'list', 'get', 'create', 'update', 'delete',
    'pending_list', 'settings_get', 'settings_update',
    'permissions_get', 'token_get', 'token_delete',
    'password_update', 'email_update', 'status_update',
    'assistants_list', 'assistants_add', 'assistants_delete',
    'schedulers_list', 'schedulers_delete',
    'meetings_list', 'webinars_list', 'recordings_list',
  ], 'Params: {userId, assistantId, schedulerId, body, status, action, role_id, login_type, option, from, to, type, page_size, next_page_token, page_number}'),

  createToolGroup('zoom_reports', 'Zoom reporting — daily usage, meetings, webinars, participants, Q&A, polls, telephone, cloud recording, operation logs, upcoming events, active hosts', [
    'daily_usage', 'meeting_list', 'meeting_details', 'meeting_participants',
    'webinar_list', 'webinar_details', 'webinar_participants', 'webinar_qa', 'webinar_polls',
    'telephone_report', 'cloud_recording_usage', 'operation_logs',
    'upcoming_events', 'active_hosts',
  ], 'Params: {userId, meetingId, webinarId, from, to, year, month, type, query_date_type, category_type, include_fields, page_size, next_page_token, page_number}'),

  createToolGroup('zoom_groups', 'Zoom user groups — CRUD, members, settings', [
    'list', 'get', 'create', 'update', 'delete',
    'members_list', 'members_add', 'members_delete',
    'settings_get', 'settings_update',
  ], 'Params: {groupId, memberId, body, option, page_size, next_page_token, page_number}'),

  createToolGroup('zoom_contacts', 'Zoom contact management — list, get, search', [
    'list', 'get', 'search',
  ], 'Params: {contactId, search_key, type, contact_types, query_presence_status, page_size, next_page_token}'),

  createToolGroup('zoom_rooms', 'Zoom Rooms — CRUD, devices, settings', [
    'list', 'get', 'create', 'update', 'delete',
    'devices_list', 'settings_get', 'settings_update',
  ], 'Params: {roomId, body, status, type, location_id, setting_type, page_size, next_page_token}'),

  createToolGroup('zoom_events', 'Zoom Events — hubs, events, sessions, tickets, registrations', [
    'hub_list', 'hub_get',
    'event_list', 'event_get',
    'session_list', 'session_get',
    'ticket_list', 'ticket_get',
    'registration_list', 'registration_get',
  ], 'Params: {hubId, eventId, sessionId, ticketId, registrationId, status, page_size, next_page_token}'),

  createToolGroup('zoom_account', 'Zoom account settings — settings, trusted domains, vanity name, plans', [
    'settings_get', 'settings_update',
    'trusted_domains_get', 'vanity_name_check',
    'plan_list', 'plan_subscribe', 'plan_update',
  ], 'Params: {accountId, vanity_name, option, body}'),
];

// ─── Register Server ───

export function registerZoomServer() {
  registerServer('zoom', {
    name: 'AIM Zoom',
    description: 'Full Zoom API v2 access — ALL 12 API categories, 200+ operations. Meetings, webinars, recordings, phone, chat, users, reports, groups, contacts, rooms, events, and account settings.',
    tools,
    execute,
  });
}
