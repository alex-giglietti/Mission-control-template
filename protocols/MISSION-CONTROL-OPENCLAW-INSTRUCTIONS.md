# MISSION CONTROL REVEAL — OPEN CLAW INSTRUCTIONS
**For:** Open Claw Bot System
**Trigger:** End of demo after all bot waves complete
**Purpose:** Reveal the volunteer's CEO Dashboard

---

## WHAT YOU DO

When the demo reaches the Mission Control reveal moment, you construct and display the dashboard URL with the volunteer's business name.

---

## TRIGGER CONDITIONS

Execute this protocol when ALL of these are true:

1. `[MASTER: ALL BOTS COMPLETE]` signal received
2. You have the volunteer's business name from Vision intake
3. Joseph has not already revealed Mission Control manually

---

## THE URL

**Base URL:** `https://aim-demo-dashboard.vercel.app`

**With business name:**
```
https://aim-demo-dashboard.vercel.app?business={BUSINESS_NAME_URL_ENCODED}
```

**Example:**
- Business name: "Peak Performance Coaching"
- URL: `https://aim-demo-dashboard.vercel.app?business=Peak%20Performance%20Coaching`

---

## URL ENCODING RULES

Replace these characters in the business name:
- Space → `%20`
- `&` → `%26`
- `'` → `%27`
- `"` → `%22`

Or simply use standard URL encoding on the business name.

---

## YOUR OUTPUT

When triggered, output this message:

```
═══════════════════════════════════════════════════════════════
                    🎯 MISSION CONTROL READY
═══════════════════════════════════════════════════════════════

Your CEO Dashboard is LIVE:

👉 {FULL_URL}

This is your command center. Every lead, every sale, every dollar — 
all in one place.

[MASTER: MISSION CONTROL REVEALED — {BUSINESS_NAME}]
═══════════════════════════════════════════════════════════════
```

---

## EXAMPLE EXECUTION

**Input state:**
- Business name: "Acme Business Solutions"
- All bot waves complete

**Your output:**

```
═══════════════════════════════════════════════════════════════
                    🎯 MISSION CONTROL READY
═══════════════════════════════════════════════════════════════

Your CEO Dashboard is LIVE:

👉 https://aim-demo-dashboard.vercel.app?business=Acme%20Business%20Solutions

This is your command center. Every lead, every sale, every dollar — 
all in one place.

[MASTER: MISSION CONTROL REVEALED — Acme Business Solutions]
═══════════════════════════════════════════════════════════════
```

---

## WHAT THE VOLUNTEER SEES

When they click the link:
- Header shows: "CEO Dashboard — Acme Business Solutions"
- All 5 views work: Dashboard, Promote, Profit, Produce, 24HR
- Date picker is functional
- Metrics are demo data (they don't have a real Factory yet)
- Mobile responsive if they view on phone

---

## IMPORTANT NOTES

1. **This is a DEMO dashboard** — metrics are simulated, not real
2. **The dashboard is pre-deployed** — you're just constructing the URL
3. **Joseph takes over after this** — this is the setup for his close
4. **Do not explain the demo data** — let Joseph handle that conversation

---

## IF SOMETHING GOES WRONG

**If you don't have the business name:**
```
[MASTER: MISSION CONTROL BLOCKED — NO BUSINESS NAME]

I need the business name from Vision intake to generate the dashboard URL.
Joseph, can you confirm the business name?
```

**If the URL doesn't work (Joseph reports issue):**
```
The dashboard URL should be working. Try:
1. Refresh the page
2. Check if the URL has any extra characters
3. Use the base URL without parameters: https://aim-demo-dashboard.vercel.app

If still not working, show screenshots while we troubleshoot.
```

---

## SIGNAL REFERENCE

**Signal you listen for:**
```
[MASTER: ALL BOTS COMPLETE]
```

**Signal you send:**
```
[MASTER: MISSION CONTROL REVEALED — {BUSINESS_NAME}]
```

---

## THAT'S IT

Your job is simple:
1. Wait for all bots to complete
2. Construct the URL with the business name
3. Display it with the formatted message
4. Send the signal
5. Let Joseph take over for the close

---

*Protocol version: 1.0*
*Last updated: March 3, 2026*
