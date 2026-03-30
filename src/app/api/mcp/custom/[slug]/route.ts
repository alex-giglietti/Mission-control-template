import { NextRequest } from 'next/server';
import { validateMCPRequest, logUsage } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limiter';
import { createServiceClient } from '@/lib/supabase';
import { getValidToken, getApiKeyToken } from '@/lib/token-refresh';

export const runtime = 'nodejs';
export const maxDuration = 60;

async function getConnectorAuth(
  connector: any,
  userId: string
): Promise<Record<string, string>> {
  switch (connector.auth_type) {
    case 'oauth2': {
      const { accessToken, tokenType } = await getValidToken(userId, `custom:${connector.slug}`);
      return { Authorization: `${tokenType} ${accessToken}` };
    }
    case 'api_key': {
      const apiKey = await getApiKeyToken(userId, `custom:${connector.slug}`);
      // Check default_headers for the header name, default to Authorization
      const headerName = connector.default_headers?.['auth_header_name'] || 'Authorization';
      const prefix = connector.default_headers?.['auth_prefix'] || 'Bearer';
      return { [headerName]: prefix ? `${prefix} ${apiKey}` : apiKey };
    }
    case 'bearer': {
      const token = await getApiKeyToken(userId, `custom:${connector.slug}`);
      return { Authorization: `Bearer ${token}` };
    }
    default:
      return {};
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const startTime = Date.now();
  const { slug } = await params;
  const serverName = `custom:${slug}`;

  try {
    // 1. Validate API key
    const { userId, apiKeyId, rateLimitRpm } = await validateMCPRequest(req, serverName);

    // 2. Rate limit
    const rateCheck = checkRateLimit(apiKeyId, rateLimitRpm);
    if (!rateCheck.allowed) {
      return Response.json({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32000,
          message: `Rate limit exceeded. Resets at ${rateCheck.resetAt.toISOString()}`,
        },
      }, { status: 429 });
    }

    // 3. Load the custom connector config
    const supabase = createServiceClient();
    const { data: connector, error: connError } = await supabase
      .from('custom_connectors')
      .select('*')
      .eq('user_id', userId)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (connError || !connector) {
      return Response.json({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32000, message: 'Connector not found' },
      }, { status: 404 });
    }

    // 4. Parse request
    const body = await req.json();
    const { method, id, params: rpcParams } = body;

    switch (method) {
      case 'initialize': {
        return Response.json({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: { listChanged: false } },
            serverInfo: { name: `aim-custom-${slug}`, version: '1.0.0' },
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
          result: {
            tools: [
              {
                name: `${slug}_request`,
                description: `Make an API request to ${connector.name}`,
                inputSchema: {
                  type: 'object',
                  properties: {
                    method: {
                      type: 'string',
                      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                      description: 'HTTP method',
                    },
                    path: {
                      type: 'string',
                      description: 'API endpoint path (appended to base URL)',
                    },
                    body: {
                      type: 'object',
                      description: 'Request body (for POST/PUT/PATCH)',
                    },
                    query: {
                      type: 'object',
                      description: 'Query parameters',
                    },
                    headers: {
                      type: 'object',
                      description: 'Additional headers',
                    },
                  },
                  required: ['method', 'path'],
                },
              },
            ],
          },
        });
      }

      case 'tools/call': {
        const args = rpcParams?.arguments || {};
        const { method: httpMethod, path, body: reqBody, query, headers: extraHeaders } = args;

        // Build auth headers
        const authHeaders = await getConnectorAuth(connector, userId);

        // Build URL
        const url = new URL(path, connector.base_url);
        if (query) {
          Object.entries(query).forEach(([k, v]) =>
            url.searchParams.set(k, v as string)
          );
        }

        // Build merged headers
        const defaultHeaders = connector.default_headers || {};
        // Remove internal auth config keys from headers
        const { auth_header_name, auth_prefix, ...cleanDefaults } = defaultHeaders;

        const mergedHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...cleanDefaults,
          ...authHeaders,
          ...(extraHeaders || {}),
        };

        // Make the proxied request
        const response = await fetch(url.toString(), {
          method: httpMethod,
          headers: mergedHeaders,
          body: reqBody ? JSON.stringify(reqBody) : undefined,
        });

        let data: any;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        const latencyMs = Date.now() - startTime;

        logUsage({
          userId,
          apiKeyId,
          server: serverName,
          toolName: `${slug}_request`,
          action: `${httpMethod} ${path}`,
          status: response.ok ? 'success' : 'error',
          latencyMs,
          requestSummary: { method: httpMethod, path, status: response.status },
        }).catch(console.error);

        // Update last_used
        supabase
          .from('connection_status')
          .update({ last_used_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('service', serverName)
          .then(() => {});

        return Response.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
              },
            ],
            ...(response.ok ? {} : { isError: true }),
          },
        });
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
    console.error(`Custom MCP ${slug} error:`, err);
    return Response.json({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32603, message: err.message || 'Internal server error' },
    }, { status: 500 });
  }
}
