"use client";

import { useState, useEffect } from "react";

// Pipeline types
type PipelineType = "book-a-call" | "webinar" | "challenge";

// Pipeline type definitions with stages
const pipelineTypes: Record<PipelineType, { name: string; stages: { id: string; name: string; description: string; color: string }[] }> = {
  "book-a-call": {
    name: "Book a Call",
    stages: [
      { id: "new-lead", name: "New Lead", description: "Just entered, qualifying", color: "#2F80FF" },
      { id: "qualified", name: "Qualified", description: "Confirmed fit", color: "#7B61FF" },
      { id: "call-scheduled", name: "Call Scheduled", description: "Meeting on calendar", color: "#F59E0B" },
      { id: "call-completed", name: "Call Completed", description: "Discovery done", color: "#06B6D4" },
      { id: "proposal-sent", name: "Proposal Sent", description: "Offer delivered", color: "#10B981" },
      { id: "negotiating", name: "Negotiating", description: "Working terms", color: "#FF4EDB" },
      { id: "closed-won", name: "Closed Won", description: "Money in! 🎉", color: "#10B981" },
      { id: "closed-lost", name: "Closed Lost", description: "Not this time", color: "#EF4444" },
    ],
  },
  webinar: {
    name: "Webinar",
    stages: [
      { id: "registered", name: "Registered", description: "Signed up for webinar", color: "#2F80FF" },
      { id: "reminded", name: "Reminded", description: "Got reminder emails", color: "#7B61FF" },
      { id: "attended-live", name: "Attended Live", description: "Showed up live", color: "#10B981" },
      { id: "watched-replay", name: "Watched Replay", description: "Viewed recording", color: "#06B6D4" },
      { id: "clicked-offer", name: "Clicked Offer", description: "Clicked sales link", color: "#F59E0B" },
      { id: "started-checkout", name: "Started Checkout", description: "Cart initiated", color: "#FF4EDB" },
      { id: "purchased", name: "Purchased", description: "Converted! 🎉", color: "#10B981" },
      { id: "no-show", name: "No Show", description: "Didn't attend", color: "#EF4444" },
    ],
  },
  challenge: {
    name: "Challenge",
    stages: [
      { id: "registered", name: "Registered", description: "Signed up for challenge", color: "#2F80FF" },
      { id: "day-1", name: "Day 1 Attended", description: "Showed up day 1", color: "#7B61FF" },
      { id: "day-2", name: "Day 2 Attended", description: "Showed up day 2", color: "#06B6D4" },
      { id: "day-3", name: "Day 3 Attended", description: "Showed up day 3", color: "#F59E0B" },
      { id: "offer-presented", name: "Offer Presented", description: "Saw the offer", color: "#FF4EDB" },
      { id: "started-checkout", name: "Started Checkout", description: "Cart initiated", color: "#E91E8C" },
      { id: "purchased", name: "Purchased", description: "Challenge buyer! 🎉", color: "#10B981" },
      { id: "vip-upsold", name: "VIP Upsold", description: "Upgraded to VIP! 💎", color: "#FFD700" },
      { id: "dropped-off", name: "Dropped Off", description: "Left the challenge", color: "#EF4444" },
    ],
  },
};

// Deal interface
interface Deal {
  id: number;
  name: string;
  email: string;
  phone: string;
  value: number;
  stage: string;
  source: string;
  entryDate: string;
  temp: "hot" | "warm" | "cold";
  avatar?: string;
  tags: { type: "event" | "status" | "behavior"; label: string }[];
  workflow: string;
  notes: { date: string; content: string; agent?: string }[];
}

// Temperature colors
const tempColors = {
  hot: "#FF4EDB",
  warm: "#F59E0B",
  cold: "#2F80FF",
};

// Tag colors by type
const tagColors = {
  event: { bg: "rgba(47,128,255,0.15)", border: "rgba(47,128,255,0.3)", text: "#2F80FF" },
  status: { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.3)", text: "#10B981" },
  behavior: { bg: "rgba(123,97,255,0.15)", border: "rgba(123,97,255,0.3)", text: "#7B61FF" },
};

