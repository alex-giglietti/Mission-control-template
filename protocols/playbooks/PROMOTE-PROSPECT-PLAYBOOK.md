# PROMOTE > PROSPECT PLAYBOOK (Cold Email System — Volume Infrastructure)

**Classification: P1 — PROMOTE > Prospect**
**Purpose: Outbound cold email infrastructure to generate event registrations and book funnel entries at scale**
**Source: Cold Email System Build Playbook (Joseph Aaron / AI Monetizations Live)**
**Bot Target: Outbound Bot (Wave 2 — requires Vision + Brand + Offer defined)**

---

## OVERVIEW

This is a volume-based cold email infrastructure designed to send 1M+ emails per month at less than $10k/month cost. Responses route to either event registrations or a free book funnel. This is NOT a "send 50 emails and hope" system — it's an engineered sending machine with scrapers, enrichment waterfalls, validation layers, and automated campaign management.

**Mission:** Build infrastructure to send 1M+ emails/month at <$10k/month cost. Route responses to event registrations or free book funnel.

---

## MODEL USAGE (Open Claw Routing)

| Model | Use For |
|---|---|
| **Opus 4.5** | Conversations, email copy, persuasion, strategy decisions |
| **Sonnet** | Code generation, data processing, API integrations, routine tasks |

---

## TECH STACK

| Tool | Purpose | Cost |
|---|---|---|
| Claude Code | Build everything | $200/mo |
| Railway | Host workers + Postgres DB | $50–200/mo |
| Vercel | Dashboards | $20/mo |
| GitHub | Code storage | Free |
| Instantly or Email Bison | Sending platform | $500–1k/mo |
| AR Arc | Lead data | $0.005–0.01/lead |
| NeverBounce / ZeroBounce | Email validation | $500–1k/mo |

---

## BUILD SEQUENCE (6-Phase, 6-Week Rollout)

### Phase 1: Foundation (Week 1)

1. Create GitHub repo
2. Set up Railway account + Postgres database
3. Create Vercel account
4. Build database schema:

**Tables required:**
- `companies` — name, domain, industry, location, employees
- `contacts` — name, title, email, linkedin, phone, company_id
- `enrichments` — contact_id, source, confidence, validated
- `campaigns` — contact_id, list, send_date, status, response

### Phase 2: Lead Processing (Week 2)

1. CSV processor: intake → clean → dedupe → store
2. Deploy 5–10 Railway workers for parallel processing
3. Build queue system for lead enrichment

### Phase 3: Lead Scrapers (Week 3)

**Google Maps Scraper:**
- Input: industry + zip codes (32k+ US zips)
- Output: company, address, phone, website
- Scrape zip-by-zip for complete results

**Ad Library Scrapers (Google + LinkedIn):**
- Find companies running ads in last 30–60 days
- Filter by ad volume
- These are businesses already spending on marketing (higher quality leads)

### Phase 4: Enrichment Waterfall (Week 4)

