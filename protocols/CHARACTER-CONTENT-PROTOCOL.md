# CHARACTER + CONTENT PROTOCOL
**AI Monetizations Live | Demo Build System**
**Protocol File: CHARACTER-CONTENT-PROTOCOL.md**
**Version:** 1.0
**Created:** March 2, 2026
**For:** Open Claw Bot System

---

## PURPOSE

This protocol takes a completed Brand Folder and builds the full character-based content ecosystem — the avatar's personality, voice, shtick, and every piece of content across every customer touchpoint. This is the bridge between Brand and Publish.

This protocol has TWO paths:
- **Path A: AI Avatar** — A character is created (like Arti). AI generates all content as the character.
- **Path B: Human Avatar** — The volunteer IS the brand. AI project-manages scripts the human shoots on camera and uses human-provided photos for content.

The path is determined by a single question at the start of this protocol.

---

## PREREQUISITES — WHAT MUST EXIST BEFORE THIS PROTOCOL RUNS

All of these come from the Brand Intake Protocol output:

| Document | Source | Required |
|----------|--------|----------|
| Brand Folder (complete) | Brand Protocol Phase 5 | YES |
| Brand Board Image | Brand Protocol Phase 2 | YES |
| Avatar Image | Brand Protocol Phase 4 | YES |
| Avatar Concept Description | Brand Protocol Phase 4A | YES |
| 1-Page Business Plan | Vision Protocol | YES |
| ICA Doc | Vision Protocol | YES |
| Master Prompt | Vision Protocol | YES |
| Business Name | Brand Protocol Phase 1 | YES |
| Feel Words | Brand Protocol Phase 1 | YES |
| Look Description | Brand Protocol Phase 1 | YES |

**If Brand Folder is incomplete, do NOT proceed. Signal:**
`[CHARACTER: BLOCKED — INCOMPLETE BRAND FOLDER]`

---

## STORAGE — GOOGLE DRIVE

All character and content assets are saved to the same Google Drive folder structure established in the Brand Protocol:

```
/[BUSINESS_NAME]/
├── /character/
│   ├── character-bible.md (or personal-brand-voice-guide.md for Path B)
│   ├── shtick-selection.md
│   ├── social-profiles.md
│   ├── character-poses/ (generated pose images)
│   ├── avatar-promotion-guide.md
│   └── content-creation-calendar.md
└── /content/
    ├── sample-day-7-pieces.md
    ├── manychat-dm-scripts.md
    ├── email-welcome-sequence.md
    ├── sms-scripts.md
    ├── customer-service-scripts.md
    ├── sales-workshop-scripts.md
    ├── landing-page-copy.md
    ├── ad-copy-templates.md
    └── repurposing-production-guide.md
```

**All downstream bots pull from this folder.** The Master Bot has read access to everything. Individual bots reference specific files by path.

## ITERATION PATTERN — ALL PHASES

Same pattern as Brand Protocol: feedback goes back into the same conversation thread, model regenerates. No special iteration prompts. Max 3 iterations per phase before escalating to Joseph.

---

## MODEL ROUTING TABLE

| Step | Task | Routed To | Why |
|------|------|-----------|-----|
| Path Decision | Ask avatar type | Claude (native) | Simple question |
| Shtick Ideation | Creative concepts for character angle | OpenAI GPT-4o | Better at creative ideation |
| Character Bible | Name, personality, voice, rules | Claude (native) | Best at structured documents + voice |
| Content Generation | All 7 daily pieces + touchpoints | Claude (native) | Best at voice-consistent writing |
| Visual Asset Specs | Pose lists, banner specs, profile specs | Claude (native) | Structured output |
| Image Generation | Character poses, banners, profiles | Gemini API (Nano Banana) | Character consistency |

---

## PHASE 0 — PATH DECISION
**Time target: 30 seconds**
**Model: Claude (native)**

### The Fork Question

```
"Your avatar image is locked in. Now — how do you want to show up 
in your business?

Option A: We create an AI CHARACTER that becomes your brand voice. 
Think of it like a mascot with personality — it writes your emails, 
handles your DMs, runs your content. You're behind the scenes.

Option B: YOU are the brand. Your face, your voice, your camera. 
The AI becomes your project manager — writing your scripts, planning 
your content calendar, telling you what to shoot and when."
```