// Sample Data - Book a Call (Higher Ticket $5K-$50K)
const bookACallDeals: Deal[] = [
  // New Lead
  { id: 1, name: "Jennifer Walsh", email: "jennifer@growthlabs.io", phone: "(555) 234-5678", value: 25000, stage: "new-lead", source: "Facebook Ad", entryDate: "2026-03-01", temp: "hot", tags: [{ type: "event", label: "Webinar Feb 2026" }, { type: "status", label: "Hot Lead" }, { type: "behavior", label: "Opened Emails" }], workflow: "High-Ticket Lead Nurture", notes: [{ date: "2026-03-02", content: "Arty sent intro sequence", agent: "Arty" }, { date: "2026-03-03", content: "Clicked through to booking page", agent: "Scout" }] },
  { id: 2, name: "Marcus Thompson", email: "marcus@scalingup.co", phone: "(555) 345-6789", value: 15000, stage: "new-lead", source: "LinkedIn", entryDate: "2026-03-02", temp: "warm", tags: [{ type: "status", label: "Warming Up" }, { type: "behavior", label: "Downloaded Guide" }], workflow: "Consultation Funnel", notes: [{ date: "2026-03-03", content: "Downloaded AI Implementation Guide", agent: "Scout" }] },
  { id: 3, name: "Lisa Chen", email: "lisa@venturestudios.com", phone: "(555) 456-7890", value: 50000, stage: "new-lead", source: "Referral", entryDate: "2026-03-03", temp: "hot", tags: [{ type: "event", label: "Workshop Attendee" }, { type: "status", label: "VIP" }], workflow: "VIP Lead Treatment", notes: [{ date: "2026-03-03", content: "Referred by Daniel Foster - top priority", agent: "Solomon" }] },
  // Qualified
  { id: 4, name: "David Park", email: "david@apexdigital.io", phone: "(555) 567-8901", value: 35000, stage: "qualified", source: "Google Ad", entryDate: "2026-02-25", temp: "hot", tags: [{ type: "status", label: "Hot Lead" }, { type: "behavior", label: "Watched Demo" }], workflow: "Demo Follow-up", notes: [{ date: "2026-02-28", content: "Confirmed $30-50K budget", agent: "Closer" }, { date: "2026-03-01", content: "Wants to move fast - Q2 deadline", agent: "Closer" }] },
  { id: 5, name: "Amanda Rodriguez", email: "amanda@growthpartners.com", phone: "(555) 678-9012", value: 25000, stage: "qualified", source: "Facebook Ad", entryDate: "2026-02-26", temp: "hot", tags: [{ type: "event", label: "Challenge Feb 2026" }, { type: "status", label: "Hot Lead" }, { type: "behavior", label: "Attended All Days" }], workflow: "Challenge Grad Sequence", notes: [{ date: "2026-02-28", content: "Completed all 3 challenge days", agent: "Arty" }] },
  { id: 6, name: "Chris Martinez", email: "chris@scaledge.io", phone: "(555) 789-0123", value: 18000, stage: "qualified", source: "Organic", entryDate: "2026-02-27", temp: "warm", tags: [{ type: "behavior", label: "Multiple Page Views" }], workflow: "Warm Lead Nurture", notes: [{ date: "2026-03-01", content: "Visited pricing page 5 times", agent: "Scout" }] },
  // Call Scheduled
  { id: 7, name: "Sarah Chen", email: "sarah@techventure.co", phone: "(555) 890-1234", value: 45000, stage: "call-scheduled", source: "Webinar", entryDate: "2026-02-20", temp: "hot", tags: [{ type: "event", label: "Webinar Feb 2026" }, { type: "status", label: "VIP" }, { type: "behavior", label: "Clicked Offer" }], workflow: "Pre-Call Warmup", notes: [{ date: "2026-03-03", content: "Call scheduled for tomorrow 2pm EST", agent: "Scheduler" }, { date: "2026-03-03", content: "Sent pre-call worksheet", agent: "Arty" }] },
  { id: 8, name: "Robert Kim", email: "robert@digitalfirst.co", phone: "(555) 901-2345", value: 30000, stage: "call-scheduled", source: "Referral", entryDate: "2026-02-22", temp: "hot", tags: [{ type: "status", label: "Hot Lead" }, { type: "behavior", label: "Fast Responder" }], workflow: "High-Value Call Prep", notes: [{ date: "2026-03-02", content: "Referred by Mike Johnson - closing today", agent: "Closer" }] },
  // Call Completed
  { id: 9, name: "Emily Watson", email: "emily@revenuesystems.io", phone: "(555) 012-3456", value: 50000, stage: "call-completed", source: "Facebook Ad", entryDate: "2026-02-15", temp: "hot", tags: [{ type: "status", label: "Hot Lead" }, { type: "behavior", label: "Great Call" }], workflow: "Proposal Sequence", notes: [{ date: "2026-03-02", content: "Amazing call - 50K package discussed", agent: "Joseph" }, { date: "2026-03-02", content: "Preparing custom proposal", agent: "Solomon" }] },
  { id: 10, name: "Michael Brown", email: "michael@growthengine.co", phone: "(555) 123-4567", value: 35000, stage: "call-completed", source: "LinkedIn", entryDate: "2026-02-18", temp: "warm", tags: [{ type: "status", label: "Warming Up" }, { type: "behavior", label: "Needs Time" }], workflow: "Decision Nurture", notes: [{ date: "2026-03-01", content: "Good call but needs to talk to partner", agent: "Closer" }] },
  // Proposal Sent
  { id: 11, name: "Jessica Lee", email: "jessica@alphagrowth.io", phone: "(555) 234-5679", value: 50000, stage: "proposal-sent", source: "Referral", entryDate: "2026-02-10", temp: "hot", tags: [{ type: "status", label: "Hot Lead" }, { type: "behavior", label: "Opened Proposal" }], workflow: "Proposal Follow-up", notes: [{ date: "2026-03-02", content: "Opened proposal 4 times", agent: "Scout" }, { date: "2026-03-03", content: "Following up today", agent: "Closer" }] },
  { id: 12, name: "Kevin Patel", email: "kevin@startupstudio.co", phone: "(555) 345-6780", value: 25000, stage: "proposal-sent", source: "Webinar", entryDate: "2026-02-12", temp: "warm", tags: [{ type: "event", label: "Webinar Attendee" }, { type: "behavior", label: "Reviewing" }], workflow: "Proposal Warmup", notes: [{ date: "2026-03-01", content: "Sent detailed proposal with case studies", agent: "Solomon" }] },
  // Negotiating
  { id: 13, name: "Stephanie Adams", email: "stephanie@scalefast.io", phone: "(555) 456-7891", value: 45000, stage: "negotiating", source: "Referral", entryDate: "2026-02-05", temp: "hot", tags: [{ type: "status", label: "Closing" }, { type: "behavior", label: "Price Discussion" }], workflow: "Close Sequence", notes: [{ date: "2026-03-02", content: "Discussing payment plan options", agent: "Closer" }, { date: "2026-03-03", content: "Likely closing this week", agent: "Joseph" }] },
  { id: 14, name: "Brian Wilson", email: "brian@velocitylabs.co", phone: "(555) 567-8902", value: 35000, stage: "negotiating", source: "Facebook Ad", entryDate: "2026-02-08", temp: "hot", tags: [{ type: "status", label: "Closing" }], workflow: "Final Push", notes: [{ date: "2026-03-03", content: "Finalizing scope - adding content piece", agent: "Closer" }] },
  // Closed Won
  { id: 15, name: "Daniel Foster", email: "daniel@revops.io", phone: "(555) 678-9013", value: 50000, stage: "closed-won", source: "Referral", entryDate: "2026-02-01", temp: "hot", tags: [{ type: "status", label: "Buyer" }, { type: "behavior", label: "Paid in Full" }], workflow: "Onboarding", notes: [{ date: "2026-02-28", content: "CLOSED! $50K - Full payment received", agent: "Joseph" }, { date: "2026-03-01", content: "Kickoff call scheduled", agent: "Scheduler" }] },
  { id: 16, name: "Nicole Turner", email: "nicole@digitaldynamics.io", phone: "(555) 789-0124", value: 35000, stage: "closed-won", source: "Webinar", entryDate: "2026-02-03", temp: "hot", tags: [{ type: "status", label: "Buyer" }, { type: "event", label: "Webinar Feb 2026" }], workflow: "Onboarding", notes: [{ date: "2026-03-01", content: "CLOSED! Starting implementation next week", agent: "Closer" }] },
  // Closed Lost
  { id: 17, name: "Tony Stark", email: "tony@starkindustries.com", phone: "(555) 890-1235", value: 40000, stage: "closed-lost", source: "LinkedIn", entryDate: "2026-02-10", temp: "cold", tags: [{ type: "status", label: "Lost" }, { type: "behavior", label: "Budget Issue" }], workflow: "Lost Deal Nurture", notes: [{ date: "2026-03-02", content: "Budget frozen until Q3 - adding to reactivation list", agent: "Closer" }] },
  { id: 18, name: "Peter Parker", email: "peter@webdesigns.co", phone: "(555) 901-2346", value: 20000, stage: "closed-lost", source: "Organic", entryDate: "2026-02-15", temp: "cold", tags: [{ type: "status", label: "Lost" }, { type: "behavior", label: "Went Competitor" }], workflow: "Win-Back Sequence", notes: [{ date: "2026-03-01", content: "Chose competitor - adding to 90-day win-back", agent: "Arty" }] },
];

