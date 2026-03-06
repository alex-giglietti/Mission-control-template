// Solomon Webhook Client
// Helper for calling the Solomon webhook from chat components

export type PhaseType = "vision" | "brand" | "character";
export type ActionType = "process" | "iterate" | "lock";

export interface WebhookRequest {
  type: PhaseType;
  action: ActionType;
  data: string;
  businessName: string;
  feedback?: string;
}

export interface WebhookResponse {
  status: "processing" | "complete" | "error";
  deliverable?: string;
  preview?: string;
  message?: string;
  fileUrl?: string;
  signal?: string;
}

/**
 * Call the Solomon webhook to process, iterate, or lock a deliverable
 */
export async function callSolomonWebhook(
  request: WebhookRequest
): Promise<WebhookResponse> {
  try {
    const response = await fetch("/api/webhook/solomon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[webhook-client] Error:", error);
    return {
      status: "error",
      message: String(error),
    };
  }
}

/**
 * Process the current chat state and generate a deliverable
 */
export async function processPhase(
  type: PhaseType,
  businessName: string,
  chatTranscript: string
): Promise<WebhookResponse> {
  return callSolomonWebhook({
    type,
    action: "process",
    data: chatTranscript,
    businessName,
  });
}

/**
 * Iterate on a deliverable with user feedback
 */
export async function iterateDeliverable(
  type: PhaseType,
  businessName: string,
  chatTranscript: string,
  feedback: string
): Promise<WebhookResponse> {
  return callSolomonWebhook({
    type,
    action: "iterate",
    data: chatTranscript,
    businessName,
    feedback,
  });
}

/**
 * Lock the deliverable and save to Google Drive
 */
export async function lockDeliverable(
  type: PhaseType,
  businessName: string,
  chatTranscript: string
): Promise<WebhookResponse> {
  return callSolomonWebhook({
    type,
    action: "lock",
    data: chatTranscript,
    businessName,
  });
}

/**
 * Format messages array into a chat transcript string
 */
export function formatChatTranscript(
  messages: { role: string; content: string }[],
  agentName: string = "Agent"
): string {
  return messages
    .map((m) => `${m.role === "user" ? "User" : agentName}: ${m.content}`)
    .join("\n\n");
}
