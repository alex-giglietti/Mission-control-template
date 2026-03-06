# BRAND INTAKE PROTOCOL
**AI Monetizations Live | Demo Build System**
**Protocol File: BRAND-INTAKE-PROTOCOL.md**
**Version:** 1.0
**Created:** March 2, 2026
**For:** Open Claw Bot System

---

## PURPOSE

This protocol governs the Brand phase of the AIM Demo. It takes the volunteer from a completed Vision (with all documents generated) through a complete brand identity, website, and avatar — ready for the Content phase.

The Brand Bot runs inside Open Claw but orchestrates calls to multiple AI models. The volunteer interacts with ONE interface. Routing happens behind the scenes.

---

## PREREQUISITES — WHAT MUST EXIST BEFORE THIS PROTOCOL RUNS

All of these come from the Vision Intake Protocol output:

| Document | Source | Required |
|----------|--------|----------|
| 1-Page Business Plan | Vision Protocol Phase 5 | YES |
| ICA Doc | Vision Protocol Phase 3 | YES |
| Master Prompt | Vision Protocol Phase 3 | YES |

**If any document is missing, do NOT proceed. Signal:**
`[BRAND: BLOCKED — MISSING VISION DOCUMENTS]`

---

## STORAGE — GOOGLE DRIVE

All brand assets are stored in a Google Drive folder accessible to the Master Bot and all downstream bots.

