'use client';

import { useState } from 'react';

// Shared card type (used by keep-customers and others)
export interface PlaybookCard {
  slug: string;
  title: string;
  description?: string;
}

interface Playbook {
  slug: string;
  title: string;
  description: string;
  source: 'Built-in' | 'Custom';
}

export interface PlaybookSelectorProps {
  slugPrefix: string;
  // get-leads style props
  title?: string;
  description?: string;
  onActiveChange?: (activeSlugs: string[]) => void;
  // keep-customers style props
  placeholderCards?: PlaybookCard[];
  onSelectionChange?: (selected: PlaybookCard[]) => void;
}

// Built-in data keyed by slug prefix (used for get-leads style)
const PLAYBOOK_DATA: Record<string, Playbook[]> = {
  'publish-': [
    { slug: 'publish-daily-7', title: 'Daily 7', description: 'Post 7 pieces of content every day across platforms.', source: 'Built-in' },
    { slug: 'publish-shorts-flood', title: 'Shorts Flood', description: 'Short-form video blitz across platforms daily.', source: 'Built-in' },
    { slug: 'publish-email-nurture', title: 'Email Nurture', description: 'Weekly email sequence to warm your list.', source: 'Custom' },
    { slug: 'publish-authority-blog', title: 'Authority Blog', description: 'Long-form posts that build SEO and credibility.', source: 'Built-in' },
  ],
  'prospect-': [
    { slug: 'prospect-dm-outreach', title: 'DM Outreach', description: 'Structured DM campaign to warm leads daily.', source: 'Built-in' },
    { slug: 'prospect-comment-blitz', title: 'Comment Blitz', description: 'Strategic commenting on 10 target accounts per day.', source: 'Built-in' },
    { slug: 'prospect-linkedin-connect', title: 'LinkedIn Connect', description: 'Connection + message sequence for professionals.', source: 'Custom' },
    { slug: 'prospect-cold-loom', title: 'Cold Loom', description: 'Personalized video messages to high-value prospects.', source: 'Built-in' },
  ],
  'pay-': [
    { slug: 'pay-fb-power-ads', title: 'FB Power Ads', description: 'Facebook lead generation with retargeting stack.', source: 'Built-in' },
    { slug: 'pay-yt-preroll', title: 'YT Pre-Roll', description: 'YouTube ads targeting competitor audiences.', source: 'Built-in' },
    { slug: 'pay-ig-story-ads', title: 'IG Story Ads', description: 'Instagram story placements driving opt-in page.', source: 'Custom' },
    { slug: 'pay-google-search', title: 'Google Search', description: 'High-intent keyword targeting for warm traffic.', source: 'Built-in' },
  ],
  'partner-': [
    { slug: 'partner-podcast-swap', title: 'Podcast Swap', description: 'Guest on 2 podcasts per month, host 2 in return.', source: 'Built-in' },
    { slug: 'partner-jv-webinar', title: 'JV Webinar', description: 'Co-host a webinar with a complementary audience.', source: 'Built-in' },
    { slug: 'partner-affiliate-launch', title: 'Affiliate Launch', description: 'Partner-promoted launch to their email list.', source: 'Custom' },
    { slug: 'partner-ig-takeover', title: 'IG Takeover', description: 'Swap Instagram stories with a strategic partner.', source: 'Built-in' },
  ],
  'fulfill-': [
    { slug: 'fulfill-onboard-fast', title: 'Fast Onboarding', description: 'Get new clients results within 72 hours of joining.', source: 'Built-in' },
    { slug: 'fulfill-weekly-wins', title: 'Weekly Wins', description: 'Send a win summary every Monday to keep momentum.', source: 'Built-in' },
    { slug: 'fulfill-loom-review', title: 'Loom Review', description: 'Weekly personalized Loom video feedback per client.', source: 'Custom' },
  ],
  'grow-': [
    { slug: 'grow-upsell-sequence', title: 'Upsell Sequence', description: 'Email sequence introducing higher-tier offers.', source: 'Built-in' },
    { slug: 'grow-referral-ask', title: 'Referral Ask', description: 'Structured ask for referrals after early wins.', source: 'Built-in' },
    { slug: 'grow-testimonial', title: 'Testimonial Capture', description: 'Automated follow-up for case studies and reviews.', source: 'Custom' },
  ],
};

