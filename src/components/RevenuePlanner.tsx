"use client";

import { useState } from "react";

interface RevenuePlannerData {
  revenueGoal: number;
  promote: {
    prospect: "now" | "later" | "never";
    paid: "now" | "later" | "never";
    publish: "now" | "later" | "never";
    partnership: "now" | "later" | "never";
  };
  profit: {
    cart: "now" | "later" | "never";
    call: "now" | "later" | "never";
    crowd: "now" | "later" | "never";
    aiSales: "now" | "later" | "never";
  };
  produce: {
    ship: boolean;
    serve: boolean;
    unlock: boolean;
    shift: boolean;
  };
}

interface RevenuePlannerProps {
  businessName: string;
  onLockAndBuild: (data: RevenuePlannerData) => void;
  isLocked: boolean;
}

const SelectionButton = ({ 
  value, 
  selected, 
  onClick, 
  disabled 
}: { 
  value: string; 
  selected: boolean; 
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: "8px 16px",
      borderRadius: 6,
      border: "none",
      background: selected 
        ? value === "now" ? "linear-gradient(135deg, #10B981, #059669)" 
        : value === "later" ? "linear-gradient(135deg, #F59E0B, #D97706)"
        : "linear-gradient(135deg, #6B7280, #4B5563)"
        : "rgba(255,255,255,0.05)",
      color: selected ? "#FFF" : "#8A8F98",
      fontSize: 12,
      fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      textTransform: "uppercase",
    }}
  >
    {value}
  </button>
);