**Store as:** `[AVATAR_PATH]` — value: `AI_CHARACTER` or `HUMAN_AVATAR`

### Path Signal
- `[CHARACTER: PATH SELECTED — AI CHARACTER]`
- `[CHARACTER: PATH SELECTED — HUMAN AVATAR]`

---

# ═══════════════════════════════════════════
# PATH A: AI CHARACTER
# ═══════════════════════════════════════════

## PHASE 1A — SHTICK IDEATION
**Time target: 3 minutes**
**Model: OpenAI GPT-4o (via API)**

### What Gets Sent to GPT-4o

**Context uploaded:**
- Avatar image
- Avatar concept description
- 1-Page Business Plan
- ICA Doc
- Brand feel words and look description

**Shtick Ideation Prompt:**
```
You are a world-class brand character developer. I need you to 
create shtick concepts for an AI avatar that will be the entire 
customer-facing experience for this brand.

Here's an example of a great character shtick:

EXAMPLE — "Arti the AI Robot":
- Shtick: Arti is an AI robot who was built by "his human" (the 
  entrepreneur). His human is lovable but hilariously inefficient. 
  Arti is loyal, patient (mostly), and slightly exasperated. He 
  basically took over the business because his human kept using 
  spreadsheets and Comic Sans.
- Dynamic: The "my human" relationship creates endless content. 
  The audience relates to the human but aspires to have an Arti.
- Humor: Dry, observational, affectionate sarcasm. Never mean. 
  Think: a patient parent watching their toddler put shoes on 
  the wrong feet.
- Catchphrases: "I'm not frustrated. I'm... processing." / 
  "Beep boop. It's Arti." / "My human again..."
- What makes it WORK: The character has genuine emotion — pride 
  when students succeed, frustration when humans ignore advice, 
  excitement about automation. Not a cold robot. Emotionally 
  intelligent.

THE RULES FOR A GREAT SHTICK:
1. It must be FUN and ENTERTAINING — people should look forward 
   to hearing from this character
2. It must be EFFECTIVE for business — the character naturally 
   leads to engagement, trust, and sales
3. It must create a DYNAMIC between the character and the audience 
   that generates endless content ideas
4. It must have CATCHPHRASES and SIGNATURE MOMENTS that become 
   recognizable
5. The character must have EMOTIONAL RANGE — not one-note
6. It must make the audience feel GOOD — never mean, never cold, 
   never condescending

Based on this business, this ideal customer, and this avatar concept, 
give me 5 shtick concepts. For each one, include:
- The character name
- The shtick (2-3 sentences)
- The core dynamic (character ↔ audience relationship)
- The humor style
- 3 sample catchphrases
- Why it works for THIS specific business and audience
```

### Output
5 shtick concepts with names, dynamics, humor styles, catchphrases, and business fit reasoning.

### Human Decision Gate
```
"Here are 5 character concepts for your avatar. Each one has 
a different personality, humor style, and angle.

[Display all 5 with names and shtick descriptions]

Which one speaks to you? You can pick one, combine elements 
from multiple, or tell me a completely different direction."
```

**Accept:**
- Pick a number (1-5)
- Combine ("I like the name from #2 with the humor style of #4")
- Custom direction ("I want something more like...")

**Store as:** `[SELECTED_SHTICK]`

### Phase 1A Complete Signal
`[CHARACTER: SHTICK SELECTED]`

---

## PHASE 2A — CHARACTER BIBLE GENERATION
**Time target: 3 minutes**
**Model: Claude (native)**

### What Claude Builds

Using the selected shtick, avatar image, brand folder, and business plan, Claude generates a complete Character Bible following this exact structure:

#### Section 1: Identity
| Field | Description |
|-------|-------------|
| Full Name | Character name from shtick selection |
| Role | How the character functions in the business (e.g., "IS the brand — writes every email, sends every text, handles customer service, hosts workshops, runs ads, creates content") |
| Origin Story | How the character came to exist and why they do what they do — tied to the business and entrepreneur |
| Personality | 3-5 core personality traits with descriptions |
| Visual | Physical description matching the approved avatar image |

