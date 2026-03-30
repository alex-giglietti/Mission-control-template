import { NextResponse } from "next/server";
import { validateMCPRequest, logUsage, AuthError } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limiter";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export type ExecuteActionFn = (
  toolName: string,
  args: Record<string, unknown>,
  context: { userId: string }
) => Promise<unknown>;

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcSuccessResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result: unknown;
}

interface JsonRpcErrorResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse;

// ---------------------------------------------------------------------------
// JSON-RPC error codes
// ---------------------------------------------------------------------------

const PARSE_ERROR = -32700;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;
const INTERNAL_ERROR = -32603;

// ---------------------------------------------------------------------------
// createMCPHandler
// ---------------------------------------------------------------------------

/**
 * Creates a Next.js App Router POST handler that implements the MCP protocol
 * (JSON-RPC 2.0 transport).
 *
 * @param serverName       Unique name of this MCP server (used for auth scoping and logging).
 * @param toolDefinitions  Array of tool schemas exposed by this server.
 * @param executeAction    Callback invoked when a client calls a tool.
 * @returns                An async function suitable as a Next.js `POST` export.
 */
export function createMCPHandler(
  serverName: string,
  toolDefinitions: ToolDefinition[],
  executeAction: ExecuteActionFn
) {
  return async function POST(req: Request): Promise<NextResponse<JsonRpcResponse>> {
    let rpcId: string | number | null = null;

    try {
      // ---- Auth ----
      const auth = await validateMCPRequest(req, serverName);

      // ---- Rate limiting ----
      const rateResult = checkRateLimit(auth.apiKeyId, auth.rateLimitRpm);
      if (!rateResult.allowed) {
        return NextResponse.json<JsonRpcResponse>(
          {
            jsonrpc: "2.0",
            id: null,
            error: {
              code: -32000,
              message: "Rate limit exceeded",
              data: {
                remaining: rateResult.remaining,
                resetAt: rateResult.resetAt.toISOString(),
              },
            },
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Remaining": String(rateResult.remaining),
              "X-RateLimit-Reset": rateResult.resetAt.toISOString(),
            },
          }
        );
      }

      // ---- Parse body ----
      let body: JsonRpcRequest;
      try {
        body = await req.json();
      } catch {
        return jsonRpcError(null, PARSE_ERROR, "Parse error: invalid JSON");
      }

      rpcId = body.id ?? null;

      if (body.jsonrpc !== "2.0" || typeof body.method !== "string") {
        return jsonRpcError(
          rpcId,
          INVALID_REQUEST,
          "Invalid JSON-RPC 2.0 request"
        );
      }

      // ---- Route method ----
      switch (body.method) {
        // ---- initialize ----
        case "initialize":
          return jsonRpcSuccess(rpcId, {
            protocolVersion: "2024-11-05",
            serverInfo: {
              name: serverName,
              version: "1.0.0",
            },
            capabilities: {
              tools: { listChanged: false },
            },
          });

        // ---- tools/list ----
        case "tools/list":
          return jsonRpcSuccess(rpcId, {
            tools: toolDefinitions.map((t) => ({
              name: t.name,
              description: t.description,
              inputSchema: t.inputSchema,
            })),
          });

        // ---- tools/call ----
        case "tools/call": {
          const params = body.params;
          if (
            !params ||
            typeof params.name !== "string"
          ) {
            return jsonRpcError(
              rpcId,
              INVALID_PARAMS,
              'Missing required parameter "name" for tools/call'
            );
          }

          const toolName = params.name as string;
          const toolArgs =
            (params.arguments as Record<string, unknown>) ?? {};

          // Verify tool exists
          const toolExists = toolDefinitions.some(
            (t) => t.name === toolName
          );
          if (!toolExists) {
            return jsonRpcError(
              rpcId,
              METHOD_NOT_FOUND,
              `Unknown tool: "${toolName}"`
            );
          }

          const startMs = Date.now();
          let status: "success" | "error" = "success";

          try {
            const result = await executeAction(toolName, toolArgs, {
              userId: auth.userId,
            });

            const latencyMs = Date.now() - startMs;

            // Fire-and-forget usage log
            logUsage({
              userId: auth.userId,
              apiKeyId: auth.apiKeyId,
              server: serverName,
              toolName,
              action: "tools/call",
              status: "success",
              latencyMs,
              requestSummary: summariseArgs(toolArgs),
            });

            return jsonRpcSuccess(rpcId, {
              content: [
                {
                  type: "text",
                  text:
                    typeof result === "string"
                      ? result
                      : JSON.stringify(result),
                },
              ],
            });
          } catch (execErr) {
            status = "error";
            const latencyMs = Date.now() - startMs;
            const message =
              execErr instanceof Error
                ? execErr.message
                : String(execErr);

            logUsage({
              userId: auth.userId,
              apiKeyId: auth.apiKeyId,
              server: serverName,
              toolName,
              action: "tools/call",
              status,
              latencyMs,
              requestSummary: message,
            });

            return jsonRpcError(rpcId, INTERNAL_ERROR, message);
          }
        }

        // ---- ping ----
        case "ping":
          return jsonRpcSuccess(rpcId, {});

        // ---- unknown method ----
        default:
          return jsonRpcError(
            rpcId,
            METHOD_NOT_FOUND,
            `Method not found: "${body.method}"`
          );
      }
    } catch (err) {
      // Auth / rate-limit errors surface here
      if (err instanceof AuthError) {
        return NextResponse.json<JsonRpcResponse>(
          {
            jsonrpc: "2.0",
            id: rpcId,
            error: {
              code: -32000,
              message: err.message,
            },
          },
          { status: err.statusCode }
        );
      }

      const message =
        err instanceof Error ? err.message : "Internal server error";
      return jsonRpcError(rpcId, INTERNAL_ERROR, message);
    }
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonRpcSuccess(
  id: string | number | null,
  result: unknown
): NextResponse<JsonRpcSuccessResponse> {
  return NextResponse.json({ jsonrpc: "2.0" as const, id, result });
}

function jsonRpcError(
  id: string | number | null,
  code: number,
  message: string,
  data?: unknown
): NextResponse<JsonRpcErrorResponse> {
  const payload: JsonRpcErrorResponse = {
    jsonrpc: "2.0",
    id,
    error: { code, message },
  };
  if (data !== undefined) {
    payload.error.data = data;
  }
  return NextResponse.json(payload);
}

/**
 * Create a short summary of tool arguments for the usage log. Truncates
 * the JSON representation to avoid storing huge payloads.
 */
function summariseArgs(
  args: Record<string, unknown>,
  maxLength = 500
): string {
  try {
    const json = JSON.stringify(args);
    if (json.length <= maxLength) return json;
    return json.slice(0, maxLength) + "...(truncated)";
  } catch {
    return "(unserializable)";
  }
}
