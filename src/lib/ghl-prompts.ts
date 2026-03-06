// GHL Workflow Prompt Generation
// Per MASTER-SYSTEM-PROMPT Section 5: The GHL Workflow Rule
// "You will NEVER attempt to build a GHL workflow directly."
// Instead, generate Claude Cowork Execution Prompts.

export interface GHLWorkflowPrompt {
  workflowName: string;
  triggerCondition: string;
  steps: string[];
  tags: string[];
  pipelineStages: string[];
  waitConditions: string[];
  conditionalBranches: string[];
  actions: string[];
  filePath: string;
}

/**
 * Generate GHL workflow prompts based on revenue planner selections.
 * Each prompt is a complete, plain-language instruction set for manual GHL build.
 */
export function generateWorkflowPrompts(
  businessName: string,
  revenuePlannerData: {
    profit?: { cart?: string; call?: string; crowd?: string; aiSales?: string };
    promote?: { prospect?: string; paid?: string; publish?: string; partnership?: string };
  }
): GHLWorkflowPrompt[] {
  const prompts: GHLWorkflowPrompt[] = [];
  const basePath = `/BUSINESSES/${businessName}/workflows`;

  // Always generate Welcome Sequence workflow
  prompts.push({
    workflowName: "Welcome Sequence Automation",
    triggerCondition: "New contact is created OR new form submission on any opt-in page",
    steps: [
      "1. Trigger: Contact Created / Form Submitted",
      "2. Wait 1 minute",
      "3. Send Email #1: Welcome email — introduce the brand, set expectations",
      "4. Apply Tag: 'welcome-sequence-active'",
      "5. Move to Pipeline Stage: 'New Lead'",
      "6. Wait 2 days",
      "7. Send Email #2: Origin story — why this business exists",
      "8. Wait 2 days",
      "9. Send Email #3: Value bomb — free resource or actionable tip",
      "10. Wait 1 day",
      "11. Send Email #4: First pitch — soft offer, low pressure",
      "12. Wait 2 days",
      "13. Send Email #5: Workshop/event invite OR re-engagement",
      "14. Remove Tag: 'welcome-sequence-active'",
      "15. Apply Tag: 'welcome-sequence-complete'",
      "16. IF contact clicked any CTA link → Apply Tag: 'engaged-lead'",
      "17. IF contact clicked offer link → Move to Pipeline Stage: 'Interested'",
    ],
    tags: ["welcome-sequence-active", "welcome-sequence-complete", "engaged-lead"],
    pipelineStages: ["New Lead", "Interested"],
    waitConditions: ["2 days between emails #1-#2", "2 days between #2-#3", "1 day between #3-#4", "2 days between #4-#5"],
    conditionalBranches: [
      "IF contact clicks CTA → tag as 'engaged-lead'",
      "IF contact clicks offer → move pipeline to 'Interested'",
      "IF contact unsubscribes → end workflow, apply 'unsubscribed' tag",
    ],
    actions: ["5 emails", "tag applications", "pipeline stage moves", "conditional branching"],
    filePath: `${basePath}/welcome-sequence-ghl-prompt.md`,
  });

  // Lead Nurture workflow
  prompts.push({
    workflowName: "Lead Nurture Automation",
    triggerCondition: "Tag 'welcome-sequence-complete' is applied AND tag 'customer' is NOT present",
    steps: [
      "1. Trigger: Tag Applied — 'welcome-sequence-complete'",
      "2. Condition: IF tag 'customer' NOT present → continue",
      "3. Wait 3 days",
      "4. Send Email: Value content piece (educational)",
      "5. Wait 4 days",
      "6. Send Email: Case study or testimonial",
      "7. Wait 3 days",
      "8. Send Email: Offer reminder with urgency",
      "9. IF contact clicks offer → Move Pipeline to 'Hot Lead'",
      "10. IF no engagement after 30 days → Apply tag 'cold-lead'",
    ],
    tags: ["nurture-active", "cold-lead"],
    pipelineStages: ["Hot Lead"],
    waitConditions: ["3-4 days between emails"],
    conditionalBranches: [
      "IF clicks offer → pipeline 'Hot Lead'",
      "IF no engagement 30 days → tag 'cold-lead'",
    ],
    actions: ["3 emails", "conditional pipeline moves"],
    filePath: `${basePath}/lead-nurture-ghl-prompt.md`,
  });

  // Cart funnel follow-up
  if (revenuePlannerData.profit?.cart === "now") {
    prompts.push({
      workflowName: "Cart Abandonment & Purchase Follow-up",
      triggerCondition: "Contact visits cart page OR completes purchase",
      steps: [
        "1. Trigger: Page Visit — cart page URL",
        "2. Wait 30 minutes",
        "3. Condition: IF purchase NOT completed →",
        "   3a. Send SMS: 'Hey! Noticed you were checking out [product]. Any questions?'",
        "   3b. Wait 24 hours",
        "   3c. Send Email: Cart reminder with testimonial",
        "   3d. Wait 48 hours",
        "   3e. Send Email: Last chance + bonus offer",
        "4. IF purchase completed →",
        "   4a. Apply Tag: 'customer'",
        "   4b. Move Pipeline: 'Customer'",
        "   4c. Send Email: Purchase confirmation + onboarding",
        "   4d. Wait 3 days",
        "   4e. Send Email: Check-in + ask for review",
        "   4f. Create Task: 'Follow up with new customer' (assigned to team)",
      ],
      tags: ["cart-visitor", "cart-abandoned", "customer"],
      pipelineStages: ["Cart Visitor", "Customer"],
      waitConditions: ["30 min after visit", "24h/48h for abandonment sequence"],
      conditionalBranches: [
        "IF purchased → customer flow",
        "IF NOT purchased → abandonment flow",
      ],
      actions: ["SMS", "3 emails (abandon) / 2 emails (purchase)", "pipeline moves", "task creation"],
      filePath: `${basePath}/cart-followup-ghl-prompt.md`,
    });
  }

  // Call funnel booking
  if (revenuePlannerData.profit?.call === "now") {
    prompts.push({
      workflowName: "Booking Confirmation & No-Show Follow-up",
      triggerCondition: "Calendar booking is created",
      steps: [
        "1. Trigger: Calendar Event Created",
        "2. Immediately: Send SMS confirmation with date/time",
        "3. Send Email: Booking confirmation + what to expect",
        "4. Apply Tag: 'call-booked'",
        "5. Move Pipeline: 'Call Booked'",
        "6. Wait until 24 hours before call",
        "7. Send SMS reminder: 'See you tomorrow at [time]!'",
        "8. Wait until 1 hour before call",
        "9. Send SMS: 'Your call starts in 1 hour. Join here: [link]'",
        "10. After call time: Wait 30 minutes",
        "11. Condition: IF call status = 'completed' →",
        "    11a. Apply Tag: 'call-completed'",
        "    11b. Create Task: 'Send proposal to [name]'",
        "12. IF call status = 'no-show' →",
        "    12a. Apply Tag: 'no-show'",
        "    12b. Send SMS: 'We missed you! Want to reschedule?'",
        "    12c. Wait 24 hours → Send Email: reschedule link",
      ],
      tags: ["call-booked", "call-completed", "no-show"],
      pipelineStages: ["Call Booked", "Call Completed", "No Show"],
      waitConditions: ["24h before call", "1h before call", "30 min after call time"],
      conditionalBranches: [
        "IF completed → proposal task",
        "IF no-show → reschedule flow",
      ],
      actions: ["SMS confirmations/reminders", "email confirmation", "pipeline moves", "task creation"],
      filePath: `${basePath}/booking-confirmation-ghl-prompt.md`,
    });
  }

  // Event/webinar follow-up
  if (revenuePlannerData.profit?.crowd === "now") {
    prompts.push({
      workflowName: "Event Registration & Follow-up",
      triggerCondition: "Contact registers for live event/webinar",
      steps: [
        "1. Trigger: Form Submission — event registration form",
        "2. Apply Tag: 'event-registered'",
        "3. Send Email: Registration confirmation + calendar invite link",
        "4. Move Pipeline: 'Event Registered'",
        "5. Wait until 24 hours before event",
        "6. Send SMS: 'Reminder: [Event] is tomorrow at [time]!'",
        "7. Send Email: What to expect + pre-event resource",
        "8. Wait until 1 hour before event",
        "9. Send SMS: 'Starting in 1 hour! Join here: [link]'",
        "10. After event: Wait 30 minutes",
        "11. Send Email: Replay link + special offer (event-only pricing)",
        "12. Wait 24 hours",
        "13. Send Email: Offer reminder + testimonials from event",
        "14. Wait 48 hours",
        "15. Send Email: Final call — offer expires",
        "16. IF purchased → Apply Tag: 'customer', move pipeline",
      ],
      tags: ["event-registered", "event-attended", "event-offer-sent"],
      pipelineStages: ["Event Registered", "Event Attended", "Customer"],
      waitConditions: ["24h before event", "1h before", "30 min after", "24h/48h post-event"],
      conditionalBranches: [
        "IF attended → post-event offer sequence",
        "IF purchased → customer pipeline",
        "IF no-show → replay + re-engagement",
      ],
      actions: ["SMS reminders", "5 emails", "pipeline moves", "conditional offers"],
      filePath: `${basePath}/event-followup-ghl-prompt.md`,
    });
  }

  // AI Sales conversational bot
  if (revenuePlannerData.profit?.aiSales === "now") {
    prompts.push({
      workflowName: "AI Conversational Sales Bot",
      triggerCondition: "New inbound SMS/chat message from contact",
      steps: [
        "1. Trigger: Inbound Message received",
        "2. Route to Conversational AI agent",
        "3. AI engages using trained personality and conversation flows",
        "4. IF contact requests resource → deliver and tag 'resource-requested'",
        "5. IF contact qualifies (answers qualification questions) → Apply Tag: 'qualified'",
        "6. IF qualified → offer booking link, move pipeline to 'Qualified Lead'",
        "7. IF contact books → Apply Tag: 'call-booked', trigger booking workflow",
        "8. IF contact objects → handle with trained objection responses",
        "9. IF escalation trigger hit → Notify team, apply 'needs-human' tag",
        "10. Track: conversation_started, qualification_complete, booking_offered, booking_made",
      ],
      tags: ["ai-conversation-active", "qualified", "needs-human"],
      pipelineStages: ["Qualified Lead"],
      waitConditions: ["Real-time responses, no delays"],
      conditionalBranches: [
        "IF qualifies → booking offer",
        "IF objects → objection handling",
        "IF requests escalation → human handoff",
      ],
      actions: ["AI conversation", "tag application", "booking triggers", "escalation notifications"],
      filePath: `${basePath}/ai-sales-bot-ghl-prompt.md`,
    });
  }

  return prompts;
}

/**
 * Format a GHL workflow prompt as markdown for saving to Google Drive.
 */
export function formatWorkflowPromptMarkdown(prompt: GHLWorkflowPrompt): string {
  return `# GHL Workflow: ${prompt.workflowName}

**Status:** PENDING MANUAL BUILD
**Task Type:** GHL-WORKFLOW
**Instructions:** When ready to build — open this prompt in Claude Cowork and follow step by step inside GoHighLevel.

---

## Trigger Condition
${prompt.triggerCondition}

## Step-by-Step Sequence
${prompt.steps.join("\n")}

## Tags Applied
${prompt.tags.map(t => `- \`${t}\``).join("\n")}

## Pipeline Stage Movements
${prompt.pipelineStages.map(s => `- ${s}`).join("\n")}

## Wait Conditions & Time Delays
${prompt.waitConditions.map(w => `- ${w}`).join("\n")}

## Conditional Branches (If/Then Logic)
${prompt.conditionalBranches.map(c => `- ${c}`).join("\n")}

## Actions Included
${prompt.actions.map(a => `- ${a}`).join("\n")}

---

*Generated by AIM Demo System*
*Classification: GHL-WORKFLOW — PENDING MANUAL BUILD*
`;
}