export default function RevenuePlanner({ businessName, onLockAndBuild, isLocked }: RevenuePlannerProps) {
  const [data, setData] = useState<RevenuePlannerData>({
    revenueGoal: 100000,
    promote: {
      prospect: "later",
      paid: "later",
      publish: "now",
      partnership: "later",
    },
    profit: {
      cart: "now",
      call: "later",
      crowd: "later",
      aiSales: "now",
    },
    produce: {
      ship: false,
      serve: true,
      unlock: false,
      shift: true,
    },
  });

  const updatePromote = (key: keyof typeof data.promote, value: "now" | "later" | "never") => {
    setData(prev => ({
      ...prev,
      promote: { ...prev.promote, [key]: value },
    }));
  };

  const updateProfit = (key: keyof typeof data.profit, value: "now" | "later" | "never") => {
    setData(prev => ({
      ...prev,
      profit: { ...prev.profit, [key]: value },
    }));
  };

  const toggleProduce = (key: keyof typeof data.produce) => {
    setData(prev => ({
      ...prev,
      produce: { ...prev.produce, [key]: !prev.produce[key] },
    }));
  };

  const promoteItems = [
    { key: "prospect" as const, label: "Prospect", desc: "Cold outreach at scale", icon: "📧" },
    { key: "publish" as const, label: "Publish", desc: "Character-based content", icon: "📱" },
    { key: "paid" as const, label: "Pay", desc: "Paid ads (FB/Meta)", icon: "💰" },
    { key: "partnership" as const, label: "Partner", desc: "Affiliates & JVs", icon: "🤝" },
  ];

  const profitItems = [
    { key: "cart" as const, label: "Cart", desc: "1-page sales, LTO funnel", icon: "🛒" },
    { key: "call" as const, label: "Call", desc: "Application funnel", icon: "📞" },
    { key: "crowd" as const, label: "Crowd", desc: "Webinar, live event", icon: "👥" },
    { key: "aiSales" as const, label: "AI Sales", desc: "GHL conversational AI", icon: "🤖" },
  ];

  const produceItems = [
    { key: "ship" as const, label: "Ship", desc: "Digital/physical products", icon: "📦" },
    { key: "serve" as const, label: "Serve", desc: "DFY services, agency", icon: "⚡" },
    { key: "unlock" as const, label: "Unlock", desc: "Software, subscriptions", icon: "🔓" },
    { key: "shift" as const, label: "Shift", desc: "Coaching, consulting", icon: "🎯" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0F19",
      padding: 24,
    }}>
      {/* Header */}
      <div style={{
        marginBottom: 32,
        padding: "24px",
        background: "linear-gradient(135deg, #111624, #0D1117)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{
          fontSize: 10,
          letterSpacing: 2,
          color: "#10B981",
          fontFamily: "'Orbitron', monospace",
          marginBottom: 8,
        }}>
          REVENUE ENGINE PLANNER
        </div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#F5F7FA",
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          {businessName || "Configure Your Business"}
        </h1>
        <p style={{ color: "#8A8F98", margin: "8px 0 0", fontSize: 14 }}>
          Select NOW for Wave 1, LATER for future phases, NEVER to skip
        </p>
      </div>

      {/* Revenue Goal */}
      <div style={{
        background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: 24,
        marginBottom: 24,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#F5F7FA", marginBottom: 16 }}>
          💰 90-Day Revenue Goal
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <input
            type="range"
            min="10000"
            max="1000000"
            step="10000"
            value={data.revenueGoal}
            onChange={(e) => setData(prev => ({ ...prev, revenueGoal: parseInt(e.target.value) }))}
            disabled={isLocked}
            style={{ flex: 1, accentColor: "#10B981" }}
          />
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#10B981",
            fontFamily: "'Orbitron', monospace",
            minWidth: 150,
            textAlign: "right",
          }}>
            ${data.revenueGoal.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* PROMOTE Section */}
        <div style={{
          background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
          borderRadius: 16,
          border: "1px solid rgba(47,128,255,0.3)",
          padding: 24,
        }}>
          <h2 style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#2F80FF",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            📣 PROMOTE — Get Leads
          </h2>
          <p style={{ color: "#6B7186", fontSize: 12, marginBottom: 20 }}>
            How will you drive traffic?
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {promoteItems.map(item => (
              <div key={item.key} style={{
                padding: 16,
                background: "rgba(255,255,255,0.03)",
                borderRadius: 10,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#F5F7FA" }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: "#6B7186" }}>{item.desc}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  {(["now", "later", "never"] as const).map(val => (
                    <SelectionButton
                      key={val}
                      value={val}
                      selected={data.promote[item.key] === val}
                      onClick={() => updatePromote(item.key, val)}
                      disabled={isLocked}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PROFIT Section */}
        <div style={{
          background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
          borderRadius: 16,
          border: "1px solid rgba(16,185,129,0.3)",
          padding: 24,
        }}>
          <h2 style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#10B981",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            💵 PROFIT — Close Sales
          </h2>
          <p style={{ color: "#6B7186", fontSize: 12, marginBottom: 20 }}>
            How will you convert leads?
          </p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {profitItems.map(item => (
              <div key={item.key} style={{
                padding: 16,
                background: "rgba(255,255,255,0.03)",
                borderRadius: 10,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#F5F7FA" }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: "#6B7186" }}>{item.desc}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  {(["now", "later", "never"] as const).map(val => (
                    <SelectionButton
                      key={val}
                      value={val}
                      selected={data.profit[item.key] === val}
                      onClick={() => updateProfit(item.key, val)}
                      disabled={isLocked}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCE Section */}
      <div style={{
        background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
        borderRadius: 16,
        border: "1px solid rgba(255,78,219,0.3)",
        padding: 24,
        marginTop: 24,
      }}>
        <h2 style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#FF4EDB",
          marginBottom: 8,
        }}>
          📦 PRODUCE — What You Sell
        </h2>
        <p style={{ color: "#6B7186", fontSize: 12, marginBottom: 20 }}>
          Select all that apply (shapes messaging, not bot spawning)
        </p>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {produceItems.map(item => (
            <button
              key={item.key}
              onClick={() => toggleProduce(item.key)}
              disabled={isLocked}
              style={{
                padding: 20,
                background: data.produce[item.key] 
                  ? "linear-gradient(135deg, #FF4EDB20, #FF4EDB10)"
                  : "rgba(255,255,255,0.03)",
                border: data.produce[item.key]
                  ? "2px solid #FF4EDB"
                  : "2px solid transparent",
                borderRadius: 12,
                cursor: isLocked ? "not-allowed" : "pointer",
                textAlign: "center",
                opacity: isLocked ? 0.5 : 1,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#F5F7FA" }}>{item.label}</div>
              <div style={{ fontSize: 10, color: "#6B7186", marginTop: 4 }}>{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* LOCK & BUILD Button */}
      <div style={{
        marginTop: 32,
        display: "flex",
        justifyContent: "center",
      }}>
        {isLocked ? (
          <div style={{
            padding: "20px 60px",
            background: "linear-gradient(135deg, #10B98150, #10B98130)",
            borderRadius: 12,
            border: "2px solid #10B981",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <span style={{ fontSize: 24 }}>✅</span>
            <span style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#10B981",
              fontFamily: "'Orbitron', monospace",
            }}>
              LOCKED — WAVE 1 SPAWNING
            </span>
          </div>
        ) : (
          <button
            onClick={() => onLockAndBuild(data)}
            style={{
              padding: "20px 60px",
              background: "linear-gradient(135deg, #10B981, #059669)",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 0 30px rgba(16,185,129,0.4)",
            }}
          >
            <span style={{ fontSize: 24 }}>🔒</span>
            <span style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#FFF",
              fontFamily: "'Orbitron', monospace",
              letterSpacing: 2,
            }}>
              LOCK & BUILD
            </span>
          </button>
        )}
      </div>

      {/* Summary */}
      <div style={{
        marginTop: 32,
        padding: 24,
        background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#F5F7FA", marginBottom: 16 }}>
          📋 Wave Preview
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "#6B7186", marginBottom: 8, textTransform: "uppercase" }}>Wave 1 (Foundation)</div>
            <div style={{ fontSize: 13, color: "#F5F7FA" }}>
              ✅ Website (always)<br />
              {data.profit.cart === "now" && "✅ Cart Page\n"}
              {data.profit.call === "now" && "✅ Call Funnel\n"}
              {data.profit.crowd === "now" && "✅ Event Page\n"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6B7186", marginBottom: 8, textTransform: "uppercase" }}>Wave 2 (Sequences)</div>
            <div style={{ fontSize: 13, color: "#F5F7FA" }}>
              ✅ Email Sequence (always)<br />
              {data.promote.prospect === "now" && "✅ Outbound Setup\n"}
              {data.promote.partnership === "now" && "✅ Partnership Pitch\n"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#6B7186", marginBottom: 8, textTransform: "uppercase" }}>Wave 3 (Content/Ads)</div>
            <div style={{ fontSize: 13, color: "#F5F7FA" }}>
              {data.promote.publish === "now" && "✅ Content Engine\n"}
              {data.promote.paid === "now" && "✅ Ad Creative\n"}
              {data.promote.publish !== "now" && data.promote.paid !== "now" && <span style={{ color: "#6B7186" }}>No items selected for now</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
