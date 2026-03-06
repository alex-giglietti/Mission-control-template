// Centralized Signal System for AIM Demo
// Based on MASTER-SYSTEM-PROMPT Section 8 — Signal Dictionary

const SIGNALS_KEY = "aim-demo-signals";

// ─── Signal Constants ────────────────────────────────────────────────

// Vision Protocol Signals
export const VISION_SEED_COLLECTED = "[VISION: SEED COLLECTED — ENTERING RESEARCH PHASE]";
export const VISION_RESEARCH_COMPLETE = "[VISION: RESEARCH COMPLETE — GENERATING DOCUMENTS]";
export const VISION_OFFER_CONCEPTS_READY = "[VISION: OFFER CONCEPTS READY — JOSEPH TAKE OVER]";
export const VISION_OFFER_LOCKED = "[VISION: OFFER LOCKED — GENERATING BUSINESS PLAN]";
export const VISION_COMPLETE = "[VISION: COMPLETE — ALL DOCUMENTS GENERATED]";
export const VISION_INTAKE_COMPLETE = "[VISION: INTAKE COMPLETE]";

// Brand Protocol Signals
export const BRAND_BLOCKED_MISSING_VISION = "[BRAND: BLOCKED — MISSING VISION DOCUMENTS]";
export const BRAND_BOARD_APPROVED = "[BRAND: BOARD APPROVED — SAVED TO BRAND FOLDER]";
export const BRAND_BOARD_NEEDS_JOSEPH = "[BRAND: BOARD — NEEDS JOSEPH]";
export const BRAND_WEBSITE_APPROVED = "[BRAND: WEBSITE APPROVED — ARTIFACTS SAVED]";
export const BRAND_AVATAR_APPROVED = "[BRAND: AVATAR APPROVED — SAVED TO BRAND FOLDER]";
export const BRAND_OPENAI_DOWN = "[BRAND: OPENAI DOWN — NEEDS MANUAL]";
export const BRAND_COMPLETE = "[BRAND: COMPLETE — HANDING OFF TO CHARACTER]";

// Character Protocol Signals
export const CHARACTER_BLOCKED = "[CHARACTER: BLOCKED — INCOMPLETE BRAND FOLDER]";
export const CHARACTER_SHTICK_NEEDS_JOSEPH = "[CHARACTER: SHTICK — NEEDS JOSEPH]";
export const CHARACTER_BIBLE_APPROVED = "[CHARACTER: BIBLE APPROVED]";
export const CHARACTER_VOICE_GUIDE_APPROVED = "[CHARACTER: PERSONAL BRAND VOICE GUIDE APPROVED]";
export const CHARACTER_COMPLETE = "[CHARACTER: COMPLETE — ALL DELIVERABLES GENERATED]";

// Master / Revenue Planner Signals
export const MASTER_REVENUE_PLANNER_APPROVED = "[MASTER: REVENUE PLANNER APPROVED]";
export const MASTER_WAVE1_SPAWNING = "[MASTER: WAVE 1 SPAWNING]";
export const MASTER_WAVE2_SPAWNING = "[MASTER: WAVE 2 SPAWNING]";
export const MASTER_WAVE3_SPAWNING = "[MASTER: WAVE 3 SPAWNING]";
export const MASTER_WAVE1_COMPLETE = "[MASTER: WAVE 1 COMPLETE]";
export const MASTER_WAVE2_COMPLETE = "[MASTER: WAVE 2 COMPLETE]";
export const MASTER_WAVE3_COMPLETE = "[MASTER: WAVE 3 COMPLETE]";
export const MASTER_ALL_BOTS_COMPLETE = "[MASTER: ALL BOTS COMPLETE]";
export const MASTER_DEMO_STARTED = "[MASTER: DEMO STARTED]";
export const MASTER_MISSION_CONTROL_REVEALED = "[MASTER: MISSION CONTROL REVEALED]";
export const MASTER_NEEDS_JOSEPH = "[MASTER: NEEDS JOSEPH]";
export const MASTER_BOT_FAILED = "[MASTER: BOT FAILED]";
export const MASTER_STARTUP_FAILED = "[MASTER: STARTUP FAILED]";

