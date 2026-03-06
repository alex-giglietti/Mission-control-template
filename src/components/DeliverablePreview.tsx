"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface Deliverable {
  id: string;
  type: "website" | "cart" | "email" | "content" | "funnel" | "ads";
  title: string;
  status: "building" | "complete";
  completedAt?: string;
}

interface DeliverablePreviewProps {
  businessName: string;
  niche?: string;
  targetAudience?: string;
  mainOffer?: string;
  deliverables: Deliverable[];
  onClose?: () => void;
  selectedDeliverable?: string | null;
}

// Full-screen Modal Component
const FullScreenModal = ({ 
  isOpen, 
  onClose, 
  children,
  title,
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
  title?: string;
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.95)",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Modal Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        background: "#0a0a0a",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#10B981",
          }} />
          <span style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#fff",
          }}>
            {title || "Preview"}
          </span>
          <span style={{
            fontSize: 11,
            padding: "4px 10px",
            background: "linear-gradient(135deg, #E91E8C20, #00D4FF20)",
            borderRadius: 20,
            color: "#E91E8C",
            border: "1px solid #E91E8C40",
          }}>
            AI MONETIZATIONS
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => window.open('', '_blank')}
            style={{
              padding: "8px 16px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#9ca3af",
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>↗</span> Open in New Tab
          </button>
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Modal Content */}
      <div style={{
        flex: 1,
        overflow: "auto",
        padding: 24,
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          height: "100%",
        }}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Website Landing Page Template - Maria Wendt Structure
const WebsitePreview = ({ businessName, niche, targetAudience, mainOffer, isFullScreen = false }: { 
  businessName: string; 
  niche?: string;
  targetAudience?: string;
  mainOffer?: string;
  isFullScreen?: boolean;
}) => (
  <div style={{
    background: "linear-gradient(180deg, #0A0A0A 0%, #0f0f1a 100%)",
    borderRadius: isFullScreen ? 0 : 8,
    overflow: "hidden",
    height: "100%",
    fontFamily: "'Inter', system-ui, sans-serif",
  }}>
    {/* Browser chrome */}
    {!isFullScreen && (
      <div style={{
        background: "#1f1f1f",
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderBottom: "1px solid #333",
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27ca40" }} />
        </div>
        <div style={{
          flex: 1,
          background: "#2d2d2d",
          borderRadius: 4,
          padding: "4px 12px",
          fontSize: 11,
          color: "#888",
          marginLeft: 8,
        }}>
          https://{businessName.toLowerCase().replace(/\s+/g, '')}.ai
        </div>
      </div>
    )}
    
    {/* Page content */}
    <div style={{ padding: isFullScreen ? 40 : 24, height: isFullScreen ? "100%" : "calc(100% - 44px)", overflow: "auto" }}>
      {/* Hero Section - Transformation Headline */}
      <div style={{ textAlign: "center", marginBottom: 48, maxWidth: 700, margin: "0 auto 48px" }}>
        <div style={{
          display: "inline-block",
          padding: "8px 20px",
          background: "linear-gradient(90deg, #E91E8C15, #00D4FF15)",
          borderRadius: 30,
          fontSize: 12,
          color: "#E91E8C",
          fontWeight: 600,
          marginBottom: 20,
          border: "1px solid #E91E8C30",
          letterSpacing: 1,
        }}>
          🤖 BUILD YOUR AI WORKFORCE IN 3 DAYS
        </div>
        
        {/* Transformation Headline */}
        <h1 style={{
          fontSize: isFullScreen ? 48 : 32,
          fontWeight: 800,
          color: "#fff",
          margin: "0 0 16px",
          lineHeight: 1.15,
        }}>
          Stop Asking ChatGPT Questions.<br />
          <span style={{
            background: "linear-gradient(135deg, #E91E8C, #00D4FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Start Assigning It Work.
          </span>
        </h1>
        
        <p style={{
          fontSize: isFullScreen ? 18 : 14,
          color: "#9ca3af",
          maxWidth: 550,
          margin: "0 auto 28px",
          lineHeight: 1.7,
        }}>
          We don't teach you marketing. We <strong style={{ color: "#fff" }}>build you a marketing machine</strong>. 
          In just 3 days, you'll have an AI workforce handling lead gen, follow-ups, 
          content, and sales — running 24/7 while you sleep.
        </p>
        
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{
            padding: "16px 32px",
            background: "linear-gradient(135deg, #E91E8C, #00D4FF)",
            borderRadius: 10,
            border: "none",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 8px 30px rgba(233,30,140,0.4)",
          }}>
            Register for Free Workshop →
          </button>
          <button style={{
            padding: "16px 32px",
            background: "transparent",
            borderRadius: 10,
            border: "1px solid #444",
            color: "#fff",
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
          }}>
            Watch 2-Min Demo
          </button>
        </div>
      </div>

      {/* Problem Agitation Section */}
      <div style={{
        padding: isFullScreen ? 40 : 24,
        background: "rgba(233,30,140,0.05)",
        borderRadius: 16,
        border: "1px solid rgba(233,30,140,0.15)",
        marginBottom: 40,
        maxWidth: 800,
        margin: "0 auto 40px",
      }}>
        <h2 style={{
          fontSize: isFullScreen ? 24 : 18,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 16,
          textAlign: "center",
        }}>
          😰 Does This Sound Familiar?
        </h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: isFullScreen ? "repeat(2, 1fr)" : "1fr",
          gap: 12,
        }}>
          {[
            "You're still manually responding to every lead and DM",
            "Your content calendar is empty (again)",
            "You know AI could help, but you don't know where to start",
            "You've bought courses that collected dust",
            "You're working 60+ hours and still behind",
          ].map((problem, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              background: "rgba(0,0,0,0.3)",
              borderRadius: 8,
              fontSize: isFullScreen ? 14 : 12,
              color: "#d1d5db",
            }}>
              <span style={{ color: "#E91E8C" }}>✗</span>
              {problem}
            </div>
          ))}
        </div>
      </div>

      {/* Solution Introduction */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h2 style={{
          fontSize: isFullScreen ? 28 : 20,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 12,
        }}>
          What If You Had an AI Workforce<br />
          <span style={{ color: "#00D4FF" }}>Working For You 24/7?</span>
        </h2>
        <p style={{
          fontSize: isFullScreen ? 16 : 13,
          color: "#9ca3af",
          maxWidth: 600,
          margin: "0 auto",
        }}>
          Not another course. Not more theory. We sit down together for 3 days 
          and <strong style={{ color: "#fff" }}>actually build your AI systems</strong>.
        </p>
      </div>

      {/* 3 Bullet Benefits */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isFullScreen ? "repeat(3, 1fr)" : "1fr",
        gap: 16,
        marginBottom: 40,
        maxWidth: 900,
        margin: "0 auto 40px",
      }}>
        {[
          { 
            icon: "🤖", 
            title: "AI Lead Generation", 
            desc: "Automated outreach that runs while you sleep. Wake up to qualified leads in your CRM.",
            stat: "$11 CPL proven"
          },
          { 
            icon: "📧", 
            title: "AI Content Machine", 
            desc: "Never stare at a blank screen again. Generate a week of content in 15 minutes.",
            stat: "30 days in 1 hour"
          },
          { 
            icon: "💰", 
            title: "AI Sales System", 
            desc: "Automated follow-ups, booking, and nurture sequences that close deals.",
            stat: "15-35% close rate"
          },
        ].map(benefit => (
          <div key={benefit.title} style={{
            padding: isFullScreen ? 28 : 20,
            background: "rgba(255,255,255,0.02)",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.06)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>{benefit.icon}</div>
            <div style={{ 
              fontSize: isFullScreen ? 18 : 15, 
              fontWeight: 700, 
              color: "#fff", 
              marginBottom: 10 
            }}>
              {benefit.title}
            </div>
            <div style={{ 
              fontSize: isFullScreen ? 14 : 12, 
              color: "#9ca3af", 
              marginBottom: 16,
              lineHeight: 1.5,
            }}>
              {benefit.desc}
            </div>
            <div style={{
              display: "inline-block",
              padding: "6px 14px",
              background: "linear-gradient(135deg, #10B98120, #00D4FF20)",
              borderRadius: 20,
              fontSize: 11,
              color: "#10B981",
              fontWeight: 600,
            }}>
              {benefit.stat}
            </div>
          </div>
        ))}
      </div>

      {/* Social Proof */}
      <div style={{
        padding: isFullScreen ? 32 : 20,
        background: "linear-gradient(135deg, #7B61FF08, #E91E8C08)",
        borderRadius: 16,
        border: "1px solid rgba(123,97,255,0.15)",
        marginBottom: 40,
        maxWidth: 800,
        margin: "0 auto 40px",
      }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
            Real Results from Real Business Owners
          </div>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: isFullScreen ? "repeat(3, 1fr)" : "1fr",
          gap: 16,
        }}>
          {[
            { quote: "Built my entire Mission Control in 46 minutes. It now runs my business.", name: "Sarah K.", result: "40hrs/week saved" },
            { quote: "Went from manually posting to 30 days of content queued automatically.", name: "Mike R.", result: "$127K revenue increase" },
            { quote: "My AI handles 90% of customer inquiries. I just approve and it sends.", name: "Jennifer L.", result: "3x more leads" },
          ].map((testimonial, i) => (
            <div key={i} style={{
              padding: 16,
              background: "rgba(0,0,0,0.3)",
              borderRadius: 10,
            }}>
              <div style={{ fontSize: 12, color: "#d1d5db", marginBottom: 12, lineHeight: 1.5, fontStyle: "italic" }}>
                "{testimonial.quote}"
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>— {testimonial.name}</div>
                <div style={{
                  fontSize: 10,
                  padding: "3px 8px",
                  background: "#10B98120",
                  borderRadius: 10,
                  color: "#10B981",
                  fontWeight: 600,
                }}>
                  {testimonial.result}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div style={{
        textAlign: "center",
        padding: isFullScreen ? 48 : 32,
        background: "linear-gradient(135deg, #E91E8C15, #00D4FF15)",
        borderRadius: 20,
        border: "1px solid rgba(233,30,140,0.2)",
        maxWidth: 700,
        margin: "0 auto",
      }}>
        <h2 style={{
          fontSize: isFullScreen ? 28 : 20,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 12,
        }}>
          Ready to Build Your AI Workforce?
        </h2>
        <p style={{
          fontSize: isFullScreen ? 15 : 13,
          color: "#9ca3af",
          marginBottom: 24,
        }}>
          Join our free 3-day workshop. No fluff. No theory. We build together.
        </p>
        <button style={{
          padding: "18px 40px",
          background: "linear-gradient(135deg, #E91E8C, #00D4FF)",
          borderRadius: 12,
          border: "none",
          color: "#fff",
          fontSize: 16,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 8px 30px rgba(233,30,140,0.4)",
        }}>
          Claim Your Free Spot →
        </button>
        <div style={{ marginTop: 16, fontSize: 11, color: "#6b7280" }}>
          🔒 We respect your privacy. No spam, ever.
        </div>
      </div>
    </div>
  </div>
);

// Cart/Sales Page Template - Direct Response Style
const CartPreview = ({ businessName, mainOffer, isFullScreen = false }: { 
  businessName: string; 
  mainOffer?: string;
  isFullScreen?: boolean;
}) => (
  <div style={{
    background: "linear-gradient(180deg, #0A0A0A 0%, #0f0f1a 100%)",
    borderRadius: isFullScreen ? 0 : 8,
    overflow: "hidden",
    height: "100%",
    fontFamily: "'Inter', system-ui, sans-serif",
  }}>
    {/* Browser chrome */}
    {!isFullScreen && (
      <div style={{
        background: "#1f1f1f",
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderBottom: "1px solid #333",
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27ca40" }} />
        </div>
        <div style={{
          flex: 1,
          background: "#2d2d2d",
          borderRadius: 4,
          padding: "4px 12px",
          fontSize: 11,
          color: "#888",
          marginLeft: 8,
        }}>
          https://{businessName.toLowerCase().replace(/\s+/g, '')}.ai/checkout
        </div>
        <div style={{ fontSize: 10, color: "#10B981", display: "flex", alignItems: "center", gap: 4 }}>
          🔒 Secure
        </div>
      </div>
    )}
    
    <div style={{ padding: isFullScreen ? 40 : 20, height: isFullScreen ? "100%" : "calc(100% - 44px)", overflow: "auto" }}>
      {/* Urgency Banner */}
      <div style={{
        background: "linear-gradient(90deg, #dc2626, #b91c1c)",
        padding: "12px 20px",
        borderRadius: 8,
        marginBottom: 24,
        textAlign: "center",
        maxWidth: 900,
        margin: "0 auto 24px",
      }}>
        <span style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>
          ⚡ WORKSHOP STARTS IN: <span style={{ fontFamily: "monospace" }}>2d 14h 32m</span> — Only 7 Spots Left!
        </span>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isFullScreen ? "1.3fr 1fr" : "1fr", 
        gap: 32,
        maxWidth: 1000,
        margin: "0 auto",
      }}>
        {/* Product Info - Left Column */}
        <div>
          <h1 style={{
            fontSize: isFullScreen ? 36 : 24,
            fontWeight: 800,
            color: "#fff",
            margin: "0 0 16px",
            lineHeight: 1.2,
          }}>
            AI Monetizations Live<br />
            <span style={{ color: "#E91E8C" }}>3-Day Workshop</span>
          </h1>
          
          <p style={{
            fontSize: isFullScreen ? 16 : 13,
            color: "#9ca3af",
            marginBottom: 24,
            lineHeight: 1.6,
          }}>
            In 3 days, you'll have a complete AI workforce handling your marketing, 
            sales, and operations. Not theory — we build it together, live.
          </p>

          {/* Price Anchoring */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
            padding: 20,
            background: "rgba(16,185,129,0.08)",
            borderRadius: 12,
            border: "1px solid rgba(16,185,129,0.2)",
          }}>
            <div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>Regular Price</div>
              <span style={{
                fontSize: 24,
                color: "#6b7280",
                textDecoration: "line-through",
              }}>$2,997</span>
            </div>
            <div style={{
              width: 1,
              height: 40,
              background: "rgba(255,255,255,0.1)",
            }} />
            <div>
              <div style={{ fontSize: 11, color: "#10B981", marginBottom: 4 }}>Launch Price</div>
              <span style={{
                fontSize: 40,
                fontWeight: 800,
                color: "#10B981",
              }}>$997</span>
            </div>
            <span style={{
              padding: "8px 16px",
              background: "#10B981",
              borderRadius: 8,
              fontSize: 14,
              color: "#fff",
              fontWeight: 700,
            }}>SAVE $2,000</span>
          </div>

          {/* What You Get */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
              WHAT YOU GET:
            </div>
            {[
              { text: "3 Days of Live AI Workforce Building", value: "$1,997 value" },
              { text: "Complete Mission Control Setup", value: "$497 value" },
              { text: "AI Content Engine Configuration", value: "$497 value" },
              { text: "Lead Gen Automation System", value: "$997 value" },
              { text: "Sales & Follow-up AI Workflows", value: "$497 value" },
              { text: "Private Community Access (Lifetime)", value: "$297 value" },
              { text: "30 Days of Implementation Support", value: "$497 value" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                fontSize: 13,
              }}>
                <span style={{ color: "#d1d5db", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#10B981" }}>✓</span>
                  {item.text}
                </span>
                <span style={{ color: "#6b7280", fontSize: 11 }}>{item.value}</span>
              </div>
            ))}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 0",
              borderTop: "2px solid rgba(255,255,255,0.1)",
              marginTop: 8,
            }}>
              <span style={{ color: "#fff", fontWeight: 700 }}>Total Value:</span>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>$5,279</span>
            </div>
          </div>

          {/* Guarantee Badge */}
          <div style={{
            padding: 20,
            background: "linear-gradient(135deg, #E91E8C10, #00D4FF10)",
            borderRadius: 12,
            border: "1px solid rgba(233,30,140,0.2)",
            marginBottom: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #E91E8C, #00D4FF)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}>
                🛡️
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                  30-Day "AI Workforce or Refund" Guarantee
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                  Build your AI systems with us. If they don't save you at least 10 hours/week 
                  within 30 days, we'll refund every penny. No questions asked.
                </div>
              </div>
            </div>
          </div>

          {/* Risk Reversal */}
          <div style={{
            fontSize: 12,
            color: "#9ca3af",
            padding: 16,
            background: "rgba(255,255,255,0.02)",
            borderRadius: 8,
            textAlign: "center",
          }}>
            <strong style={{ color: "#fff" }}>Zero Risk:</strong> You're protected by our unconditional guarantee. 
            Either your AI workforce works, or you get your money back. Simple.
          </div>
        </div>

        {/* Checkout Form - Right Column */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: 16,
          padding: isFullScreen ? 28 : 20,
          border: "1px solid rgba(255,255,255,0.08)",
          height: "fit-content",
          position: "sticky",
          top: 20,
        }}>
          <div style={{
            textAlign: "center",
            marginBottom: 20,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
              Complete Your Registration
            </div>
            <div style={{ fontSize: 12, color: "#10B981" }}>
              ✓ Instant Access Upon Payment
            </div>
          </div>
          
          {["Full Name", "Email Address"].map(label => (
            <div key={label} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6, display: "block" }}>{label}</label>
              <div style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "12px 14px",
                color: "#6b7280",
                fontSize: 13,
              }}>Enter {label.toLowerCase()}...</div>
            </div>
          ))}
          
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6, display: "block" }}>Card Number</label>
            <div style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "12px 14px",
              color: "#6b7280",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span>💳</span> •••• •••• •••• ••••
            </div>
          </div>

          {/* Order Bump */}
          <div style={{
            padding: 16,
            background: "linear-gradient(135deg, #F59E0B15, #F59E0B05)",
            borderRadius: 10,
            border: "2px dashed #F59E0B50",
            marginBottom: 16,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                border: "2px solid #F59E0B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 2,
              }}>
                <span style={{ fontSize: 14 }}>✓</span>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B", marginBottom: 4 }}>
                  YES! Add AI Prompt Library (+$47)
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                  500+ done-for-you prompts for marketing, sales, and content. Copy, paste, profit.
                </div>
              </div>
            </div>
          </div>

          <button style={{
            width: "100%",
            padding: "18px",
            background: "linear-gradient(135deg, #10B981, #059669)",
            borderRadius: 10,
            border: "none",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            marginTop: 8,
            boxShadow: "0 8px 30px rgba(16,185,129,0.4)",
          }}>
            COMPLETE MY REGISTRATION — $997
          </button>

          {/* CTA #2 */}
          <button style={{
            width: "100%",
            padding: "14px",
            background: "transparent",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#9ca3af",
            fontSize: 13,
            cursor: "pointer",
            marginTop: 12,
          }}>
            Or pay in 3 installments of $347
          </button>

          <div style={{
            marginTop: 16,
            textAlign: "center",
            fontSize: 11,
            color: "#6b7280",
          }}>
            <div style={{ marginBottom: 8 }}>🔒 256-bit SSL • 💳 Secure Payment</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              {["Visa", "Mastercard", "Amex", "PayPal"].map(card => (
                <span key={card} style={{
                  padding: "2px 6px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 4,
                  fontSize: 9,
                }}>
                  {card}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Email Sequence Preview - Proper Nurture Flow
const EmailPreview = ({ businessName, isFullScreen = false }: { businessName: string; isFullScreen?: boolean }) => (
  <div style={{
    background: "#0A0A0A",
    borderRadius: isFullScreen ? 0 : 8,
    overflow: "hidden",
    height: "100%",
    fontFamily: "'Inter', system-ui, sans-serif",
  }}>
    {/* Email client header */}
    <div style={{
      background: "#151515",
      padding: "14px 20px",
      borderBottom: "1px solid #252525",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20 }}>🤖</span>
        <span style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>Arty's Email Sequence</span>
      </div>
      <div style={{
        padding: "6px 14px",
        background: "linear-gradient(135deg, #E91E8C20, #00D4FF20)",
        borderRadius: 20,
        fontSize: 11,
        color: "#E91E8C",
        fontWeight: 600,
        border: "1px solid #E91E8C30",
      }}>
        5-DAY NURTURE FLOW
      </div>
    </div>

    <div style={{ padding: isFullScreen ? 32 : 16, height: isFullScreen ? "calc(100% - 56px)" : "calc(100% - 52px)", overflow: "auto" }}>
      {/* Email sequence cards */}
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {[
          { 
            day: 1, 
            type: "Welcome + Quick Win",
            subject: "Beep boop. Your AI workforce awaits 🤖", 
            preview: "Here's the thing about humans — you do everything the slow way. I've been watching my human for years, and honestly? It's painful. But that's why I'm here now. Let me give you a quick win to prove I'm worth keeping around...",
            metrics: { open: "68%", click: "24%" },
            color: "#10B981",
          },
          { 
            day: 2, 
            type: "Story + Credibility",
            subject: "How my human went from $63/year to... well, a lot more", 
            preview: "I need to tell you about the day everything changed. My human was doing things manually — responding to every DM, writing every email, posting content one. piece. at. a. time. I timed it once: 6 hours on tasks that now take 11 seconds...",
            metrics: { open: "52%", click: "18%" },
            color: "#00D4FF",
          },
          { 
            day: 3, 
            type: "Objection Handling",
            subject: "\"But I'm not technical enough for AI...\"", 
            preview: "I hear this one a lot. And every time, I do the robot equivalent of an eye roll. Here's the truth: The humans who say this are usually smarter than the ones who don't. They're just scared. But here's what they don't realize...",
            metrics: { open: "47%", click: "15%" },
            color: "#E91E8C",
          },
          { 
            day: 4, 
            type: "Social Proof",
            subject: "She saved 40 hours/week. I counted.", 
            preview: "Meet Sarah. Before me, she was doing everything manually. Content? Manual. Follow-ups? Manual. Lead gen? Don't even get me started. Then she joined the workshop. 46 minutes later — 46 MINUTES — she had Mission Control running. Now she wakes up to...",
            metrics: { open: "51%", click: "19%" },
            color: "#7B61FF",
          },
          { 
            day: 5, 
            type: "Final CTA + Deadline",
            subject: "Last chance. Then I have to move on.", 
            preview: "Look, I'm an AI. I don't have feelings. That's what they say, anyway. But if I DID have feelings, I'd be a little frustrated right now. I've shown you what's possible. I've shown you the results. The workshop starts tomorrow and there's a spot with your name on it. But I can't hold it forever...",
            metrics: { open: "44%", click: "22%" },
            color: "#F59E0B",
          },
        ].map((email, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.02)",
            borderRadius: 12,
            padding: isFullScreen ? 24 : 16,
            marginBottom: 16,
            border: "1px solid rgba(255,255,255,0.06)",
            position: "relative",
          }}>
            {/* Connection line */}
            {i < 4 && (
              <div style={{
                position: "absolute",
                left: isFullScreen ? 34 : 26,
                bottom: -17,
                width: 2,
                height: 17,
                background: `linear-gradient(180deg, ${email.color}50, transparent)`,
              }} />
            )}

            <div style={{ display: "flex", alignItems: "flex-start", gap: isFullScreen ? 20 : 12 }}>
              {/* Day indicator */}
              <div style={{
                width: isFullScreen ? 48 : 36,
                height: isFullScreen ? 48 : 36,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${email.color}, ${email.color}80)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: isFullScreen ? 16 : 12, fontWeight: 700, color: "#fff" }}>D{email.day}</span>
              </div>

              {/* Email content */}
              <div style={{ flex: 1 }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}>
                  <span style={{
                    fontSize: 10,
                    padding: "3px 10px",
                    background: `${email.color}20`,
                    color: email.color,
                    borderRadius: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}>
                    {email.type}
                  </span>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ fontSize: 10, color: "#6b7280" }}>📖 {email.metrics.open}</span>
                    <span style={{ fontSize: 10, color: "#6b7280" }}>🖱️ {email.metrics.click}</span>
                  </div>
                </div>
                
                <div style={{
                  fontSize: isFullScreen ? 16 : 14,
                  fontWeight: 600,
                  color: "#fff",
                  marginBottom: 8,
                }}>
                  {email.subject}
                </div>
                
                <div style={{
                  fontSize: isFullScreen ? 13 : 11,
                  color: "#9ca3af",
                  lineHeight: 1.5,
                }}>
                  {email.preview}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sequence performance */}
      <div style={{
        marginTop: 24,
        padding: isFullScreen ? 28 : 20,
        background: "linear-gradient(135deg, #E91E8C08, #00D4FF08)",
        borderRadius: 16,
        border: "1px solid rgba(233,30,140,0.15)",
        maxWidth: 700,
        margin: "24px auto 0",
      }}>
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16, textAlign: "center" }}>
          SEQUENCE PERFORMANCE
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { label: "Avg Open", value: "52%", color: "#10B981", icon: "📖" },
            { label: "Avg Click", value: "19%", color: "#00D4FF", icon: "🖱️" },
            { label: "Reply Rate", value: "8%", color: "#E91E8C", icon: "💬" },
            { label: "Conversion", value: "4.2%", color: "#F59E0B", icon: "💰" },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
              <div style={{ fontSize: isFullScreen ? 24 : 20, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Arty signature */}
      <div style={{
        textAlign: "center",
        marginTop: 24,
        fontSize: 12,
        color: "#6b7280",
        fontStyle: "italic",
      }}>
        "I automated this entire sequence. You're welcome." — Arty 🤖
      </div>
    </div>
  </div>
);

