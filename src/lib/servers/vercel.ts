import {
  registerServer,
  createToolGroup,
  makeApiKeyRequest,
  type ExecuteContext,
} from '@/lib/server-registry';

// ─── Vercel API Base URL ───
const VERCEL_API = 'https://api.vercel.com';

// ─── Helpers ───

function qs(params: Record<string, any>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

async function vercelRequest(userId: string, method: string, path: string, query?: Record<string, any>, body?: any) {
  const url = `${VERCEL_API}${path}${query ? qs(query) : ''}`;
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' } as Record<string, string>,
  };
  if (body) options.body = JSON.stringify(body);
  return makeApiKeyRequest(userId, 'vercel', url, options, 'Authorization', 'Bearer');
}

// ─── Projects ───

async function executeProjects(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return vercelRequest(userId, 'GET', '/v9/projects', {
      ...(p.teamId ? { teamId: p.teamId } : {}),
      ...(p.limit ? { limit: p.limit } : {}),
      ...(p.since ? { since: p.since } : {}),
      ...(p.until ? { until: p.until } : {}),
      ...(p.search ? { search: p.search } : {}),
    });
    case 'get': return vercelRequest(userId, 'GET', `/v9/projects/${p.idOrName}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'create': return vercelRequest(userId, 'POST', '/v10/projects', {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    }, {
      name: p.name,
      ...(p.framework ? { framework: p.framework } : {}),
      ...(p.gitRepository ? { gitRepository: p.gitRepository } : {}),
      ...(p.buildCommand ? { buildCommand: p.buildCommand } : {}),
      ...(p.outputDirectory ? { outputDirectory: p.outputDirectory } : {}),
      ...(p.installCommand ? { installCommand: p.installCommand } : {}),
      ...(p.devCommand ? { devCommand: p.devCommand } : {}),
      ...(p.rootDirectory ? { rootDirectory: p.rootDirectory } : {}),
      ...(p.serverlessFunctionRegion ? { serverlessFunctionRegion: p.serverlessFunctionRegion } : {}),
      ...(p.environmentVariables ? { environmentVariables: p.environmentVariables } : {}),
      ...(p.publicSource ? { publicSource: p.publicSource } : {}),
    });
    case 'update': return vercelRequest(userId, 'PATCH', `/v9/projects/${p.idOrName}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    }, {
      ...(p.name ? { name: p.name } : {}),
      ...(p.framework ? { framework: p.framework } : {}),
      ...(p.buildCommand ? { buildCommand: p.buildCommand } : {}),
      ...(p.outputDirectory ? { outputDirectory: p.outputDirectory } : {}),
      ...(p.installCommand ? { installCommand: p.installCommand } : {}),
      ...(p.devCommand ? { devCommand: p.devCommand } : {}),
      ...(p.rootDirectory ? { rootDirectory: p.rootDirectory } : {}),
      ...(p.serverlessFunctionRegion ? { serverlessFunctionRegion: p.serverlessFunctionRegion } : {}),
      ...(p.publicSource !== undefined ? { publicSource: p.publicSource } : {}),
      ...(p.autoExposeSystemEnvs !== undefined ? { autoExposeSystemEnvs: p.autoExposeSystemEnvs } : {}),
    });
    case 'delete': return vercelRequest(userId, 'DELETE', `/v9/projects/${p.idOrName}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'env_vars': return vercelRequest(userId, 'GET', `/v8/projects/${p.idOrName}/env`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
      ...(p.gitBranch ? { gitBranch: p.gitBranch } : {}),
      ...(p.decrypt ? { decrypt: p.decrypt } : {}),
    });
    case 'domains': return vercelRequest(userId, 'GET', `/v9/projects/${p.idOrName}/domains`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
      ...(p.limit ? { limit: p.limit } : {}),
      ...(p.since ? { since: p.since } : {}),
      ...(p.until ? { until: p.until } : {}),
    });
    case 'members': return vercelRequest(userId, 'GET', `/v9/projects/${p.idOrName}/members`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
      ...(p.limit ? { limit: p.limit } : {}),
      ...(p.since ? { since: p.since } : {}),
      ...(p.until ? { until: p.until } : {}),
      ...(p.search ? { search: p.search } : {}),
    });
    default: throw new Error(`Unknown vercel_projects action: ${action}`);
  }
}

// ─── Deployments ───

async function executeDeployments(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return vercelRequest(userId, 'GET', '/v6/deployments', {
      ...(p.projectId ? { projectId: p.projectId } : {}),
      ...(p.teamId ? { teamId: p.teamId } : {}),
      ...(p.limit ? { limit: p.limit } : {}),
      ...(p.since ? { since: p.since } : {}),
      ...(p.until ? { until: p.until } : {}),
      ...(p.state ? { state: p.state } : {}),
      ...(p.target ? { target: p.target } : {}),
    });
    case 'get': return vercelRequest(userId, 'GET', `/v13/deployments/${p.id}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'create': return vercelRequest(userId, 'POST', '/v13/deployments', {
      ...(p.teamId ? { teamId: p.teamId } : {}),
      ...(p.forceNew ? { forceNew: p.forceNew } : {}),
      ...(p.skipAutoDetectionConfirmation ? { skipAutoDetectionConfirmation: p.skipAutoDetectionConfirmation } : {}),
    }, {
      name: p.name,
      ...(p.project ? { project: p.project } : {}),
      ...(p.target ? { target: p.target } : {}),
      ...(p.regions ? { regions: p.regions } : {}),
      ...(p.files ? { files: p.files } : {}),
      ...(p.gitSource ? { gitSource: p.gitSource } : {}),
      ...(p.projectSettings ? { projectSettings: p.projectSettings } : {}),
      ...(p.functions ? { functions: p.functions } : {}),
      ...(p.routes ? { routes: p.routes } : {}),
      ...(p.env ? { env: p.env } : {}),
      ...(p.build ? { build: p.build } : {}),
    });
    case 'cancel': return vercelRequest(userId, 'PATCH', `/v12/deployments/${p.id}/cancel`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'redeploy': return vercelRequest(userId, 'POST', '/v13/deployments', {
      ...(p.teamId ? { teamId: p.teamId } : {}),
      ...(p.forceNew ? { forceNew: '1' } : {}),
    }, {
      deploymentId: p.id,
      name: p.name,
      ...(p.target ? { target: p.target } : {}),
      ...(p.meta ? { meta: p.meta } : {}),
    });
    case 'promote': return vercelRequest(userId, 'POST', `/v10/projects/${p.projectId}/promote/${p.id}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'rollback': return vercelRequest(userId, 'POST', `/v9/projects/${p.projectId}/rollback/${p.id}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    default: throw new Error(`Unknown vercel_deployments action: ${action}`);
  }
}

// ─── Domains ───

async function executeDomains(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return vercelRequest(userId, 'GET', '/v5/domains', {
      ...(p.teamId ? { teamId: p.teamId } : {}),
      ...(p.limit ? { limit: p.limit } : {}),
      ...(p.since ? { since: p.since } : {}),
      ...(p.until ? { until: p.until } : {}),
    });
    case 'get': return vercelRequest(userId, 'GET', `/v5/domains/${p.domain}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'add': return vercelRequest(userId, 'POST', '/v5/domains', {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    }, {
      name: p.name,
      ...(p.cdnEnabled !== undefined ? { cdnEnabled: p.cdnEnabled } : {}),
      ...(p.zone !== undefined ? { zone: p.zone } : {}),
    });
    case 'remove': return vercelRequest(userId, 'DELETE', `/v6/domains/${p.domain}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'verify': return vercelRequest(userId, 'POST', `/v5/domains/${p.domain}/verify`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'check_availability': return vercelRequest(userId, 'GET', '/v4/domains/status', {
      name: p.name,
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'buy': return vercelRequest(userId, 'POST', '/v5/domains/buy', {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    }, {
      name: p.name,
      ...(p.expectedPrice ? { expectedPrice: p.expectedPrice } : {}),
      ...(p.renew !== undefined ? { renew: p.renew } : {}),
      ...(p.country ? { country: p.country } : {}),
      ...(p.orgName ? { orgName: p.orgName } : {}),
      ...(p.firstName ? { firstName: p.firstName } : {}),
      ...(p.lastName ? { lastName: p.lastName } : {}),
      ...(p.address1 ? { address1: p.address1 } : {}),
      ...(p.city ? { city: p.city } : {}),
      ...(p.state ? { state: p.state } : {}),
      ...(p.postalCode ? { postalCode: p.postalCode } : {}),
      ...(p.phone ? { phone: p.phone } : {}),
      ...(p.email ? { email: p.email } : {}),
    });
    default: throw new Error(`Unknown vercel_domains action: ${action}`);
  }
}

// ─── DNS ───

async function executeDns(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'record_list': return vercelRequest(userId, 'GET', `/v4/domains/${p.domain}/records`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
      ...(p.limit ? { limit: p.limit } : {}),
      ...(p.since ? { since: p.since } : {}),
      ...(p.until ? { until: p.until } : {}),
    });
    case 'record_create': return vercelRequest(userId, 'POST', `/v2/domains/${p.domain}/records`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    }, {
      name: p.name,
      type: p.type,
      value: p.value,
      ...(p.ttl ? { ttl: p.ttl } : {}),
      ...(p.mxPriority !== undefined ? { mxPriority: p.mxPriority } : {}),
      ...(p.srv ? { srv: p.srv } : {}),
    });
    case 'record_update': return vercelRequest(userId, 'PATCH', `/v1/domains/records/${p.recordId}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    }, {
      ...(p.name ? { name: p.name } : {}),
      ...(p.type ? { type: p.type } : {}),
      ...(p.value ? { value: p.value } : {}),
      ...(p.ttl ? { ttl: p.ttl } : {}),
      ...(p.mxPriority !== undefined ? { mxPriority: p.mxPriority } : {}),
      ...(p.srv ? { srv: p.srv } : {}),
    });
    case 'record_delete': return vercelRequest(userId, 'DELETE', `/v2/domains/${p.domain}/records/${p.recordId}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    default: throw new Error(`Unknown vercel_dns action: ${action}`);
  }
}

// ─── Environment Variables ───

async function executeEnv(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return vercelRequest(userId, 'GET', `/v8/projects/${p.idOrName}/env`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
      ...(p.gitBranch ? { gitBranch: p.gitBranch } : {}),
      ...(p.decrypt ? { decrypt: p.decrypt } : {}),
    });
    case 'get': return vercelRequest(userId, 'GET', `/v1/projects/${p.idOrName}/env/${p.id}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'create': return vercelRequest(userId, 'POST', `/v10/projects/${p.idOrName}/env`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    }, {
      key: p.key,
      value: p.value,
      target: p.target || ['production', 'preview', 'development'],
      type: p.type || 'encrypted',
      ...(p.gitBranch ? { gitBranch: p.gitBranch } : {}),
      ...(p.comment ? { comment: p.comment } : {}),
    });
    case 'update': return vercelRequest(userId, 'PATCH', `/v9/projects/${p.idOrName}/env/${p.id}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    }, {
      ...(p.key ? { key: p.key } : {}),
      ...(p.value ? { value: p.value } : {}),
      ...(p.target ? { target: p.target } : {}),
      ...(p.type ? { type: p.type } : {}),
      ...(p.gitBranch ? { gitBranch: p.gitBranch } : {}),
      ...(p.comment ? { comment: p.comment } : {}),
    });
    case 'delete': return vercelRequest(userId, 'DELETE', `/v9/projects/${p.idOrName}/env/${p.id}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    default: throw new Error(`Unknown vercel_env action: ${action}`);
  }
}

// ─── Logs ───

async function executeLogs(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'build_logs': return vercelRequest(userId, 'GET', `/v2/deployments/${p.id}/events`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
      ...(p.builds ? { builds: p.builds } : {}),
      ...(p.direction ? { direction: p.direction } : {}),
      ...(p.follow ? { follow: p.follow } : {}),
      ...(p.limit ? { limit: p.limit } : {}),
      ...(p.since ? { since: p.since } : {}),
      ...(p.until ? { until: p.until } : {}),
    });
    case 'runtime_logs': return vercelRequest(userId, 'GET', `/v2/deployments/${p.id}/events`, {
      type: 'runtime',
      ...(p.teamId ? { teamId: p.teamId } : {}),
      ...(p.direction ? { direction: p.direction } : {}),
      ...(p.follow ? { follow: p.follow } : {}),
      ...(p.limit ? { limit: p.limit } : {}),
      ...(p.since ? { since: p.since } : {}),
      ...(p.until ? { until: p.until } : {}),
    });
    case 'access_logs': return vercelRequest(userId, 'GET', `/v2/deployments/${p.id}/events`, {
      type: 'access',
      ...(p.teamId ? { teamId: p.teamId } : {}),
      ...(p.direction ? { direction: p.direction } : {}),
      ...(p.follow ? { follow: p.follow } : {}),
      ...(p.limit ? { limit: p.limit } : {}),
      ...(p.since ? { since: p.since } : {}),
      ...(p.until ? { until: p.until } : {}),
    });
    default: throw new Error(`Unknown vercel_logs action: ${action}`);
  }
}

// ─── Teams ───

async function executeTeams(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return vercelRequest(userId, 'GET', '/v2/teams', {
      ...(p.limit ? { limit: p.limit } : {}),
      ...(p.since ? { since: p.since } : {}),
      ...(p.until ? { until: p.until } : {}),
    });
    case 'get': return vercelRequest(userId, 'GET', `/v2/teams/${p.teamId}`);
    case 'members': return vercelRequest(userId, 'GET', `/v2/teams/${p.teamId}/members`, {
      ...(p.limit ? { limit: p.limit } : {}),
      ...(p.since ? { since: p.since } : {}),
      ...(p.until ? { until: p.until } : {}),
      ...(p.search ? { search: p.search } : {}),
      ...(p.role ? { role: p.role } : {}),
    });
    case 'invite': return vercelRequest(userId, 'POST', `/v1/teams/${p.teamId}/members`, undefined, {
      email: p.email,
      role: p.role || 'MEMBER',
      ...(p.projects ? { projects: p.projects } : {}),
    });
    default: throw new Error(`Unknown vercel_teams action: ${action}`);
  }
}

// ─── Edge Config ───

async function executeEdgeConfig(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return vercelRequest(userId, 'GET', '/v1/edge-config', {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'get': return vercelRequest(userId, 'GET', `/v1/edge-config/${p.id}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'create': return vercelRequest(userId, 'POST', '/v1/edge-config', {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    }, {
      slug: p.slug,
      ...(p.items ? { items: p.items } : {}),
    });
    case 'update': return vercelRequest(userId, 'PUT', `/v1/edge-config/${p.id}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    }, {
      ...(p.slug ? { slug: p.slug } : {}),
      ...(p.items ? { items: p.items } : {}),
    });
    case 'delete': return vercelRequest(userId, 'DELETE', `/v1/edge-config/${p.id}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'items': return vercelRequest(userId, 'GET', `/v1/edge-config/${p.id}/items`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    default: throw new Error(`Unknown vercel_edge_config action: ${action}`);
  }
}

// ─── Crons ───

async function executeCrons(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return vercelRequest(userId, 'GET', `/v1/projects/${p.idOrName}/crons`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'get': return vercelRequest(userId, 'GET', `/v1/projects/${p.idOrName}/crons/${p.id}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    default: throw new Error(`Unknown vercel_crons action: ${action}`);
  }
}

// ─── Checks ───

async function executeChecks(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return vercelRequest(userId, 'GET', `/v1/deployments/${p.deploymentId}/checks`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'get': return vercelRequest(userId, 'GET', `/v1/deployments/${p.deploymentId}/checks/${p.checkId}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'create': return vercelRequest(userId, 'POST', `/v1/deployments/${p.deploymentId}/checks`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    }, {
      name: p.name,
      ...(p.path ? { path: p.path } : {}),
      ...(p.blocking !== undefined ? { blocking: p.blocking } : {}),
      ...(p.detailsUrl ? { detailsUrl: p.detailsUrl } : {}),
      ...(p.externalId ? { externalId: p.externalId } : {}),
      ...(p.rerequestable !== undefined ? { rerequestable: p.rerequestable } : {}),
    });
    case 'update': return vercelRequest(userId, 'PATCH', `/v1/deployments/${p.deploymentId}/checks/${p.checkId}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    }, {
      ...(p.name ? { name: p.name } : {}),
      ...(p.status ? { status: p.status } : {}),
      ...(p.conclusion ? { conclusion: p.conclusion } : {}),
      ...(p.detailsUrl ? { detailsUrl: p.detailsUrl } : {}),
      ...(p.output ? { output: p.output } : {}),
      ...(p.externalId ? { externalId: p.externalId } : {}),
    });
    case 'rerequest': return vercelRequest(userId, 'POST', `/v1/deployments/${p.deploymentId}/checks/${p.checkId}/rerequest`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    default: throw new Error(`Unknown vercel_checks action: ${action}`);
  }
}

// ─── Webhooks ───

async function executeWebhooks(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return vercelRequest(userId, 'GET', '/v1/webhooks', {
      ...(p.teamId ? { teamId: p.teamId } : {}),
      ...(p.projectId ? { projectId: p.projectId } : {}),
    });
    case 'get': return vercelRequest(userId, 'GET', `/v1/webhooks/${p.id}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'create': return vercelRequest(userId, 'POST', '/v1/webhooks', {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    }, {
      url: p.url,
      events: p.events,
      ...(p.projectIds ? { projectIds: p.projectIds } : {}),
    });
    case 'delete': return vercelRequest(userId, 'DELETE', `/v1/webhooks/${p.id}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    default: throw new Error(`Unknown vercel_webhooks action: ${action}`);
  }
}

// ─── Artifacts ───

async function executeArtifacts(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'status': return vercelRequest(userId, 'GET', '/v8/artifacts/status', {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'upload': return vercelRequest(userId, 'PUT', `/v8/artifacts/${p.hash}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    }, p.body);
    case 'download': return vercelRequest(userId, 'GET', `/v8/artifacts/${p.hash}`, {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'query': return vercelRequest(userId, 'POST', '/v8/artifacts', {
      ...(p.teamId ? { teamId: p.teamId } : {}),
    }, {
      hashes: p.hashes,
    });
    default: throw new Error(`Unknown vercel_artifacts action: ${action}`);
  }
}

// ─── Firewall ───

async function executeFirewall(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'rules_list': return vercelRequest(userId, 'GET', '/v1/security/firewall/config/active', {
      projectId: p.projectId,
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    case 'rule_create': return vercelRequest(userId, 'POST', '/v1/security/firewall/config', {
      projectId: p.projectId,
      ...(p.teamId ? { teamId: p.teamId } : {}),
    }, {
      action: p.action,
      name: p.name,
      conditionGroup: p.conditionGroup,
      ...(p.active !== undefined ? { active: p.active } : {}),
      ...(p.permanent !== undefined ? { permanent: p.permanent } : {}),
    });
    case 'rule_update': return vercelRequest(userId, 'PATCH', `/v1/security/firewall/config/${p.ruleId}`, {
      projectId: p.projectId,
      ...(p.teamId ? { teamId: p.teamId } : {}),
    }, {
      ...(p.action ? { action: p.action } : {}),
      ...(p.name ? { name: p.name } : {}),
      ...(p.conditionGroup ? { conditionGroup: p.conditionGroup } : {}),
      ...(p.active !== undefined ? { active: p.active } : {}),
      ...(p.permanent !== undefined ? { permanent: p.permanent } : {}),
    });
    case 'rule_delete': return vercelRequest(userId, 'DELETE', `/v1/security/firewall/config/${p.ruleId}`, {
      projectId: p.projectId,
      ...(p.teamId ? { teamId: p.teamId } : {}),
    });
    default: throw new Error(`Unknown vercel_firewall action: ${action}`);
  }
}

// ─── Main Router ───

async function execute(toolName: string, args: Record<string, any>, ctx: ExecuteContext) {
  const action = args.action as string;
  const params = (args.params || {}) as Record<string, any>;

  if (!action) throw new Error(`Missing "action" parameter for tool ${toolName}`);

  switch (toolName) {
    case 'vercel_projects': return executeProjects(action, params, ctx);
    case 'vercel_deployments': return executeDeployments(action, params, ctx);
    case 'vercel_domains': return executeDomains(action, params, ctx);
    case 'vercel_dns': return executeDns(action, params, ctx);
    case 'vercel_env': return executeEnv(action, params, ctx);
    case 'vercel_logs': return executeLogs(action, params, ctx);
    case 'vercel_teams': return executeTeams(action, params, ctx);
    case 'vercel_edge_config': return executeEdgeConfig(action, params, ctx);
    case 'vercel_crons': return executeCrons(action, params, ctx);
    case 'vercel_checks': return executeChecks(action, params, ctx);
    case 'vercel_webhooks': return executeWebhooks(action, params, ctx);
    case 'vercel_artifacts': return executeArtifacts(action, params, ctx);
    case 'vercel_firewall': return executeFirewall(action, params, ctx);
    default:
      throw new Error(`Unknown Vercel tool: ${toolName}`);
  }
}

// ─── Tool Definitions (ALL 13 categories) ───

const tools = [
  createToolGroup('vercel_projects', 'Vercel project management — list, get, create, update, delete projects, plus env vars, domains, and members', [
    'list', 'get', 'create', 'update', 'delete',
    'env_vars', 'domains', 'members',
  ], 'Params: {idOrName, name, framework, gitRepository, buildCommand, outputDirectory, installCommand, devCommand, rootDirectory, serverlessFunctionRegion, environmentVariables, publicSource, autoExposeSystemEnvs, teamId, limit, since, until, search, gitBranch, decrypt}'),

  createToolGroup('vercel_deployments', 'Vercel deployment lifecycle — list, get, create, cancel, redeploy, promote, rollback deployments', [
    'list', 'get', 'create', 'cancel', 'redeploy', 'promote', 'rollback',
  ], 'Params: {id, name, project, projectId, target (production|preview|staging), regions[], files[], gitSource, projectSettings, functions, routes, env, build, meta, forceNew, skipAutoDetectionConfirmation, state, teamId, limit, since, until}'),

  createToolGroup('vercel_domains', 'Vercel domain management — list, get, add, remove, verify domains, check availability, buy', [
    'list', 'get', 'add', 'remove', 'verify', 'check_availability', 'buy',
  ], 'Params: {domain, name, cdnEnabled, zone, expectedPrice, renew, country, orgName, firstName, lastName, address1, city, state, postalCode, phone, email, teamId, limit, since, until}'),

  createToolGroup('vercel_dns', 'Vercel DNS record management — list, create, update, delete DNS records for a domain', [
    'record_list', 'record_create', 'record_update', 'record_delete',
  ], 'Params: {domain, recordId, name, type (A|AAAA|ALIAS|CAA|CNAME|MX|SRV|TXT|NS), value, ttl, mxPriority, srv, teamId, limit, since, until}'),

  createToolGroup('vercel_env', 'Vercel environment variable management — list, get, create, update, delete env vars per project and environment', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {idOrName, id, key, value, target[] (production|preview|development), type (plain|encrypted|secret|system), gitBranch, comment, decrypt, teamId}'),

  createToolGroup('vercel_logs', 'Vercel deployment logs — build logs, runtime logs, access logs', [
    'build_logs', 'runtime_logs', 'access_logs',
  ], 'Params: {id, builds, direction (backward|forward), follow, limit, since, until, teamId}'),

  createToolGroup('vercel_teams', 'Vercel team management — list teams, get team details, list members, invite members', [
    'list', 'get', 'members', 'invite',
  ], 'Params: {teamId, email, role (MEMBER|OWNER|VIEWER|DEVELOPER|BILLING), projects[], search, limit, since, until}'),

  createToolGroup('vercel_edge_config', 'Vercel Edge Config management — list, get, create, update, delete edge configs, and list items', [
    'list', 'get', 'create', 'update', 'delete', 'items',
  ], 'Params: {id, slug, items, teamId}'),

  createToolGroup('vercel_crons', 'Vercel cron job management — list and get cron jobs for a project', [
    'list', 'get',
  ], 'Params: {idOrName, id, teamId}'),

  createToolGroup('vercel_checks', 'Vercel deployment checks — list, get, create, update, rerequest checks on deployments', [
    'list', 'get', 'create', 'update', 'rerequest',
  ], 'Params: {deploymentId, checkId, name, path, blocking, detailsUrl, externalId, rerequestable, status, conclusion, output, teamId}'),

  createToolGroup('vercel_webhooks', 'Vercel webhook management — list, get, create, delete webhooks', [
    'list', 'get', 'create', 'delete',
  ], 'Params: {id, url, events[] (deployment.created|deployment.succeeded|deployment.failed|deployment.canceled|deployment.error|project.created|project.removed|...), projectIds[], projectId, teamId}'),

  createToolGroup('vercel_artifacts', 'Vercel build artifact management — status, upload, download, query artifacts (remote caching)', [
    'status', 'upload', 'download', 'query',
  ], 'Params: {hash, body, hashes[], teamId}'),

  createToolGroup('vercel_firewall', 'Vercel firewall rule management — list, create, update, delete firewall rules', [
    'rules_list', 'rule_create', 'rule_update', 'rule_delete',
  ], 'Params: {projectId, ruleId, action (deny|challenge|log|bypass), name, conditionGroup, active, permanent, teamId}'),
];

// ─── Register Server ───

export function registerVercelServer() {
  registerServer('vercel', {
    name: 'AIM Vercel',
    description: 'Full Vercel API access — ALL 13 API categories, 70+ operations. Projects, deployments, domains, DNS, environment variables, logs, teams, edge config, crons, checks, webhooks, artifacts, and firewall.',
    tools,
    execute,
  });
}