// Sample Data - Webinar ($997-$5K)
const webinarDeals: Deal[] = [
  // Registered
  { id: 101, name: "Michelle Carter", email: "michelle@designstudio.co", phone: "(555) 111-2222", value: 2997, stage: "registered", source: "Facebook Ad", entryDate: "2026-03-01", temp: "warm", tags: [{ type: "event", label: "Webinar Mar 2026" }, { type: "behavior", label: "Fast Signup" }], workflow: "Webinar Confirmation", notes: [{ date: "2026-03-01", content: "Registered for March 10 webinar", agent: "Arty" }] },
  { id: 102, name: "Jason Rivera", email: "jason@contentcreators.io", phone: "(555) 222-3333", value: 997, stage: "registered", source: "Instagram", entryDate: "2026-03-02", temp: "cold", tags: [{ type: "event", label: "Webinar Mar 2026" }], workflow: "Webinar Warmup", notes: [{ date: "2026-03-02", content: "Added to confirmation sequence", agent: "Arty" }] },
  { id: 103, name: "Laura Bennett", email: "laura@freelancelife.com", phone: "(555) 333-4444", value: 1997, stage: "registered", source: "Facebook Ad", entryDate: "2026-03-02", temp: "warm", tags: [{ type: "event", label: "Webinar Mar 2026" }, { type: "behavior", label: "Opened Emails" }], workflow: "Webinar Warmup", notes: [{ date: "2026-03-03", content: "Opened all confirmation emails", agent: "Scout" }] },
  // Reminded
  { id: 104, name: "Thomas Wright", email: "thomas@agencyowner.co", phone: "(555) 444-5555", value: 4997, stage: "reminded", source: "Google Ad", entryDate: "2026-02-25", temp: "hot", tags: [{ type: "event", label: "Webinar Feb 2026" }, { type: "behavior", label: "Engaged" }], workflow: "Pre-Webinar Warmup", notes: [{ date: "2026-02-27", content: "Clicked all reminder links", agent: "Arty" }, { date: "2026-02-28", content: "Added calendar reminder", agent: "Scout" }] },
  { id: 105, name: "Angela Morris", email: "angela@socialmediaqueens.com", phone: "(555) 555-6666", value: 2997, stage: "reminded", source: "Facebook Ad", entryDate: "2026-02-26", temp: "warm", tags: [{ type: "event", label: "Webinar Feb 2026" }, { type: "behavior", label: "SMS Confirmed" }], workflow: "SMS Reminder Sequence", notes: [{ date: "2026-02-28", content: "Confirmed attendance via SMS", agent: "Arty" }] },
  // Attended Live
  { id: 106, name: "Brandon Taylor", email: "brandon@ecomscale.io", phone: "(555) 666-7777", value: 4997, stage: "attended-live", source: "Facebook Ad", entryDate: "2026-02-20", temp: "hot", tags: [{ type: "event", label: "Webinar Feb 2026" }, { type: "status", label: "Hot Lead" }, { type: "behavior", label: "Full Attendance" }], workflow: "Post-Webinar Hot", notes: [{ date: "2026-02-26", content: "Stayed for full 90 minutes!", agent: "Scout" }, { date: "2026-02-26", content: "Asked 3 questions in chat", agent: "Arty" }] },
  { id: 107, name: "Samantha Collins", email: "samantha@coachingbiz.com", phone: "(555) 777-8888", value: 2997, stage: "attended-live", source: "Referral", entryDate: "2026-02-21", temp: "hot", tags: [{ type: "event", label: "Webinar Feb 2026" }, { type: "status", label: "Hot Lead" }], workflow: "Post-Webinar Hot", notes: [{ date: "2026-02-26", content: "Very engaged - mentioned she's ready to buy", agent: "Scout" }] },
  { id: 108, name: "Derek Johnson", email: "derek@digitalagency.co", phone: "(555) 888-9999", value: 1997, stage: "attended-live", source: "Google Ad", entryDate: "2026-02-22", temp: "warm", tags: [{ type: "event", label: "Webinar Feb 2026" }, { type: "behavior", label: "Questions Asked" }], workflow: "Post-Webinar Nurture", notes: [{ date: "2026-02-26", content: "Asked about payment plans", agent: "Scout" }] },
  // Watched Replay
  { id: 109, name: "Patricia Green", email: "patricia@consultingpro.io", phone: "(555) 999-0000", value: 2997, stage: "watched-replay", source: "Facebook Ad", entryDate: "2026-02-18", temp: "warm", tags: [{ type: "event", label: "Webinar Feb 2026" }, { type: "behavior", label: "Replay Viewer" }], workflow: "Replay Sequence", notes: [{ date: "2026-02-28", content: "Watched 85% of replay", agent: "Scout" }] },
  { id: 110, name: "Ryan Mitchell", email: "ryan@marketingpros.com", phone: "(555) 000-1111", value: 4997, stage: "watched-replay", source: "Instagram", entryDate: "2026-02-19", temp: "hot", tags: [{ type: "event", label: "Webinar Feb 2026" }, { type: "status", label: "Hot Lead" }, { type: "behavior", label: "Full Replay" }], workflow: "Hot Replay Follow-up", notes: [{ date: "2026-03-01", content: "Watched full replay twice!", agent: "Scout" }, { date: "2026-03-02", content: "Clicked offer link after replay", agent: "Arty" }] },
  // Clicked Offer
  { id: 111, name: "Victoria Adams", email: "victoria@creativestudio.io", phone: "(555) 121-3131", value: 2997, stage: "clicked-offer", source: "Facebook Ad", entryDate: "2026-02-15", temp: "hot", tags: [{ type: "event", label: "Webinar Feb 2026" }, { type: "status", label: "Hot Lead" }, { type: "behavior", label: "Clicked Offer" }], workflow: "Offer Click Follow-up", notes: [{ date: "2026-02-26", content: "Clicked offer 3 times", agent: "Scout" }, { date: "2026-02-27", content: "Sending urgency sequence", agent: "Arty" }] },
  { id: 112, name: "Gary Thompson", email: "gary@bizcoach.com", phone: "(555) 131-4141", value: 4997, stage: "clicked-offer", source: "Referral", entryDate: "2026-02-16", temp: "hot", tags: [{ type: "event", label: "Webinar Feb 2026" }, { type: "status", label: "VIP" }, { type: "behavior", label: "Ready to Buy" }], workflow: "VIP Close Sequence", notes: [{ date: "2026-02-27", content: "Clicked offer, spent 5min on page", agent: "Scout" }] },
  // Started Checkout
  { id: 113, name: "Nancy Williams", email: "nancy@launchexperts.co", phone: "(555) 141-5151", value: 2997, stage: "started-checkout", source: "Facebook Ad", entryDate: "2026-02-12", temp: "hot", tags: [{ type: "event", label: "Webinar Feb 2026" }, { type: "status", label: "Hot Lead" }, { type: "behavior", label: "Cart Abandon" }], workflow: "Cart Recovery", notes: [{ date: "2026-02-28", content: "Started checkout but didn't complete", agent: "Scout" }, { date: "2026-02-28", content: "Sent cart recovery email", agent: "Arty" }] },
  { id: 114, name: "Paul Anderson", email: "paul@salesmastery.io", phone: "(555) 151-6161", value: 4997, stage: "started-checkout", source: "Google Ad", entryDate: "2026-02-13", temp: "hot", tags: [{ type: "status", label: "Closing" }, { type: "behavior", label: "Payment Issue" }], workflow: "Payment Recovery", notes: [{ date: "2026-03-01", content: "Card declined - following up", agent: "Arty" }] },
  // Purchased
  { id: 115, name: "Catherine Lewis", email: "catherine@funnelqueen.com", phone: "(555) 161-7171", value: 2997, stage: "purchased", source: "Facebook Ad", entryDate: "2026-02-08", temp: "hot", tags: [{ type: "event", label: "Webinar Feb 2026" }, { type: "status", label: "Buyer" }], workflow: "Buyer Onboarding", notes: [{ date: "2026-02-26", content: "PURCHASED! $2997 course", agent: "Arty" }] },
  { id: 116, name: "James Rodriguez", email: "james@contentking.io", phone: "(555) 171-8181", value: 4997, stage: "purchased", source: "Referral", entryDate: "2026-02-09", temp: "hot", tags: [{ type: "event", label: "Webinar Feb 2026" }, { type: "status", label: "Buyer" }, { type: "status", label: "VIP" }], workflow: "VIP Onboarding", notes: [{ date: "2026-02-27", content: "PURCHASED! $4997 VIP package", agent: "Closer" }] },
  { id: 117, name: "Elizabeth Moore", email: "elizabeth@marketingmaven.co", phone: "(555) 181-9191", value: 997, stage: "purchased", source: "Instagram", entryDate: "2026-02-10", temp: "warm", tags: [{ type: "event", label: "Webinar Feb 2026" }, { type: "status", label: "Buyer" }], workflow: "Entry Buyer Nurture", notes: [{ date: "2026-02-28", content: "PURCHASED! $997 starter", agent: "Arty" }] },
  // No Show
  { id: 118, name: "William Jackson", email: "william@bizbuilder.io", phone: "(555) 191-0101", value: 2997, stage: "no-show", source: "Facebook Ad", entryDate: "2026-02-18", temp: "cold", tags: [{ type: "event", label: "Webinar Feb 2026" }, { type: "behavior", label: "No Show" }], workflow: "No Show Recovery", notes: [{ date: "2026-02-26", content: "Didn't attend - sending replay", agent: "Arty" }] },
  { id: 119, name: "Karen White", email: "karen@solopreneur.com", phone: "(555) 202-1212", value: 997, stage: "no-show", source: "Google Ad", entryDate: "2026-02-19", temp: "cold", tags: [{ type: "event", label: "Webinar Feb 2026" }, { type: "behavior", label: "No Show" }], workflow: "No Show Recovery", notes: [{ date: "2026-02-26", content: "No show - replay sequence started", agent: "Arty" }] },
];