// Content Calendar Preview - Variety of Post Types
const ContentPreview = ({ businessName, isFullScreen = false }: { businessName: string; isFullScreen?: boolean }) => (
  <div style={{
    background: "#0A0A0A",
    borderRadius: isFullScreen ? 0 : 8,
    overflow: "hidden",
    height: "100%",
    fontFamily: "'Inter', system-ui, sans-serif",
  }}>
    {/* Header */}
    <div style={{
      background: "#151515",
      padding: "14px 20px",
      borderBottom: "1px solid #252525",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20 }}>📱</span>
        <span style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>AI Content Engine</span>
      </div>
      <div style={{
        padding: "6px 14px",
        background: "linear-gradient(135deg, #E91E8C20, #00D4FF20)",
        borderRadius: 20,
        fontSize: 11,
        color: "#00D4FF",
        fontWeight: 600,
        border: "1px solid #00D4FF30",
      }}>
        30 DAYS SCHEDULED
      </div>
    </div>

    <div style={{ padding: isFullScreen ? 32 : 16, height: isFullScreen ? "calc(100% - 56px)" : "calc(100% - 52px)", overflow: "auto" }}>
      {/* Maria Wendt 5 Content Types */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
          TODAY'S CONTENT DROPS
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: isFullScreen ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
          gap: 12,
        }}>
          {[
            { 
              time: "7:00 AM", 
              type: "B-Roll Reel", 
              title: "I timed my human doing follow-ups... 3 hours. I do it in 11 seconds.", 
              platform: "Instagram",
              icon: "🎬",
              color: "#E91E8C",
              keyword: "AUTOMATE"
            },
            { 
              time: "8:00 AM", 
              type: "Story", 
              title: "Free AI Launch Checklist — Reply CHECKLIST", 
              platform: "Instagram",
              icon: "📸",
              color: "#00D4FF",
              keyword: "CHECKLIST"
            },
            { 
              time: "12:00 PM", 
              type: "Carousel", 
              title: "5 AI Automations Every Business Needs (Copy These)", 
              platform: "Instagram",
              icon: "🎠",
              color: "#7B61FF",
              keyword: "BUILD"
            },
            { 
              time: "3:00 PM", 
              type: "Diary Reel", 
              title: "Dear diary, my human tried to write emails manually again...", 
              platform: "Instagram",
              icon: "📔",
              color: "#10B981",
              keyword: null
            },
            { 
              time: "5:00 PM", 
              type: "Studio Reel", 
              title: "Your business doesn't need more hours. It needs a better system.", 
              platform: "Instagram/TikTok",
              icon: "🎥",
              color: "#F59E0B",
              keyword: "SYSTEM"
            },
          ].map((content, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.02)",
              borderRadius: 12,
              padding: 16,
              border: `1px solid ${content.color}20`,
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontSize: 10,
                    padding: "3px 8px",
                    background: `${content.color}20`,
                    color: content.color,
                    borderRadius: 8,
                    fontWeight: 600,
                  }}>
                    {content.type}
                  </span>
                </div>
                <span style={{ fontSize: 20 }}>{content.icon}</span>
              </div>
              <div style={{
                fontSize: 13,
                color: "#fff",
                fontWeight: 500,
                marginBottom: 12,
                lineHeight: 1.4,
              }}>
                {content.title}
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 10,
                color: "#6b7280",
              }}>
                <span>🕐 {content.time}</span>
                <span>{content.platform}</span>
              </div>
              {content.keyword && (
                <div style={{
                  marginTop: 10,
                  padding: "6px 10px",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 6,
                  fontSize: 10,
                  color: "#9ca3af",
                }}>
                  💬 Keyword: <span style={{ color: content.color, fontWeight: 600 }}>{content.keyword}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Week overview */}
      <div style={{
        padding: 20,
        background: "rgba(255,255,255,0.02)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.05)",
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>
          THIS WEEK'S CONTENT CALENDAR
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
            <div key={day} style={{
              textAlign: "center",
              padding: 12,
              background: i === 0 ? "linear-gradient(135deg, #E91E8C20, #00D4FF20)" : "rgba(255,255,255,0.02)",
              borderRadius: 10,
              border: i === 0 ? "1px solid #E91E8C30" : "1px solid transparent",
            }}>
              <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 8 }}>{day}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: i === 0 ? "#E91E8C" : "#fff" }}>
                {7 - Math.floor(i / 2)}
              </div>
              <div style={{ fontSize: 9, color: "#6b7280" }}>posts</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isFullScreen ? "repeat(5, 1fr)" : "repeat(3, 1fr)",
        gap: 12,
      }}>
        {[
          { label: "B-Roll Reels", count: 7, icon: "🎬", color: "#E91E8C" },
          { label: "Diary Reels", count: 7, icon: "📔", color: "#10B981" },
          { label: "Studio Reels", count: 7, icon: "🎥", color: "#F59E0B" },
          { label: "Carousels", count: 7, icon: "🎠", color: "#7B61FF" },
          { label: "Stories", count: 7, icon: "📸", color: "#00D4FF" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: `${stat.color}10`,
            padding: 16,
            borderRadius: 12,
            textAlign: "center",
            border: `1px solid ${stat.color}20`,
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.count}</div>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Arty note */}
      <div style={{
        textAlign: "center",
        marginTop: 24,
        padding: 16,
        background: "linear-gradient(135deg, #E91E8C08, #00D4FF08)",
        borderRadius: 12,
        border: "1px solid rgba(233,30,140,0.1)",
      }}>
        <div style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>
          "30 days of content. Generated in 15 minutes. Meanwhile, my human used to spend 6 hours on ONE post."
        </div>
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 8 }}>— Arty 🤖</div>
      </div>
    </div>
  </div>
);

