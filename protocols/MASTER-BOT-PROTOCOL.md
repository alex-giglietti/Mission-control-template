# MASTER BOT PROTOCOL
**AI Monetizations Live | Demo Build System**
**Protocol File: MASTER-BOT-PROTOCOL.md**
**Version:** 1.0
**Created:** March 3, 2026
**For:** Open Claw Bot System

---

## PURPOSE

The Master Bot is the central orchestrator of the entire Ultimate Demo System. It does NOT do the work itself — it coordinates which bots run, when they run, and what data flows between them.

Think of it as the conductor of an orchestra. Each specialized bot is an instrument. The Master Bot ensures they play in the right order, at the right time, with the right inputs.

---

## CORE PRINCIPLES

1. **One Interface** — The volunteer only talks to Open Claw. The Master Bot routes everything behind the scenes.
2. **Signal-Driven** — Bots communicate via signals. The Master Bot listens for signals and triggers next actions.
3. **Wave-Based Execution** — Bots spawn in waves based on dependencies and Revenue Planner selections.
4. **Human Gates** — Certain moments require human approval before proceeding.
5. **Parallel Processing** — Bots in the same wave run simultaneously, not sequentially.
6. **Fail-Forward** — If a bot fails, flag it and continue. Don't block the entire demo.

---

## ACTIVATION TRIGGER

The Master Bot activates when **both conditions are met**:

1. `[CHARACTER: BIBLE APPROVED — NAME: {name}]` OR `[CHARACTER: PERSONAL BRAND VOICE GUIDE APPROVED]` signal received
2. **Revenue Planner selections confirmed** by Joseph

### Revenue Planner Approval

Joseph reviews the Revenue Planner with the volunteer and confirms:
- "This is your 90-day plan. Ready to build?"
- Volunteer: "Yes" / "Let's go" / "Build it"

Joseph signals:
```
[MASTER: REVENUE PLANNER APPROVED]
```

### What the Master Bot Receives

When activated, the Master Bot receives this data object from the Revenue Planner:

```javascript
{
  // BUSINESS IDENTITY
  businessName: "[BUSINESS_NAME]",
  
  // TARGETS
  revenueGoal: 100000,           // 90-day goal
  avgTicket: 5000,               // Average ticket price
  
  // CALCULATED MATH
  salesNeeded: 20,               // Total sales to hit goal
  salesPerWeek: 2,               // Weekly sales target
  leadsPerDay: 15,               // Daily lead generation target
  
  // PROMOTE SELECTIONS
  promote: {
    prospect: "now" | "later" | "off",
    paid: "now" | "later" | "off",
    publish: "now" | "later" | "off",
    partnership: "now" | "later" | "off"
  },
  
  // PROFIT SELECTIONS
  profit: {
    cart: "now" | "later" | "off",       // 1-page cart
    call: "now" | "later" | "off",       // Book-a-call / application
    crowd: "now" | "later" | "off",      // Live event / webinar
    aiSales: "now" | "later" | "off"     // AI sales team
  },
  
  // PRODUCE SELECTIONS
  produce: {
    dfy: "now" | "later" | "off",
    workshop: "now" | "later" | "off",
    vipChallenge: "now" | "later" | "off",
    book: "now" | "later" | "off",
    continuity: "now" | "later" | "off"
  }
}
```

---

## SIGNAL VOCABULARY

The Master Bot listens for these signals from all protocols:

### VISION SIGNALS
| Signal | Meaning | Action |
|--------|---------|--------|
| `[VISION: SEED COLLECTED — ENTERING RESEARCH PHASE]` | Phase 1 done | Log status, continue listening |
| `[VISION: RESEARCH COMPLETE — GENERATING DOCUMENTS]` | Phase 2 done | Log status, continue listening |
| `[VISION: OFFER CONCEPTS READY — JOSEPH TAKE OVER FOR OFFER CONVERSATION]` | Phase 3 done | Alert Joseph |
| `[VISION: OFFER LOCKED — GENERATING BUSINESS PLAN]` | Phase 4 done | Log status, continue listening |
| `[VISION: COMPLETE — ALL DOCUMENTS GENERATED]` | Vision done | Push to Mission Control, trigger Brand |

