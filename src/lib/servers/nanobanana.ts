import {
  registerServer,
  createToolGroup,
  makeApiKeyRequest,
  type ExecuteContext,
} from '@/lib/server-registry';

// ─── NanoBanana API Base URL ───
const NB_API = 'https://api.nanobanana.com/v2';

// ─── Helpers ───

function qs(params: Record<string, any>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return '';
  return '?' + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

async function nbRequest(userId: string, method: string, path: string, query?: Record<string, any>, body?: any) {
  const url = `${NB_API}${path}${query ? qs(query) : ''}`;
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' } as Record<string, string>,
  };
  if (body) options.body = JSON.stringify(body);
  return makeApiKeyRequest(userId, 'nanobanana', url, options, 'Authorization', 'Bearer');
}

// ─── Images ───

async function executeImages(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'generate': return nbRequest(userId, 'POST', '/images/generate', undefined, {
      prompt: p.prompt,
      model: p.model,
      width: p.width,
      height: p.height,
      style: p.style,
      steps: p.steps,
      cfg_scale: p.cfg_scale,
      seed: p.seed,
      negative_prompt: p.negative_prompt,
      samples: p.samples,
    });
    case 'list': return nbRequest(userId, 'GET', '/images', {
      limit: p.limit,
      offset: p.offset,
    });
    case 'get': return nbRequest(userId, 'GET', `/images/${p.id}`);
    case 'delete': return nbRequest(userId, 'DELETE', `/images/${p.id}`);
    case 'download': return nbRequest(userId, 'GET', `/images/${p.id}/download`);
    case 'variations': return nbRequest(userId, 'POST', `/images/${p.id}/variations`, undefined, {
      count: p.count,
      strength: p.strength,
    });
    case 'upscale': return nbRequest(userId, 'POST', `/images/${p.id}/upscale`, undefined, {
      scale_factor: p.scale_factor,
    });
    case 'edit': return nbRequest(userId, 'POST', '/images/edit', undefined, {
      image_id: p.image_id,
      prompt: p.prompt,
      mask: p.mask,
      strength: p.strength,
    });
    default: throw new Error(`Unknown nb_images action: ${action}`);
  }
}

// ─── Models ───

async function executeModels(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return nbRequest(userId, 'GET', '/models', {
      limit: p.limit,
      offset: p.offset,
    });
    case 'get': return nbRequest(userId, 'GET', `/models/${p.id}`);
    case 'fine_tune_create': return nbRequest(userId, 'POST', '/fine-tunes', undefined, {
      model: p.model,
      name: p.name,
      training_images: p.training_images,
      description: p.description,
      learning_rate: p.learning_rate,
      epochs: p.epochs,
      resolution: p.resolution,
    });
    case 'fine_tune_list': return nbRequest(userId, 'GET', '/fine-tunes', {
      limit: p.limit,
      offset: p.offset,
    });
    case 'fine_tune_get': return nbRequest(userId, 'GET', `/fine-tunes/${p.id}`);
    case 'fine_tune_cancel': return nbRequest(userId, 'POST', `/fine-tunes/${p.id}/cancel`);
    default: throw new Error(`Unknown nb_models action: ${action}`);
  }
}

// ─── Styles ───

async function executeStyles(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return nbRequest(userId, 'GET', '/styles', {
      limit: p.limit,
      offset: p.offset,
    });
    case 'get': return nbRequest(userId, 'GET', `/styles/${p.id}`);
    case 'create': return nbRequest(userId, 'POST', '/styles', undefined, {
      name: p.name,
      description: p.description,
      prompt_prefix: p.prompt_prefix,
      prompt_suffix: p.prompt_suffix,
      negative_prompt: p.negative_prompt,
      settings: p.settings,
    });
    case 'update': return nbRequest(userId, 'PATCH', `/styles/${p.id}`, undefined, {
      name: p.name,
      description: p.description,
      prompt_prefix: p.prompt_prefix,
      prompt_suffix: p.prompt_suffix,
      negative_prompt: p.negative_prompt,
      settings: p.settings,
    });
    case 'delete': return nbRequest(userId, 'DELETE', `/styles/${p.id}`);
    default: throw new Error(`Unknown nb_styles action: ${action}`);
  }
}

