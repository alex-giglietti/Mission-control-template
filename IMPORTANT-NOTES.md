# IMPORTANT NOTES — AIM Demo Mission Control

**Last Updated:** March 5, 2026
**Production URL:** https://demo-mission-control.vercel.app
**GitHub Repo:** https://github.com/alex-giglietti/Demo-Mission-Control

---

## 📋 SOLE GUIDANCE FOR THIS PROJECT

**READ THIS FIRST:** [MASTER-SYSTEM-PROMPT.md](./MASTER-SYSTEM-PROMPT.md)

The Master System Prompt is the authoritative guide for how this entire demo system works. Every feature, every flow, every bot behavior should align with it. When in doubt, check the Master System Prompt.

---

## ✅ ISSUES RESOLVED (March 5, 2026)

### 1. Vision Chat Not Starting
**Symptom:** AI greeting never appeared, conversation wouldn't start
**Root Cause:** `useCallback` + `useEffect` dependency issue causing stale closures
**Fix:** Removed `useCallback`, converted to regular async function, simplified deps

### 2. LOCK & BUILD Not Transitioning
**Symptom:** Clicking "LOCK & BUILD" showed "Waiting to Build" instead of Live Build
**Root Cause:** Race condition — `LiveDemo` read localStorage before state was written
**Fix:** Pass state as props directly instead of relying on localStorage timing

### 3. Build Simulation Stopping/Pausing
**Symptom:** Simulation would pause randomly and restart, never completing
**Root Cause:** React effect cleanup cleared ALL intervals on re-render (not just unmount)
**Fix:** Added `simulationActiveRef` guard, separated cleanup into its own effect with empty deps

### 4. Deliverables Not Showing
**Symptom:** Build completed but no outputs visible
**Root Cause:** Deliverables array wasn't being populated correctly
**Fix:** Added proper deliverable creation tied to agent completion

### 5. Dashboard Tabs Empty
**Symptom:** CEO Dashboard, Revenue Engine, etc. showed no data
**Root Cause:** Each view read from separate state, not shared with LiveDemo
**Fix:** Created `simulation-state.ts` shared localStorage system

### 6. Full-Screen Preview Not Discoverable
**Symptom:** Users couldn't figure out how to view deliverables full-size
**Fix:** Made entire preview card clickable, added visual cues, help text, hover effects

---

## ⚠️ KNOWN ISSUES (Still Present)

### 1. Simulation Auto-Runs on Page Load
**Symptom:** Loading the page during "building" phase auto-starts simulation
**Status:** `fix-autostart` subagent was spawned — check if deployed
**Expected:** Simulation should only start when user clicks "LOCK & BUILD"

### 2. Gemini API Rate Limits
**Symptom:** AI chat responses sometimes fail, fall back to hardcoded responses
**Workaround:** Using `gemini-1.5-flash` (more stable than 2.0-flash)
**Note:** Fallback responses work fine for demo purposes

### 3. Google Drive File Creation
**Symptom:** Files are saved to Google Drive but folder structure may vary
**Note:** Using service account with impersonation to `solomon@multiplyinc.com`
**Credentials:** Stored in Vercel env var `GOOGLE_SERVICE_ACCOUNT_JSON`

---

## 🚧 FEATURES NOT YET IMPLEMENTED

### Per Master System Prompt:

1. **Phase 0 — Startup Check**
   - Pre-demo system verification not implemented
   - Should check all APIs before volunteer starts

2. **Human Gates (Section 9)**
   - Gate 1: Offer Lock (Joseph + Volunteer approval)
   - Gate 2: Brand Board Approval (Volunteer)
   - Gate 3: Avatar Approval (Volunteer)
   - Gate 4: Character Bible Approval (Volunteer)
   - Gate 5: Revenue Planner Lock & Build ✅ (implemented)
   - Currently only Gate 5 is functional

