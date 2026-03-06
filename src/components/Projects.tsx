"use client";

import { useState } from "react";
import { Tv } from "lucide-react";

// Types matching original Mission Control
type TaskStatus = 'inbox' | 'up-next' | 'in-progress' | 'waiting-on-aaron' | 'in-review' | 'done' | 'backlog';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_agent: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  due_date: string | null;
}

// Columns - EXACT MATCH to original
const KANBAN_COLUMNS = [
  { id: 'inbox' as TaskStatus, title: 'Inbox', color: '#94A3B8' },
  { id: 'up-next' as TaskStatus, title: 'Up Next', color: '#00D9FF' },
  { id: 'in-progress' as TaskStatus, title: 'In Progress', color: '#E91E8C' },
  { id: 'waiting-on-aaron' as TaskStatus, title: '⏳ Waiting on Aaron', color: '#FBBF24' },
  { id: 'in-review' as TaskStatus, title: 'In Review', color: '#A855F7' },
  { id: 'done' as TaskStatus, title: 'Done', color: '#34D399' },
  { id: 'backlog' as TaskStatus, title: '📦 Backlog', color: '#64748B' },
];

// Priorities - EXACT MATCH to original
const PRIORITY_COLORS: Record<TaskPriority, { bg: string; text: string; border: string }> = {
  low: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
  medium: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  high: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  urgent: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  critical: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
};

// Agents - EXACT MATCH to original
const AGENTS = ['Aaron', 'Solomon', 'Phil', 'Alex'] as const;