// ─── Jobs ───

async function executeJobs(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'list': return nbRequest(userId, 'GET', '/jobs', {
      limit: p.limit,
      offset: p.offset,
      status: p.status,
    });
    case 'get': return nbRequest(userId, 'GET', `/jobs/${p.id}`);
    case 'cancel': return nbRequest(userId, 'POST', `/jobs/${p.id}/cancel`);
    case 'retry': return nbRequest(userId, 'POST', `/jobs/${p.id}/retry`);
    default: throw new Error(`Unknown nb_jobs action: ${action}`);
  }
}

// ─── Account ───

async function executeAccount(action: string, p: Record<string, any>, ctx: ExecuteContext) {
  const { userId } = ctx;
  switch (action) {
    case 'get': return nbRequest(userId, 'GET', '/account');
    case 'usage': return nbRequest(userId, 'GET', '/account/usage', {
      start_date: p.start_date,
      end_date: p.end_date,
    });
    case 'credits': return nbRequest(userId, 'GET', '/account/credits');
    default: throw new Error(`Unknown nb_account action: ${action}`);
  }
}

// ─── Main Router ───

async function execute(toolName: string, args: Record<string, any>, ctx: ExecuteContext) {
  const action = args.action as string;
  const params = (args.params || {}) as Record<string, any>;

  if (!action) throw new Error(`Missing "action" parameter for tool ${toolName}`);

  switch (toolName) {
    case 'nb_images': return executeImages(action, params, ctx);
    case 'nb_models': return executeModels(action, params, ctx);
    case 'nb_styles': return executeStyles(action, params, ctx);
    case 'nb_jobs': return executeJobs(action, params, ctx);
    case 'nb_account': return executeAccount(action, params, ctx);
    default:
      throw new Error(`Unknown NanoBanana tool: ${toolName}`);
  }
}

// ─── Tool Definitions ───

const tools = [
  createToolGroup('nb_images', 'NanoBanana 2 AI image generation and management — generate images from text prompts, list/get/delete images, download, create variations, upscale, and edit (inpainting/outpainting)', [
    'generate', 'list', 'get', 'delete',
    'download', 'variations', 'upscale', 'edit',
  ], 'Params: {id, prompt, model, width, height, style, steps, cfg_scale, seed, negative_prompt, samples, count, strength, scale_factor, image_id, mask, limit, offset}'),

  createToolGroup('nb_models', 'NanoBanana 2 model management — list and inspect available AI models, create and manage fine-tuning jobs', [
    'list', 'get',
    'fine_tune_create', 'fine_tune_list', 'fine_tune_get', 'fine_tune_cancel',
  ], 'Params: {id, model, name, training_images[], description, learning_rate, epochs, resolution, limit, offset}'),

  createToolGroup('nb_styles', 'NanoBanana 2 style preset management — list, get, create, update, and delete custom style presets for image generation', [
    'list', 'get', 'create', 'update', 'delete',
  ], 'Params: {id, name, description, prompt_prefix, prompt_suffix, negative_prompt, settings, limit, offset}'),

  createToolGroup('nb_jobs', 'NanoBanana 2 async job management — list, get status, cancel, and retry image generation jobs', [
    'list', 'get', 'cancel', 'retry',
  ], 'Params: {id, status, limit, offset}'),

  createToolGroup('nb_account', 'NanoBanana 2 account management — get account info, usage statistics, and remaining credits', [
    'get', 'usage', 'credits',
  ], 'Params: {start_date, end_date}'),
];

// ─── Register Server ───

export function registerNanoBananaServer() {
  registerServer('nanobanana', {
    name: 'AIM NanoBanana',
    description: 'Full NanoBanana 2 AI image generation API access — 5 API categories, 25+ operations. Image generation, models, fine-tuning, style presets, async jobs, and account management.',
    tools,
    execute,
  });
}