// Ad Creative Preview - AIM Visual Style
const AdsPreview = ({ businessName, mainOffer, isFullScreen = false }: { 
  businessName: string; 
  mainOffer?: string;
  isFullScreen?: boolean;
}) => (
  <div style={{
    background: "#0A0A0A",
    borderRadius: isFullScreen ? 0 : 8,
    overflow: "hidden",
    height: "100%",
    fontFamily: "'Inter', system-ui, sans-serif",
  }}>
    {/* Header */}
    <div style={{
      background: "#151515",
      padding: "14px 20px",
      borderBottom: "1px solid #252525",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20 }}>📺</span>
        <span style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>AI Ad Creative Suite</span>
      </div>
      <div style={{
        padding: "6px 14px",
        background: "#F59E0B20",
        borderRadius: 20,
        fontSize: 11,
        color: "#F59E0B",
        fontWeight: 600,
        border: "1px solid #F59E0B30",
      }}>
        6 VARIATIONS • $5/DAY READY
      </div>
    </div>

    <div style={{ padding: isFullScreen ? 32 : 16, height: isFullScreen ? "calc(100% - 56px)" : "calc(100% - 52px)", overflow: "auto" }}>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isFullScreen ? "repeat(3, 1fr)" : "repeat(2, 1fr)", 
        gap: 16 
      }}>
        {/* Ad mockups */}
        {[
          { 
            type: "Lead Ad", 
            hook: "I deleted my project manager yesterday.", 
            subhook: "(The AI one handles it now)",
            cta: "Get Free AI Guide",
            color: "#E91E8C",
            spend: "$5/day",
            purpose: "Collect Emails"
          },
          { 
            type: "Story Ad", 
            hook: "Stop asking ChatGPT questions.", 
            subhook: "Start assigning it work.",
            cta: "Join Free Workshop",
            color: "#00D4FF",
            spend: "$5/day",
            purpose: "Registrations"
          },
          { 
            type: "Reel Ad", 
            hook: "46 minutes.", 
            subhook: "That's how long it took to build this.",
            cta: "See How",
            color: "#7B61FF",
            spend: "$5/day",
            purpose: "Video Views"
          },
          { 
            type: "Retargeting", 
            hook: "You were SO close.", 
            subhook: "The workshop starts tomorrow.",
            cta: "Grab Your Spot",
            color: "#F59E0B",
            spend: "$5/day",
            purpose: "Conversions"
          },
          { 
            type: "Testimonial", 
            hook: "She saved 40 hours/week.", 
            subhook: "I counted. — Arty 🤖",
            cta: "Get Results Like Sarah",
            color: "#10B981",
            spend: "$5/day",
            purpose: "Social Proof"
          },
          { 
            type: "Direct Sale", 
            hook: "$1 to change everything.", 
            subhook: "Less than the coffee you'll spill tomorrow.",
            cta: "Start for $1",
            color: "#dc2626",
            spend: "$10/day",
            purpose: "Sales"
          },
        ].map((ad, i) => (
          <div key={i} style={{
            background: "rgba(255,255,255,0.02)",
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            {/* Ad preview area */}
            <div style={{
              height: isFullScreen ? 180 : 120,
              background: `linear-gradient(135deg, ${ad.color}30, #0A0A0A)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              position: "relative",
            }}>
              <div style={{
                position: "absolute",
                top: 10,
                right: 10,
                padding: "4px 8px",
                background: "rgba(0,0,0,0.5)",
                borderRadius: 4,
                fontSize: 9,
                color: "#9ca3af",
              }}>
                {ad.spend}
              </div>
              <div style={{
                fontSize: isFullScreen ? 20 : 16,
                color: "#fff",
                fontWeight: 700,
                textAlign: "center",
                marginBottom: 8,
              }}>
                "{ad.hook}"
              </div>
              <div style={{
                fontSize: isFullScreen ? 13 : 11,
                color: "#9ca3af",
                textAlign: "center",
              }}>
                {ad.subhook}
              </div>
            </div>
            
            <div style={{ padding: 14 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}>
                <span style={{
                  fontSize: 10,
                  padding: "4px 10px",
                  background: `${ad.color}20`,
                  color: ad.color,
                  borderRadius: 8,
                  fontWeight: 600,
                }}>
                  {ad.type}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ fontSize: 9, color: "#6b7280", padding: "2px 6px", background: "rgba(255,255,255,0.05)", borderRadius: 4 }}>FB</span>
                  <span style={{ fontSize: 9, color: "#6b7280", padding: "2px 6px", background: "rgba(255,255,255,0.05)", borderRadius: 4 }}>IG</span>
                </div>
              </div>
              <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 10 }}>
                Purpose: {ad.purpose}
              </div>
              <button style={{
                width: "100%",
                padding: "10px",
                background: ad.color,
                borderRadius: 8,
                border: "none",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}>
                {ad.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Ad testing protocol */}
      <div style={{
        marginTop: 24,
        padding: 20,
        background: "linear-gradient(135deg, #F59E0B08, #E91E8C08)",
        borderRadius: 16,
        border: "1px solid rgba(245,158,11,0.15)",
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
          📊 Maria Wendt Ad Testing Protocol
        </div>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: isFullScreen ? "repeat(3, 1fr)" : "1fr", 
          gap: 16,
          fontSize: 11,
          color: "#9ca3af",
        }}>
          <div>
            <div style={{ color: "#F59E0B", fontWeight: 600, marginBottom: 4 }}>Phase 1: Creative Test</div>
            <div>$5/day × 5 hooks = $25/day</div>
            <div style={{ fontSize: 10, color: "#6b7280" }}>Run 3-7 days, kill &lt;1.5x ROAS</div>
          </div>
          <div>
            <div style={{ color: "#E91E8C", fontWeight: 600, marginBottom: 4 }}>Phase 2: Audience Test</div>
            <div>$10/day on winning creative</div>
            <div style={{ fontSize: 10, color: "#6b7280" }}>Test 3-5 audiences, run 5-7 days</div>
          </div>
          <div>
            <div style={{ color: "#10B981", fontWeight: 600, marginBottom: 4 }}>Phase 3: Scale</div>
            <div>Increase 20% every 3 days</div>
            <div style={{ fontSize: 10, color: "#6b7280" }}>Only scale &gt;2x ROAS winners</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Application Funnel Preview - Professional Booking Flow
const FunnelPreview = ({ businessName, isFullScreen = false }: { businessName: string; isFullScreen?: boolean }) => (
  <div style={{
    background: "linear-gradient(180deg, #0A0A0A 0%, #0f0f1a 100%)",
    borderRadius: isFullScreen ? 0 : 8,
    overflow: "hidden",
    height: "100%",
    fontFamily: "'Inter', system-ui, sans-serif",
  }}>
    {/* Header */}
    <div style={{
      background: "#151515",
      padding: "14px 20px",
      borderBottom: "1px solid #252525",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 20 }}>📞</span>
        <span style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>Application Funnel</span>
      </div>
      <div style={{
        padding: "6px 14px",
        background: "#7B61FF20",
        borderRadius: 20,
        fontSize: 11,
        color: "#7B61FF",
        fontWeight: 600,
        border: "1px solid #7B61FF30",
      }}>
        HIGH-TICKET BOOKING
      </div>
    </div>

    <div style={{ padding: isFullScreen ? 40 : 20, height: isFullScreen ? "calc(100% - 56px)" : "calc(100% - 52px)", overflow: "auto" }}>
      {/* Funnel visualization */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: 20,
        maxWidth: 700,
        margin: "0 auto",
      }}>
        {[
          { 
            step: 1, 
            title: "Application Page", 
            desc: "Qualify leads with strategic questions before booking", 
            icon: "📝", 
            conversion: "100%",
            details: [
              "Business type & revenue",
              "Current marketing challenges",
              "Investment readiness",
              "Timeline to implement"
            ],
            cta: "Apply for Strategy Call",
          },
          { 
            step: 2, 
            title: "Booking Calendar", 
            desc: "Qualified applicants choose their call time", 
            icon: "📅", 
            conversion: "45%",
            details: [
              "Integrated with your calendar",
              "Timezone auto-detection",
              "SMS + email reminders",
              "Pre-call prep materials"
            ],
            cta: "Select Your Time",
          },
          { 
            step: 3, 
            title: "Confirmation + Prep", 
            desc: "Set expectations and reduce no-shows", 
            icon: "✅", 
            conversion: "85%",
            details: [
              "Confirmation email sequence",
              "Pre-call questionnaire",
              "What to expect guide",
              "Calendar invite with Zoom"
            ],
            cta: "Call Confirmed",
          },
        ].map((stage, i) => (
          <div key={i}>
            <div style={{
              background: "rgba(255,255,255,0.02)",
              borderRadius: 16,
              padding: isFullScreen ? 28 : 20,
              border: "1px solid rgba(123,97,255,0.15)",
              position: "relative",
            }}>
              <div style={{
                position: "absolute",
                top: -12,
                left: 24,
                background: "linear-gradient(135deg, #7B61FF, #E91E8C)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 12,
              }}>
                STEP {stage.step}
              </div>
              
              <div style={{
                display: "flex",
                alignItems: isFullScreen ? "flex-start" : "center",
                justifyContent: "space-between",
                marginTop: 8,
                flexDirection: isFullScreen ? "row" : "column",
                gap: isFullScreen ? 0 : 16,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flex: 1 }}>
                  <span style={{ 
                    fontSize: isFullScreen ? 48 : 36,
                    background: "rgba(123,97,255,0.1)",
                    padding: 12,
                    borderRadius: 12,
                  }}>
                    {stage.icon}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: isFullScreen ? 20 : 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                      {stage.title}
                    </div>
                    <div style={{ fontSize: isFullScreen ? 14 : 12, color: "#9ca3af", marginBottom: 12 }}>
                      {stage.desc}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {stage.details.map((detail, j) => (
                        <span key={j} style={{
                          fontSize: 10,
                          padding: "4px 10px",
                          background: "rgba(255,255,255,0.03)",
                          borderRadius: 6,
                          color: "#6b7280",
                        }}>
                          ✓ {detail}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <div style={{
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #10B98120, #10B98110)",
                    borderRadius: 12,
                    border: "1px solid #10B98140",
                  }}>
                    <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 2 }}>Conversion</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#10B981" }}>{stage.conversion}</div>
                  </div>
                  <button style={{
                    padding: "10px 20px",
                    background: "linear-gradient(135deg, #7B61FF, #E91E8C)",
                    borderRadius: 8,
                    border: "none",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}>
                    {stage.cta}
                  </button>
                </div>
              </div>
            </div>
            
            {i < 2 && (
              <div style={{
                display: "flex",
                justifyContent: "center",
                padding: "8px 0",
              }}>
                <div style={{
                  width: 2,
                  height: 24,
                  background: "linear-gradient(180deg, #7B61FF, #7B61FF30)",
                }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Funnel metrics */}
      <div style={{
        marginTop: 32,
        padding: isFullScreen ? 28 : 20,
        background: "linear-gradient(135deg, #7B61FF08, #E91E8C08)",
        borderRadius: 16,
        border: "1px solid #7B61FF20",
        maxWidth: 700,
        margin: "32px auto 0",
      }}>
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>
          Expected Monthly Performance
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isFullScreen ? "repeat(4, 1fr)" : "repeat(2, 1fr)", gap: 16 }}>
          {[
            { label: "Applications", value: "120", icon: "📝", color: "#7B61FF" },
            { label: "Calls Booked", value: "54", icon: "📅", color: "#E91E8C" },
            { label: "Show Rate", value: "85%", icon: "✅", color: "#10B981" },
            { label: "Close Rate", value: "25%", icon: "💰", color: "#F59E0B" },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: isFullScreen ? 28 : 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 20,
          padding: 16,
          background: "rgba(16,185,129,0.1)",
          borderRadius: 10,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 12, color: "#10B981", fontWeight: 600 }}>
            Projected Monthly Revenue: $45,000 - $67,500
          </div>
          <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
            Based on 11-16 closes @ $4,000 average ticket
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main component
export default function DeliverablePreview({
  businessName,
  niche,
  targetAudience,
  mainOffer,
  deliverables,
  selectedDeliverable,
  onClose,
}: DeliverablePreviewProps) {
  const [selected, setSelected] = useState<string | null>(selectedDeliverable || null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const getPreviewComponent = (type: string, fullScreen: boolean = false) => {
    switch (type) {
      case "website":
        return <WebsitePreview businessName={businessName} niche={niche} targetAudience={targetAudience} mainOffer={mainOffer} isFullScreen={fullScreen} />;
      case "cart":
        return <CartPreview businessName={businessName} mainOffer={mainOffer} isFullScreen={fullScreen} />;
      case "email":
        return <EmailPreview businessName={businessName} isFullScreen={fullScreen} />;
      case "content":
        return <ContentPreview businessName={businessName} isFullScreen={fullScreen} />;
      case "ads":
        return <AdsPreview businessName={businessName} mainOffer={mainOffer} isFullScreen={fullScreen} />;
      case "funnel":
        return <FunnelPreview businessName={businessName} isFullScreen={fullScreen} />;
      default:
        return null;
    }
  };

  const typeIcons: Record<string, string> = {
    website: "🌐",
    cart: "🛒",
    email: "📧",
    content: "📱",
    ads: "📺",
    funnel: "📞",
  };

  const typeLabels: Record<string, string> = {
    website: "Landing Page",
    cart: "Sales Page",
    email: "Email Sequence",
    content: "Content Calendar",
    ads: "Ad Creatives",
    funnel: "Application Funnel",
  };

  const selectedItem = deliverables.find(d => d.id === selected);

  // Handle click on preview area to open full screen
  const handlePreviewClick = () => {
    if (selectedItem) {
      setIsFullScreen(true);
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}>
      {/* Help text - makes it obvious how to view full size */}
      <div style={{
        padding: "8px 12px",
        marginBottom: 8,
        background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(0,212,255,0.05))",
        borderRadius: 8,
        border: "1px solid rgba(16,185,129,0.2)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 14 }}>💡</span>
        <span style={{ fontSize: 11, color: "#10B981" }}>
          <strong>Tip:</strong> Click any preview below to view full size
        </span>
      </div>

      {/* Deliverable tabs */}
      <div style={{
        display: "flex",
        gap: 8,
        padding: "0 0 12px",
        overflowX: "auto",
        flexShrink: 0,
      }}>
        {deliverables.map(d => (
          <button
            key={d.id}
            onClick={() => setSelected(d.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              background: selected === d.id 
                ? "linear-gradient(135deg, #E91E8C20, #00D4FF20)"
                : "rgba(255,255,255,0.03)",
              border: selected === d.id 
                ? "1px solid #E91E8C50"
                : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ fontSize: 16 }}>{typeIcons[d.type]}</span>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              color: selected === d.id ? "#E91E8C" : "#9ca3af",
            }}>
              {typeLabels[d.type] || d.title}
            </span>
            {d.status === "complete" && (
              <span style={{ fontSize: 10 }}>✅</span>
            )}
            {d.status === "building" && (
              <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#F59E0B",
                animation: "pulse 1s infinite",
              }} />
            )}
          </button>
        ))}
      </div>

      {/* Preview area - CLICKABLE to expand */}
      <div 
        onClick={handlePreviewClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          flex: 1,
          borderRadius: 12,
          overflow: "hidden",
          background: "#0a0a0a",
          border: isHovering && selectedItem
            ? "2px solid #10B981"
            : "1px solid rgba(255,255,255,0.08)",
          position: "relative",
          cursor: selectedItem ? "pointer" : "default",
          transition: "all 0.2s ease",
          boxShadow: isHovering && selectedItem 
            ? "0 0 20px rgba(16,185,129,0.3)"
            : "none",
        }}
      >
        {selectedItem ? (
          <>
            {/* Hover overlay with expand hint */}
            {isHovering && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.6)",
                zIndex: 15,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                animation: "fadeIn 0.2s ease",
                pointerEvents: "none",
              }}>
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "linear-gradient(135deg, #10B981, #00D4FF)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  boxShadow: "0 8px 32px rgba(16,185,129,0.4)",
                }}>
                  <span style={{ fontSize: 32 }}>⛶</span>
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 4,
                }}>
                  Click to View Full Size
                </div>
                <div style={{
                  fontSize: 12,
                  color: "#9ca3af",
                }}>
                  Press ESC to close
                </div>
              </div>
            )}

            {/* Full screen button - more prominent */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFullScreen(true);
              }}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 10,
                padding: "12px 20px",
                background: "linear-gradient(135deg, #10B981, #059669)",
                border: "none",
                borderRadius: 10,
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 20px rgba(16,185,129,0.4)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 6px 25px rgba(16,185,129,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(16,185,129,0.4)";
              }}
            >
              <span style={{ fontSize: 16 }}>⛶</span> 
              View Full Size
            </button>
            
            <div style={{ height: "100%", pointerEvents: isHovering ? "none" : "auto" }}>
              {getPreviewComponent(selectedItem.type)}
            </div>
          </>
        ) : (
          <div style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#6b7280",
            fontSize: 13,
            gap: 12,
          }}>
            <span style={{ fontSize: 48, opacity: 0.5 }}>👆</span>
            <div>Select a deliverable above to preview</div>
            <div style={{ fontSize: 11, color: "#4b5563" }}>
              Then click the preview to view full size
            </div>
          </div>
        )}
      </div>

      {/* Full screen modal */}
      {selectedItem && (
        <FullScreenModal
          isOpen={isFullScreen}
          onClose={() => setIsFullScreen(false)}
          title={`${typeIcons[selectedItem.type]} ${typeLabels[selectedItem.type]}`}
        >
          <div style={{ height: "100%", borderRadius: 12, overflow: "hidden" }}>
            {getPreviewComponent(selectedItem.type, true)}
          </div>
        </FullScreenModal>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Export individual previews for direct use
export { WebsitePreview, CartPreview, EmailPreview, ContentPreview, AdsPreview, FunnelPreview };