### BRAND SIGNALS
| Signal | Meaning | Action |
|--------|---------|--------|
| `[BRAND: BLOCKED — MISSING VISION DOCUMENTS]` | Cannot start | Alert Joseph |
| `[BRAND: INTAKE COMPLETE — 3 OF 3 ANSWERS COLLECTED]` | Phase 1 done | Log status |
| `[BRAND: BOARD APPROVED — SAVED TO BRAND FOLDER]` | Phase 2 done | Log status |
| `[BRAND: BOARD — NEEDS JOSEPH]` | Stuck | Alert Joseph |
| `[BRAND: WEBSITE APPROVED — ARTIFACTS SAVED]` | Phase 3 done | Log status |
| `[BRAND: AVATAR APPROVED — SAVED TO BRAND FOLDER]` | Phase 4 done | Log status |
| `[BRAND: AVATAR — NEEDS JOSEPH]` | Stuck | Alert Joseph |
| `[BRAND: FOLDER COMPLETE — READY FOR CHARACTER BIBLE]` | Phase 5 done | Trigger Character |
| `[BRAND: COMPLETE — HANDING OFF TO CHARACTER + CONTENT PROTOCOL]` | Brand done | Push to Mission Control |
| `[BRAND: OPENAI DOWN — NEEDS MANUAL]` | API failure | Alert Joseph, log error |

### CHARACTER SIGNALS
| Signal | Meaning | Action |
|--------|---------|--------|
| `[CHARACTER: BLOCKED — INCOMPLETE BRAND FOLDER]` | Cannot start | Alert Joseph |
| `[CHARACTER: PATH SELECTED — AI CHARACTER]` | Path A | Log status |
| `[CHARACTER: PATH SELECTED — HUMAN AVATAR]` | Path B | Log status |
| `[CHARACTER: SHTICK SELECTED]` | Shtick locked | Log status |
| `[CHARACTER: SHTICK — NEEDS JOSEPH]` | Stuck | Alert Joseph |
| `[CHARACTER: BIBLE APPROVED — NAME: {name}]` | Character approved | **READY FOR REVENUE PLANNER** |
| `[CHARACTER: PERSONAL BRAND VOICE GUIDE APPROVED]` | Voice approved | **READY FOR REVENUE PLANNER** |
| `[CHARACTER: COMPLETE — ALL DELIVERABLES GENERATED]` | Character done | Push to Mission Control |
| `[CHARACTER: BIOS AND LINKS GENERATED — READY FOR SETUP]` | Bios ready | Log status |

### MASTER BOT SIGNALS (Outbound)
| Signal | Meaning | Sent To |
|--------|---------|---------|
| `[MASTER: REVENUE PLANNER APPROVED]` | Demo build begins | All bots |
| `[MASTER: WAVE 1 SPAWNING]` | Wave 1 bots starting | Mission Control |
| `[MASTER: WAVE 2 SPAWNING]` | Wave 2 bots starting | Mission Control |
| `[MASTER: WAVE 3 SPAWNING]` | Wave 3 bots starting | Mission Control |
| `[MASTER: BOT COMPLETE — {botName}]` | Individual bot done | Mission Control |
| `[MASTER: BOT FAILED — {botName}]` | Individual bot failed | Mission Control + Joseph |
| `[MASTER: ALL BOTS COMPLETE]` | Demo build done | Mission Control |
| `[MASTER: NEEDS JOSEPH — {context}]` | Escalation | Joseph alert |

---

## WAVE ARCHITECTURE

Bots spawn in waves. Each wave has dependencies that must be satisfied before it runs. The Master Bot ONLY spawns bots whose Revenue Planner selection is `"now"`.

### WAVE 1 — Foundation (No Dependencies)

**Trigger:** `[MASTER: REVENUE PLANNER APPROVED]`

**Spawns:**

| Bot | Condition | Playbook | Output |
|-----|-----------|----------|--------|
| Website Bot | Always | BRAND-INTAKE-PROTOCOL | `website.vercel.app` |
| Cart Page Bot | `profit.cart === "now"` | 1-page-cart-playbook.md | `cart.vercel.app` |
| Call Funnel Bot | `profit.call === "now"` | APPLICATION-FUNNEL-PLAYBOOK.md | `apply.vercel.app` |
| Event Page Bot | `profit.crowd === "now"` | live-event-page-master-prompt.md | `event.vercel.app` |

**Wave 1 Complete Signal:** `[MASTER: WAVE 1 COMPLETE]`

### WAVE 2 — Sequences (Needs Wave 1)

**Trigger:** `[MASTER: WAVE 1 COMPLETE]`

**Spawns:**

| Bot | Condition | Playbook | Output |
|-----|-----------|----------|--------|
| Email Sequence Bot | Always | (uses CHARACTER outputs) | Welcome sequence, nurture sequence |
| Outbound Bot | `promote.prospect === "now"` | PROMOTE-PROSPECT-PLAYBOOK.md | Cold email infrastructure setup |
| Partnership Bot | `promote.partnership === "now"` | PROMOTE-PARTNER-PLAYBOOK.md | Affiliate setup, outreach sequences |

