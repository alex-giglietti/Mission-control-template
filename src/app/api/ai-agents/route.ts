import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';

// GET /api/ai-agents — list all agents
export async function GET() {
  try {
    const result = await execute(`SELECT * FROM ai_agents ORDER BY created_at ASC`);
    const agents = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      description: row.description,
      attached_tools: (() => {
        try { return JSON.parse((row.attached_tools as string) || '[]'); }
        catch { return []; }
      })(),
      custom_instructions: row.custom_instructions,
      status: row.status,
      last_activity: row.last_activity,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
    return NextResponse.json({ agents });
  } catch (err) {
    console.error('[ai-agents GET]', err);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

// POST /api/ai-agents — create a new agent
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, description, attached_tools, custom_instructions } = body;

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const toolsJson = JSON.stringify(attached_tools ?? []);

    await execute(
      `INSERT INTO ai_agents (id, name, role, description, attached_tools, custom_instructions, status)
       VALUES (lower(hex(randomblob(16))), :name, :role, :description, :tools, :instructions, 'active')`,
      {
        name,
        role: role ?? null,
        description: description ?? null,
        tools: toolsJson,
        instructions: custom_instructions ?? null,
      }
    );

    const created = await execute(
      `SELECT * FROM ai_agents WHERE name = :name ORDER BY created_at DESC LIMIT 1`,
      { name }
    );

    return NextResponse.json({ agent: created.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('[ai-agents POST]', err);
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}

// PATCH /api/ai-agents — update agent by id
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, custom_instructions, attached_tools, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updates: string[] = ['updated_at = datetime(\'now\')'];
    const args: Record<string, unknown> = { id };

    if (custom_instructions !== undefined) {
      updates.push('custom_instructions = :instructions');
      args.instructions = custom_instructions;
    }
    if (attached_tools !== undefined) {
      updates.push('attached_tools = :tools');
      args.tools = JSON.stringify(attached_tools);
    }
    if (status !== undefined) {
      if (!['active', 'paused'].includes(status)) {
        return NextResponse.json({ error: 'status must be active or paused' }, { status: 400 });
      }
      updates.push('status = :status');
      args.status = status;
    }

    await execute(
      `UPDATE ai_agents SET ${updates.join(', ')} WHERE id = :id`,
      args
    );

    const updated = await execute(`SELECT * FROM ai_agents WHERE id = :id`, { id });
    if (updated.rows.length === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({ agent: updated.rows[0] });
  } catch (err) {
    console.error('[ai-agents PATCH]', err);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}
