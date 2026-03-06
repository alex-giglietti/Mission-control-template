# TASK LIBRARY
**AI Monetizations Live | Demo Build System**
**Protocol File: TASK-LIBRARY.md**
**Version:** 1.0
**Created:** March 4, 2026
**For:** Open Claw Bot System + Mission Control

---

## PURPOSE

This file defines every task that can appear on the Mission Control Kanban board. The COO Agent and Master Bot reference this library when creating and executing tasks.

---

## TASK SCHEMA

```typescript
interface Task {
  id: string;
  name: string;
  description: string;
  wave: 0 | 1 | 2 | 3;
  priority: number;
  playbook: string;
  triggerCondition: string;
  estimatedDuration: number;
  inputs: string[];
  output: string;
  dependencies: string[];
  status: "todo" | "in_progress" | "complete" | "blocked";
}
```

---

## PRE-WAVE TASKS (Wave 0)

These happen during Vision/Brand/Character intake.

### Vision Complete
```yaml
name: "Vision Complete"
wave: 0
priority: 10
playbook: "VISION-INTAKE-PROTOCOL.md"
triggerCondition: "always"
estimatedDuration: 600
inputs:
  - Volunteer conversation
output: "ICA, Master Prompt, Business Plan, 90-Day Focus"
dependencies: []
```

### Brand Complete
```yaml
name: "Brand Complete"
wave: 0
priority: 20
playbook: "BRAND-INTAKE-PROTOCOL.md"
triggerCondition: "always"
estimatedDuration: 720
inputs:
  - Vision documents
output: "Brand Board, Website Artifact, Avatar Image"
dependencies:
  - "Vision Complete"
```

### Character Approved
```yaml
name: "Character Approved"
wave: 0
priority: 30
playbook: "CHARACTER-CONTENT-PROTOCOL.md"
triggerCondition: "always"
estimatedDuration: 300
inputs:
  - Brand folder
  - Vision documents
output: "Character Bible or Voice Guide"
dependencies:
  - "Brand Complete"
```

---

## WAVE 1 TASKS — Foundation

Run immediately after Revenue Planner approval.

### Build Website
```yaml
name: "Build Website"
wave: 1
priority: 100
playbook: "BRAND-INTAKE-PROTOCOL.md"
triggerCondition: "always"
estimatedDuration: 45
inputs:
  - /[BUSINESS]/brand/brand-board-approved.png
  - /[BUSINESS]/vision/master-prompt.md
  - /[BUSINESS]/vision/1-page-business-plan.md
  - /[BUSINESS]/vision/ica-doc.md
output: "https://[business].vercel.app"
dependencies: []
executionSteps:
  1. Load brand board for colors, fonts, logo
  2. Load master prompt for messaging
  3. Generate Next.js website
  4. Include hero, about, offer, testimonials, CTA
  5. Deploy to Vercel
  6. Return live URL
```

### Build Cart Page
```yaml
name: "Build Cart Page"
wave: 1
priority: 101
playbook: "1-page-cart-playbook.md"
triggerCondition: "revenuePlanner.profit.cart === 'now'"
estimatedDuration: 40
inputs:
  - /[BUSINESS]/brand/brand-board-approved.png
  - /[BUSINESS]/vision/master-prompt.md
  - /[BUSINESS]/vision/ica-doc.md
output: "https://[business]-cart.vercel.app"
dependencies: []
executionSteps:
  1. Load brand board for visual consistency
  2. Extract offer details from master prompt
  3. Generate 7-Section cart page
  4. Add order bump, trust badges
  5. Deploy to Vercel
  6. Return live URL
```

### Build Call Funnel
```yaml
name: "Build Call Funnel"
wave: 1
priority: 102
playbook: "APPLICATION-FUNNEL-PLAYBOOK.md"
triggerCondition: "revenuePlanner.profit.call === 'now'"
estimatedDuration: 50
inputs:
  - /[BUSINESS]/brand/brand-board-approved.png
  - /[BUSINESS]/vision/master-prompt.md
  - /[BUSINESS]/vision/ica-doc.md
output: "https://[business]-apply.vercel.app"
dependencies: []
executionSteps:
  1. Load brand board
  2. Generate landing page with direct offer
  3. Create application form
  4. Create booking page integration
  5. Create thank you page
  6. Deploy to Vercel
  7. Return live URL
```