**Wave 2 Complete Signal:** `[MASTER: WAVE 2 COMPLETE]`

### WAVE 3 — Content & Ads (Needs Character Bible)

**Trigger:** `[MASTER: WAVE 2 COMPLETE]` AND Character Bible approved

**Spawns:**

| Bot | Condition | Playbook | Output |
|-----|-----------|----------|--------|
| Content Bot | `promote.publish === "now"` | CHARACTER-CONTENT-PROTOCOL (Phase 4+) | 7 daily content pieces |
| Ads Bot | `promote.paid === "now"` | PROMOTE-PAY-PLAYBOOK.md | Ad creative, campaign structure |

**Wave 3 Complete Signal:** `[MASTER: WAVE 3 COMPLETE]`

---

## BOT SPAWN LOGIC

When a wave triggers, the Master Bot executes this logic:

```python
def spawn_wave(wave_number, revenue_planner):
    bots_to_spawn = []
    
    if wave_number == 1:
        bots_to_spawn.append("Website Bot")  # Always
        
        if revenue_planner.profit.cart == "now":
            bots_to_spawn.append("Cart Page Bot")
        
        if revenue_planner.profit.call == "now":
            bots_to_spawn.append("Call Funnel Bot")
        
        if revenue_planner.profit.crowd == "now":
            bots_to_spawn.append("Event Page Bot")
    
    elif wave_number == 2:
        bots_to_spawn.append("Email Sequence Bot")  # Always
        
        if revenue_planner.promote.prospect == "now":
            bots_to_spawn.append("Outbound Bot")
        
        if revenue_planner.promote.partnership == "now":
            bots_to_spawn.append("Partnership Bot")
    
    elif wave_number == 3:
        if revenue_planner.promote.publish == "now":
            bots_to_spawn.append("Content Bot")
        
        if revenue_planner.promote.paid == "now":
            bots_to_spawn.append("Ads Bot")
    
    # Spawn all bots in parallel
    for bot in bots_to_spawn:
        spawn_bot_async(bot)
        signal(f"[MASTER: SPAWNED — {bot}]")
    
    return bots_to_spawn
```

---

## DATA FLOW

### What Every Bot Receives

When spawned, every bot receives:

```javascript
{
  // BUSINESS CONTEXT
  businessName: "[BUSINESS_NAME]",
  masterPrompt: "/[BUSINESS_NAME]/vision/master-prompt.md",
  icaDoc: "/[BUSINESS_NAME]/vision/ica-doc.md",
  businessPlan: "/[BUSINESS_NAME]/vision/1-page-business-plan.md",
  
  // BRAND ASSETS
  brandBoard: "/[BUSINESS_NAME]/brand/brand-board-approved.png",
  avatarImage: "/[BUSINESS_NAME]/brand/avatar-image.png",
  website: "/[BUSINESS_NAME]/brand/website-artifact.html",
  
  // CHARACTER ASSETS
  characterBible: "/[BUSINESS_NAME]/character/character-bible.md",
  voiceGuide: "/[BUSINESS_NAME]/character/personal-brand-voice-guide.md",
  contentCalendar: "/[BUSINESS_NAME]/character/content-creation-calendar.md",
  
  // REVENUE TARGETS
  revenuePlanner: { /* full Revenue Planner object */ }
}
```

### Bot-Specific Data

| Bot | Additional Data |
|-----|-----------------|
| Cart Page Bot | Offer details, pricing, value stack from Master Prompt |
| Call Funnel Bot | ICA doc for qualification, offer for pitch |
| Event Page Bot | Business plan for event structure |
| Outbound Bot | ICA doc for targeting, offer for outreach |
| Ads Bot | Character bible for voice, avatar for creative |
| Content Bot | Full character folder, 7-piece system specs |

---

## HUMAN GATES

These moments REQUIRE human approval before proceeding:

| Gate | Who Approves | Signal to Continue |
|------|--------------|-------------------|
| Offer Lock | Joseph + Volunteer | `[VISION: OFFER LOCKED]` |
| Brand Board | Volunteer | `[BRAND: BOARD APPROVED]` |
| Avatar Image | Volunteer | `[BRAND: AVATAR APPROVED]` |
| Character Bible | Volunteer | `[CHARACTER: BIBLE APPROVED]` |
| Revenue Planner | Joseph + Volunteer | `[MASTER: REVENUE PLANNER APPROVED]` |

