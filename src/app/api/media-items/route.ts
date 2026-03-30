import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

function getClient() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const client = getClient();

    let sql = 'SELECT * FROM media_items';
    const conditions: string[] = [];
    const args: string[] = [];

    if (status) {
      conditions.push('status = ?');
      args.push(status);
    }
    if (type) {
      conditions.push('type = ?');
      args.push(type);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC';

    const result = await client.execute({ sql, args });

    return NextResponse.json({
      items: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('GET /api/media-items error:', error);
    return NextResponse.json({ error: 'Failed to fetch media items' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, title, body: itemBody, hashtags } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
    }

    const client = getClient();

    if (status) {
      const validStatuses = ['pending', 'approved', 'scheduled', 'published'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
      }

      const updates: string[] = ['status = ?', 'updated_at = datetime(\'now\')'];
      const args: (string | null)[] = [status];

      if (title !== undefined) { updates.push('title = ?'); args.push(title); }
      if (itemBody !== undefined) { updates.push('body = ?'); args.push(itemBody); }
      if (hashtags !== undefined) { updates.push('hashtags = ?'); args.push(hashtags); }

      args.push(id);

      await client.execute({
        sql: `UPDATE media_items SET ${updates.join(', ')} WHERE id = ?`,
        args,
      });
    } else if (title !== undefined || itemBody !== undefined || hashtags !== undefined) {
      const updates: string[] = ['updated_at = datetime(\'now\')'];
      const args: (string | null)[] = [];

      if (title !== undefined) { updates.push('title = ?'); args.push(title); }
      if (itemBody !== undefined) { updates.push('body = ?'); args.push(itemBody); }
      if (hashtags !== undefined) { updates.push('hashtags = ?'); args.push(hashtags); }

      args.push(id);

      await client.execute({
        sql: `UPDATE media_items SET ${updates.join(', ')} WHERE id = ?`,
        args,
      });
    } else {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updated = await client.execute({
      sql: 'SELECT * FROM media_items WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({ item: updated.rows[0] });
  } catch (error) {
    console.error('PATCH /api/media-items error:', error);
    return NextResponse.json({ error: 'Failed to update media item' }, { status: 500 });
  }
}