### Build Event Page
```yaml
name: "Build Event Page"
wave: 1
priority: 103
playbook: "live-event-page-master-prompt.md"
triggerCondition: "revenuePlanner.profit.crowd === 'now'"
estimatedDuration: 55
inputs:
  - /[BUSINESS]/brand/brand-board-approved.png
  - /[BUSINESS]/vision/master-prompt.md
  - /[BUSINESS]/vision/1-page-business-plan.md
  - /[BUSINESS]/brand/avatar-image.png
output: "https://[business]-event.vercel.app"
dependencies: []
executionSteps:
  1. Load brand board
  2. Generate 10-section event page
  3. All buttons trigger popup opt-in
  4. Add countdown timer
  5. Deploy to Vercel
  6. Return live URL
```

---

## WAVE 2 TASKS — Sequences

Run after Wave 1 completes.

### Create Email Sequence
```yaml
name: "Create Email Sequence"
wave: 2
priority: 200
playbook: "CHARACTER-CONTENT-PROTOCOL.md"
triggerCondition: "always"
estimatedDuration: 75
inputs:
  - /[BUSINESS]/character/character-bible.md
  - /[BUSINESS]/vision/master-prompt.md
  - Website URL from Wave 1
output: "5 welcome emails + nurture templates"
dependencies:
  - "Build Website"
executionSteps:
  1. Load character bible for voice
  2. Generate 5-email welcome sequence
  3. Generate nurture templates
  4. Generate pitch templates
  5. Save to /[BUSINESS]/content/
```

### Setup Outbound
```yaml
name: "Setup Outbound"
wave: 2
priority: 201
playbook: "PROMOTE-PROSPECT-PLAYBOOK.md"
triggerCondition: "revenuePlanner.promote.prospect === 'now'"
estimatedDuration: 90
inputs:
  - /[BUSINESS]/vision/ica-doc.md
  - /[BUSINESS]/vision/master-prompt.md
  - /[BUSINESS]/character/character-bible.md
output: "Cold email sequences + setup checklist"
dependencies:
  - "Build Website"
  - "Create Email Sequence"
executionSteps:
  1. Load ICA for targeting
  2. Generate target list criteria
  3. Generate cold email sequences
  4. Create setup checklist
  5. Save to /[BUSINESS]/outbound/
```

### Setup Partnerships
```yaml
name: "Setup Partnerships"
wave: 2
priority: 202
playbook: "PROMOTE-PARTNER-PLAYBOOK.md"
triggerCondition: "revenuePlanner.promote.partnership === 'now'"
estimatedDuration: 60
inputs:
  - /[BUSINESS]/vision/master-prompt.md
  - /[BUSINESS]/vision/ica-doc.md
output: "Partnership kit + outreach sequences"
dependencies:
  - "Build Website"
executionSteps:
  1. Define ideal affiliate profile
  2. Create commission structure
  3. Generate outreach sequences
  4. Create swipe kit
  5. Save to /[BUSINESS]/partnerships/
```

---

## WAVE 3 TASKS — Content & Ads

Run after Wave 2 completes.

### Create Content
```yaml
name: "Create Content"
wave: 3
priority: 300
playbook: "PROMOTE-PUBLISH-PLAYBOOK.md"
triggerCondition: "revenuePlanner.promote.publish === 'now'"
estimatedDuration: 120
inputs:
  - /[BUSINESS]/character/character-bible.md
  - /[BUSINESS]/character/content-creation-calendar.md
  - /[BUSINESS]/vision/master-prompt.md
output: "1 week of content (49 pieces)"
dependencies:
  - "Create Email Sequence"
executionSteps:
  1. Load character bible
  2. Generate 7 days × 7 pieces
  3. Generate ManyChat flows
  4. Create repurposing map
  5. Save to /[BUSINESS]/content/
```