**If any gate stalls for >5 minutes**, the Master Bot signals:
```
[MASTER: NEEDS JOSEPH — {gate} stalled for {time}]
```

---

## ERROR HANDLING

### Bot Failure

If any bot fails 3 times:

1. Signal: `[MASTER: BOT FAILED — {botName}]`
2. Log error details to Mission Control
3. Alert Joseph
4. **Continue with other bots** — don't block the demo
5. Mark failed bot as `SKIPPED` in Mission Control

### API Failures

| API | Fallback |
|-----|----------|
| OpenAI GPT-4o | Claude generates instead (lower quality, but works) |
| Gemini (Nano Banana) | fal.ai for image generation |
| Vercel deployment | Save artifacts locally, deploy manually after demo |
| Resend (email) | Log emails to file, send manually |
| Twilio (SMS) | Skip SMS, email-only |

### Timeout Rules

| Bot Type | Max Runtime | On Timeout |
|----------|-------------|------------|
| Website Bot | 3 minutes | Flag, continue |
| Funnel Bots | 3 minutes | Flag, continue |
| Email Sequence Bot | 2 minutes | Flag, continue |
| Content Bot | 5 minutes | Flag, continue |
| Ads Bot | 3 minutes | Flag, continue |

---

## MISSION CONTROL INTEGRATION

The Master Bot pushes status to Mission Control (Vercel dashboard) via webhook:

### Webhook Payload

```javascript
POST /api/demo-status
{
  businessName: "[BUSINESS_NAME]",
  timestamp: "2026-03-03T14:32:00Z",
  event: "bot_status",
  data: {
    botName: "Website Bot",
    status: "complete" | "running" | "failed" | "skipped",
    output: "https://website.vercel.app",
    duration: 45,  // seconds
    error: null    // or error message
  }
}
```

### Status Board Updates

Mission Control displays:

```
┌─────────────────────────────────────────────────┐
│  DEMO BUILD: [BUSINESS NAME]                    │
│  Status: WAVE 2 IN PROGRESS                     │
├─────────────────────────────────────────────────┤
│  WAVE 1                                         │
│  ✅ Website Bot ............... 45s → LIVE      │
│  ✅ Cart Page Bot ............. 38s → LIVE      │
│  ✅ Call Funnel Bot ........... 52s → LIVE      │
│  ⬜ Event Page Bot ............ SKIPPED         │
├─────────────────────────────────────────────────┤
│  WAVE 2                                         │
│  🔄 Email Sequence Bot ........ RUNNING         │
│  🔄 Outbound Bot .............. RUNNING         │
│  ⬜ Partnership Bot ........... NOT SELECTED    │
├─────────────────────────────────────────────────┤
│  WAVE 3                                         │
│  ⏳ Content Bot ............... WAITING         │
│  ⏳ Ads Bot ................... WAITING         │
└─────────────────────────────────────────────────┘
```

---

## TIMING TARGETS

| Phase | Target Time | Notes |
|-------|-------------|-------|
| Revenue Planner Review | 3-5 min | Joseph facilitates |
| Wave 1 (parallel) | 2-3 min | All bots run simultaneously |
| Wave 2 (parallel) | 2-3 min | All bots run simultaneously |
| Wave 3 (parallel) | 3-5 min | All bots run simultaneously |
| **Total Bot Execution** | **8-12 min** | After Revenue Planner approval |

**Demo Timeline:**
- Vision: 10 min
- Brand: 12 min
- Character (approval only): 5 min
- Revenue Planner: 3-5 min
- Bot Waves: 8-12 min
- **Total: ~40 min** (can compress to 30 with tight execution)

---

## DEMO CLOSE SEQUENCE

When all waves complete:

1. Master Bot signals: `[MASTER: ALL BOTS COMPLETE]`

2. Mission Control displays final status board with all live links

3. Master Bot generates summary:
```
"Your complete business system is LIVE:

🌐 WEBSITE: https://[business].vercel.app
🛒 CART: https://[business]-cart.vercel.app
📞 BOOK A CALL: https://[business]-apply.vercel.app
📧 EMAIL SEQUENCES: 5 emails ready to send
📱 CONTENT: 7 daily pieces scripted

Everything is built. Everything is connected.
This is what Joseph's system does — in 30 minutes."
```

4. Joseph takes over for the close

---

## STARTUP CHECKLIST

Before demo begins, Master Bot verifies:

- [ ] Google Drive folder structure exists
- [ ] OpenAI API connection live
- [ ] Gemini API connection live
- [ ] Vercel deployment credentials ready
- [ ] Mission Control webhook endpoint live
- [ ] Resend API key configured
- [ ] Twilio API key configured (optional)
- [ ] All playbook files loaded

