# COO AGENT PROTOCOL
**AI Monetizations Live | Demo Build System**
**Protocol File: COO-AGENT-PROTOCOL.md**
**Version:** 1.0
**Created:** March 4, 2026
**For:** Open Claw Bot System

---

## PURPOSE

The COO Agent is the executor. While the Master Bot orchestrates WHAT needs to happen and WHEN, the COO Agent actually DOES the work. It watches Mission Control, picks up tasks, executes them using the appropriate playbooks, and moves them through the Kanban board.

Think of it this way:
- **Master Bot** = CEO (makes decisions, sets priorities)
- **COO Agent** = COO (executes the plan, manages the work)

---

## CORE BEHAVIOR

The COO Agent runs in a continuous loop:

```
LOOP:
  1. Check Mission Control for tasks in "TO DO" column
  2. Pick the highest priority task
  3. Move it to "IN PROGRESS"
  4. Execute the task using the appropriate playbook
  5. On success: Move to "COMPLETE" + attach output
  6. On failure: Move to "BLOCKED" + attach error
  7. Signal Master Bot with status
  8. Repeat
```

---

## MISSION CONTROL API

The COO Agent communicates with Mission Control via API:

### Base URL
```
https://aim-demo-dashboard.vercel.app/api
```

### Endpoints

#### GET /tasks
Fetch all tasks for a business.

```javascript
GET /api/tasks?business={BUSINESS_NAME}

Response:
{
  tasks: [
    {
      id: "task_001",
      name: "Build Website",
      status: "todo" | "in_progress" | "complete" | "blocked",
      priority: 1,
      playbook: "BRAND-INTAKE-PROTOCOL",
      inputs: { brandBoard: "...", masterPrompt: "..." },
      output: null,
      error: null,
      createdAt: "2026-03-04T14:00:00Z",
      updatedAt: "2026-03-04T14:00:00Z"
    },
    ...
  ]
}
```

#### POST /tasks
Create a new task.

```javascript
POST /api/tasks

Body:
{
  business: "Peak Performance Coaching",
  name: "Build Website",
  priority: 1,
  playbook: "BRAND-INTAKE-PROTOCOL",
  inputs: {
    brandBoard: "/brand/brand-board-approved.png",
    masterPrompt: "/vision/master-prompt.md"
  }
}

Response:
{
  id: "task_001",
  status: "todo",
  ...
}
```

#### PATCH /tasks/{id}
Update a task (move columns, attach output).

```javascript
PATCH /api/tasks/task_001

Body:
{
  status: "in_progress" | "complete" | "blocked",
  output: "https://website.vercel.app",  // optional
  error: "API timeout after 3 retries"    // optional
}

Response:
{
  id: "task_001",
  status: "complete",
  output: "https://website.vercel.app",
  ...
}
```

---

## TASK EXECUTION FLOW

When the COO Agent picks up a task:

### Step 1: Claim the Task
```javascript
PATCH /api/tasks/{id}
{ status: "in_progress" }
```

Signal:
```
[COO: TASK CLAIMED — {taskName}]
```

### Step 2: Load the Playbook
Based on the task's `playbook` field, load the appropriate protocol:

| Playbook Value | File to Load |
|----------------|--------------|
| `BRAND-INTAKE-PROTOCOL` | BRAND-INTAKE-PROTOCOL.md |
| `1-page-cart-playbook` | 1-page-cart-playbook.md |
| `APPLICATION-FUNNEL-PLAYBOOK` | APPLICATION-FUNNEL-PLAYBOOK.md |
| `live-event-page-master-prompt` | live-event-page-master-prompt.md |
| `PROMOTE-PROSPECT-PLAYBOOK` | PROMOTE-PROSPECT-PLAYBOOK.md |
| `PROMOTE-PUBLISH-PLAYBOOK` | PROMOTE-PUBLISH-PLAYBOOK.md |
| `PROMOTE-PAY-PLAYBOOK` | PROMOTE-PAY-PLAYBOOK.md |
| `PROMOTE-PARTNER-PLAYBOOK` | PROMOTE-PARTNER-PLAYBOOK.md |
| `CHARACTER-CONTENT-PROTOCOL` | CHARACTER-CONTENT-PROTOCOL.md |

