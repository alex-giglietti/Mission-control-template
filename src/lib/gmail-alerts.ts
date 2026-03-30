// @ts-nocheck
import fs from "fs";
import path from "path";
import { google, type gmail_v1 } from "googleapis";

const WHITELIST = new Set(
  [
    "joe@multiplyinc.com",
    "alex@multiplyinc.com",
    "phil@aimonetizationslive.com",
    "melody@multiplyinc.com",
    "emily@multiplyinc.com",
    "restrada@firstam.com",
  ].map((email) => email.toLowerCase())
);

const TELEGRAM_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  "7830035467:AAHq_EkAolQANZMPfxDpSDhX5uqbXER0Mvw";
const TELEGRAM_CHAT_ID =
  process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_WHITELIST_CHAT_ID || "1339916777";

const SERVICE_ACCOUNT_SUBJECT = "joe@multiplyinc.com";
const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

let gmailClient: gmail_v1.Gmail | null = null;

function loadServiceAccount(): Record<string, unknown> {
  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (inline) {
    return JSON.parse(inline);
  }

  const localPath = path.join(process.cwd(), "config/google-service-account.json");
  if (fs.existsSync(localPath)) {
    return JSON.parse(fs.readFileSync(localPath, "utf-8"));
  }

  throw new Error(
    "GOOGLE_SERVICE_ACCOUNT_JSON env var not set and config/google-service-account.json missing"
  );
}

async function getGmail(): Promise<gmail_v1.Gmail> {
  if (gmailClient) return gmailClient;
  const credentials = loadServiceAccount();
  const auth = new google.auth.GoogleAuth({
    credentials: credentials as any,
    scopes: GMAIL_SCOPES,
    clientOptions: { subject: SERVICE_ACCOUNT_SUBJECT },
  });
  const authClient = await auth.getClient();
  gmailClient = google.gmail({ version: "v1", auth: authClient as never });
  return gmailClient;
}

export type WhitelistedMessage = {
  id: string;
  threadId?: string;
  from: string;
  subject: string;
  snippet: string;
  bodySnippet: string;
  receivedAt?: string;
};

function messageMatchesWhitelist(fromHeader: string | undefined): boolean {
  if (!fromHeader) return false;
  const lower = fromHeader.toLowerCase();
  return Array.from(WHITELIST).some((allowed) => lower.includes(allowed));
}

function extractPlainText(payload?: gmail_v1.Schema$MessagePart): string {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }
  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      const text = extractPlainText(part);
      if (text) return text;
    }
  }
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, "base64").toString("utf-8");
  }
  return "";
}

export async function fetchWhitelistedMessagesSince(
  startHistoryId: string
): Promise<WhitelistedMessage[]> {
  if (!startHistoryId) return [];
  const gmail = await getGmail();
  const messages = new Map<string, WhitelistedMessage>();

  let pageToken: string | undefined;
  do {
    const res = await gmail.users.history.list({
      userId: "me",
      startHistoryId,
      historyTypes: ["messageAdded"],
      maxResults: 100,
      pageToken,
    });

    const history = res.data.history ?? [];
    for (const entry of history) {
      for (const added of entry.messagesAdded ?? []) {
        const msg = added.message;
        if (!msg?.id || messages.has(msg.id)) continue;
        const details = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "full",
        });
        const headers = details.data.payload?.headers ?? [];
        const from = headers.find((h) => h.name === "From")?.value;
        const subject = headers.find((h) => h.name === "Subject")?.value ?? "(no subject)";
        if (!messageMatchesWhitelist(from)) continue;
        const snippet = details.data.snippet ?? "";
        const bodySnippet = extractPlainText(details.data.payload ?? undefined).trim();
        messages.set(msg.id, {
          id: msg.id,
          threadId: details.data.threadId || undefined,
          from: from || "(unknown)",
          subject,
          snippet,
          bodySnippet: bodySnippet.slice(0, 400),
          receivedAt: details.data.internalDate
            ? new Date(Number(details.data.internalDate)).toISOString()
            : undefined,
        });
      }
    }

    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  return Array.from(messages.values());
}

export async function sendTelegramAlert(message: WhitelistedMessage) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("[gmail-alerts] Telegram creds missing; skipping alert");
    return;
  }

  const lines = [
    `📧 New email from ${message.from}`,
    `Subject: ${message.subject}`,
  ];

  if (message.receivedAt) {
    lines.push(`Received: ${new Date(message.receivedAt).toLocaleString()}`);
  }

  if (message.bodySnippet) {
    lines.push("", message.bodySnippet);
  } else if (message.snippet) {
    lines.push("", message.snippet);
  }

  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: lines.join("\n").slice(0, 3500),
  };

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("[gmail-alerts] Telegram send failed", response.status, text);
  }
}
