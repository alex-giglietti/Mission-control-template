import { NextRequest } from 'next/server';
import { validateMCPRequest, logUsage } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limiter';
import { getServerRegistry } from '@/lib/server-registry';
import { ensureServersRegistered } from '@/lib/servers';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Ensure all MCP servers are registered before handling requests
ensureServersRegistered();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ server: string }> }
) {
  const startTime = Date.now();
  const { server } = await params;

  try {
    // 1. Validate API key and get user context
    const { userId, apiKeyId, plan, rateLimitRpm } = await validateMCPRequest(req, server);

    // 2. Check rate limit
    const rateCheck = checkRateLimit(apiKeyId, rateLimitRpm);
    if (!rateCheck.allowed) {
      return Response.json(
        {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32000,
            message: `Rate limit exceeded. Resets at ${rateCheck.resetAt.toISOString()}`,
            data: { remaining: rateCheck.remaining, resetAt: rateCheck.resetAt.toISOString() },
          },
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': String(rateCheck.remaining),
            'X-RateLimit-Reset': rateCheck.resetAt.toISOString(),
          },
        }
      );
    }

    // 3. Parse JSON-RPC request
    const body = await req.json();
    const { method, id, params: rpcParams } = body;

    // 4. Get server definition from registry
    const serverDef = getServerRegistry(server);
    if (!serverDef) {
      return Response.json({
        jsonrpc: '2.0',
        id: id ?? null,
        error: { code: -32601, message: `Unknown server: ${server}` },
      }, { status: 404 });
    }

    // 5. Handle MCP protocol methods
    switch (method) {
      case 'initialize': {
        return Response.json({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: { listChanged: false },
            },
            serverInfo: {
              name: `aim-${server}`,
              version: '1.0.0',
            },
          },
        });
      }

      case 'notifications/initialized': {
        return Response.json({ jsonrpc: '2.0', id, result: {} });
      }

      case 'ping': {
        return Response.json({ jsonrpc: '2.0', id, result: {} });
      }

      case 'tools/list': {
        return Response.json({
          jsonrpc: '2.0',
          id,
          result: { tools: serverDef.tools },
        });
      }

      case 'tools/call': {
        const toolName = rpcParams?.name;
        const args = rpcParams?.arguments || {};

        if (!toolName) {
          return Response.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: 'Missing tool name' },
          }, { status: 400 });
        }

        // Find the tool definition
        const tool = serverDef.tools.find((t: { name: string }) => t.name === toolName);
        if (!tool) {
          return Response.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Unknown tool: ${toolName}` },
          }, { status: 404 });
        }

        try {
          // Execute the tool action
          const result = await serverDef.execute(toolName, args, { userId, server });

          const latencyMs = Date.now() - startTime;

          // Log usage asynchronously (don't await)
          logUsage({
            userId,
            apiKeyId,
            server,
            toolName,
            action: args.action || null,
            status: 'success',
            latencyMs,
            requestSummary: { action: args.action, paramsKeys: Object.keys(args.params || {}) },
          }).catch(console.error);

          return Response.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
                },
              ],
            },
          });
        } catch (toolError: any) {
          const latencyMs = Date.now() - startTime;

          logUsage({
            userId,
            apiKeyId,
            server,
            toolName,
            action: args.action || null,
            status: 'error',
            latencyMs,
            requestSummary: { error: toolError.message },
          }).catch(console.error);

          return Response.json({
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({ error: toolError.message }, null, 2),
                },
              ],
              isError: true,
            },
          });
        }
      }

      default: {
        return Response.json({
          jsonrpc: '2.0',
          id: id ?? null,
          error: { code: -32601, message: `Method not found: ${method}` },
        }, { status: 404 });
      }
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    console.error(`MCP ${server} error:`, err);

    // Auth errors
    if (err.message?.includes('Unauthorized') || err.message?.includes('Invalid API key')) {
      return Response.json({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32000, message: err.message },
      }, { status: 401 });
    }

    return Response.json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32603, message: err.message || 'Internal server error' },
    }, { status: 500 });
  }
}
