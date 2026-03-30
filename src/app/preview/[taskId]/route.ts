import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await context.params;

  try {
    const result = await db.execute({
      sql: "SELECT html_content, task_name FROM demo_tasks WHERE id = ?",
      args: [taskId],
    });

    const row = result.rows[0];
    if (!row || !row.html_content) {
      return new NextResponse(
        `<!DOCTYPE html><html><body style="background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
          <p>Preview not available.</p>
        </body></html>`,
        { status: 404, headers: { "Content-Type": "text/html" } }
      );
    }

    return new NextResponse(row.html_content as string, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (err) {
    console.error("Preview error:", err);
    return new NextResponse("Error loading preview", { status: 500 });
  }
}