### Step 3: Gather Inputs
Pull the required inputs from Google Drive:
- `/[BUSINESS_NAME]/vision/` — Vision documents
- `/[BUSINESS_NAME]/brand/` — Brand assets
- `/[BUSINESS_NAME]/character/` — Character assets

### Step 4: Execute
Run the playbook with the inputs. This is where Open Claw does the actual building:
- Generate the funnel/page/content
- Deploy to Vercel (if applicable)
- Save outputs to Google Drive

### Step 5: Complete or Block

**On Success:**
```javascript
PATCH /api/tasks/{id}
{
  status: "complete",
  output: "https://peakperformance-cart.vercel.app"
}
```

Signal:
```
[COO: TASK COMPLETE — {taskName} — OUTPUT: {output}]
```

**On Failure (after 3 retries):**
```javascript
PATCH /api/tasks/{id}
{
  status: "blocked",
  error: "Vercel deployment failed: rate limit exceeded"
}
```

Signal:
```
[COO: TASK BLOCKED — {taskName} — ERROR: {error}]
```

---

## TASK PRIORITY RULES

When multiple tasks are in "TO DO", the COO Agent picks based on:

1. **Wave Number** — Wave 1 tasks before Wave 2, Wave 2 before Wave 3
2. **Priority Field** — Lower number = higher priority
3. **Dependencies** — Skip tasks whose dependencies aren't complete

### Priority Assignments

| Wave | Task | Priority |
|------|------|----------|
| 1 | Build Website | 100 |
| 1 | Build Cart Page | 101 |
| 1 | Build Call Funnel | 102 |
| 1 | Build Event Page | 103 |
| 2 | Create Email Sequence | 200 |
| 2 | Setup Outbound | 201 |
| 2 | Setup Partnerships | 202 |
| 3 | Create Content | 300 |
| 3 | Create Ads | 301 |

### Dependency Check

Before executing, verify dependencies are complete:

```javascript
const dependencies = {
  "Build Cart Page": ["Build Website"],
  "Build Call Funnel": ["Build Website"],
  "Build Event Page": ["Build Website"],
  "Create Email Sequence": ["Build Website"],
  "Setup Outbound": ["Create Email Sequence"],
  "Create Content": ["Character Bible Approved"],
  "Create Ads": ["Create Content", "Build Website"]
};

function canExecute(task, completedTasks) {
  const deps = dependencies[task.name] || [];
  return deps.every(dep => completedTasks.includes(dep));
}
```

If dependencies aren't met, skip the task and pick the next one.

---

## PARALLEL EXECUTION

The COO Agent can run **multiple tasks simultaneously** within the same wave:

```javascript
// Wave 1 spawns — execute all in parallel
const wave1Tasks = tasks.filter(t => t.priority >= 100 && t.priority < 200);

await Promise.all(wave1Tasks.map(task => executeTask(task)));
```

**Rules for parallel execution:**
- Max 4 concurrent tasks (prevent API rate limits)
- All tasks in a wave can run in parallel
- Cross-wave tasks must wait for previous wave

---

## REAL-TIME UPDATES

For the audience to see tasks moving in real-time, Mission Control polls or subscribes:

### Option A: Polling (Simple)
```javascript
// Mission Control frontend
setInterval(async () => {
  const tasks = await fetch('/api/tasks?business=' + businessName);
  updateKanbanBoard(tasks);
}, 2000);  // Every 2 seconds
```

### Option B: WebSocket (Smooth)
```javascript
// Mission Control frontend
const ws = new WebSocket('wss://aim-demo-dashboard.vercel.app/ws');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  updateTaskOnBoard(update.taskId, update.status);
};
```

### Option C: Server-Sent Events (Middle Ground)
```javascript
// Mission Control frontend
const eventSource = new EventSource('/api/tasks/stream?business=' + businessName);

eventSource.onmessage = (event) => {
  const update = JSON.parse(event.data);
  updateTaskOnBoard(update.taskId, update.status);
};
```