// Sample tasks data
const sampleTasks: Task[] = [
  // Inbox
  {
    id: "t1",
    title: "Review partner application from TechCorp",
    description: "New enterprise partner wants to white-label our AI solution",
    status: "inbox",
    priority: "medium",
    assigned_agent: "Solomon",
    tags: ["Partners", "Review"],
    created_at: "2026-03-05T08:00:00Z",
    updated_at: "2026-03-05T08:00:00Z",
    due_date: null,
  },
  {
    id: "t2",
    title: "Customer support escalation - billing issue",
    description: "VIP customer needs immediate attention on subscription",
    status: "inbox",
    priority: "urgent",
    assigned_agent: "Aaron",
    tags: ["Support", "Billing"],
    created_at: "2026-03-05T07:30:00Z",
    updated_at: "2026-03-05T07:30:00Z",
    due_date: null,
  },
  // Up Next
  {
    id: "t3",
    title: "Prepare webinar slides for Thursday",
    description: "AI Monetization masterclass - 500+ registered",
    status: "up-next",
    priority: "high",
    assigned_agent: "Aaron",
    tags: ["Webinar", "Content"],
    created_at: "2026-03-04T10:00:00Z",
    updated_at: "2026-03-05T09:00:00Z",
    due_date: "2026-03-07",
  },
  {
    id: "t4",
    title: "Dream 100 outreach - Wave 2",
    description: "Send personalized outreach to next 25 targets",
    status: "up-next",
    priority: "high",
    assigned_agent: "Solomon",
    tags: ["Sales", "Outreach"],
    created_at: "2026-03-03T14:00:00Z",
    updated_at: "2026-03-04T16:00:00Z",
    due_date: "2026-03-08",
  },
  // In Progress
  {
    id: "t5",
    title: "Launch Challenge Funnel V2",
    description: "Complete redesign with new copy and automation. Target: 25% conversion lift.",
    status: "in-progress",
    priority: "critical",
    assigned_agent: "Alex",
    tags: ["Funnel", "Launch"],
    created_at: "2026-02-28T10:00:00Z",
    updated_at: "2026-03-05T10:30:00Z",
    due_date: "2026-03-08",
  },
  {
    id: "t6",
    title: "Email deliverability audit",
    description: "Clean lists, verify domains, improve sending reputation",
    status: "in-progress",
    priority: "high",
    assigned_agent: "Solomon",
    tags: ["Email", "Technical"],
    created_at: "2026-03-01T08:00:00Z",
    updated_at: "2026-03-05T09:00:00Z",
    due_date: "2026-03-07",
  },
  {
    id: "t7",
    title: "Weekly content batch",
    description: "3 videos, 5 posts, 2 emails for this week",
    status: "in-progress",
    priority: "medium",
    assigned_agent: "Phil",
    tags: ["Content", "Recurring"],
    created_at: "2026-03-04T08:00:00Z",
    updated_at: "2026-03-05T08:00:00Z",
    due_date: "2026-03-07",
  },
  // Waiting on Aaron
  {
    id: "t8",
    title: "Review & approve ad creatives",
    description: "5 new static images and 3 video scripts ready for review",
    status: "waiting-on-aaron",
    priority: "high",
    assigned_agent: "Aaron",
    tags: ["Ads", "Creative"],
    created_at: "2026-03-02T10:00:00Z",
    updated_at: "2026-03-04T15:00:00Z",
    due_date: "2026-03-06",
  },
  {
    id: "t9",
    title: "Sign partnership agreement - DataSync",
    description: "Legal reviewed, needs final signature",
    status: "waiting-on-aaron",
    priority: "urgent",
    assigned_agent: "Aaron",
    tags: ["Legal", "Partners"],
    created_at: "2026-03-03T11:00:00Z",
    updated_at: "2026-03-04T17:00:00Z",
    due_date: "2026-03-05",
  },
  // In Review
  {
    id: "t10",
    title: "Webinar follow-up sequence",
    description: "7-day automated email/SMS sequence for attendees",
    status: "in-review",
    priority: "high",
    assigned_agent: "Phil",
    tags: ["Email", "Automation"],
    created_at: "2026-02-28T10:00:00Z",
    updated_at: "2026-03-04T14:00:00Z",
    due_date: "2026-03-06",
  },
  {
    id: "t11",
    title: "Customer success playbook",
    description: "Documentation for CS team with scripts and escalation paths",
    status: "in-review",
    priority: "medium",
    assigned_agent: "Solomon",
    tags: ["Documentation", "Process"],
    created_at: "2026-02-20T08:00:00Z",
    updated_at: "2026-03-04T12:00:00Z",
    due_date: "2026-03-05",
  },
  // Done
  {
    id: "t12",
    title: "Homepage redesign",
    description: "Complete refresh with new hero, testimonials, and CTAs. Result: 18% conversion lift!",
    status: "done",
    priority: "high",
    assigned_agent: "Alex",
    tags: ["Design", "Conversion"],
    created_at: "2026-02-01T09:00:00Z",
    updated_at: "2026-02-28T16:00:00Z",
    due_date: "2026-02-28",
  },
  {
    id: "t13",
    title: "Stripe + GHL integration",
    description: "Real-time webhook processing for unified customer view",
    status: "done",
    priority: "high",
    assigned_agent: "Solomon",
    tags: ["Integration", "Technical"],
    created_at: "2026-02-10T08:00:00Z",
    updated_at: "2026-02-25T14:00:00Z",
    due_date: "2026-02-25",
  },
  {
    id: "t14",
    title: "February webinar execution",
    description: "847 registrants, 412 live, 23 applications. Great success!",
    status: "done",
    priority: "critical",
    assigned_agent: "Aaron",
    tags: ["Event", "Sales"],
    created_at: "2026-02-01T08:00:00Z",
    updated_at: "2026-02-22T18:00:00Z",
    due_date: "2026-02-20",
  },
  // Backlog
  {
    id: "t15",
    title: "AI Voice Agent MVP",
    description: "Build voice-based AI agent for phone support",
    status: "backlog",
    priority: "low",
    assigned_agent: "Solomon",
    tags: ["AI", "Innovation"],
    created_at: "2026-02-20T11:00:00Z",
    updated_at: "2026-02-20T11:00:00Z",
    due_date: "2026-04-15",
  },
  {
    id: "t16",
    title: "Affiliate portal V2",
    description: "Redesign dashboard with better analytics",
    status: "backlog",
    priority: "medium",
    assigned_agent: "Alex",
    tags: ["Product", "Design"],
    created_at: "2026-02-28T09:00:00Z",
    updated_at: "2026-03-02T14:30:00Z",
    due_date: "2026-04-01",
  },
  {
    id: "t17",
    title: "CRM migration plan",
    description: "Document migration from legacy CRM to GHL",
    status: "backlog",
    priority: "low",
    assigned_agent: "Phil",
    tags: ["Infrastructure", "Planning"],
    created_at: "2026-02-15T08:00:00Z",
    updated_at: "2026-03-01T16:00:00Z",
    due_date: "2026-04-10",
  },
];

