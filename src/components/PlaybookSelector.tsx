"use client";

import { useState } from "react";

export interface PlaybookCard {
  slug: string;
  title: string;
  description?: string;
}

interface PlaybookSelectorProps {
  slugPrefix: string;
  placeholderCards?: PlaybookCard[];
  onSelectionChange?: (selected: PlaybookCard[]) => void;
}

const DEFAULT_CARDS: PlaybookCard[] = [
  { slug: "placeholder-1", title: "Playbook A", description: "Coming soon" },
  { slug: "placeholder-2", title: "Playbook B", description: "Coming soon" },
  { slug: "placeholder-3", title: "Playbook C", description: "Coming soon" },
];

export default function PlaybookSelector({
  slugPrefix,
  placeholderCards,
  onSelectionChange,
}: PlaybookSelectorProps) {
  const cards = placeholderCards ?? DEFAULT_CARDS;
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      if (onSelectionChange) {
        const selectedCards = cards.filter((c) => next.has(c.slug));
        onSelectionChange(selectedCards);
      }
      return next;
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 10,
      }}
      data-slug-prefix={slugPrefix}
    >
      {cards.map((card) => {
        const isSelected = selected.has(card.slug);
        return (
          <button
            key={card.slug}
            onClick={() => toggle(card.slug)}
            style={{
              padding: "10px 16px",
              borderRadius: 6,
              border: isSelected
                ? "1.5px solid #111"
                : "1.5px solid #e0e0e0",
              background: isSelected ? "#111" : "#fff",
              color: isSelected ? "#fff" : "#111",
              cursor: "pointer",
              fontFamily: "Montserrat, sans-serif",
              fontSize: 12,
              fontWeight: isSelected ? 600 : 500,
              letterSpacing: "0.01em",
              transition: "all 0.15s ease",
              textAlign: "left",
              minWidth: 160,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: card.description ? 2 : 0 }}>
              {card.title}
            </div>
            {card.description && (
              <div
                style={{
                  fontSize: 10,
                  color: isSelected ? "rgba(255,255,255,0.65)" : "#888",
                  fontWeight: 400,
                  marginTop: 2,
                }}
              >
                {card.description}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