// Sample Data - Challenge ($97 challenge + upsells)
const challengeDeals: Deal[] = [
  // Registered
  { id: 201, name: "Alex Turner", email: "alex@startupfounder.co", phone: "(555) 301-4141", value: 97, stage: "registered", source: "Facebook Ad", entryDate: "2026-03-01", temp: "warm", tags: [{ type: "event", label: "Challenge Mar 2026" }], workflow: "Challenge Welcome", notes: [{ date: "2026-03-01", content: "Registered for March challenge", agent: "Arty" }] },
  { id: 202, name: "Morgan Blake", email: "morgan@creativemind.io", phone: "(555) 302-4242", value: 97, stage: "registered", source: "Instagram", entryDate: "2026-03-02", temp: "cold", tags: [{ type: "event", label: "Challenge Mar 2026" }], workflow: "Challenge Warmup", notes: [{ date: "2026-03-02", content: "Added to Day 1 reminder sequence", agent: "Arty" }] },
  { id: 203, name: "Jordan Casey", email: "jordan@sidehustle.com", phone: "(555) 303-4343", value: 97, stage: "registered", source: "TikTok", entryDate: "2026-03-02", temp: "warm", tags: [{ type: "event", label: "Challenge Mar 2026" }, { type: "behavior", label: "Fast Signup" }], workflow: "Challenge Warmup", notes: [{ date: "2026-03-02", content: "Super engaged - joined FB group immediately", agent: "Scout" }] },
  // Day 1 Attended
  { id: 204, name: "Taylor Reed", email: "taylor@onlinebiz.co", phone: "(555) 304-4444", value: 97, stage: "day-1", source: "Facebook Ad", entryDate: "2026-02-25", temp: "warm", tags: [{ type: "event", label: "Challenge Feb 2026" }, { type: "behavior", label: "Day 1 Complete" }], workflow: "Day 2 Prep", notes: [{ date: "2026-02-28", content: "Completed Day 1 homework!", agent: "Scout" }] },
  { id: 205, name: "Casey Morgan", email: "casey@freelancer.io", phone: "(555) 305-4545", value: 97, stage: "day-1", source: "Referral", entryDate: "2026-02-26", temp: "hot", tags: [{ type: "event", label: "Challenge Feb 2026" }, { type: "status", label: "Hot Lead" }, { type: "behavior", label: "Super Engaged" }], workflow: "Hot Participant Track", notes: [{ date: "2026-02-28", content: "Posted homework + helped 3 others in group", agent: "Scout" }] },
  // Day 2 Attended
  { id: 206, name: "Riley Kim", email: "riley@solopreneur.co", phone: "(555) 306-4646", value: 497, stage: "day-2", source: "Facebook Ad", entryDate: "2026-02-20", temp: "hot", tags: [{ type: "event", label: "Challenge Feb 2026" }, { type: "status", label: "Hot Lead" }, { type: "behavior", label: "Day 2 Complete" }], workflow: "Day 3 Prep", notes: [{ date: "2026-02-27", content: "Crushing it! 2 days complete", agent: "Scout" }, { date: "2026-02-27", content: "Mentioned ready to buy VIP", agent: "Arty" }] },
  { id: 207, name: "Avery Thompson", email: "avery@digitalcreator.io", phone: "(555) 307-4747", value: 97, stage: "day-2", source: "Instagram", entryDate: "2026-02-21", temp: "warm", tags: [{ type: "event", label: "Challenge Feb 2026" }, { type: "behavior", label: "Day 2 Complete" }], workflow: "Day 3 Prep", notes: [{ date: "2026-02-27", content: "Good engagement - following instructions", agent: "Scout" }] },
  // Day 3 Attended
  { id: 208, name: "Quinn Williams", email: "quinn@bizbuilder.co", phone: "(555) 308-4848", value: 1997, stage: "day-3", source: "Facebook Ad", entryDate: "2026-02-18", temp: "hot", tags: [{ type: "event", label: "Challenge Feb 2026" }, { type: "status", label: "Hot Lead" }, { type: "behavior", label: "Attended All Days" }], workflow: "Offer Reveal", notes: [{ date: "2026-02-26", content: "ALL 3 DAYS COMPLETE! 🔥", agent: "Scout" }, { date: "2026-02-26", content: "Preparing for offer presentation", agent: "Arty" }] },
  { id: 209, name: "Skyler Brown", email: "skyler@contentcreator.com", phone: "(555) 309-4949", value: 497, stage: "day-3", source: "Referral", entryDate: "2026-02-19", temp: "hot", tags: [{ type: "event", label: "Challenge Feb 2026" }, { type: "status", label: "VIP" }, { type: "behavior", label: "Attended All Days" }], workflow: "VIP Offer Track", notes: [{ date: "2026-02-26", content: "Completed all days - VIP candidate", agent: "Scout" }] },
  // Offer Presented
  { id: 210, name: "Harper Davis", email: "harper@onlinecoach.io", phone: "(555) 310-5050", value: 1997, stage: "offer-presented", source: "Facebook Ad", entryDate: "2026-02-15", temp: "hot", tags: [{ type: "event", label: "Challenge Feb 2026" }, { type: "status", label: "Hot Lead" }, { type: "behavior", label: "Attended All Days" }], workflow: "Offer Follow-up", notes: [{ date: "2026-02-26", content: "Saw workshop offer - very interested", agent: "Closer" }] },
  { id: 211, name: "Sage Martinez", email: "sage@entrepreneur.co", phone: "(555) 311-5151", value: 4997, stage: "offer-presented", source: "Google Ad", entryDate: "2026-02-16", temp: "hot", tags: [{ type: "event", label: "Challenge Feb 2026" }, { type: "status", label: "VIP" }, { type: "behavior", label: "Asked About VIP" }], workflow: "VIP Close", notes: [{ date: "2026-02-26", content: "Asked about VIP pricing - sending details", agent: "Closer" }] },
  // Started Checkout
  { id: 212, name: "Finley Jones", email: "finley@bizowner.io", phone: "(555) 312-5252", value: 1997, stage: "started-checkout", source: "Facebook Ad", entryDate: "2026-02-12", temp: "hot", tags: [{ type: "event", label: "Challenge Feb 2026" }, { type: "status", label: "Closing" }, { type: "behavior", label: "Cart Abandon" }], workflow: "Cart Recovery", notes: [{ date: "2026-02-27", content: "Started checkout for workshop", agent: "Scout" }, { date: "2026-02-27", content: "Cart abandon email sent", agent: "Arty" }] },
  { id: 213, name: "Rowan Lee", email: "rowan@creativeagency.co", phone: "(555) 313-5353", value: 4997, stage: "started-checkout", source: "Referral", entryDate: "2026-02-13", temp: "hot", tags: [{ type: "event", label: "Challenge Feb 2026" }, { type: "status", label: "VIP" }, { type: "behavior", label: "Payment Pending" }], workflow: "VIP Close", notes: [{ date: "2026-02-28", content: "VIP checkout started - payment processing", agent: "Closer" }] },
  // Purchased
  { id: 214, name: "Cameron Scott", email: "cameron@growthhacker.io", phone: "(555) 314-5454", value: 1997, stage: "purchased", source: "Facebook Ad", entryDate: "2026-02-08", temp: "hot", tags: [{ type: "event", label: "Challenge Feb 2026" }, { type: "status", label: "Buyer" }], workflow: "Workshop Onboarding", notes: [{ date: "2026-02-26", content: "PURCHASED! $1997 workshop", agent: "Arty" }] },
  { id: 215, name: "Dakota Phillips", email: "dakota@founder.co", phone: "(555) 315-5555", value: 1997, stage: "purchased", source: "Instagram", entryDate: "2026-02-09", temp: "hot", tags: [{ type: "event", label: "Challenge Feb 2026" }, { type: "status", label: "Buyer" }], workflow: "Workshop Onboarding", notes: [{ date: "2026-02-27", content: "PURCHASED! Challenge → Workshop convert", agent: "Closer" }] },
  // VIP Upsold
  { id: 216, name: "Phoenix Garcia", email: "phoenix@businessempire.io", phone: "(555) 316-5656", value: 4997, stage: "vip-upsold", source: "Facebook Ad", entryDate: "2026-02-05", temp: "hot", tags: [{ type: "event", label: "Challenge Feb 2026" }, { type: "status", label: "Buyer" }, { type: "status", label: "VIP" }], workflow: "VIP Onboarding", notes: [{ date: "2026-02-26", content: "UPSOLD TO VIP! 🎉 $4997", agent: "Closer" }] },
  { id: 217, name: "River Anderson", email: "river@scalingup.io", phone: "(555) 317-5757", value: 4997, stage: "vip-upsold", source: "Referral", entryDate: "2026-02-06", temp: "hot", tags: [{ type: "event", label: "Challenge Feb 2026" }, { type: "status", label: "Buyer" }, { type: "status", label: "VIP" }], workflow: "VIP Onboarding", notes: [{ date: "2026-02-27", content: "VIP UPGRADE! Started at $97 challenge", agent: "Joseph" }] },
  // Dropped Off
  { id: 218, name: "Charlie Evans", email: "charlie@tryingout.com", phone: "(555) 318-5858", value: 97, stage: "dropped-off", source: "Facebook Ad", entryDate: "2026-02-20", temp: "cold", tags: [{ type: "event", label: "Challenge Feb 2026" }, { type: "behavior", label: "Dropped Day 2" }], workflow: "Re-engagement", notes: [{ date: "2026-02-28", content: "Dropped after Day 1 - re-engagement started", agent: "Arty" }] },
  { id: 219, name: "Blake Taylor", email: "blake@curious.io", phone: "(555) 319-5959", value: 97, stage: "dropped-off", source: "TikTok", entryDate: "2026-02-21", temp: "cold", tags: [{ type: "event", label: "Challenge Feb 2026" }, { type: "behavior", label: "Never Started" }], workflow: "Re-engagement", notes: [{ date: "2026-02-28", content: "Registered but never attended - following up", agent: "Arty" }] },
];

