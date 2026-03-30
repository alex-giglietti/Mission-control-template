import { getValidToken, getApiKeyToken } from '@/lib/token-refresh';

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ExecuteContext {
  userId: string;
  server: string;
}

export type ExecuteFn = (
  toolName: string,
  args: Record<string, any>,
  context: ExecuteContext
) => Promise<any>;

export interface ServerDefinition {
  name: string;
  description: string;
  tools: ToolDefinition[];
  execute: ExecuteFn;
}

// Registry of all MCP servers
const registry: Record<string, ServerDefinition> = {};

export function registerServer(id: string, def: ServerDefinition) {
  registry[id] = def;
}

export function getServerRegistry(id: string): ServerDefinition | null {
  return registry[id] || null;
}

export function listServers(): string[] {
  return Object.keys(registry);
}

// ─── Helper: Create a dynamic proxy tool definition ───
// Each MCP server exposes categorized tool groups with action+params pattern
export function createToolGroup(
  name: string,
  description: string,
  actions: string[],
  paramsDescription?: string
): ToolDefinition {
  return {
    name,
    description: `${description}. Actions: ${actions.join(', ')}`,
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: actions,
          description: 'The action to perform',
        },
        params: {
          type: 'object',
          description: paramsDescription || 'Parameters for the action. Varies by action — pass any relevant fields.',
          additionalProperties: true,
        },
      },
      required: ['action'],
    },
  };
}

// ─── Helper: Make an authenticated API request ───
export async function makeAuthenticatedRequest(
  userId: string,
  service: string,
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const { accessToken, tokenType } = await getValidToken(userId, service);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `${tokenType} ${accessToken}`,
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error ${response.status}: ${errorBody}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export async function makeApiKeyRequest(
  userId: string,
  service: string,
  url: string,
  options: RequestInit = {},
  headerName: string = 'Authorization',
  prefix: string = 'Bearer'
): Promise<any> {
  const apiKey = await getApiKeyToken(userId, service);

  const authValue = prefix ? `${prefix} ${apiKey}` : apiKey;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    [headerName]: authValue,
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error ${response.status}: ${errorBody}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}