// Mock activity data
const mockActivity = [
  { id: 1, type: 'task_moved', message: 'Solomon moved "Email deliverability audit" to In Progress', time: '5m ago', agent: 'Solomon' },
  { id: 2, type: 'task_created', message: 'New task: "Review partner application from TechCorp"', time: '12m ago', agent: 'System' },
  { id: 3, type: 'task_completed', message: 'Alex completed "Homepage redesign"', time: '2h ago', agent: 'Alex' },
  { id: 4, type: 'comment', message: 'Aaron commented on "Launch Challenge Funnel V2"', time: '3h ago', agent: 'Aaron' },
  { id: 5, type: 'task_moved', message: 'Phil moved "Webinar follow-up sequence" to In Review', time: '4h ago', agent: 'Phil' },
];

// Mock recurring tasks
const mockRecurringTasks = [
  { id: 1, title: 'Weekly content batch', frequency: 'Every Monday', nextRun: 'Mar 10', agent: 'Phil' },
  { id: 2, title: 'Email list cleanup', frequency: 'Every 2 weeks', nextRun: 'Mar 12', agent: 'Solomon' },
  { id: 3, title: 'Performance review', frequency: 'Monthly', nextRun: 'Apr 1', agent: 'Aaron' },
];

export default function Projects() {
  const [tasks] = useState<Task[]>(sampleTasks);

  // Get tasks by status
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  // Stats for sidebar
  const stats = {
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    inReview: tasks.filter(t => t.status === 'in-review').length,
    completed: tasks.filter(t => t.status === 'done').length,
    total: tasks.length,
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Kanban Board - Main Content */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full">
            {/* Kanban Board */}
            <div className="flex gap-4 overflow-x-auto pb-4 h-full">
              {KANBAN_COLUMNS.map((column) => {
                const columnTasks = getTasksByStatus(column.id);
                return (
                  <div
                    key={column.id}
                    className="flex flex-col min-w-[280px] max-w-[320px] flex-1"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: column.color }}
                        />
                        <h3 className="font-semibold text-sm text-foreground">{column.title}</h3>
                        <span className="text-xs text-muted-foreground bg-[#1E1E2A] px-2 py-0.5 rounded-full">
                          {columnTasks.length}
                        </span>
                      </div>
                      <button className="h-6 w-6 flex items-center justify-center rounded hover:bg-[#1E1E2A] text-muted-foreground hover:text-foreground transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    {/* Column Content */}
                    <div className="flex-1 rounded-lg p-2 bg-[#0E0E14]/50 min-h-[200px]">
                      <div className="flex flex-col gap-2">
                        {columnTasks.map((task) => {
                          const priority = PRIORITY_COLORS[task.priority];
                          return (
                            <div
                              key={task.id}
                              className="group relative p-3 bg-[#12121A] border border-[#2A2A3E] hover:border-[#3A3A5E] rounded-lg transition-all duration-200 cursor-pointer"
                            >
                              {/* Priority indicator bar */}
                              <div 
                                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                                style={{ backgroundColor: column.color }}
                              />
                              
                              <div className="pl-2">
                                {/* Title */}
                                <h4 className="font-medium text-sm text-foreground mb-2 line-clamp-2">
                                  {task.title}
                                </h4>

                                {/* Description preview */}
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}

                                {/* Tags */}
                                {task.tags.length > 0 && (
                                  <div className="flex gap-1 flex-wrap mb-3">
                                    {task.tags.slice(0, 2).map((tag) => (
                                      <span
                                        key={tag}
                                        className="text-[10px] text-[#00D9FF] bg-[#00D9FF]/10 px-2 py-0.5 rounded border border-[#00D9FF]/30"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Meta row */}
                                <div className="flex items-center justify-between gap-2">
                                  {/* Priority badge */}
                                  <span className={`${priority.bg} ${priority.text} ${priority.border} text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border font-medium`}>
                                    {task.priority}
                                  </span>

                                  {/* Agent */}
                                  <div className="flex items-center gap-1">
                                    <div 
                                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                      style={{ 
                                        background: task.assigned_agent === 'Solomon' 
                                          ? 'linear-gradient(135deg, #E91E8C, #00D9FF)' 
                                          : task.assigned_agent === 'Phil'
                                          ? '#00D9FF'
                                          : task.assigned_agent === 'Alex'
                                          ? '#A855F7'
                                          : '#FBBF24'
                                      }}
                                    >
                                      {task.assigned_agent[0]}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground">
                                      {task.assigned_agent}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Empty state */}
                      {columnTasks.length === 0 && (
                        <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
                          No tasks
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar - Right Side */}
        <aside className="w-80 border-l border-[#2A2A3E] bg-[#0E0E14] p-4 overflow-y-auto">
          {/* Live Activity */}
          <div className="p-4 rounded-lg bg-[#12121A] border border-[#2A2A3E]">
            <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-[#34D399] rounded-full animate-pulse" />
              Live Activity
            </h3>
            <div className="space-y-3">
              {mockActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                    style={{ 
                      background: activity.agent === 'Solomon' 
                        ? 'linear-gradient(135deg, #E91E8C, #00D9FF)' 
                        : activity.agent === 'Phil'
                        ? '#00D9FF'
                        : activity.agent === 'Alex'
                        ? '#A855F7'
                        : activity.agent === 'Aaron'
                        ? '#FBBF24'
                        : '#64748B'
                    }}
                  >
                    {activity.agent[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground line-clamp-2">{activity.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Stats Summary */}
          <div className="mt-4 p-4 rounded-lg bg-[#12121A] border border-[#2A2A3E]">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="In Progress" value={stats.inProgress.toString()} color="#E91E8C" />
              <StatCard label="In Review" value={stats.inReview.toString()} color="#A855F7" />
              <StatCard label="Completed" value={stats.completed.toString()} color="#34D399" />
              <StatCard label="Total" value={stats.total.toString()} color="#00D9FF" />
            </div>
          </div>

          {/* Media Hub Link */}
          <a 
            href="/media"
            className="mt-4 block p-4 rounded-lg bg-gradient-to-br from-[#E91E8C]/20 to-[#00D9FF]/20 border border-[#E91E8C]/40 hover:border-[#E91E8C]/80 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E91E8C] to-[#00D9FF] flex items-center justify-center">
                <Tv className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-[#E91E8C] transition-colors">Media Hub</h3>
                <p className="text-[10px] text-muted-foreground">Channels, content & analytics</p>
              </div>
              <span className="text-[#E91E8C] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
          </a>

          {/* Recurring Tasks */}
          <div className="mt-4 p-4 rounded-lg bg-[#12121A] border border-[#2A2A3E]">
            <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
              <svg className="w-4 h-4 text-[#00D9FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recurring Tasks
            </h3>
            <div className="space-y-3">
              {mockRecurringTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 rounded bg-[#1A1A2E]">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{task.title}</p>
                    <p className="text-[10px] text-muted-foreground">{task.frequency}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-[10px] text-[#00D9FF]">{task.nextRun}</p>
                    <p className="text-[10px] text-muted-foreground">{task.agent}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Status */}
          <div className="mt-4 p-4 rounded-lg bg-[#12121A] border border-[#2A2A3E]">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Agent Status</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E91E8C] to-[#00D9FF] flex items-center justify-center text-white font-bold">
                S
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Solomon</p>
                <p className="text-[10px] text-muted-foreground">claude-opus-4-5</p>
              </div>
              <span className="ml-auto w-2 h-2 bg-[#34D399] rounded-full animate-pulse" />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center p-2 rounded-md bg-[#1A1A2E]">
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