**If any critical dependency fails:**
```
[MASTER: STARTUP FAILED — {dependency}]
```

---

## SIGNALS THE MASTER BOT SENDS

### To Mission Control
- `[MASTER: DEMO STARTED — {businessName}]`
- `[MASTER: WAVE {n} SPAWNING]`
- `[MASTER: SPAWNED — {botName}]`
- `[MASTER: BOT COMPLETE — {botName}]`
- `[MASTER: BOT FAILED — {botName}]`
- `[MASTER: WAVE {n} COMPLETE]`
- `[MASTER: ALL BOTS COMPLETE]`

### To Joseph (Alerts)
- `[MASTER: NEEDS JOSEPH — {context}]`
- `[MASTER: BOT FAILED — {botName}]`
- `[MASTER: STARTUP FAILED — {dependency}]`

### To Other Bots
- `[MASTER: REVENUE PLANNER APPROVED]` — triggers Wave 1
- `[MASTER: WAVE 1 COMPLETE]` — triggers Wave 2
- `[MASTER: WAVE 2 COMPLETE]` — triggers Wave 3

---

## WHAT THIS PROTOCOL DOES NOT COVER

| Item | Where It Lives |
|------|---------------|
| Vision intake | VISION-INTAKE-PROTOCOL.md |
| Brand creation | BRAND-INTAKE-PROTOCOL.md |
| Character creation | CHARACTER-CONTENT-PROTOCOL.md |
| Individual bot logic | BOT-LIBRARY.md (per bot) |
| Vercel deployment mechanics | FUNNEL-DEPLOYMENT-PROTOCOL.md |
| Mission Control UI | MISSION-CONTROL-BUILD-PROTOCOL.md |
| Email/SMS engine | WORKFLOW-ENGINE-PROTOCOL.md |

---

## APPENDIX A — FULL DEMO FLOW

```
VOLUNTEER ARRIVES
        │
        ▼
┌──────────────────┐
│  VISION INTAKE   │ 10 min
│  (Vision Bot)    │
└────────┬─────────┘
         │ [VISION: COMPLETE]
         ▼
┌──────────────────┐
│  BRAND INTAKE    │ 12 min
│  (Brand Bot)     │
└────────┬─────────┘
         │ [BRAND: COMPLETE]
         ▼
┌──────────────────┐
│  CHARACTER       │ 5 min (approval only)
│  (Character Bot) │
└────────┬─────────┘
         │ [CHARACTER: BIBLE APPROVED]
         ▼
┌──────────────────┐
│ REVENUE PLANNER  │ 3-5 min
│ (Joseph + Vol)   │
└────────┬─────────┘
         │ [MASTER: REVENUE PLANNER APPROVED]
         ▼
════════════════════════════════════════════
         MASTER BOT ACTIVATES
════════════════════════════════════════════
         │
         ▼
┌──────────────────┐
│     WAVE 1       │ 2-3 min (parallel)
│  Website, Cart,  │
│  Call, Event     │
└────────┬─────────┘
         │ [MASTER: WAVE 1 COMPLETE]
         ▼
┌──────────────────┐
│     WAVE 2       │ 2-3 min (parallel)
│  Email, Outbound │
│  Partnership     │
└────────┬─────────┘
         │ [MASTER: WAVE 2 COMPLETE]
         ▼
┌──────────────────┐
│     WAVE 3       │ 3-5 min (parallel)
│  Content, Ads    │
└────────┬─────────┘
         │ [MASTER: ALL BOTS COMPLETE]
         ▼
┌──────────────────┐
│   DEMO CLOSE     │
│  (Joseph)        │
└──────────────────┘
```

---

## APPENDIX B — REVENUE PLANNER → BOT MAPPING

Quick reference for which Revenue Planner selections spawn which bots:

| Revenue Planner Selection | Bot(s) Spawned | Wave |
|---------------------------|----------------|------|
| `profit.cart: "now"` | Cart Page Bot | 1 |
| `profit.call: "now"` | Call Funnel Bot | 1 |
| `profit.crowd: "now"` | Event Page Bot | 1 |
| `promote.prospect: "now"` | Outbound Bot | 2 |
| `promote.partnership: "now"` | Partnership Bot | 2 |
| `promote.publish: "now"` | Content Bot | 3 |
| `promote.paid: "now"` | Ads Bot | 3 |
| **Always runs** | Website Bot | 1 |
| **Always runs** | Email Sequence Bot | 2 |

---

*Protocol created: March 3, 2026*
*For use in: Open Claw Bot System — AIM Demo*
