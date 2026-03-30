import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";

// ---------------------------------------------------------------------------
// GET /api/tasks — Fetch tasks with optional ?status= filter
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const missionId = req.nextUrl.searchParams.get("mission_id");

  try {
    let sql = "SELECT * FROM tasks WHERE 1=1";
    const params: Record<string, string> = {};

    if (status) {
      sql += " AND status = :status";
      params.status = status;
    }

    if (missionId) {
      sql += " AND mission_id = :missionId";
      params.missionId = missionId;
    }

    sql += " ORDER BY due_date ASC, created_at ASC";

    const result = await execute(sql, params);
    return NextResponse.json({ tasks: result.rows });
  } catch (err) {
    console.error("[GET /api/tasks]", err);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/tasks — Create a new task
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, status, priority, assigned_agent, mission_id, due_date, tags, steps } = body;

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const id = `task_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    await execute(
      `INSERT INTO tasks (id, title, description, status, priority, assigned_agent, mission_id, due_date, tags, steps)
       VALUES (:id, :title, :description, :status, :priority, :assigned_agent, :mission_id, :due_date, :tags, :steps)`,
      {
        id,
        title,
        description: description || null,
        status: status || "todo",
        priority: priority || "medium",
        assigned_agent: assigned_agent || null,
        mission_id: mission_id || null,
        due_date: due_date || null,
        tags: tags ? JSON.stringify(tags) : null,
        steps: steps ? JSON.stringify(steps) : null,
      }
    );

    const result = await execute("SELECT * FROM tasks WHERE id = :id", { id });
    return NextResponse.json({ task: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/tasks]", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/tasks — Update a task (status, assigned_agent, steps, etc.)
// ---------------------------------------------------------------------------

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, assigned_agent, steps, title, description, due_date, priority } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const updates: string[] = ["updated_at = datetime('now')"];
    const params: Record<string, string | null> = { id };

    if (status !== undefined) { updates.push("status = :status"); params.status = status; }
    if (assigned_agent !== undefined) { updates.push("assigned_agent = :assigned_agent"); params.assigned_agent = assigned_agent; }
    if (steps !== undefined) { updates.push("steps = :steps"); params.steps = JSON.stringify(steps); }
    if (title !== undefined) { updates.push("title = :title"); params.title = title; }
    if (description !== undefined) { updates.push("description = :description"); params.description = description; }
    if (due_date !== undefined) { updates.push("due_date = :due_date"); params.due_date = due_date; }
    if (priority !== undefined) { updates.push("priority = :priority"); params.priority = priority; }

    if (updates.length === 1) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await execute(
      `UPDATE tasks SET ${updates.join(", ")} WHERE id = :id`,
      params
    );

    const result = await execute("SELECT * FROM tasks WHERE id = :id", { id });
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task: result.rows[0] });
  } catch (err) {
    console.error("[PATCH /api/tasks]", err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/tasks — Delete a task by id
// ---------------------------------------------------------------------------

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await execute("DELETE FROM tasks WHERE id = :id", { id });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/tasks]", err);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
