import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually
const envPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

// Create table
await client.execute(`CREATE TABLE IF NOT EXISTS ai_agents (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  role TEXT,
  description TEXT,
  attached_tools TEXT DEFAULT '[]',
  custom_instructions TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  last_activity TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
)`);

console.log('✅ Table ai_agents created (or already exists)');

// Check existing agents
const existing = await client.execute(`SELECT name FROM ai_agents`);
const existingNames = existing.rows.map(r => r.name);
console.log('Existing agents:', existingNames);

const agents = [
  {
    name: 'Content Agent',
    role: 'content',
    description: 'Writes and publishes organic content',
    tools: JSON.stringify(['Claude', 'Nano Banana', 'Buffer']),
  },
  {
    name: 'Outreach Agent',
    role: 'outreach',
    description: 'Writes and sends cold outreach',
    tools: JSON.stringify(['Claude', 'Instantly']),
  },
  {
    name: 'Ads Agent',
    role: 'ads',
    description: 'Creates and manages ad campaigns',
    tools: JSON.stringify(['Claude', 'Meta Ads']),
  },
  {
    name: 'Email Agent',
    role: 'email',
    description: 'Writes nurture sequences and broadcasts',
    tools: JSON.stringify(['Claude', 'GHL']),
  },
  {
    name: 'Fulfillment Agent',
    role: 'fulfillment',
    description: 'Delivers your service to customers',
    tools: JSON.stringify(['Claude', 'Teachable', 'Calendly']),
  },
];

let seeded = 0;
for (const agent of agents) {
  if (existingNames.includes(agent.name)) {
    console.log(`⏭  Skipping ${agent.name} (already exists)`);
    continue;
  }
  await client.execute({
    sql: `INSERT INTO ai_agents (id, name, role, description, attached_tools, status)
          VALUES (lower(hex(randomblob(16))), :name, :role, :description, :tools, 'active')`,
    args: { name: agent.name, role: agent.role, description: agent.description, tools: agent.tools },
  });
  console.log(`✅ Seeded: ${agent.name}`);
  seeded++;
}

console.log(`\nDone. ${seeded} agents seeded.`);
process.exit(0);