1. **Primary:** AR Arc API integration
2. **Fallback:** AI lead finder (searches internet when vendors return empty)
3. **Email validation waterfall** (multiple validators for accuracy)
4. **ICP scoring layer** (score leads against volunteer's Ideal Customer Avatar)

### Phase 5: Sending Infrastructure (Week 5)

1. Purchase 100–200 domains (variations of brand)
2. Set up 3 inboxes per domain (Google Workspace)
3. Configure DNS: SPF, DKIM, DMARC for each domain
4. Warmup 2–3 weeks before sending
5. Connect to Instantly / Email Bison
6. **Daily limit: 50 emails per inbox**

### Phase 6: Automation (Week 6)

1. Auto-delete old leads from completed campaigns
2. Auto-upload fresh leads to active campaigns
3. Daily performance reports
4. Copy analysis engine (identifies winning subject lines and angles)

---

## EMAIL SEQUENCES

### Sequence A: Event Registration

**Email 1 — Opener**
- **Subject:** [Name], quick question
- **Body:** Saw you're running [business type]. We're hosting a live workshop showing how to build AI systems that run your business ops — marketing, sales, fulfillment. Limited seats. Worth 45 minutes?
- **CTA:** [Link to register]
- **Sign-off:** [Signature]

**Email 2 — Day 3 Follow-Up**
- **Subject:** Re: [Name], quick question
- **Body:** Bumping this — the workshop is [date]. Business owners who attended built complete AI executive teams in one session. Still have a seat if you want it.
- **CTA:** [Link]

**Email 3 — Day 7 Closing**
- **Subject:** Closing registration
- **Body:** [Name], registration closes tomorrow. If building AI systems to run your business sounds useful, grab your seat. If not, no worries.
- **CTA:** [Link]
- **Sign-off:** [Signature]

### Sequence B: Free Book Funnel

**Email 1 — Opener**
- **Subject:** Free copy for [Name]
- **Body:** Wrote a book on building AI systems that run business operations. Giving away free copies to business owners this week. Want one? Just reply "yes" or grab it here.
- **CTA:** [Link]
- **Sign-off:** [Signature]

**Email 2 — Day 3 Follow-Up**
- **Subject:** Re: Free copy
- **Body:** Following up — still have a copy reserved for you. Covers how to build AI that handles marketing, sales ops, and fulfillment without hiring.
- **CTA:** [Link to claim]

**Email 3 — Day 7 Last Call**
- **Subject:** Last call
- **Body:** [Name], giving your reserved copy to someone else tomorrow. Grab it now if you want it.
- **CTA:** [Link]
- **Sign-off:** [Signature]

---

## DAILY SENDING LIMITS

| Platform | Limit |
|---|---|
| Cold email | 50/day per inbox |
| LinkedIn connections | 15–20/day |
| LinkedIn DMs | 30–50/day |

---

## METRICS TO TRACK

| Metric | Target |
|---|---|
| Open rate | >50% |
| Reply rate | >5% |
| Positive reply rate | >2% |
| Bounce rate | <3% |
| Spam complaints | <0.1% |

---

## RESPONSE HANDLING

### Positive Response
1. Add to GHL
2. Tag source (`cold-email-event` or `cold-email-book`)
3. Trigger nurture sequence
4. Remove from all cold sequences

### Negative Response
1. Add to do-not-contact list
2. Remove from all sequences

### No Response (After Full Sequence)
1. Wait 60 days
2. Move to different offer angle
3. Re-enter system with new sequence

---

## 60-DAY CAPACITY RAMP

| Week | Inboxes | Daily Capacity |
|---|---|---|
| 3 | 450 | 7,500 |
| 4 | 600 | 15,000 |
| 6 | 900 | 40,000 |
| 8 | 1,200 | 60,000 |

**Day 60 target: 1.8M emails/month capacity**

---

## REVENUE PROJECTION

At 2,000:1 email-to-appointment ratio:

- 1.8M emails → 900 appointments/month
- 600 → events, 300 → book funnel
- **Event path:** 200 attendees × 20% close × $3k = $120k
- **Book path:** 90 applications × 15% close × $3k = $40k
- **Monthly projection:** $160k+

---

## DEPENDENCIES

### What This Playbook Needs (Inputs)
- ✅ Completed Vision (elevator pitch, ICA, offer, price point)
- ✅ Business name and domain for domain variation purchasing
- ✅ ICA document (for ICP scoring layer in enrichment waterfall)
- ✅ Event/workshop details (date, link, description) for Sequence A
- ✅ Book/lead magnet details (title, link, description) for Sequence B
- ✅ GHL account configured with pipelines and tags

### What This Playbook Produces (Outputs)
- 1.8M+ cold emails per month at scale
- Event registrations routed to GHL
- Book funnel entries routed to GHL
- Tagged and scored leads in CRM
- Daily performance reports via Vercel dashboard

### Downstream Dependencies
- **PURSUE > 1-to-1** — Positive responders enter personal follow-up sequences
- **PURSUE > Group** — Event registrants enter group nurture (reminder sequences)
- **PROFIT > Crowd** — Event attendees become workshop close targets
- **PROFIT > Call** — Book funnel respondents enter strategy call pipeline
- **PROJECT MANAGE** — Daily reports feed into Mission Control dashboard

---

## BOT EXECUTION NOTES (FOR OUTBOUND BOT)

### What the Bot Builds During Demo
The Outbound Bot does NOT build the full infrastructure live (that's a 6-week build). During the demo, it produces:

1. **Sequence A emails (3)** — Customized to the volunteer's event/workshop, written with their ICA's language
2. **Sequence B emails (3)** — Customized to the volunteer's lead magnet/book
3. **ICP scoring criteria** — Based on the volunteer's ICA, defining what makes a lead high/medium/low quality
4. **GHL automation config** — Tags, pipeline stages, and trigger rules for response handling
5. **Domain naming suggestions** — 10 domain variations for their brand
6. **60-day ramp plan** — Customized to their budget and capacity goals

### What the Bot Does NOT Do During Demo
- Purchase domains
- Set up inboxes
- Configure DNS
- Build scrapers
- Deploy Railway workers
- Connect to Instantly/Email Bison

These are infrastructure builds that happen in the workshop (what they buy).

### Copy Rules
1. **KEEP IT SHORT.** Cold email is not content marketing. Every word must earn its place.
2. **PERSONALIZE** with [Name] and [business type] merge fields minimum.
3. **NO CHARACTER VOICE** in cold email. This is human-to-human, professional, direct. The character system from PROMOTE > Publish does NOT apply here.
4. **SUBJECT LINES** must feel like a real person wrote them — lowercase okay, no emojis, no marketing language.
5. **ADAPT** sequences to the volunteer's specific offer, event, or lead magnet.
6. **INCLUDE** the "if not, no worries" soft close on final emails — removes pressure.

### Claude Code Commands (for Workshop Build)
The following commands are provided to workshop attendees for building their own infrastructure:

- **Phase 1:** "Build a Postgres database schema on Railway for a cold email system. Tables needed: companies, contacts, enrichments, campaigns."
- **Phase 3:** "Build a Google Maps scraper that takes an industry keyword and list of zip codes, extracts business data."
- **Phase 4:** "Build a lead enrichment system that: 1) Checks AR Arc API first, 2) Falls back to AI search if vendor returns empty, 3) Validates emails through multiple validators."
- **Phase 6:** "Build automation that: 1) Monitors lead counts in active campaigns, 2) Deletes leads from completed campaigns, 3) Uploads fresh leads automatically."

---

*PROMOTE-PROSPECT-PLAYBOOK.md | AI Monetizations Live | P1 > Prospect*
*Source: Cold Email System Build Playbook*
*Built for: Ultimate Demo System Bot Library*
