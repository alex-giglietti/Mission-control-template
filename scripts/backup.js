#!/usr/bin/env node
/**
 * Mission Control - Nightly Database Backup
 * Exports all Turso tables to a timestamped JSON backup file.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

async function backup() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  // Discover all tables
  const tablesResult = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'libsql_%'"
  );
  const tables = tablesResult.rows.map(r => r[0]);

  if (tables.length === 0) {
    console.log('No tables found. Nothing to back up.');
    process.exit(0);
  }

  const backupData = {
    timestamp: new Date().toISOString(),
    source: process.env.TURSO_DATABASE_URL,
    tables: {},
    rowCounts: {},
  };

  let totalRows = 0;
  for (const table of tables) {
    const result = await client.execute(`SELECT * FROM "${table}"`);
    backupData.tables[table] = result.rows.map(row => {
      const obj = {};
      result.columns.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
    backupData.rowCounts[table] = result.rows.length;
    totalRows += result.rows.length;
    console.log(`  ✓ ${table}: ${result.rows.length} rows`);
  }

  // Write backup
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const filename = `backup_${ts}.json`;
  const outPath = path.join(BACKUP_DIR, filename);
  fs.writeFileSync(outPath, JSON.stringify(backupData, null, 2));

  // Prune backups older than 30 days
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('backup_') && f.endsWith('.json'))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs }))
    .sort((a, b) => a.mtime - b.mtime);

  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  let pruned = 0;
  for (const f of files) {
    if (f.mtime < cutoff) {
      fs.unlinkSync(path.join(BACKUP_DIR, f.name));
      pruned++;
    }
  }

  const sizeMB = (fs.statSync(outPath).size / 1024 / 1024).toFixed(3);
  console.log(`\nBackup complete: ${filename}`);
  console.log(`Tables: ${tables.length} | Rows: ${totalRows} | Size: ${sizeMB} MB`);
  if (pruned > 0) console.log(`Pruned ${pruned} backup(s) older than 30 days.`);

  return { filename, tables: tables.length, totalRows, sizeMB, pruned };
}

backup().catch(err => {
  console.error('Backup failed:', err.message);
  process.exit(1);
});