function getPlaybooks(slugPrefix: string): Playbook[] {
  return PLAYBOOK_DATA[slugPrefix] ?? [];
}

const DEFAULT_CARDS: PlaybookCard[] = [
  { slug: 'placeholder-1', title: 'Playbook A', description: 'Coming soon' },
  { slug: 'placeholder-2', title: 'Playbook B', description: 'Coming soon' },
  { slug: 'placeholder-3', title: 'Playbook C', description: 'Coming soon' },
];

export default function PlaybookSelector({
  slugPrefix,
  description,
  onActiveChange,
  placeholderCards,
  onSelectionChange,
}: PlaybookSelectorProps) {
  // Determine mode: if placeholderCards provided, use keep-customers style
  const isCardMode = placeholderCards !== undefined || onSelectionChange !== undefined;
  const [active, setActive] = useState<Set<string>>(new Set());
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());

  // Card mode (keep-customers)
  const cards = placeholderCards ?? DEFAULT_CARDS;
  const toggleCard = (card: PlaybookCard) => {
    setSelectedCards((prev) => {
      const next = new Set(prev);
      if (next.has(card.slug)) {
        next.delete(card.slug);
      } else {
        next.add(card.slug);
      }
      const selected = cards.filter((c) => next.has(c.slug));
      onSelectionChange?.(selected);
      return next;
    });
  };

  // Slug-prefix mode (get-leads)
  const playbooks = getPlaybooks(slugPrefix);
  const toggle = (slug: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      onActiveChange?.(Array.from(next));
      return next;
    });
  };

  if (isCardMode) {
    // Keep-customers style with provided cards
    return (
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {cards.map((card) => {
            const isSelected = selectedCards.has(card.slug);
            return (
              <div
                key={card.slug}
                onClick={() => toggleCard(card)}
                style={{
                  border: isSelected ? '2px solid #111' : '1.5px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  background: '#fff',
                  transition: 'border-color 0.15s ease',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: isSelected ? 700 : 500, color: '#111', fontFamily: 'Montserrat, sans-serif' }}>
                    {card.title}
                  </span>
                  {isSelected && (
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#111', background: '#f0f0f0', padding: '2px 7px', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase' as const, fontFamily: 'Montserrat, sans-serif' }}>
                      Active
                    </span>
                  )}
                </div>
                {card.description && (
                  <p style={{ fontSize: '12px', color: '#777', margin: 0, lineHeight: '1.5', fontFamily: 'Montserrat, sans-serif' }}>
                    {card.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Get-leads style with built-in data
  return (
    <div style={{ marginBottom: '32px' }}>
      {description && (
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px', marginTop: '4px' }}>
          {description}
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {playbooks.map((pb) => {
          const isActive = active.has(pb.slug);
          return (
            <div
              key={pb.slug}
              onClick={() => toggle(pb.slug)}
              style={{
                border: isActive ? '2px solid #111' : '1.5px solid #e0e0e0',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                background: '#fff',
                transition: 'border-color 0.15s ease',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '14px', fontWeight: isActive ? 700 : 500, color: '#111', fontFamily: 'Montserrat, sans-serif' }}>
                  {pb.title}
                </span>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
                  {isActive && (
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#111', background: '#f0f0f0', padding: '2px 7px', borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase' as const, fontFamily: 'Montserrat, sans-serif' }}>
                      Active
                    </span>
                  )}
                  <span style={{ fontSize: '10px', fontWeight: 500, color: '#999', background: '#f7f7f7', padding: '2px 7px', borderRadius: '20px', fontFamily: 'Montserrat, sans-serif' }}>
                    {pb.source}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '12px', color: '#777', margin: 0, lineHeight: '1.5', fontFamily: 'Montserrat, sans-serif' }}>
                {pb.description}
              </p>
            </div>
          );
        })}
        <a
          href="/connections"
          style={{ border: '1.5px dashed #d0d0d0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '13px', fontWeight: 500, fontFamily: 'Montserrat, sans-serif', textDecoration: 'none', cursor: 'pointer', minHeight: '80px' }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = '#aaa'; el.style.color = '#555'; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = '#d0d0d0'; el.style.color = '#aaa'; }}
        >
          + Add playbook
        </a>
      </div>
    </div>
  );
}

export { getPlaybooks };