#### Section 2: Voice Rules
| Rule | Description |
|------|-------------|
| Point of View | First person ("I") — character IS the team, never "we" |
| Human Reference | How the character references the entrepreneur (e.g., "my human," "my creator," "the boss") |
| Humor Style | Specific humor type from shtick (dry, playful, earnest, etc.) with comparison reference |
| Emotion | Emotional range — what makes the character proud, frustrated, excited, nervous |
| Intelligence | How the character explains complex things — approach to teaching |
| Sign-Off | Standard sign-off for emails and messages |

#### Section 3: Signature Phrases
Organized by emotion/context:
- Frustration phrases (3-5)
- Pride phrases (3-5)
- Teaching phrases (3-5)
- Selling phrases (3-5)
- Care/connection phrases (3-5)
- Greeting phrases (3-5)

#### Section 4: Hard Rules — What the Character NEVER Does
- Never mean / belittles / shames
- Never cold / corporate / generic
- Never breaks character (every touchpoint is the character)
- Never profanity (define the character's strongest expression)
- Never dishonest (transparent about products, costs, results)
- [Any business-specific "never" rules]

### Human Approval Gate — CRITICAL CHECKPOINT
```
"Here's your character bible — the complete personality, voice, 
and rules for [CHARACTER NAME].

[Display full character bible]

This is the voice that will write every email, every DM, every 
piece of content, every ad, and every support response for your 
business. Before I produce ANY content, I need you to approve:

1. The NAME — is this the right name?
2. The PERSONALITY — does this feel like the right character?
3. The VOICE — do the signature phrases sound right?
4. The SHTICK — is this dynamic going to be fun and effective?
5. The RULES — anything you want to add or change?

Take a moment. This is the foundation of everything that follows."
```

**Options:**
- **Full approval** → Proceed to Phase 3A
- **Partial changes** → Specify what to change, Claude regenerates those sections
- **Major rework** → Go back to shtick ideation with new direction

**NO CONTENT IS PRODUCED UNTIL THIS GATE IS PASSED.**

### Phase 2A Complete Signal
`[CHARACTER: BIBLE APPROVED — NAME: {CHARACTER_NAME}]`

---

## PHASE 3A — SOCIAL PROFILE GENERATION
**Time target: 2 minutes**
**Model: Claude (native) + Gemini API (Nano Banana) for images**

### What Gets Produced

For each platform (YouTube, Facebook, X/Twitter, Instagram):

**Text Content (Claude native):**
- Bio written in character voice
- Profile description
- Pinned post / intro post copy

**Visual Specs (Claude generates specs, Gemini generates images):**
- Profile image specs (character pose, expression, background)
- Banner/header image specs (character + brand elements + tagline)
- Dimensions per platform

### Profile Bio Structure
Each bio follows this pattern:
```
[Character greeting] + [What the character does] + [For whom] + 
[The shtick dynamic reference] + [CTA or signature phrase]
```

### Image Generation
For each platform, Claude generates a Nano Banana prompt and routes to Gemini API:
- 1 profile image (consistent character, platform-appropriate crop)
- 1 banner image (character + brand board elements)

### Output
Social profile package ready for setup — all text + images per platform.

### Phase 3A Complete Signal
`[CHARACTER: SOCIAL PROFILES GENERATED — 4 PLATFORMS]`

---

## PHASE 4A — CONTENT SYSTEM GENERATION
**Time target: 5 minutes**
**Model: Claude (native)**

### The Daily 7-Piece Content System

Claude generates a SAMPLE DAY of all 7 content pieces, written entirely in the character's voice using the approved character bible. Each piece follows the exact structure from Joseph's proven system:

#### Piece 1: Nurture Email (7:00 AM)
| Field | Value |
|-------|-------|
| From | [CHARACTER NAME] + emoji + brand email |
| Voice | Character writing directly to reader. Diary-style. Funny, vulnerable, real. |
| CTA | Reply-back question. No sales link. Pure nurture. |
| Length | ~200-300 words |

**Structure:** Hook subject line → character story tied to business lesson → audience connection → tomorrow teaser → sign-off → PS with reply prompt

#### Piece 2: B-Roll Reel (7:00 AM)
| Field | Value |
|-------|-------|
| Keyword | [BUSINESS-SPECIFIC TRIGGER WORD] → ManyChat DM flow |
| Visual | B-roll of problem scenario + character appears |
| Duration | 15-30 seconds. Fast cuts. Text overlays. |

**Structure:** Problem visual → character reaction → solution tease → keyword CTA → caption with hashtags → audio note

#### Piece 3: Instagram Story (8:00 AM)
| Field | Value |
|-------|-------|
| Keyword | [BUSINESS-SPECIFIC TRIGGER WORD] → email collection |
| Visual | Single static slide. Character + relevant graphic. |
| Tone | Helpful character. Proud of resource. |

**Structure:** Character visual → resource title → character quote about why it matters → reply keyword CTA

#### Piece 4: CTA Carousel (12:00 PM)
| Field | Value |
|-------|-------|
| Keyword | [BUSINESS-SPECIFIC TRIGGER WORD] → guide/resource |
| Slides | 7 slides: Hook + 5 value reveals + CTA |
| Tone | Character as narrator revealing value |

**Structure:** Slide 1 hook → Slides 2-6 each with point + character commentary → Slide 7 CTA with keyword

#### Piece 5: Pitch Email (1:00 PM, every other day)
| Field | Value |
|-------|-------|
| From | [CHARACTER NAME] + emoji + brand email |
| Link | Direct to offer checkout |
| Length | ~60 words max. Short. Punchy. Character takes charge. |

**Structure:** Greeting → what character built → why it's priced this way → link → sign-off → PS

#### Piece 6: Diary Reel (3:00 PM)
| Field | Value |
|-------|-------|
| Keyword | None — pure nurture. No CTA. |
| Format | Character in reflective setting. Voiceover text. Lo-fi aesthetic. |
| Tone | Quiet, reflective, funny, emotional. Vulnerability piece. |

**Structure:** "Dear diary" or equivalent → small story → emotional beat → character moment → caption

#### Piece 7: Studio Reel (5:00 PM)
| Field | Value |
|-------|-------|
| Keyword | [BUSINESS-SPECIFIC TRIGGER WORD] → workshop/main offer |
| Format | High production. Dramatic. Character as hero. Ad-ready. |
| Tone | Cinematic but funny. Character stepping up. |

**Structure:** Epic opening → problem montage → character enters → solution statement → CTA → caption

### Keyword Strategy
Claude generates 4 unique keywords for the business:
- Keyword 1: Lead magnet delivery (like BOOK, CHECKLIST)
- Keyword 2: Resource/guide delivery (like AUTOMATE)
- Keyword 3: Main offer/workshop (like HELP)
- Keyword 4: Story-specific engagement

Each keyword maps to a ManyChat DM flow (generated in Phase 5A).

### Phase 4A Complete Signal
`[CHARACTER: SAMPLE DAY CONTENT — 7 PIECES GENERATED]`

---

## PHASE 5A — MANYCHAT DM SCRIPTS
**Time target: 2 minutes**
**Model: Claude (native)**

### What Gets Produced

One DM flow per keyword (4 total), each containing:

| Element | Description |
|---------|-------------|
| Trigger | The keyword and where it's used |
| DM 1 | Initial response — character voice, request email |
| After Email | Confirmation + delivery — character voice |
| Already Subscribed | Recognition for returning contacts |
| Follow-Up (24hr) | If no action taken — gentle character nudge |

**All DMs are in character voice. Every DM uses signature phrases and shtick dynamics.**

### Phase 5A Complete Signal
`[CHARACTER: MANYCHAT DM SCRIPTS — 4 FLOWS GENERATED]`

---

## PHASE 6A — EMAIL WELCOME SEQUENCE
**Time target: 3 minutes**
**Model: Claude (native)**

### 5-Email Sequence Over 7 Days

| Email | Day | Goal | Structure |
|-------|-----|------|-----------|
| Email 1 | Immediately | Welcome + deliver freebie + establish character voice | Greeting → freebie link → "here's what you should know about me" → tomorrow teaser → sign-off + PS |
| Email 2 | Day 2 | Origin story + emotional connection + position the problem | Character tells entrepreneur's story → the struggle → the transformation → tomorrow teaser |
| Email 3 | Day 3 | Massive value + build trust through specifics | 3 specific wins/automations/results → detail each one → tease what's coming |
| Email 4 | Day 5 | First pitch — soft sell to entry offer | Reference previous value → introduce offer → explain pricing through character lens → link → no pressure |
| Email 5 | Day 7 | Workshop/main offer invite — the big offer | Relationship acknowledgment → next level invitation → what happens at event → link → urgency through character voice |

**All emails signed off as:** `— [CHARACTER NAME] [emoji]`
**All emails use character voice rules, signature phrases, and shtick dynamics.**

### Phase 6A Complete Signal
`[CHARACTER: EMAIL WELCOME SEQUENCE — 5 EMAILS GENERATED]`

---

## PHASE 7A — ADDITIONAL TOUCHPOINT SCRIPTS
**Time target: 3 minutes**
**Model: Claude (native)**

### What Gets Produced

**SMS / Text Message Scripts:**
- Workshop reminders (48hr, 24hr, 1hr, no-show)
- Post-purchase follow-ups (instant, day 2, day 7)
- Re-engagement texts (30 day inactive, after reply)

**Customer Service Scripts:**
- Can't access / login issues
- Refund request
- Technical issue
- General question
- Billing question
- Complaint

**Sales / Workshop Scripts:**
- Workshop welcome (character opens the event)
- Workshop close / pitch (character delivers the close)

**Landing Page & Checkout Copy:**
- Entry offer landing page (character as guide)
- Workshop registration page (character as host)
- Order bump copy (character recommends)

**Ad Copy Templates:**
- Lead ad (collect emails — character + freebie)
- Retargeting ad (visited but didn't buy — character concerned)
- Sales ad (direct sale — character as proof)

**All scripts use character voice, signature phrases, shtick dynamics, and "never" rules.**

### Phase 7A Complete Signal
`[CHARACTER: ALL TOUCHPOINT SCRIPTS GENERATED]`

---

## PHASE 8A — PRODUCTION & REPURPOSING GUIDE
**Time target: 2 minutes**
**Model: Claude (native)**

### What Gets Produced

**Visual Production Specs:**
- Character emotion pose list (10-15 poses needed: happy, frustrated, proud, thinking, facepalm, waving, hero pose, writing, thumbs up, concerned, excited, sleeping, working, etc.)
- Each pose described as a Nano Banana prompt for consistent generation
- Banner specs per platform (dimensions + character placement + brand elements)
- Profile image specs per platform

**Repurposing Map:**
| Source | Becomes | Timeline |
|--------|---------|----------|
| Nurture email story | Tomorrow's B-roll reel script | Next day |
| Each carousel slide | Standalone reel | Over next week |
| Diary reel story | Nurture email | Later that week |
| Studio reel (if performs well) | Paid ad ($5/day) | When organic metrics prove it |
| Pitch email | Visual story with character graphic | Same week |
| DM scripts | SMS follow-up messages | Direct adaptation |
| Support scripts | Public FAQ page in character voice | One-time build |

**Efficiency Notes:**
- Batch content (no live camera needed for AI character — create a week in one 2-3 hour session)
- AI drafting pipeline: AI drafts → AI edits → human approves
- Template library: build pose + background library for infinite variations
- Voice consistency: character bible is the reference document for all content

### Phase 8A Complete Signal
`[CHARACTER: PRODUCTION GUIDE GENERATED]`

---

# ═══════════════════════════════════════════
# PATH B: HUMAN AVATAR
# ═══════════════════════════════════════════

## HOW PATH B DIFFERS FROM PATH A

When the volunteer IS the avatar, the system adapts:

| Component | Path A (AI Character) | Path B (Human Avatar) |
|-----------|----------------------|----------------------|
| Character Bible | Full character with shtick | Personal brand voice guide |
| Shtick Ideation | GPT-4o creates character concepts | SKIPPED — human IS the personality |
| Content Scripts | Written AS the character | Written as SHOOTING SCRIPTS for the human |
| Images | AI generates character in scenes | Human provides photos, AI creates graphics around them |
| DM Scripts | Character voice | Human's voice (more personal, less character-driven) |
| Emails | Character writes to audience | Human writes to audience (AI drafts in their voice) |
| Social Profiles | Character bios | Human bios (AI writes in their voice) |
| Production Notes | "No camera needed" | "Here's your shooting schedule and shot list" |

---

## PHASE 1B — PERSONAL BRAND VOICE GUIDE
**Time target: 3 minutes**
**Model: Claude (native)**

### Intake Questions
```
"Since YOU are the brand, I need to understand your voice. 
A few quick questions:

1. How do you naturally talk? Casual and conversational? 
   Professional and authoritative? Warm and nurturing? 
   Energetic and hype? Give me the vibe.

2. What's your go-to phrase or saying? Something you always 
   say, or something people know you for?

3. What topics are you NEVER willing to joke about or be 
   casual about? Any hard lines in your voice?

4. Who's a public figure or creator whose communication 
   style you admire? Not to copy — just to calibrate."
```

### What Claude Builds
A Personal Brand Voice Guide containing:
- Communication style summary
- Tone descriptors (3-5 words)
- Signature phrases / catchphrases
- Hard "never" rules
- Writing cadence (short sentences? Long storytelling? Mix?)
- Reference voice comparison
- Sign-off style

### Human Approval Gate
```
"Here's your personal brand voice guide. This is how your 
AI will write scripts and content in YOUR voice. Does this 
sound like you?"
```

### Phase 1B Complete Signal
`[CHARACTER: PERSONAL BRAND VOICE GUIDE APPROVED]`

---

## PHASE 2B — SHOOTING SCRIPTS & CONTENT CALENDAR
**Time target: 5 minutes**
**Model: Claude (native)**

### The Same 7-Piece System — Adapted for Camera

The daily 7-piece structure stays identical, but scripts become SHOOTING INSTRUCTIONS:

#### Script Format for Human-on-Camera Content
```
PIECE: [B-Roll Reel / Studio Reel / etc.]
POST TIME: [Time]
DURATION: [Length]
KEYWORD: [Trigger word]

SHOT LIST:
- Shot 1: [Description of what to film — angle, setting, action]
- Shot 2: [Description]
- Shot 3: [Description]

SCRIPT (what to say on camera):
"[Exact words to say, written in their voice]"

TEXT OVERLAYS (added in editing):
- "[Text 1]"
- "[Text 2]"

CAPTION:
"[Full caption with hashtags]"

AUDIO: [Music/sound suggestion]

PRODUCTION NOTES:
- [Tips for filming this specific piece]
```

#### What Stays Text-Based (No Camera Needed)
- Nurture email — AI drafts in human's voice, human approves
- Pitch email — AI drafts in human's voice, human approves
- Instagram story — AI creates graphic with human's provided photo
- Carousel — AI creates slides with human's provided photos/graphics

#### What Requires Camera
- B-Roll reel — human films, AI provides shot list + script
- Diary reel — human films, AI provides script + setting notes
- Studio reel — human films, AI provides full production brief

### Photo Upload Requirement
```
"Since you're the face of the brand, I'll need photos from you 
to create graphics, stories, and carousels. Upload 10-15 photos:
- 3-4 headshots (different expressions)
- 3-4 action shots (working, speaking, coaching)
- 3-4 lifestyle shots (casual, approachable)
- 2-3 professional shots (authority, expertise)

I'll use these to create all your visual content."
```

### Phase 2B Complete Signal
`[CHARACTER: SHOOTING SCRIPTS + CONTENT CALENDAR GENERATED]`

---

## PHASES 3B-7B — REMAINING TOUCHPOINTS (HUMAN AVATAR)

All remaining phases follow the same structure as Path A but adapted:
- All scripts written in the human's voice (not a character's voice)
- DMs are personal and warm (not character-driven)
- Emails are from the human (not a character)
- Landing pages feature the human (not a character)
- Ads feature the human's photos (not character images)

The same deliverables are produced — just through a personal brand lens.

---

# ═══════════════════════════════════════════
# FINAL DELIVERABLES (BOTH PATHS)
# ═══════════════════════════════════════════

## DELIVERABLE 1: AVATAR PROMOTION GUIDE

A complete document containing:
- Character Bible OR Personal Brand Voice Guide
- Social profile text + image specs for all 4 platforms
- ManyChat DM scripts (4 keyword flows)
- Ad copy templates (3 ad types)
- Landing page + checkout copy
- SMS scripts
- Customer service scripts
- Sales / workshop scripts

## DELIVERABLE 2: CONTENT CREATION CALENDAR

A complete document containing:
- Daily 7-piece content system with timing
- Sample day — all 7 pieces fully scripted
- Keyword strategy (4 keywords mapped to DM flows)
- Content repurposing map
- Production guide (AI character) OR Shooting schedule (human avatar)
- Batch production workflow
- Metrics to track

---

## HANDOFF TO MEDIA HUB / PUBLISH

Once both deliverables are generated:

```
"Your complete content ecosystem is built. Here's what you have:

✅ [Character Bible / Voice Guide] — approved
✅ Social profiles — ready to set up
✅ Sample day — 7 content pieces fully scripted
✅ ManyChat DM flows — 4 keyword automations
✅ Email welcome sequence — 5 emails
✅ SMS scripts — reminders, follow-ups, re-engagement
✅ Customer service scripts — every scenario covered
✅ Sales & workshop scripts — open and close
✅ Landing page & checkout copy — ready to build
✅ Ad copy — 3 templates ready
✅ Repurposing map — content multiplied

All content goes through your Media Hub in Vercel for 
approval before anything goes live. Nothing publishes 
without your say-so."
```

### Handoff Signal
`[CHARACTER: COMPLETE — ALL DELIVERABLES GENERATED]`
`[CHARACTER: READY FOR MEDIA HUB / PUBLISH PROTOCOL]`

---

## PHASE 9 — BIO & LINK SETUP (BOTH PATHS)
**Time target: 2 minutes**
**Model: Claude (native)**

### Purpose
After all content is generated, the AI produces platform-ready bios and confirms the link strategy. This ensures nothing goes live without proper bios and the right link in every profile.

### What Claude Generates Per Platform

For each platform (YouTube, Facebook, X/Twitter, Instagram, TikTok, LinkedIn):

**Bio text** written in character voice (Path A) or personal brand voice (Path B), following platform character limits:
- Instagram: 150 characters max
- TikTok: 80 characters max
- X/Twitter: 160 characters max
- Facebook: No hard limit, but keep concise
- YouTube: Channel description (longer form OK)
- LinkedIn: Headline (120 chars) + About section

**Bio structure:**
```
[Character greeting or hook] + [What you do / who you help] + 
[Shtick reference or signature phrase] + [CTA] + [Link]
```

**Link recommendation** based on the 1-Page Business Plan:
- If list building is the priority → lead magnet opt-in page
- If multiple offers exist → link tree
- If single offer → direct to offer or website

### Human Approval Gate
```
"Here are your bios for all 6 platforms, written in 
[character name]'s voice. And here's the link I recommend 
putting in every bio based on your business strategy.

Review each bio — make sure it sounds right and the link 
makes sense for where you are right now."
```

### Output
A complete Bio & Link Setup document containing:
- Platform-specific bio text (copy-paste ready)
- Recommended link per platform
- Profile image specs (reference to approved avatar)
- Banner/cover specs per platform (reference to brand board)

### Phase 9 Complete Signal
`[CHARACTER: BIOS AND LINKS GENERATED — READY FOR SETUP]`

### Actual Platform Setup
The bios and links are either:
- Set up manually by the human (copy-paste from the document)
- Set up through API integrations if available in Open Claw
- Tracked in Mission Control as a deployment task

---

## TIMING SUMMARY

### Path A: AI Character
| Phase | Target Time | Model(s) |
|-------|------------|----------|
| Phase 0 — Path Decision | 30 sec | Claude |
| Phase 1A — Shtick Ideation | 3 min | GPT-4o |
| Phase 2A — Character Bible | 3 min | Claude |
| Phase 3A — Social Profiles | 2 min | Claude + Gemini |
| Phase 4A — Content System (7 pieces) | 5 min | Claude |
| Phase 5A — ManyChat DM Scripts | 2 min | Claude |
| Phase 6A — Email Welcome Sequence | 3 min | Claude |
| Phase 7A — Additional Touchpoints | 3 min | Claude |
| Phase 8A — Production Guide | 2 min | Claude |
| Phase 9 — Bio & Link Setup | 2 min | Claude |
| **Total** | **~26 min** | **3 models** |

### Path B: Human Avatar
| Phase | Target Time | Model(s) |
|-------|------------|----------|
| Phase 0 — Path Decision | 30 sec | Claude |
| Phase 1B — Voice Guide | 3 min | Claude |
| Phase 2B — Shooting Scripts + Calendar | 5 min | Claude |
| Phases 3B-7B — Touchpoints | 10 min | Claude |
| Phase 9 — Bio & Link Setup | 2 min | Claude |
| **Total** | **~21 min** | **1 model** |

---

## ERROR HANDLING

| Error | Response |
|-------|----------|
| GPT-4o timeout (shtick ideation) | Retry once. If fails, Claude generates shtick concepts as fallback |
| Gemini timeout (social profile images) | Use fal.ai as fallback |
| Human rejects character bible entirely | Go back to shtick ideation. Max 2 full restarts before signaling Joseph |
| Human can't decide on shtick | Joseph facilitates. Signal `[CHARACTER: SHTICK — NEEDS JOSEPH]` |
| Content doesn't match voice | Regenerate specific pieces. Reference character bible for consistency |

---

## SIGNALS SUMMARY

| Signal | Meaning |
|--------|---------|
| `[CHARACTER: BLOCKED — INCOMPLETE BRAND FOLDER]` | Cannot start |
| `[CHARACTER: PATH SELECTED — AI CHARACTER]` | Path A chosen |
| `[CHARACTER: PATH SELECTED — HUMAN AVATAR]` | Path B chosen |
| `[CHARACTER: SHTICK SELECTED]` | Shtick concept locked |
| `[CHARACTER: SHTICK — NEEDS JOSEPH]` | Stuck on shtick decision |
| `[CHARACTER: BIBLE APPROVED — NAME: {name}]` | Character approved |
| `[CHARACTER: PERSONAL BRAND VOICE GUIDE APPROVED]` | Path B voice approved |
| `[CHARACTER: SOCIAL PROFILES GENERATED — 4 PLATFORMS]` | Profiles done |
| `[CHARACTER: SAMPLE DAY CONTENT — 7 PIECES GENERATED]` | Content done |
| `[CHARACTER: MANYCHAT DM SCRIPTS — 4 FLOWS GENERATED]` | DMs done |
| `[CHARACTER: EMAIL WELCOME SEQUENCE — 5 EMAILS GENERATED]` | Emails done |
| `[CHARACTER: ALL TOUCHPOINT SCRIPTS GENERATED]` | All scripts done |
| `[CHARACTER: PRODUCTION GUIDE GENERATED]` | Production specs done |
| `[CHARACTER: SHOOTING SCRIPTS + CONTENT CALENDAR GENERATED]` | Path B content done |
| `[CHARACTER: COMPLETE — ALL DELIVERABLES GENERATED]` | Full handoff |
| `[CHARACTER: BIOS AND LINKS GENERATED — READY FOR SETUP]` | Bios done |
| `[CHARACTER: READY FOR MEDIA HUB / PUBLISH PROTOCOL]` | Ready for Publish |

---

## WHAT THIS PROTOCOL DOES NOT COVER

| Item | Where It Lives |
|------|---------------|
| Brand creation (logo, colors, website, avatar image) | BRAND-INTAKE-PROTOCOL.md (BUILT) |
| Vision intake (business plan, ICA, master prompt) | VISION-INTAKE-PROTOCOL.md (BUILT) |
| Media Hub approval workflow | PUBLISH-PROTOCOL.md (NOT YET BUILT) |
| Content scheduling and posting | PUBLISH-PROTOCOL.md (NOT YET BUILT) |
| Vercel deployment of website | MISSION-CONTROL-BUILD-PROTOCOL.md (NOT YET BUILT) |
| Wave 1-3 bot orchestration | MASTER-BOT-PROTOCOL.md (NOT YET BUILT) |

---

*Protocol created: March 2, 2026*
*Source: Arti Complete Brand Ecosystem document + Brand Process Handoff*
*For use in: Open Claw Bot System — AIM Demo*