3. **Real Bot Execution**
   - Current bots are simulated (progress bars, timers)
   - Should connect to actual OpenClaw agents that:
     - Read from Google Drive brain
     - Execute playbooks
     - Save outputs to correct folders

4. **Mission Control Webhook**
   - Not sending status updates to webhook endpoint
   - Should POST to `/api/demo-status` per Section 8

5. **Signal System**
   - Signals show in activity log but aren't triggering actual actions
   - Should implement full signal dictionary from Section 8

6. **GHL Workflow Prompts**
   - Not generating Claude Cowork execution prompts
   - Should output workflow specs to `/workflows/` folder

7. **Wave Dependencies**
   - Waves currently run on timers
   - Should wait for actual bot completion signals

8. **Fail-Forward System (Section 10)**
   - No API failure fallbacks implemented
   - No bot retry logic
   - No timeout handling

9. **Demo Close Sequence (Section 12)**
   - No summary generation
   - No Mission Control reveal URL construction

### Nice-to-Haves:

10. **Real-time Collaboration**
    - Joseph override commands
    - Live audience view

11. **Actual Deployments**
    - Deploy funnels to Vercel
    - Create real GHL workflows

---

## 🏗️ ARCHITECTURE NOTES

### State Management
- **localStorage key:** `aim-demo-state`
- **Simulation state:** `aim-simulation-state`
- State persists across page refreshes

### Key Components
- `page.tsx` — Main app, phase management
- `VisionChat.tsx` — Vision intake conversation
- `BrandChat.tsx` — Brand discovery conversation
- `CharacterChat.tsx` — Character/avatar creation
- `RevenuePlanner.tsx` — PROMOTE/PROFIT/PRODUCE selection
- `LiveDemo.tsx` — Build simulation, waves, agents, tasks
- `DeliverablePreview.tsx` — Output templates (landing page, cart, emails, etc.)

### API Routes
- `/api/chat` — Gemini-powered AI conversation (vision/brand/character phases)
- `/api/demo` — Demo state management
- `/api/save-output` — Google Drive file creation

### Simulation Intervals
- Uses `simulationActiveRef` to guard against stale closures
- Single cleanup effect on unmount only
- All intervals tracked in `Set` for proper cleanup

---

## 📁 FOLDER STRUCTURE

```
demo-mission-control/
├── MASTER-SYSTEM-PROMPT.md    ← THE LAW
├── IMPORTANT-NOTES.md         ← You are here
├── src/
│   ├── app/
│   │   ├── page.tsx           ← Main app
│   │   └── api/
│   │       ├── chat/          ← AI conversation
│   │       ├── demo/          ← State management
│   │       └── save-output/   ← Google Drive saves
│   ├── components/
│   │   ├── VisionChat.tsx
│   │   ├── BrandChat.tsx
│   │   ├── CharacterChat.tsx
│   │   ├── RevenuePlanner.tsx
│   │   ├── LiveDemo.tsx
│   │   ├── DeliverablePreview.tsx
│   │   ├── CEODashboard.tsx
│   │   ├── RevenueEngine.tsx
│   │   ├── AIWorkforce.tsx
│   │   ├── ProfitPipeline.tsx
│   │   ├── MediaHub.tsx
│   │   ├── Projects.tsx
│   │   └── Financials.tsx
│   └── lib/
│       └── simulation-state.ts
└── config/                    ← Credentials (gitignored)
```

---

## 🔑 ENVIRONMENT VARIABLES

Required in Vercel:
- `GEMINI_API_KEY` — For AI chat
- `GOOGLE_SERVICE_ACCOUNT_JSON` — For Drive file saves (full JSON, not path)

---

## 📞 CONTACTS

- **Project Owner:** Joseph Aaron
- **AI CoS:** Solomon (OpenClaw)
- **GitHub:** alex-giglietti/Demo-Mission-Control

---

*When working on this project, always check MASTER-SYSTEM-PROMPT.md first.*
