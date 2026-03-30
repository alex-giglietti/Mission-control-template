const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  // Step 1: Insert mission
  await client.execute({
    sql: `INSERT OR REPLACE INTO missions (id, name, description, status) VALUES (?, ?, ?, ?)`,
    args: [
      'mission-media-mogul-100m',
      'Media Mogul Growth Engine — $100M',
      "Joe's 7-lever personal brand system to reach $100M/year. Levers: PUBLISH, PAID ADS, PROSPECTING, PARTNERING, CART, CALL, CROWD.",
      'active',
    ],
  });
  console.log('✅ Mission created: Media Mogul Growth Engine — $100M');

  // Step 2: Insert 10 tasks
  const tasks = [
    {
      id: 'mm-crowd-weekly-webinar',
      title: '🎤 CROWD: Run Weekly Webinar — This Week',
      status: 'up-next',
      priority: 'Critical',
      assigned_agent: 'Joe',
      due_date: '2026-03-20',
      description: "Schedule and run a weekly webinar ASAP. This is the proven closer. Don't wait on Visionary AI demo. Definition of done: webinar scheduled, registrations open, Joe on stage closing.",
      tags: 'crowd,revenue,immediate',
    },
    {
      id: 'mm-call-ai-ticket-seller',
      title: '📞 CALL: Deploy AI Ticket Seller (GHL)',
      status: 'up-next',
      priority: 'Critical',
      assigned_agent: 'Solomon',
      due_date: '2026-03-21',
      description: 'Build and activate GHL Conversation AI to sell webinar/event tickets and upsell buyers who are ready. AI handles the selling, Joe handles the closing. DoD: AI bot live, selling tickets to weekly webinar, upsell flow working.',
      tags: 'call,automation,ai,ghl',
    },
    {
      id: 'mm-paid-ads-laurel-retargeting',
      title: '💸 PAID ADS: Launch Laurel Retargeting Playbook',
      status: 'up-next',
      priority: 'High',
      assigned_agent: 'Solomon',
      due_date: '2026-03-21',
      description: 'Get retargeting ads live following the Laurel Playbook. Stay in front of warm FB followers and webinar visitors. DoD: retargeting campaign live on Meta, budget set, targeting warm audiences.',
      tags: 'paid-ads,facebook,retargeting',
    },
    {
      id: 'mm-publish-show-launch',
      title: '📣 PUBLISH: Launch Media Mogul Show — First Episode',
      status: 'todo',
      priority: 'Critical',
      assigned_agent: 'Joe',
      due_date: '2026-04-14',
      description: 'Record and publish first episode. Lead format: Visit an influencer and build them a business with AI in a single episode. DoD: Episode 1 recorded, edited, published on YouTube + repurposed to socials.',
      tags: 'publish,show,content',
    },
    {
      id: 'mm-publish-hot-seat-system',
      title: '📣 PUBLISH: Build Hot Seat Content System',
      status: 'todo',
      priority: 'High',
      assigned_agent: 'Solomon',
      due_date: '2026-04-07',
      description: "Hot seats are Joe's secret weapon — audiences cry and shift watching them. Build a system to: run hot seats in webinars, clip and post as organic content, use in ad creatives. DoD: Hot seat clip template built, first 3 clips repurposed.",
      tags: 'publish,hot-seat,content',
    },
    {
      id: 'mm-cart-book-launch',
      title: '🛒 CART: Publish Book + Funnel',
      status: 'up-next',
      priority: 'Critical',
      assigned_agent: 'Solomon',
      due_date: '2026-04-07',
      description: "Get first book live with a funnel. Low ticket entry point that creates buyers before they know Joe. DoD: Book published, funnel live, ads driving traffic to it.",
      tags: 'cart,book,funnel',
    },
    {
      id: 'mm-crowd-monthly-challenge',
      title: '👥 CROWD: Build Monthly Challenge Framework',
      status: 'todo',
      priority: 'High',
      assigned_agent: 'Solomon',
      due_date: '2026-04-01',
      description: 'Monthly challenge in addition to weekly webinar. Structure, registration page, fulfillment flow. DoD: Challenge framework built, April challenge scheduled, registrations open.',
      tags: 'crowd,challenge,monthly',
    },
    {
      id: 'mm-partnering-influencer-targets',
      title: '🔗 PARTNERING: Identify 5 Influencer Collab Targets',
      status: 'todo',
      priority: 'High',
      assigned_agent: 'Solomon',
      due_date: '2026-04-30',
      description: 'Find 5 influencer targets for the show format. Become Media Mogul Show episodes AND potential deals. DoD: 5 targets identified, outreach sent, 1 confirmed.',
      tags: 'partnering,influencers,show',
    },
    {
      id: 'mm-prospecting-workshop-outreach',
      title: '🤝 PROSPECTING: Build Workshop Outreach System',
      status: 'todo',
      priority: 'Medium',
      assigned_agent: 'Solomon',
      due_date: '2026-04-30',
      description: 'Direct outreach to potential workshop buyers. DMs, LinkedIn, email sequences. AI handles volume, Joe handles warm responses. DoD: System live, 50 qualified prospects contacted per week.',
      tags: 'prospecting,outreach,workshop',
    },
    {
      id: 'mm-partnering-media-acquisitions',
      title: '🔗 PARTNERING: Media Channel Acquisition Pipeline',
      status: 'todo',
      priority: 'Medium',
      assigned_agent: 'Joe',
      due_date: '2026-05-15',
      description: "Identify and approach media channels for acquisition or partnership. Joe's media mogul identity monetizes distribution. DoD: 3 channels evaluated, deal terms drafted for 1.",
      tags: 'partnering,media,acquisition',
    },
  ];

  for (const task of tasks) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO tasks (id, title, description, status, priority, assigned_agent, mission_id, due_date, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        task.id,
        task.title,
        task.description,
        task.status,
        task.priority,
        task.assigned_agent,
        'mission-media-mogul-100m',
        task.due_date,
        task.tags,
      ],
    });
    console.log(`✅ Task created: ${task.title}`);
  }

  console.log('\nDONE: Mission Control updated — 10 tasks created under Media Mogul Growth Engine — $100M');
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