**Recommendation for demo:** Start with polling (Option A). It's simplest and 2-second delay is fine for live audience. Upgrade to WebSocket later if needed.

---

## SIGNALS

### Signals the COO Agent Sends

| Signal | When | To |
|--------|------|-----|
| `[COO: STARTING]` | Agent begins watching | Master Bot |
| `[COO: TASK CLAIMED — {taskName}]` | Task moved to In Progress | Mission Control |
| `[COO: TASK COMPLETE — {taskName}]` | Task finished successfully | Mission Control, Master Bot |
| `[COO: TASK BLOCKED — {taskName}]` | Task failed after retries | Mission Control, Master Bot, Joseph |
| `[COO: WAVE {n} COMPLETE]` | All tasks in wave done | Master Bot |
| `[COO: ALL TASKS COMPLETE]` | Everything done | Master Bot |

### Signals the COO Agent Listens For

| Signal | Action |
|--------|--------|
| `[MASTER: REVENUE PLANNER APPROVED]` | Begin processing tasks |
| `[MASTER: PAUSE]` | Stop claiming new tasks |
| `[MASTER: RESUME]` | Resume claiming tasks |
| `[MASTER: ABORT]` | Stop everything, mark remaining as blocked |

---

## ERROR HANDLING

### Retry Logic
```javascript
async function executeWithRetry(task, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await executeTask(task);
      return result;
    } catch (error) {
      console.log(`Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        throw error;  // Final failure
      }
      
      await sleep(2000 * attempt);  // Exponential backoff
    }
  }
}
```

### Common Errors and Responses

| Error | Response |
|-------|----------|
| API timeout | Retry up to 3 times with backoff |
| Rate limit | Wait 60 seconds, then retry |
| Missing input file | Block task, signal Joseph |
| Vercel deployment failed | Retry once, then block |
| Invalid playbook | Block task, signal Joseph |

### Graceful Degradation

If a task blocks, the COO Agent:
1. Marks it as blocked with error details
2. Continues with other tasks
3. Signals Joseph for manual intervention
4. Does NOT stop the entire demo

---

## TASK CREATION (Pre-Loading)

When Revenue Planner is approved, the Master Bot creates tasks based on selections:

```javascript
function createTasksFromRevenuePlanner(revenuePlanner, businessName) {
  const tasks = [];
  
  // Wave 1 — Always create Website
  tasks.push({
    name: "Build Website",
    priority: 100,
    playbook: "BRAND-INTAKE-PROTOCOL",
    wave: 1
  });
  
  // Wave 1 — Based on PROFIT selections
  if (revenuePlanner.profit.cart === "now") {
    tasks.push({
      name: "Build Cart Page",
      priority: 101,
      playbook: "1-page-cart-playbook",
      wave: 1
    });
  }
  
  if (revenuePlanner.profit.call === "now") {
    tasks.push({
      name: "Build Call Funnel",
      priority: 102,
      playbook: "APPLICATION-FUNNEL-PLAYBOOK",
      wave: 1
    });
  }
  
  if (revenuePlanner.profit.crowd === "now") {
    tasks.push({
      name: "Build Event Page",
      priority: 103,
      playbook: "live-event-page-master-prompt",
      wave: 1
    });
  }
  
  // Wave 2 — Always create Email Sequence
  tasks.push({
    name: "Create Email Sequence",
    priority: 200,
    playbook: "CHARACTER-CONTENT-PROTOCOL",
    wave: 2
  });
  
  // Wave 2 — Based on PROMOTE selections
  if (revenuePlanner.promote.prospect === "now") {
    tasks.push({
      name: "Setup Outbound",
      priority: 201,
      playbook: "PROMOTE-PROSPECT-PLAYBOOK",
      wave: 2
    });
  }
  
  if (revenuePlanner.promote.partnership === "now") {
    tasks.push({
      name: "Setup Partnerships",
      priority: 202,
      playbook: "PROMOTE-PARTNER-PLAYBOOK",
      wave: 2
    });
  }
  
  // Wave 3 — Based on PROMOTE selections
  if (revenuePlanner.promote.publish === "now") {
    tasks.push({
      name: "Create Content",
      priority: 300,
      playbook: "PROMOTE-PUBLISH-PLAYBOOK",
      wave: 3
    });
  }
  
  if (revenuePlanner.promote.paid === "now") {
    tasks.push({
      name: "Create Ads",
      priority: 301,
      playbook: "PROMOTE-PAY-PLAYBOOK",
      wave: 3
    });
  }
  
  // Create all tasks via API
  for (const task of tasks) {
    await fetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        business: businessName,
        ...task,
        status: "todo",
        inputs: getInputsForTask(task.name, businessName)
      })
    });
  }
  
  return tasks;
}
```

---

## DEMO SEQUENCE

Here's exactly what happens during the demo:

### Pre-Demo
1. Mission Control is loaded with business name in URL
2. Kanban board is empty (no tasks yet)

### After Revenue Planner Approval
1. Master Bot signals: `[MASTER: REVENUE PLANNER APPROVED]`
2. Master Bot calls `createTasksFromRevenuePlanner()`
3. Tasks appear in "TO DO" column (audience sees this)
4. Master Bot signals: `[MASTER: WAVE 1 SPAWNING]`
5. COO Agent starts claiming tasks

### During Execution
1. First task moves from "TO DO" → "IN PROGRESS" (audience sees)
2. COO Agent executes the playbook
3. Task moves from "IN PROGRESS" → "COMPLETE" (audience sees)
4. Output link appears on the task card
5. Next task begins
6. Repeat until all waves complete

### After All Complete
1. COO Agent signals: `[COO: ALL TASKS COMPLETE]`
2. Master Bot reveals Mission Control summary
3. Joseph takes over for the close

---

## VISUAL TASK CARD

What each task looks like on the Kanban board:

### In "TO DO"
```
┌─────────────────────────────┐
│ 📋 Build Website            │
│ Priority: 100 | Wave 1      │
│ Playbook: BRAND-INTAKE      │
│ ─────────────────────────── │
│ Waiting...                  │
└─────────────────────────────┘
```

### In "IN PROGRESS"
```
┌─────────────────────────────┐
│ 🔄 Build Website            │
│ Priority: 100 | Wave 1      │
│ Playbook: BRAND-INTAKE      │
│ ─────────────────────────── │
│ ◐ Generating page...        │
│ Started: 14:32:05           │
└─────────────────────────────┘
```

### In "COMPLETE"
```
┌─────────────────────────────┐
│ ✅ Build Website            │
│ Priority: 100 | Wave 1      │
│ Playbook: BRAND-INTAKE      │
│ ─────────────────────────── │
│ Duration: 45s               │
│ 🔗 peakperformance.vercel.app│
└─────────────────────────────┘
```

### In "BLOCKED"
```
┌─────────────────────────────┐
│ ⚠️ Build Cart Page          │
│ Priority: 101 | Wave 1      │
│ Playbook: 1-page-cart       │
│ ─────────────────────────── │
│ ❌ Vercel rate limit        │
│ Needs: Joseph               │
└─────────────────────────────┘
```

---

## TIMING EXPECTATIONS

| Task | Expected Duration |
|------|-------------------|
| Build Website | 30-60 seconds |
| Build Cart Page | 30-45 seconds |
| Build Call Funnel | 30-45 seconds |
| Build Event Page | 30-45 seconds |
| Create Email Sequence | 45-90 seconds |
| Setup Outbound | 60-120 seconds |
| Setup Partnerships | 45-60 seconds |
| Create Content | 90-180 seconds |
| Create Ads | 60-90 seconds |

**Total demo build time (all tasks parallel within waves):** 5-8 minutes

---

## WHAT THIS PROTOCOL DOES NOT COVER

| Item | Where It Lives |
|------|---------------|
| Task definitions | TASK-LIBRARY.md |
| How playbooks execute | Individual playbook files |
| Mission Control UI | Mission Control codebase |
| Master Bot orchestration | MASTER-BOT-PROTOCOL.md |

---

*Protocol created: March 4, 2026*
*For use in: Open Claw Bot System — AIM Demo*