// AI Activity items (shared)
const aiActivity = [
  { agent: "Arty", action: "followed up with Sarah Chen", time: "5 min ago", icon: "🎯" },
  { agent: "Closer", action: "sent proposal to Jessica Lee", time: "22 min ago", icon: "💰" },
  { agent: "Scheduler", action: "booked call with David Park", time: "1 hr ago", icon: "📅" },
  { agent: "Arty", action: "qualified Jennifer Walsh", time: "2 hr ago", icon: "🎯" },
  { agent: "Scout", action: "tracked replay views for Ryan Mitchell", time: "3 hr ago", icon: "🔍" },
  { agent: "Arty", action: "sent cart recovery to Nancy Williams", time: "4 hr ago", icon: "🎯" },
  { agent: "Scheduler", action: "confirmed call with Robert Kim", time: "5 hr ago", icon: "📅" },
  { agent: "Closer", action: "negotiating with Stephanie Adams", time: "6 hr ago", icon: "💰" },
];

export default function ProfitPipeline() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activePipeline, setActivePipeline] = useState<PipelineType>("book-a-call");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get deals for active pipeline
  const getDeals = (): Deal[] => {
    switch (activePipeline) {
      case "book-a-call":
        return bookACallDeals;
      case "webinar":
        return webinarDeals;
      case "challenge":
        return challengeDeals;
      default:
        return bookACallDeals;
    }
  };

  const deals = getDeals();
  const stages = pipelineTypes[activePipeline].stages;

  // Calculate stats
  const totalPipelineValue = deals.reduce((sum, d) => sum + d.value, 0);
  const totalDeals = deals.length;
  
  // Conversion rate calculation
  const getConversionRate = () => {
    if (activePipeline === "book-a-call") {
      const closedWon = deals.filter(d => d.stage === "closed-won").length;
      const total = deals.length;
      return total > 0 ? Math.round((closedWon / total) * 100) : 0;
    } else if (activePipeline === "webinar") {
      const purchased = deals.filter(d => d.stage === "purchased").length;
      const registered = deals.length;
      return registered > 0 ? Math.round((purchased / registered) * 100) : 0;
    } else {
      const purchased = deals.filter(d => d.stage === "purchased" || d.stage === "vip-upsold").length;
      const registered = deals.length;
      return registered > 0 ? Math.round((purchased / registered) * 100) : 0;
    }
  };
  
  // Closing this week (deals in late stages)
  const closingThisWeek = activePipeline === "book-a-call" 
    ? deals.filter(d => d.stage === "negotiating" || d.stage === "proposal-sent")
    : activePipeline === "webinar"
    ? deals.filter(d => d.stage === "started-checkout" || d.stage === "clicked-offer")
    : deals.filter(d => d.stage === "started-checkout" || d.stage === "offer-presented");
  
  const closingValue = closingThisWeek.reduce((sum, d) => sum + d.value, 0);
  
  // Stage stats
  const getStageDeals = (stageId: string) => deals.filter(d => d.stage === stageId);
  const getStageValue = (stageId: string) => getStageDeals(stageId).reduce((sum, d) => sum + d.value, 0);

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle deal click
  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDetailOpen(true);
  };

  return (
    <div style={{ padding: 32, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 10,
          letterSpacing: 3,
          fontFamily: "'Orbitron', monospace",
          background: "linear-gradient(90deg, #10B981, #2F80FF, #FF4EDB)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 8,
        }}>
          PROFIT PIPELINE
        </div>
        <div style={{
          fontSize: 28,
          fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
          color: "#F5F7FA",
          marginBottom: 4,
        }}>
          Deals in Motion
        </div>
        <div style={{
          fontSize: 14,
          color: "#6B7186",
          fontFamily: "'Inter', sans-serif",
        }}>
          AI Following Up Automatically — Your Revenue Never Sleeps
        </div>
      </div>

      {/* Pipeline Type Toggle */}
      <div style={{
        display: "flex",
        gap: 0,
        marginBottom: 24,
        background: "rgba(255,255,255,0.03)",
        borderRadius: 12,
        padding: 4,
        border: "1px solid rgba(255,255,255,0.06)",
        width: "fit-content",
      }}>
        {(["book-a-call", "webinar", "challenge"] as PipelineType[]).map((type) => (
          <button
            key={type}
            onClick={() => setActivePipeline(type)}
            style={{
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              background: activePipeline === type 
                ? "linear-gradient(135deg, rgba(233,30,140,0.2), rgba(0,217,255,0.2))"
                : "transparent",
              color: activePipeline === type ? "#F5F7FA" : "#6B7186",
              boxShadow: activePipeline === type 
                ? "0 0 20px rgba(233,30,140,0.2)"
                : "none",
            }}
          >
            {type === "book-a-call" && "📞 Book a Call"}
            {type === "webinar" && "🎥 Webinar"}
            {type === "challenge" && "🏆 Challenge"}
          </button>
        ))}
      </div>

      {/* Stats Bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
        marginBottom: 24,
      }}>
        {/* Total Pipeline Value */}
        <div style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))",
          borderRadius: 12,
          border: "1px solid rgba(16,185,129,0.3)",
        }}>
          <div style={{
            fontSize: 10,
            letterSpacing: 1.5,
            fontFamily: "'Orbitron', monospace",
            color: "#10B981",
            marginBottom: 8,
          }}>
            TOTAL IN PIPELINE
          </div>
          <div style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#F5F7FA",
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            {totalDeals}
            <span style={{ fontSize: 14, color: "#10B981", marginLeft: 8 }}>
              (${totalPipelineValue.toLocaleString()})
            </span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, rgba(47,128,255,0.15), rgba(47,128,255,0.05))",
          borderRadius: 12,
          border: "1px solid rgba(47,128,255,0.3)",
        }}>
          <div style={{
            fontSize: 10,
            letterSpacing: 1.5,
            fontFamily: "'Orbitron', monospace",
            color: "#2F80FF",
            marginBottom: 8,
          }}>
            CONVERSION RATE
          </div>
          <div style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#F5F7FA",
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            {getConversionRate()}%
          </div>
        </div>

        {/* Revenue in Pipeline */}
        <div style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, rgba(255,78,219,0.15), rgba(255,78,219,0.05))",
          borderRadius: 12,
          border: "1px solid rgba(255,78,219,0.3)",
        }}>
          <div style={{
            fontSize: 10,
            letterSpacing: 1.5,
            fontFamily: "'Orbitron', monospace",
            color: "#FF4EDB",
            marginBottom: 8,
          }}>
            REVENUE IN PIPELINE
          </div>
          <div style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#F5F7FA",
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            ${totalPipelineValue.toLocaleString()}
          </div>
        </div>

        {/* Closing This Week */}
        <div style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, rgba(123,97,255,0.15), rgba(123,97,255,0.05))",
          borderRadius: 12,
          border: "1px solid rgba(123,97,255,0.3)",
        }}>
          <div style={{
            fontSize: 10,
            letterSpacing: 1.5,
            fontFamily: "'Orbitron', monospace",
            color: "#7B61FF",
            marginBottom: 8,
          }}>
            CLOSING THIS WEEK
          </div>
          <div style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#F5F7FA",
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            {closingThisWeek.length}
            <span style={{ fontSize: 14, color: "#7B61FF", marginLeft: 8 }}>
              (${closingValue.toLocaleString()})
            </span>
          </div>
        </div>
      </div>

      {/* Main Content: Pipeline + Sidebar */}
      <div style={{ display: "flex", gap: 24, flex: 1 }}>
        {/* Pipeline Kanban */}
        <div style={{ 
          flex: 1, 
          overflowX: "auto",
          paddingBottom: 16,
        }}>
          <div style={{
            display: "flex",
            gap: 12,
            minWidth: "fit-content",
          }}>
            {stages.map((stage) => {
              const stageDeals = getStageDeals(stage.id);
              const stageValue = getStageValue(stage.id);
              
              return (
                <div
                  key={stage.id}
                  style={{
                    width: 260,
                    minWidth: 260,
                    background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "calc(100vh - 420px)",
                  }}
                >
                  {/* Stage Header */}
                  <div style={{
                    padding: "16px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}>
                      <div style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: stage.color,
                        fontFamily: "'Orbitron', monospace",
                        letterSpacing: 0.5,
                      }}>
                        {stage.name.toUpperCase()}
                      </div>
                      <div style={{
                        padding: "3px 8px",
                        borderRadius: 10,
                        background: `${stage.color}20`,
                        fontSize: 11,
                        fontWeight: 600,
                        color: stage.color,
                      }}>
                        {stageDeals.length}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 10,
                      color: "#6B7186",
                      marginBottom: 8,
                    }}>
                      {stage.description}
                    </div>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#F5F7FA",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}>
                      {formatCurrency(stageValue)}
                    </div>
                  </div>

                  {/* Deal Cards */}
                  <div style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}>
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        onClick={() => handleDealClick(deal)}
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderLeft: `3px solid ${tempColors[deal.temp]}`,
                          padding: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                        }}
                      >
                        {/* Deal Header */}
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 8,
                        }}>
                          <div>
                            <div style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#F5F7FA",
                              fontFamily: "'Space Grotesk', sans-serif",
                            }}>
                              {deal.name}
                            </div>
                          </div>
                          {/* Temperature indicator */}
                          <div style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: tempColors[deal.temp],
                            boxShadow: `0 0 8px ${tempColors[deal.temp]}80`,
                          }} />
                        </div>

                        {/* Deal Value */}
                        <div style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: "#10B981",
                          fontFamily: "'Space Grotesk', sans-serif",
                          marginBottom: 8,
                        }}>
                          ${deal.value.toLocaleString()}
                        </div>

                        {/* Tags Preview (first 2) */}
                        <div style={{
                          display: "flex",
                          gap: 4,
                          flexWrap: "wrap",
                          marginBottom: 8,
                        }}>
                          {deal.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: 9,
                                padding: "2px 6px",
                                borderRadius: 4,
                                background: tagColors[tag.type].bg,
                                color: tagColors[tag.type].text,
                                border: `1px solid ${tagColors[tag.type].border}`,
                              }}
                            >
                              {tag.label}
                            </span>
                          ))}
                          {deal.tags.length > 2 && (
                            <span style={{
                              fontSize: 9,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "rgba(255,255,255,0.05)",
                              color: "#6B7186",
                            }}>
                              +{deal.tags.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Source Badge */}
                        <div style={{
                          fontSize: 9,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "rgba(47,128,255,0.15)",
                          color: "#2F80FF",
                          fontFamily: "'Orbitron', monospace",
                          display: "inline-block",
                          marginBottom: 8,
                        }}>
                          {deal.source}
                        </div>

                        {/* Last Activity */}
                        {deal.notes.length > 0 && (
                          <div style={{
                            fontSize: 10,
                            color: "#6B7186",
                            borderTop: "1px solid rgba(255,255,255,0.06)",
                            paddingTop: 8,
                          }}>
                            <span style={{ color: "#7B61FF" }}>🤖</span>
                            {" "}{deal.notes[deal.notes.length - 1].content.substring(0, 35)}
                            {deal.notes[deal.notes.length - 1].content.length > 35 && "..."}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {stageDeals.length === 0 && (
                      <div style={{
                        padding: 20,
                        textAlign: "center",
                        color: "#6B7186",
                        fontSize: 12,
                      }}>
                        No deals
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar - AI Activity */}
        <div style={{
          width: 280,
          minWidth: 280,
          background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.06)",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(100vh - 420px)",
        }}>
          {/* Sidebar Header */}
          <div style={{
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <div style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  fontFamily: "'Orbitron', monospace",
                  color: "#7B61FF",
                  marginBottom: 4,
                }}>
                  AI ACTIVITY
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#F5F7FA",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}>
                  Pipeline Actions
                </div>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 10px",
                borderRadius: 12,
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.3)",
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#10B981",
                  animation: "pulse 2s ease-in-out infinite",
                }} />
                <span style={{ fontSize: 10, color: "#10B981", fontWeight: 500 }}>LIVE</span>
              </div>
            </div>
          </div>

          {/* Activity Items */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}>
            {aiActivity.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 8px",
                  borderRadius: 8,
                  background: index === 0 ? "rgba(123,97,255,0.1)" : "transparent",
                }}
              >
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 11,
                    color: "#F5F7FA",
                    lineHeight: 1.4,
                  }}>
                    <span style={{ fontWeight: 600, color: "#7B61FF" }}>{item.agent}</span>
                    {" "}{item.action}
                  </div>
                  <div style={{
                    fontSize: 9,
                    color: "#6B7186",
                    fontFamily: "'Orbitron', monospace",
                    marginTop: 3,
                  }}>
                    {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Client Detail Modal */}
      {isDetailOpen && selectedDeal && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {/* Backdrop */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
            }}
            onClick={() => setIsDetailOpen(false)}
          />
          
          {/* Modal */}
          <div style={{
            position: "relative",
            background: "#12121A",
            border: "1px solid #2A2A3E",
            borderRadius: 12,
            width: "100%",
            maxWidth: 600,
            maxHeight: "90vh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            margin: "0 16px",
          }}>
            {/* Header */}
            <div style={{
              flexShrink: 0,
              borderBottom: "1px solid #2A2A3E",
              padding: 24,
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {/* Profile Photo Placeholder */}
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${tempColors[selectedDeal.temp]}, ${tempColors[selectedDeal.temp]}80)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#fff",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}>
                    {selectedDeal.name.charAt(0)}
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: "#F5F7FA",
                      fontFamily: "'Space Grotesk', sans-serif",
                      margin: 0,
                    }}>
                      {selectedDeal.name}
                    </h2>
                    <div style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#10B981",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}>
                      ${selectedDeal.value.toLocaleString()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    border: "none",
                    background: "transparent",
                    color: "#6B7186",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1E1E2A";
                    e.currentTarget.style.color = "#F5F7FA";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#6B7186";
                  }}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}>
              {/* Contact Info */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}>
                <div style={{
                  padding: 12,
                  background: "#1A1A2E",
                  borderRadius: 8,
                  border: "1px solid #2A2A3E",
                }}>
                  <div style={{ fontSize: 10, color: "#6B7186", marginBottom: 4, fontFamily: "'Orbitron', monospace" }}>EMAIL</div>
                  <div style={{ fontSize: 13, color: "#F5F7FA" }}>{selectedDeal.email}</div>
                </div>
                <div style={{
                  padding: 12,
                  background: "#1A1A2E",
                  borderRadius: 8,
                  border: "1px solid #2A2A3E",
                }}>
                  <div style={{ fontSize: 10, color: "#6B7186", marginBottom: 4, fontFamily: "'Orbitron', monospace" }}>PHONE</div>
                  <div style={{ fontSize: 13, color: "#F5F7FA" }}>{selectedDeal.phone}</div>
                </div>
              </div>

              {/* Entry Date, Source, Current Stage */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}>
                <div style={{
                  padding: 12,
                  background: "#1A1A2E",
                  borderRadius: 8,
                  border: "1px solid #2A2A3E",
                }}>
                  <div style={{ fontSize: 10, color: "#6B7186", marginBottom: 4, fontFamily: "'Orbitron', monospace" }}>ENTRY DATE</div>
                  <div style={{ fontSize: 13, color: "#F5F7FA" }}>{formatDate(selectedDeal.entryDate)}</div>
                </div>
                <div style={{
                  padding: 12,
                  background: "#1A1A2E",
                  borderRadius: 8,
                  border: "1px solid #2A2A3E",
                }}>
                  <div style={{ fontSize: 10, color: "#6B7186", marginBottom: 4, fontFamily: "'Orbitron', monospace" }}>SOURCE</div>
                  <div style={{ fontSize: 13, color: "#2F80FF" }}>{selectedDeal.source}</div>
                </div>
                <div style={{
                  padding: 12,
                  background: "#1A1A2E",
                  borderRadius: 8,
                  border: "1px solid #2A2A3E",
                }}>
                  <div style={{ fontSize: 10, color: "#6B7186", marginBottom: 4, fontFamily: "'Orbitron', monospace" }}>CURRENT STAGE</div>
                  <div style={{ 
                    fontSize: 13, 
                    color: stages.find(s => s.id === selectedDeal.stage)?.color || "#F5F7FA",
                    fontWeight: 600,
                  }}>
                    {stages.find(s => s.id === selectedDeal.stage)?.name}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <div style={{ fontSize: 10, color: "#6B7186", marginBottom: 8, fontFamily: "'Orbitron', monospace" }}>TAGS</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {selectedDeal.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: 12,
                        padding: "6px 12px",
                        borderRadius: 6,
                        background: tagColors[tag.type].bg,
                        color: tagColors[tag.type].text,
                        border: `1px solid ${tagColors[tag.type].border}`,
                        fontWeight: 500,
                      }}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Current GHL Workflow */}
              <div style={{
                padding: 12,
                background: "linear-gradient(135deg, rgba(123,97,255,0.1), rgba(123,97,255,0.05))",
                borderRadius: 8,
                border: "1px solid rgba(123,97,255,0.3)",
              }}>
                <div style={{ fontSize: 10, color: "#7B61FF", marginBottom: 4, fontFamily: "'Orbitron', monospace" }}>CURRENT GHL WORKFLOW</div>
                <div style={{ fontSize: 14, color: "#F5F7FA", fontWeight: 600 }}>{selectedDeal.workflow}</div>
              </div>

              {/* Notes / Activity Log */}
              <div>
                <div style={{ fontSize: 10, color: "#6B7186", marginBottom: 8, fontFamily: "'Orbitron', monospace" }}>ACTIVITY LOG</div>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: 200,
                  overflowY: "auto",
                }}>
                  {selectedDeal.notes.map((note, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 12,
                        background: "#1A1A2E",
                        borderRadius: 8,
                        border: "1px solid #2A2A3E",
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#E91E8C" }}>
                          {note.agent || "System"}
                        </span>
                        <span style={{ fontSize: 10, color: "#6B7186" }}>
                          {formatDate(note.date)}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: "#F5F7FA", margin: 0, lineHeight: 1.5 }}>
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
