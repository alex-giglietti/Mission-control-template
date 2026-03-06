import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// In-memory store for demo status (resets on cold start)
// For production, use Vercel KV or a database
interface DemoStatusEntry {
  businessName: string;
  timestamp: string;
  event: string;
  data: Record<string, unknown>;
}

const statusLog: DemoStatusEntry[] = [];
let currentStatus: Record<string, unknown> = {};

/**
 * POST /api/demo-status
 * Receives status updates from the signal system.
 * Payload matches MASTER-SYSTEM-PROMPT Section 8 format.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const entry: DemoStatusEntry = {
      businessName: body.businessName || "",
      timestamp: body.timestamp || new Date().toISOString(),
      event: body.event || "phase_update",
      data: body.data || {},
    };

    statusLog.unshift(entry);
    // Keep last 500 entries
    if (statusLog.length > 500) statusLog.length = 500;

    // Update current status snapshot
    currentStatus = {
      ...currentStatus,
      businessName: entry.businessName || currentStatus.businessName,
      lastEvent: entry.event,
      lastSignal: entry.data?.signal,
      phase: entry.data?.phase || currentStatus.phase,
      lastUpdated: entry.timestamp,
    };

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("demo-status POST error:", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

/**
 * GET /api/demo-status
 * Returns current demo status and recent events for dashboard consumption.
 */
export async function GET() {
  return NextResponse.json({
    status: currentStatus,
    recentEvents: statusLog.slice(0, 50),
    totalEvents: statusLog.length,
  });
}