// COO Agent Signals
export const COO_TASK_CLAIMED = "[COO: TASK CLAIMED]";
export const COO_TASK_COMPLETE = "[COO: TASK COMPLETE]";
export const COO_TASK_BLOCKED = "[COO: TASK BLOCKED]";
export const COO_ALL_TASKS_COMPLETE = "[COO: ALL TASKS COMPLETE]";

// ─── Signal Types ────────────────────────────────────────────────────

export interface SignalEntry {
  id: string;
  signal: string;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

type SignalHandler = (entry: SignalEntry) => void;

// ─── Signal Bus (in-memory for this browser session) ─────────────────

const handlers: Map<string, Set<SignalHandler>> = new Map();

/**
 * Fire a signal — logs to localStorage and triggers registered handlers.
 */
export function fireSignal(signal: string, message: string, data?: Record<string, unknown>): SignalEntry {
  const entry: SignalEntry = {
    id: `signal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    signal,
    message,
    timestamp: new Date().toISOString(),
    data,
  };

  // Persist to localStorage for cross-component communication
  try {
    const existing: SignalEntry[] = JSON.parse(localStorage.getItem(SIGNALS_KEY) || "[]");
    existing.unshift(entry);
    localStorage.setItem(SIGNALS_KEY, JSON.stringify(existing.slice(0, 200)));
  } catch (e) {
    console.error("Failed to persist signal:", e);
  }

  // Notify all matching handlers
  handlers.forEach((handlerSet, pattern) => {
    if (signal.includes(pattern) || pattern === "*") {
      handlerSet.forEach((handler) => {
        try {
          handler(entry);
        } catch (e) {
          console.error(`Signal handler error for "${pattern}":`, e);
        }
      });
    }
  });

  // Also POST to demo-status webhook (fire-and-forget)
  postToDemoStatus(entry).catch(() => {});

  return entry;
}

/**
 * Register a handler for signals matching a pattern.
 * Pattern is matched via string.includes() — use "*" for all signals.
 * Returns an unsubscribe function.
 */
export function onSignal(pattern: string, handler: SignalHandler): () => void {
  if (!handlers.has(pattern)) {
    handlers.set(pattern, new Set());
  }
  handlers.get(pattern)!.add(handler);

  return () => {
    const set = handlers.get(pattern);
    if (set) {
      set.delete(handler);
      if (set.size === 0) handlers.delete(pattern);
    }
  };
}

/**
 * Get all signals from localStorage.
 */
export function getSignalLog(): SignalEntry[] {
  try {
    return JSON.parse(localStorage.getItem(SIGNALS_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Clear the signal log.
 */
export function clearSignalLog(): void {
  localStorage.removeItem(SIGNALS_KEY);
}

// ─── Webhook Integration ─────────────────────────────────────────────

async function postToDemoStatus(entry: SignalEntry): Promise<void> {
  try {
    await fetch("/api/demo-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessName: entry.data?.businessName || "",
        timestamp: entry.timestamp,
        event: categorizeSignal(entry.signal),
        data: {
          signal: entry.signal,
          message: entry.message,
          ...entry.data,
        },
      }),
    });
  } catch {
    // Fail silently — webhook is optional
  }
}

function categorizeSignal(signal: string): string {
  if (signal.includes("VISION:") || signal.includes("BRAND:") || signal.includes("CHARACTER:")) {
    return "phase_update";
  }
  if (signal.includes("TASK")) return "task_update";
  if (signal.includes("BOT") || signal.includes("WAVE")) return "bot_status";
  if (signal.includes("COMPLETE") || signal.includes("REVEALED")) return "demo_complete";
  return "phase_update";
}