### Folder Structure
```
/[BUSINESS_NAME]/
├── /brand/
│   ├── brand-board.png (or .jpg)
│   ├── brand-board-approved.png (final approved version)
│   ├── website-artifact.html (or .jsx)
│   ├── thank-you-page.html
│   ├── sales-confirmation-page.html
│   ├── avatar-image.png
│   └── avatar-concept-description.md
├── /character/
│   ├── character-bible.md
│   ├── shtick-selection.md
│   ├── social-profiles.md
│   ├── avatar-promotion-guide.md
│   └── content-creation-calendar.md
├── /vision/
│   ├── 1-page-business-plan.md
│   ├── ica-doc.md
│   ├── master-prompt.md
│   └── 90-day-focus.md
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

**Downstream bots reference files by path.** When the email bot needs the character bible, it pulls `/[BUSINESS_NAME]/character/character-bible.md`. When the ad bot needs the brand board, it pulls `/[BUSINESS_NAME]/brand/brand-board-approved.png`.

---

## ITERATION PATTERN — ALL PHASES

The iteration flow is the same across every phase:

1. Bot generates output and presents to human
2. Human reviews and either approves or gives feedback
3. If feedback: the feedback is passed back into the **same conversation thread** with the relevant model — the model regenerates based on the feedback
4. Repeat until approved
5. On approval: save the final approved version to Google Drive

**No special iteration prompts are needed.** The model receives the feedback in context and regenerates. The conversation thread preserves all prior context.

**Maximum iterations before escalating to Joseph:** 3 per phase.

---

## MODEL ROUTING TABLE

Open Claw orchestrates all steps. The volunteer never switches tools.

| Step | Task | Routed To | API Connection |
|------|------|-----------|----------------|
| 1 — Brand Board | Logo, colors, fonts, visual identity | OpenAI GPT-4o | NEEDS CONNECTION |
| 2 — Website | Functional site + conversion copy | Claude (native) | READY |
| 3 — Avatar Concepts | 5 character ideas | OpenAI GPT-4o | NEEDS CONNECTION |
| 4 — Avatar Imagery | Character image generation | Gemini API (Nano Banana) | NEEDS CONNECTION |
| 5 — Assembly | Brand folder compilation | Claude (native) | READY |

**Connection dependencies that must be live before demo:**
- OpenAI API (GPT-4o)
- Gemini API (Nano Banana)

---

## PHASE 1 — BRAND INTAKE QUESTIONS
**Time target: 2 minutes**
**Model: Claude (native)**

### Bot Behavior
Open Claw asks three questions conversationally. These are the ONLY intake questions — everything else comes from the Vision documents already on file.

### Question 1: Business Name
```
"Let's build your brand. First — what's the name of your business? 
If you have a working title, that works. If you don't have one yet, 
I can suggest some based on your business plan."
```

**If no name:**
- Pull the Core Promise and Target Market from the 1-Page Business Plan
- Generate 3 name suggestions
- Human picks one or provides their own

**Store as:** `[BUSINESS_NAME]`

### Question 2: Brand Feel
```
"How do you want people to FEEL when they see your brand? 
Give me the emotions — hopeful, energized, calm, bold, 
empowered, safe, excited — whatever comes to mind."
```

**Accept:** Free-form emotional descriptors
**Store as:** `[FEEL_WORDS]`

### Question 3: Brand Look
```
"How do you want it to LOOK visually? Describe a vibe, a room, 
a texture, any imagery. Cozy, sleek, electric, professional, 
warm, minimal, luxurious — paint me a picture."
```

**Accept:** Free-form visual/aesthetic descriptors
**Store as:** `[LOOK_DESCRIPTION]`

### Phase 1 Complete Signal
`[BRAND: INTAKE COMPLETE — 3 OF 3 ANSWERS COLLECTED]`

---

## PHASE 2 — BRAND BOARD GENERATION
**Time target: 2 minutes**
**Model: OpenAI GPT-4o (via API)**

### What Gets Sent to GPT-4o

**System context uploaded:**
- Master Prompt (from Vision)
- 1-Page Business Plan (from Vision)
- ICA Doc (from Vision)

**Prompt assembled and sent:**
```
Operate like a world class brand designer and consultant. 
I want you to create an image with a logo, colors and fonts 
for this brand above. [BUSINESS_NAME] ... I want it to feel ... 
[FEEL_WORDS]. I want it to look [LOOK_DESCRIPTION]. 
Make this brand doc like a professional designer so I can 
see the brand board.
```

### Output
- Brand board image containing: logo, color palette, font selections, visual feel

### Human Approval Gate
```
"Here's your brand board. Take a look at the logo, colors, 
and fonts. Does this feel right?"
```

**Options:**
- **Approved** → Save to Brand Folder, proceed to Phase 3
- **Iterate** → Ask what to change, regenerate with adjusted prompt
- **Start Over** → Re-ask feel/look questions, regenerate from scratch

**Maximum iterations before Joseph intervenes:** 3
**If stuck after 3 iterations, signal:** `[BRAND: BOARD — NEEDS JOSEPH]`

### Phase 2 Complete Signal
`[BRAND: BOARD APPROVED — SAVED TO BRAND FOLDER]`

---

## PHASE 3 — WEBSITE BUILD
**Time target: 3 minutes**
**Model: Claude (native)**

### What Gets Uploaded to Claude
- Approved brand board image (from Phase 2)
- 1-Page Business Plan (from Vision)

### Website Prompt
```
I want you to build me a website for this brand. 
Buttons should open a popup that is all on brand.
```

### Output
- Website as artifact (HTML/React)
- Fully styled to match brand board colors, fonts, and feel
- Popup forms on-brand
- Conversion copy pulled from business plan

### Additional Pages (prompted in sequence if needed)

**Thank You Page:**
```
"Make me a thank you page."
```

**Sales Confirmation Page:**
```
"Make me a sales confirmation page."
```

### Human Approval Gate
```
"Here's your website. Look at the design, the copy, 
and the flow. Does this represent your brand?"
```

**Options:**
- **Approved** → Save all artifacts to Brand Folder, proceed to Phase 4
- **Iterate** → Specify changes, Claude regenerates
- **Start Over** → Regenerate from brand board + business plan

### Artifact Storage
All website artifacts are saved for Vercel deployment later. They are NOT deployed during the demo — they are stored as build-ready artifacts.

### Phase 3 Complete Signal
`[BRAND: WEBSITE APPROVED — ARTIFACTS SAVED]`

---

## PHASE 4 — AVATAR CREATION
**Time target: 4 minutes**
**This phase has TWO sub-steps using TWO different models**

### STEP 4A — Avatar Concept Ideas
**Model: OpenAI GPT-4o (via API)**

**What gets uploaded:**
- 1-Page Business Plan (from Vision)
- ICA Doc (from Vision)

**Prompt sent to GPT-4o:**
```
With your current understanding of this business and ideal 
customer, give me 5 ideas for a potential avatar.
```

**Output:** 5 avatar concept descriptions

### Human Decision Gate
```
"Here are 5 avatar concepts for your brand. Which one 
speaks to you? You can pick one, combine ideas from 
multiple, or tell me something completely different."
```

**Accept:**
- Pick a number (1-5)
- Combine ("I like the look of #2 with the personality of #4")
- Custom direction ("Actually, I want something more like...")

**Store as:** `[AVATAR_CONCEPT]`

### Image Prompt Generation
**Model: OpenAI GPT-4o (via API)**

Once avatar concept is locked, send:
```
Make me a prompt for Nano Banana so that I can generate 
this according to my brand guidelines.
```

**Output:** A formatted image generation prompt optimized for Gemini/Nano Banana
**Store as:** `[NANO_BANANA_PROMPT]`

### STEP 4B — Avatar Image Generation
**Model: Gemini API / Nano Banana**

**Process:**
- Send `[NANO_BANANA_PROMPT]` to Gemini API
- Return generated image to volunteer

### Human Approval Gate
```
"Here's your avatar. Is this the one?"
```

**Options:**
- **"That's the one"** → Save to Brand Folder, proceed to Phase 5
- **Iterate** → Adjust prompt, regenerate through Gemini
- **New direction** → Go back to concept selection

**Maximum Gemini iterations before Joseph intervenes:** 3
**If stuck after 3 iterations, signal:** `[BRAND: AVATAR — NEEDS JOSEPH]`

### Phase 4 Complete Signal
`[BRAND: AVATAR APPROVED — SAVED TO BRAND FOLDER]`

---

## PHASE 4C — NANO BANANA PROMPT BEST PRACTICES

When GPT-4o generates the Nano Banana prompt for Gemini, Open Claw should append these parameters to ensure quality and consistency:

**Structure the prompt should follow:**
```
[Character description] + [pose/expression] + [setting/background] + 
[art style matching brand board] + [color palette from brand board] + 
[mood/lighting matching brand feel words]
```

**Consistency parameters to include:**
- Reference the brand board colors explicitly (hex codes if possible)
- Specify art style consistently (e.g., "Pixar-quality appeal for adults," "clean vector illustration," "warm 3D render")
- Include "consistent character design" in every prompt
- Specify aspect ratio based on intended use (1:1 for profile, 16:9 for banner, 9:16 for reels)

**For character pose generation (used later in content production):**
When the content system needs additional poses, use this template:
```
[Character name] in [emotion/pose] — [same character description 
from approved avatar] + [specific expression: eyes wide, arms crossed, 
tiny smile, etc.] + [setting appropriate to the content piece] + 
[brand colors] + [consistent art style from original avatar]
```

Recommended pose set (10-15 for a complete library):
1. Happy / welcoming (default profile image)
2. Frustrated / processing (signature comedic moment)
3. Proud / accomplished
4. Thinking / contemplating
5. Facepalm / exasperated
6. Waving / greeting
7. Hero pose (for ads and studio reels)
8. Writing / at desk (for diary content)
9. Thumbs up / approving
10. Concerned / worried (for retargeting ads)
11. Excited / celebrating
12. Teaching / pointing at something
13. Arms crossed / confident
14. Peeking / curious (for story content)

**Pose generation timing:** Poses are generated AFTER the character bible is approved (in the Character + Content Protocol), not during the Brand phase. The brand phase produces only the primary avatar image.

---

## PHASE 5 — BRAND FOLDER ASSEMBLY
**Time target: 1 minute**
**Model: Claude (native)**

### Brand Folder Contents Checklist

| Item | Source | Status |
|------|--------|--------|
| Brand board image (logo, fonts, colors) | Phase 2 — GPT-4o | ☐ |
| Website + pages as artifacts | Phase 3 — Claude | ☐ |
| Avatar image | Phase 4 — Gemini/Nano Banana | ☐ |
| 1-Page Business Plan | Vision Protocol | ☐ |
| ICA Doc | Vision Protocol | ☐ |
| Master Prompt | Vision Protocol | ☐ |

### Assembly Confirmation
```
"Your brand folder is complete. Here's everything we've built:

✅ Brand board — your logo, colors, and fonts
✅ Website — ready to deploy
✅ Avatar — your brand's character
✅ Business plan, ICA, and master prompt — all on file

Now we're moving into bringing your avatar to life."
```

### Phase 5 Complete Signal
`[BRAND: FOLDER COMPLETE — READY FOR CHARACTER BIBLE]`

---

## PHASE 6 — HANDOFF TO CHARACTER BIBLE + CONTENT
**Model: Claude (native)**

### What Happens Next (NOT in this protocol)
Once the Brand Folder is complete, the next protocol takes over:

1. **Character Bible** — Name, personality, voice rules, signature phrases
2. **Social Profiles** — Bios, banners, profile images for YouTube, Facebook, X, Instagram
3. **Content Creation Calendar** — Daily 7-piece system, ManyChat scripts, email welcome sequence, SMS scripts, ad copy templates
4. **Deliverables** — Avatar Promotion Guide + Content Creation Calendar

### Handoff Signal
`[BRAND: COMPLETE — HANDING OFF TO CHARACTER + CONTENT PROTOCOL]`

### Data Passed Forward
Everything in the Brand Folder, plus:
- `[BUSINESS_NAME]`
- `[FEEL_WORDS]`
- `[LOOK_DESCRIPTION]`
- `[AVATAR_CONCEPT]`
- `[NANO_BANANA_PROMPT]`

---

## TIMING SUMMARY

| Phase | Target Time | Model(s) Used |
|-------|------------|---------------|
| Phase 1 — Intake Questions | 2 min | Claude (native) |
| Phase 2 — Brand Board | 2 min | OpenAI GPT-4o |
| Phase 3 — Website | 3 min | Claude (native) |
| Phase 4 — Avatar (Concepts + Image) | 4 min | GPT-4o + Gemini |
| Phase 5 — Assembly | 1 min | Claude (native) |
| **Total Brand Phase** | **12 min** | **3 models** |

---

## ERROR HANDLING

| Error | Response |
|-------|----------|
| OpenAI API timeout | Retry once. If fails again, signal `[BRAND: OPENAI DOWN — NEEDS MANUAL]` |
| Gemini API timeout | Retry once. If fails again, use fal.ai as fallback for image generation |
| Human takes too long on approval | After 60 seconds of silence, gentle nudge: "Take your time — when you're ready, tell me if this feels right or what you'd change." |
| Missing Vision documents | Hard stop. Signal `[BRAND: BLOCKED — MISSING VISION DOCUMENTS]` |
| 3+ failed iterations on any step | Signal `[BRAND: {STEP} — NEEDS JOSEPH]` |

---

## SIGNALS SUMMARY

All signals output to Master Bot / Mission Control:

| Signal | Meaning |
|--------|---------|
| `[BRAND: BLOCKED — MISSING VISION DOCUMENTS]` | Cannot start, Vision incomplete |
| `[BRAND: INTAKE COMPLETE — 3 OF 3 ANSWERS COLLECTED]` | Phase 1 done |
| `[BRAND: BOARD APPROVED — SAVED TO BRAND FOLDER]` | Phase 2 done |
| `[BRAND: BOARD — NEEDS JOSEPH]` | Stuck on brand board iterations |
| `[BRAND: WEBSITE APPROVED — ARTIFACTS SAVED]` | Phase 3 done |
| `[BRAND: AVATAR APPROVED — SAVED TO BRAND FOLDER]` | Phase 4 done |
| `[BRAND: AVATAR — NEEDS JOSEPH]` | Stuck on avatar iterations |
| `[BRAND: FOLDER COMPLETE — READY FOR CHARACTER BIBLE]` | Phase 5 done |
| `[BRAND: COMPLETE — HANDING OFF TO CHARACTER + CONTENT PROTOCOL]` | Full handoff |
| `[BRAND: OPENAI DOWN — NEEDS MANUAL]` | API failure |

---

## OPEN CLAW CONNECTION REQUIREMENTS

Before this protocol can run in the demo, Open Claw needs:

### Connection 1: OpenAI API (GPT-4o)
- **Used in:** Phase 2 (Brand Board), Phase 4A (Avatar Concepts + Image Prompt)
- **Capabilities needed:** Image generation, text completion
- **Input format:** System message + user prompt with file attachments
- **Output format:** Image (brand board), text (avatar concepts, Nano Banana prompt)

### Connection 2: Gemini API (Nano Banana)
- **Used in:** Phase 4B (Avatar Image Generation)
- **Capabilities needed:** Image generation from text prompt
- **Input format:** Text prompt (the Nano Banana prompt generated by GPT-4o)
- **Output format:** Image (avatar)
- **Fallback:** fal.ai (already connected) if Gemini is unavailable

---

## WHAT THIS PROTOCOL DOES NOT COVER

The following are handled by separate protocols:

1. **Vision Intake** → VISION-INTAKE-PROTOCOL.md (BUILT)
2. **Character Bible creation** → CHARACTER-CONTENT-PROTOCOL.md (BUILT)
3. **Content creation system** → CHARACTER-CONTENT-PROTOCOL.md (BUILT)
4. **Vercel deployment** → MISSION-CONTROL-BUILD-PROTOCOL.md (NOT YET BUILT)
5. **Wave 1-3 bot spawning** → MASTER-BOT-PROTOCOL.md (NOT YET BUILT)
6. **Media Hub / content approval** → PUBLISH-PROTOCOL.md (NOT YET BUILT)

---

## APPENDIX A — SOCIAL MEDIA PLATFORM SPECS (2026)

Exact pixel dimensions for image generation. These specs are current as of February 2026. The AI should verify before generating final assets, as platforms update periodically.

### FACEBOOK
| Asset | Dimensions | Notes |
|-------|-----------|-------|
| Profile Picture | 170×170px (desktop), 128×128px (mobile) | Upload at 320×320px minimum. Crops to circle. |
| Cover Photo | 820×360px (safe zone) | Displays 820×312px desktop, 640×360px mobile. Keep critical content out of bottom-left (profile pic overlap). Upload at 851×315px or 1640×720px for retina. |
| Feed Post (square) | 1080×1080px | 1:1 aspect ratio |
| Feed Post (portrait) | 1080×1350px | 4:5 aspect ratio — takes up more feed space |
| Feed Post (landscape) | 1200×630px | 1.91:1 aspect ratio |
| Carousel | 1200×1200px | 1:1 per slide |
| Stories / Reels | 1080×1920px | 9:16 — leave 14% top and 20% bottom free of text |
| Event Cover | 1920×1005px | |
| Ad (feed) | 1440×1440px (1:1) or 1440×1800px (4:5) | |

### INSTAGRAM
| Asset | Dimensions | Notes |
|-------|-----------|-------|
| Profile Picture | 320×320px | Displays at 110×110px. Crops to circle. Center key elements. |
| Feed Post (portrait) | 1080×1350px | 4:5 — recommended default. Grid shows as 3:4. |
| Feed Post (square) | 1080×1080px | 1:1 |
| Feed Post (landscape) | 1080×566px | Not recommended — takes up less feed space |
| Carousel | 1080×1350px | 4:5 — first image sets crop for all slides |
| Stories | 1080×1920px | 9:16 — leave top/bottom margins for UI elements |
| Reels | 1080×1920px | 9:16 — appears cropped to 4:5 in feed, 1:1 on profile grid |
| Reel Cover / Thumbnail | 1080×1920px | Keep text in center 1080×1080 safe zone |

### X (TWITTER)
| Asset | Dimensions | Notes |
|-------|-----------|-------|
| Profile Picture | 400×400px | Crops to circle. Min 200×200px. |
| Header / Banner | 1500×500px | Account for profile pic overlap bottom-left. Displays differently desktop vs mobile. |
| Tweet Image (square) | 1080×1080px | 1:1 |
| Tweet Image (portrait) | 1080×1350px | 3:4 shows in full in timeline |
| Tweet Image (landscape) | 1600×900px | 16:9 |
| Link Card Image | 1200×631px | |
| Ad Image | 1200×1200px (1:1) or 1200×628px (1.91:1) | |

### YOUTUBE
| Asset | Dimensions | Notes |
|-------|-----------|-------|
| Profile Picture | 800×800px | Displays at 98×98px. Crops to circle. |
| Channel Banner | 2560×1440px | Safe zone for text/logos: 1546×423px (center). Min 2048×1152px. Max file size 6MB. |
| Video Thumbnail | 1280×720px | 16:9 — custom thumbnails strongly recommended |
| Shorts | 1080×1920px | 9:16 |

### TIKTOK
| Asset | Dimensions | Notes |
|-------|-----------|-------|
| Profile Picture | 200×200px | Upload higher resolution for quality. Crops to circle. |
| Video | 1080×1920px | 9:16 — vertical always outperforms |
| Carousel | 1080×1920px | 9:16 recommended. 1:1 and 16:9 also supported. |

### LINKEDIN
| Asset | Dimensions | Notes |
|-------|-----------|-------|
| Personal Profile Picture | 400×400px | Crops to circle. |
| Background Photo | 1584×396px | May crop differently on devices. |
| Company Logo | 300×300px | |
| Company Cover | 1128×191px | |
| Feed Post (square) | 1200×1200px | 1:1 |
| Feed Post (landscape) | 1200×627px | For link previews |
| Article Cover | 1200×644px | |

### CONTENT FORMAT QUICK REFERENCE
| Format | Dimensions | Aspect Ratio | Used For |
|--------|-----------|-------------|----------|
| Square | 1080×1080px | 1:1 | Universal safe format |
| Portrait | 1080×1350px | 4:5 | Feed posts (most engagement) |
| Vertical Full | 1080×1920px | 9:16 | Stories, Reels, Shorts, TikTok |
| Landscape | 1600×900px | 16:9 | YouTube, Twitter, LinkedIn |
| Banner Wide | 1500×500px | 3:1 | Twitter/X header |
| Banner Ultra-Wide | 2560×1440px | 16:9 | YouTube channel banner |

---

## APPENDIX B — BIO & LINK SETUP CHECKLIST

**CRITICAL:** After all content and profiles are generated, the system must ensure bios and links are properly entered on every platform. This is a final deployment task that happens after content production.

### What Gets Set Up Per Platform

| Platform | Bio Text | Profile Image | Banner/Cover | Link in Bio |
|----------|----------|--------------|-------------|-------------|
| YouTube | Channel description in character voice | Avatar/headshot | Branded banner with tagline | Main offer or link tree |
| Facebook | Page "About" in character voice | Avatar/headshot | Branded cover with CTA | Main offer or link tree |
| X/Twitter | 160-char bio in character voice | Avatar/headshot | Branded header | Main offer or link tree |
| Instagram | 150-char bio in character voice | Avatar/headshot | N/A | Link tree or main offer |
| TikTok | 80-char bio in character voice | Avatar/headshot | N/A | Main offer or link tree |
| LinkedIn | Headline + About in character voice | Avatar/headshot | Branded background | Main offer or website |

### Bio Structure (All Platforms)
```
[Character greeting or hook] + [What you do / who you help] + 
[Shtick reference or signature phrase] + [CTA] + [Link]
```

### Link Strategy
The link in every bio should point to ONE of:
- **Primary:** Lead magnet opt-in page (if building list is priority)
- **Secondary:** Link tree with multiple offers (if multiple entry points exist)
- **Tertiary:** Direct to main offer or website

**The AI generates the bio text during the Character + Content Protocol.** 
**The link destination is determined by the business strategy from the 1-Page Business Plan.**
**Actual setup on platforms is either done manually by the human or through API integrations if available.**

### Signal When Complete
`[PROFILES: BIOS AND LINKS — SETUP COMPLETE]`

This task is tracked in Mission Control as part of the deployment phase.

---

*Protocol created: March 2, 2026*
*Source: Brand Process Handoff + Vision documents*
*For use in: Open Claw Bot System — AIM Demo*
