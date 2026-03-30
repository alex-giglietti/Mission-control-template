require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@libsql/client');

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function run() {
  // Create table
  await client.execute(`CREATE TABLE IF NOT EXISTS media_items (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    type TEXT NOT NULL CHECK (type IN ('content', 'paid', 'broadcast')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'scheduled', 'published')),
    platform TEXT,
    content_format TEXT,
    title TEXT,
    body TEXT,
    hashtags TEXT,
    media_url TEXT,
    production_brief TEXT,
    scheduled_at TEXT,
    published_at TEXT,
    ad_phase TEXT,
    daily_budget REAL,
    cta TEXT,
    targeting TEXT,
    recipient_count INTEGER,
    email_subject TEXT,
    sequence_position INTEGER,
    playbook_slug TEXT,
    calendar_day TEXT,
    assigned_agent TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`);
  console.log('✅ Table created');

  // Seed sample items
  const items = [
    {
      id: 'item001',
      type: 'content',
      status: 'pending',
      platform: 'Instagram',
      content_format: 'reel',
      title: '3 Ways AI Is Replacing Your 9-5',
      body: 'The shift is happening faster than anyone predicted. Here are 3 ways AI is quietly replacing traditional jobs — and what you can do about it.',
      hashtags: '#AI #ArtificialIntelligence #FutureOfWork #AIMonetizations',
      production_brief: 'Hook on screen: "Your job might not exist in 2 years." Aaron talking head, fast cuts.',
      playbook_slug: 'daily-7',
      calendar_day: '2026-03-30',
      assigned_agent: 'Arty',
    },
    {
      id: 'item002',
      type: 'content',
      status: 'pending',
      platform: 'Instagram',
      content_format: 'carousel',
      title: '5 AI Income Streams You Can Start Today',
      body: 'Slide 1: You don\'t need to code. Slide 2: Offer #1 — AI Consulting. Slide 3: Offer #2 — Done-for-you automations...',
      hashtags: '#AIBusiness #Entrepreneur #PassiveIncome #AIMOneyTips',
      production_brief: '5-slide carousel. Clean white background, black text. Bold headline each slide.',
      playbook_slug: 'daily-7',
      calendar_day: '2026-03-31',
      assigned_agent: 'Arty',
    },
    {
      id: 'item003',
      type: 'content',
      status: 'approved',
      platform: 'Facebook',
      content_format: 'story',
      title: 'The $10k/Month AI Blueprint (Story)',
      body: 'Swipe up to get the free blueprint that 200+ people used to hit $10k/month with AI services.',
      hashtags: '#AIBlueprint #MoneyWithAI',
      scheduled_at: '2026-04-01T14:00:00Z',
      playbook_slug: 'daily-7',
      calendar_day: '2026-04-01',
      assigned_agent: 'Arty',
    },
    {
      id: 'item004',
      type: 'paid',
      status: 'pending',
      platform: 'Facebook',
      content_format: 'video',
      title: 'Power Content Phase 1 — Cold Traffic',
      body: 'Meet the AI workforce that runs your entire marketing department. No employees. No overhead. Just results.',
      ad_phase: 'Power Content P1',
      daily_budget: 150.00,
      cta: 'Learn More',
      targeting: 'Entrepreneurs 25-55, interested in AI, business automation, online business',
      playbook_slug: 'paid-ads',
      calendar_day: '2026-03-30',
      assigned_agent: 'Arty',
    },
    {
      id: 'item005',
      type: 'paid',
      status: 'scheduled',
      platform: 'Instagram',
      content_format: 'image',
      title: 'Webinar Registration Ad — Retargeting',
      body: 'You visited but didn\'t register. This free webinar could change everything. Spots are filling up.',
      ad_phase: 'Conversion P2',
      daily_budget: 75.00,
      cta: 'Register Now',
      targeting: 'Website visitors last 14 days, video viewers 50%+',
      scheduled_at: '2026-04-02T08:00:00Z',
      playbook_slug: 'paid-ads',
      calendar_day: '2026-04-02',
      assigned_agent: 'Arty',
    },
    {
      id: 'item006',
      type: 'broadcast',
      status: 'pending',
      platform: 'Email',
      content_format: 'email',
      title: 'The Webinar Is Tomorrow — Are You Ready?',
      email_subject: '🗓 Tomorrow: Your AI Monetization Blueprint [Confirm Your Spot]',
      body: 'Hey [First Name], just a quick reminder that tomorrow\'s live training starts at 7PM ET. We have 200+ people registered and we\'re going to cover...',
      recipient_count: 847,
      sequence_position: 3,
      playbook_slug: 'webinar-launch',
      calendar_day: '2026-03-31',
      assigned_agent: 'Arty',
    },
    {
      id: 'item007',
      type: 'broadcast',
      status: 'published',
      platform: 'Email',
      content_format: 'email',
      title: 'Registration Confirmation + Bonus',
      email_subject: 'You\'re In! Here\'s Your Access Link + A Surprise Bonus',
      body: 'Congratulations on claiming your spot. Here is your access link for the live training. As a bonus, I\'m sending you my AI Income Starter Kit...',
      recipient_count: 312,
      sequence_position: 1,
      published_at: '2026-03-28T09:00:00Z',
      playbook_slug: 'webinar-launch',
      calendar_day: '2026-03-28',
      assigned_agent: 'Arty',
    },
    {
      id: 'item008',
      type: 'broadcast',
      status: 'approved',
      platform: 'SMS',
      content_format: 'sms',
      title: 'Last Chance — Webinar in 1 Hour',
      body: 'Hey [First Name]! The AI Monetization training starts in 60 min. Jump in here: [link] — Joseph Aaron',
      recipient_count: 634,
      sequence_position: 4,
      scheduled_at: '2026-04-01T18:00:00Z',
      playbook_slug: 'webinar-launch',
      calendar_day: '2026-04-01',
      assigned_agent: 'Arty',
    },
  ];

  for (const item of items) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO media_items 
        (id, type, status, platform, content_format, title, body, hashtags, production_brief,
         scheduled_at, published_at, ad_phase, daily_budget, cta, targeting,
         recipient_count, email_subject, sequence_position, playbook_slug, calendar_day, assigned_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        item.id, item.type, item.status, item.platform || null, item.content_format || null,
        item.title || null, item.body || null, item.hashtags || null, item.production_brief || null,
        item.scheduled_at || null, item.published_at || null, item.ad_phase || null,
        item.daily_budget || null, item.cta || null, item.targeting || null,
        item.recipient_count || null, item.email_subject || null, item.sequence_position || null,
        item.playbook_slug || null, item.calendar_day || null, item.assigned_agent || null
      ]
    });
    console.log(`  ✅ Seeded: ${item.title}`);
  }

  const result = await client.execute('SELECT COUNT(*) as count FROM media_items');
  console.log(`\n✅ Total media_items in DB: ${result.rows[0].count}`);
}

run().catch(console.error);
