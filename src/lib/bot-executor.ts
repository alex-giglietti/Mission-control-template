// Bot Execution Abstraction Layer
// Per MASTER-SYSTEM-PROMPT Sections 6 & 7
//
// Two modes:
// - "simulation" (default): Progress bars and timers, no real work
// - "real" (future): Calls OpenClaw agents via API
//
// This layer lets us swap between simulation and real bot execution
// without touching the UI components.

import { fireSignal, COO_TASK_CLAIMED, COO_TASK_COMPLETE, COO_TASK_BLOCKED } from "./signals";

// ─── Types ───────────────────────────────────────────────────────────

export type BotExecutionMode = "simulation" | "real";

export interface BotConfig {
  id: string;
  name: string;
  playbook: string; // Playbook file path from /protocols/playbooks/
  wave: number;
  timeoutMs: number;
}

export interface BotContext {
  businessName: string;
  driveFolderPath: string;
  visionDocs: {
    elevatorPitch?: string;
    icaDoc?: string;
    masterPrompt?: string;
    offerConcepts?: string;
    businessPlan?: string;
    ninetyDayFocus?: string;
  };
  brandAssets: {
    brandBoard?: string;
    websiteArtifact?: string;
    avatarImage?: string;
  };
  characterAssets: {
    characterBible?: string;
    contentCalendar?: string;
  };
  revenuePlanner: {
    revenueGoal?: number;
    promote?: Record<string, string>;
    profit?: Record<string, string>;
    produce?: Record<string, string>;
  };
}

export interface BotProgress {
  botId: string;
  progress: number; // 0-100
  status: "idle" | "working" | "complete" | "blocked";
  message?: string;
  outputPath?: string;
}

type ProgressCallback = (progress: BotProgress) => void;

// ─── Bot Definitions ─────────────────────────────────────────────────

export const BOT_CONFIGS: Record<string, Omit<BotConfig, "id">> = {
  website: {
    name: "Website Builder",
    playbook: "protocols/BRAND-INTAKE-PROTOCOL.md",
    wave: 1,
    timeoutMs: 180000,
  },
  cart: {
    name: "Cart Page Bot",
    playbook: "protocols/playbooks/1-page-cart-playbook.md",
    wave: 1,
    timeoutMs: 180000,
  },
  call: {
    name: "Call Funnel Bot",
    playbook: "protocols/playbooks/APPLICATION-FUNNEL-PLAYBOOK.md",
    wave: 1,
    timeoutMs: 180000,
  },
  event: {
    name: "Event Page Bot",
    playbook: "protocols/playbooks/live-event-page-master-prompt.md",
    wave: 1,
    timeoutMs: 180000,
  },
  email: {
    name: "Email Sequence Bot",
    playbook: "protocols/CHARACTER-CONTENT-PROTOCOL.md",
    wave: 2,
    timeoutMs: 120000,
  },
  outbound: {
    name: "Outbound Bot",
    playbook: "protocols/playbooks/PROMOTE-PROSPECT-PLAYBOOK.md",
    wave: 2,
    timeoutMs: 180000,
  },
  partnership: {
    name: "Partnership Bot",
    playbook: "protocols/playbooks/PROMOTE-PARTNER-PLAYBOOK.md",
    wave: 2,
    timeoutMs: 180000,
  },
  content: {
    name: "Content Engine",
    playbook: "protocols/playbooks/PROMOTE-PUBLISH-PLAYBOOK.md",
    wave: 3,
    timeoutMs: 300000,
  },
  ads: {
    name: "Ads Creative Bot",
    playbook: "protocols/playbooks/PROMOTE-PAY-PLAYBOOK.md",
    wave: 3,
    timeoutMs: 180000,
  },
};

// ─── Executor ────────────────────────────────────────────────────────

let currentMode: BotExecutionMode = "simulation";

export function setExecutionMode(mode: BotExecutionMode): void {
  currentMode = mode;
}

export function getExecutionMode(): BotExecutionMode {
  return currentMode;
}

/**
 * Spawn a bot and track its progress.
 * Returns a cleanup function to stop the bot.
 */