### Create Ads
```yaml
name: "Create Ads"
wave: 3
priority: 301
playbook: "PROMOTE-PAY-PLAYBOOK.md"
triggerCondition: "revenuePlanner.promote.paid === 'now'"
estimatedDuration: 75
inputs:
  - /[BUSINESS]/character/character-bible.md
  - /[BUSINESS]/brand/avatar-image.png
  - /[BUSINESS]/vision/master-prompt.md
  - /[BUSINESS]/vision/ica-doc.md
output: "5 power ads + HOT 7 retargeting"
dependencies:
  - "Build Website"
  - "Create Content"
executionSteps:
  1. Load character bible
  2. Generate 5 Power Content ads
  3. Generate HOT 7 retargeting ads
  4. Create campaign structure guide
  5. Save to /[BUSINESS]/ads/
```

---

## TASK CREATION MATRIX

Quick reference for Revenue Planner → Tasks:

| Selection | Task Created | Wave |
|-----------|--------------|------|
| (always) | Build Website | 1 |
| (always) | Create Email Sequence | 2 |
| profit.cart: "now" | Build Cart Page | 1 |
| profit.call: "now" | Build Call Funnel | 1 |
| profit.crowd: "now" | Build Event Page | 1 |
| promote.prospect: "now" | Setup Outbound | 2 |
| promote.partnership: "now" | Setup Partnerships | 2 |
| promote.publish: "now" | Create Content | 3 |
| promote.paid: "now" | Create Ads | 3 |

---

## API PAYLOADS

### Create Task
```json
POST /api/tasks
{
  "business": "Peak Performance Coaching",
  "name": "Build Website",
  "wave": 1,
  "priority": 100,
  "playbook": "BRAND-INTAKE-PROTOCOL.md",
  "status": "todo",
  "inputs": {
    "brandBoard": "/Peak Performance Coaching/brand/brand-board-approved.png",
    "masterPrompt": "/Peak Performance Coaching/vision/master-prompt.md"
  }
}
```

### Update Task Status
```json
PATCH /api/tasks/{id}
{
  "status": "complete",
  "output": "https://peakperformance.vercel.app",
  "duration": 45
}
```

### Task Failed
```json
PATCH /api/tasks/{id}
{
  "status": "blocked",
  "error": "Vercel deployment timeout"
}
```

---

## KANBAN DISPLAY

### Card in TO DO
```
┌─────────────────────────┐
│ 📋 Build Website        │
│ Wave 1 · Priority 100   │
│ Est: 45 seconds         │
└─────────────────────────┘
```

### Card in IN PROGRESS
```
┌─────────────────────────┐
│ 🔄 Build Website        │
│ Wave 1 · Priority 100   │
│ ◐ Generating...         │
│ Started: 14:32:05       │
└─────────────────────────┘
```

### Card in COMPLETE
```
┌─────────────────────────┐
│ ✅ Build Website        │
│ Wave 1 · 45s            │
│ 🔗 site.vercel.app      │
└─────────────────────────┘
```

### Card in BLOCKED
```
┌─────────────────────────┐
│ ⚠️ Build Cart Page      │
│ Wave 1 · Priority 101   │
│ ❌ Vercel rate limit    │
└─────────────────────────┘
```

---

## TIMING SUMMARY

| Task | Wave | Duration |
|------|------|----------|
| Build Website | 1 | 45s |
| Build Cart Page | 1 | 40s |
| Build Call Funnel | 1 | 50s |
| Build Event Page | 1 | 55s |
| Create Email Sequence | 2 | 75s |
| Setup Outbound | 2 | 90s |
| Setup Partnerships | 2 | 60s |
| Create Content | 3 | 120s |
| Create Ads | 3 | 75s |

**Wave 1 (parallel):** ~1 min
**Wave 2 (parallel):** ~1.5 min
**Wave 3 (parallel):** ~2 min
**Total execution:** ~5 min

---

*Task Library v1.0 | March 4, 2026*