export function spawnBot(
  botId: string,
  context: BotContext,
  onProgress: ProgressCallback
): () => void {
  const config = BOT_CONFIGS[botId];
  if (!config) {
    console.error(`Unknown bot: ${botId}`);
    return () => {};
  }

  const fullConfig: BotConfig = { ...config, id: botId };

  fireSignal(COO_TASK_CLAIMED, `${config.name} claimed task`, {
    businessName: context.businessName,
    botId,
    wave: config.wave,
  });

  if (currentMode === "simulation") {
    return spawnSimulatedBot(fullConfig, context, onProgress);
  } else {
    return spawnRealBot(fullConfig, context, onProgress);
  }
}

// ─── Simulation Mode ─────────────────────────────────────────────────

function spawnSimulatedBot(
  config: BotConfig,
  context: BotContext,
  onProgress: ProgressCallback
): () => void {
  let progress = 0;
  let cancelled = false;

  const interval = setInterval(() => {
    if (cancelled) {
      clearInterval(interval);
      return;
    }

    progress += Math.random() * 8 + 3;

    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);

      fireSignal(COO_TASK_COMPLETE, `${config.name} completed`, {
        businessName: context.businessName,
        botId: config.id,
        wave: config.wave,
        outputPath: `${context.driveFolderPath}/${config.id}-output`,
      });

      onProgress({
        botId: config.id,
        progress: 100,
        status: "complete",
        message: `${config.name} complete`,
        outputPath: `${context.driveFolderPath}/${config.id}-output`,
      });
      return;
    }

    onProgress({
      botId: config.id,
      progress: Math.min(progress, 99),
      status: "working",
      message: `${config.name} working...`,
    });
  }, 600);

  // Timeout handler
  const timeout = setTimeout(() => {
    if (!cancelled && progress < 100) {
      clearInterval(interval);
      cancelled = true;

      fireSignal(COO_TASK_BLOCKED, `${config.name} timed out`, {
        businessName: context.businessName,
        botId: config.id,
        error: `Exceeded ${config.timeoutMs / 1000}s timeout`,
      });

      onProgress({
        botId: config.id,
        progress,
        status: "blocked",
        message: `${config.name} timed out`,
      });
    }
  }, config.timeoutMs);

  return () => {
    cancelled = true;
    clearInterval(interval);
    clearTimeout(timeout);
  };
}

// ─── Real Mode (Future) ──────────────────────────────────────────────

function spawnRealBot(
  config: BotConfig,
  context: BotContext,
  onProgress: ProgressCallback
): () => void {
  // TODO: Implement real OpenClaw agent integration
  // This would:
  // 1. POST to OpenClaw API with config.playbook + context
  // 2. Stream progress updates via SSE or polling
  // 3. Save outputs to Google Drive via /api/save-output
  // 4. Fire completion signals

  console.warn(`Real bot execution not yet implemented for ${config.id}. Falling back to simulation.`);
  return spawnSimulatedBot(config, context, onProgress);
}

/**
 * Get the list of bots to spawn for a given wave based on revenue planner selections.
 */
export function getBotsForWave(
  wave: number,
  revenuePlannerData: {
    promote?: Record<string, string>;
    profit?: Record<string, string>;
  }
): string[] {
  const bots: string[] = [];

  if (wave === 1) {
    bots.push("website"); // Always
    if (revenuePlannerData.profit?.cart === "now") bots.push("cart");
    if (revenuePlannerData.profit?.call === "now") bots.push("call");
    if (revenuePlannerData.profit?.crowd === "now") bots.push("event");
  }

  if (wave === 2) {
    bots.push("email"); // Always
    if (revenuePlannerData.promote?.prospect === "now") bots.push("outbound");
    if (revenuePlannerData.promote?.partnership === "now") bots.push("partnership");
  }

  if (wave === 3) {
    if (revenuePlannerData.promote?.publish === "now") bots.push("content");
    if (revenuePlannerData.promote?.paid === "now") bots.push("ads");
  }

  return bots;
}
