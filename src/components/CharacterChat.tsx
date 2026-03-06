"use client";

import { useState, useRef, useEffect } from "react";
import { processPhase, lockDeliverable, iterateDeliverable, formatChatTranscript, type WebhookResponse } from "@/lib/webhook-client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface CharacterChatProps {
  businessName: string;
  brandSummary: string;
  onComplete: (characterSummary: string) => void;
}

// Add signal to localStorage for LiveDemo to pick up
function addSignalToLog(signal: string, message: string) {
  const SIGNALS_KEY = "aim-demo-signals";
  const existing = JSON.parse(localStorage.getItem(SIGNALS_KEY) || "[]");
  existing.unshift({
    id: `signal-${Date.now()}-${Math.random()}`,
    signal,
    message,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(SIGNALS_KEY, JSON.stringify(existing.slice(0, 100)));
}

export default function CharacterChat({ businessName, brandSummary, onComplete }: CharacterChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Solomon webhook states
  const [solomonWorking, setSolomonWorking] = useState(false);
  const [deliverableReady, setDeliverableReady] = useState(false);
  const [deliverable, setDeliverable] = useState<WebhookResponse | null>(null);
  const [showDeliverable, setShowDeliverable] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState("");
  const [isLocking, setIsLocking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input after loading
  useEffect(() => {
    if (!isLoading && !showDeliverable) {
      inputRef.current?.focus();
    }
  }, [isLoading, showDeliverable]);

  // Start conversation on mount (only once)
  const startConversation = async () => {
    setIsLoading(true);
    setError(null);
    
    console.log("Starting character conversation for:", businessName);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
          businessName,
          brandSummary,
          phase: "character",
        }),
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errText = await response.text();
        console.error("API error:", errText);
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let assistantMessage = "";
      const messageId = `msg-${Date.now()}`;

      // Add empty assistant message
      setMessages([{
        id: messageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      }]);

      // Stream the response
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(line => line.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              assistantMessage += parsed.text;
              setMessages(prev => 
                prev.map(m => m.id === messageId ? { ...m, content: assistantMessage } : m)
              );
            }
          } catch {
            // Ignore parse errors
          }
        }
      }

      // If no message was received, show fallback
      if (!assistantMessage) {
        setMessages([{
          id: messageId,
          role: "assistant",
          content: `Time to create your AI avatar! Based on ${businessName}'s brand personality, I'm envisioning a character that embodies your values. Should they be more mentor-like and wise, or energetic and motivational? What vibe feels right?`,
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      setError("Connection issue — using offline mode");
      setMessages([{
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: `Let's create your AI character! Based on ${businessName}'s brand, what kind of personality should they have? Friendly mentor? Bold motivator? Calm expert?`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Start conversation on mount (only once)
  useEffect(() => {
    if (!hasStarted && businessName) {
      setHasStarted(true);
      startConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessName]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          businessName,
          brandSummary,
          phase: "character",
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let assistantMessage = "";
      const messageId = `msg-${Date.now()}-assistant`;

      // Add empty assistant message
      setMessages(prev => [...prev, {
        id: messageId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      }]);

      // Stream the response
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(line => line.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              assistantMessage += parsed.text;
              setMessages(prev => 
                prev.map(m => m.id === messageId ? { ...m, content: assistantMessage } : m)
              );
            }
          } catch {
            // Ignore parse errors
          }
        }
      }

      // Check if conversation is complete (after 5-7 exchanges)
      const lowerMsg = assistantMessage.toLowerCase();
      const totalMessages = messages.length + 2;
      
      if (lowerMsg.includes("revenue planner") || 
          lowerMsg.includes("continue to") ||
          lowerMsg.includes("character bible") ||
          lowerMsg.includes("ready to build") ||
          totalMessages >= 8) {
        setIsComplete(true);
        
        // Automatically trigger Solomon to work on deliverable
        triggerSolomonWork([...messages, userMessage, { id: messageId, role: "assistant" as const, content: assistantMessage, timestamp: new Date().toISOString() }]);
      }

    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content: "I apologize, I had a brief connection issue. Could you repeat that?",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Solomon webhook to process the deliverable
  const triggerSolomonWork = async (currentMessages: Message[]) => {
    setSolomonWorking(true);
    addSignalToLog("[SOLOMON: WORKING]", "🎭 Solomon is creating your character bible...");
    
    try {
      const transcript = formatChatTranscript(
        currentMessages.map(m => ({ role: m.role, content: m.content })),
        "Character Agent"
      );
      
      const result = await processPhase("character", businessName, transcript);
      
      if (result.status === "complete") {
        setDeliverable(result);
        setDeliverableReady(true);
        addSignalToLog("[CHARACTER: DELIVERABLE READY]", "✅ Character bible generated");
      } else {
        console.error("Solomon processing failed:", result.message);
      }
    } catch (err) {
      console.error("Solomon webhook error:", err);
    } finally {
      setSolomonWorking(false);
    }
  };

  // Handle iteration request
  const handleIterate = async () => {
    if (!feedbackInput.trim()) return;
    
    setSolomonWorking(true);
    addSignalToLog("[SOLOMON: ITERATING]", "🔄 Solomon is updating character bible...");
    
    try {
      const transcript = formatChatTranscript(
        messages.map(m => ({ role: m.role, content: m.content })),
        "Character Agent"
      );
      
      const result = await iterateDeliverable("character", businessName, transcript, feedbackInput);
      
      if (result.status === "complete") {
        setDeliverable(result);
        setFeedbackInput("");
        addSignalToLog("[CHARACTER: UPDATED]", "✅ Character bible updated");
      }
    } catch (err) {
      console.error("Iteration error:", err);
    } finally {
      setSolomonWorking(false);
    }
  };

  // Handle lock and continue
  const handleLock = async () => {
    setIsLocking(true);
    addSignalToLog("[SOLOMON: LOCKING]", "🔒 Solomon is finalizing character bible...");
    
    try {
      const transcript = formatChatTranscript(
        messages.map(m => ({ role: m.role, content: m.content })),
        "Character Agent"
      );
      
      const result = await lockDeliverable("character", businessName, transcript);
      
      if (result.status === "complete") {
        addSignalToLog(result.signal || "[CHARACTER: LOCKED]", "✅ Character bible locked and saved to Google Drive");
        if (result.fileUrl) {
          addSignalToLog("[GDRIVE: FILE CREATED]", `📁 ${result.fileUrl}`);
        }
        
        // Wait a moment then transition
        setTimeout(() => {
          onComplete(transcript);
        }, 1500);
      }
    } catch (err) {
      console.error("Lock error:", err);
      setIsLocking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "#0B0F19",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 24px",
        background: "linear-gradient(135deg, #111624, #0D1117)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #2F80FF, #10B981)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
          }}>
            🎭
          </div>
          <div>
            <div style={{
              fontSize: 10,
              letterSpacing: 2,
              color: "#2F80FF",
              fontFamily: "'Orbitron', monospace",
              marginBottom: 2,
            }}>
              PHASE 3 — CHARACTER CREATION
            </div>
            <div style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#F5F7FA",
              fontFamily: "'Space Grotesk', sans-serif",
            }}>
              Character Agent
            </div>
            <div style={{
              fontSize: 12,
              color: "#8A8F98",
            }}>
              Creating the AI avatar for {businessName}
            </div>
          </div>
          
          {/* Solomon Working Indicator */}
          {solomonWorking && (
            <div style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              background: "rgba(47,128,255,0.2)",
              borderRadius: 20,
              border: "1px solid rgba(47,128,255,0.4)",
            }}>
              <span style={{ animation: "pulse 1s infinite" }}>👑</span>
              <span style={{ fontSize: 12, color: "#2F80FF" }}>Solomon is working...</span>
            </div>
          )}
        </div>
        {error && (
          <div style={{
            marginTop: 10,
            padding: "8px 12px",
            background: "rgba(251,191,36,0.1)",
            border: "1px solid rgba(251,191,36,0.3)",
            borderRadius: 6,
            fontSize: 12,
            color: "#FBBf24",
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>
        {messages.length === 0 && isLoading && (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
            color: "#8A8F98",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎭</div>
              <div>Connecting to Character Agent...</div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: "flex",
              justifyContent: message.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div style={{
              maxWidth: "70%",
              padding: "14px 18px",
              borderRadius: message.role === "user" 
                ? "18px 18px 4px 18px" 
                : "18px 18px 18px 4px",
              background: message.role === "user"
                ? "linear-gradient(135deg, #2F80FF, #10B981)"
                : "rgba(255,255,255,0.08)",
              color: "#F5F7FA",
              fontSize: 15,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
            }}>
              {message.content || (
                <div style={{ display: "flex", gap: 6 }}>
                  <span className="typing-dot" style={{ animationDelay: "0ms" }} />
                  <span className="typing-dot" style={{ animationDelay: "150ms" }} />
                  <span className="typing-dot" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "14px 18px",
              borderRadius: "18px 18px 18px 4px",
              background: "rgba(255,255,255,0.08)",
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                <span className="typing-dot" style={{ animationDelay: "0ms" }} />
                <span className="typing-dot" style={{ animationDelay: "150ms" }} />
                <span className="typing-dot" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Deliverable Preview Panel */}
      {deliverableReady && showDeliverable && deliverable && (
        <div style={{
          padding: "20px 24px",
          background: "linear-gradient(135deg, #2F80FF15, #2F80FF08)",
          borderTop: "1px solid #2F80FF",
          maxHeight: "40vh",
          overflowY: "auto",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}>
            <h3 style={{ margin: 0, color: "#2F80FF", fontSize: 16 }}>
              🎭 Character Bible Preview
            </h3>
            <button
              onClick={() => setShowDeliverable(false)}
              style={{
                background: "none",
                border: "none",
                color: "#8A8F98",
                cursor: "pointer",
                fontSize: 18,
              }}
            >
              ✕
            </button>
          </div>
          
          {/* HTML Preview */}
          <div 
            dangerouslySetInnerHTML={{ __html: deliverable.preview || "" }}
            style={{ marginBottom: 16 }}
          />
          
          {/* Feedback Input */}
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <input
              type="text"
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="Request changes... (e.g., 'Make the character more energetic')"
              disabled={solomonWorking}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#F5F7FA",
                fontSize: 14,
              }}
            />
            <button
              onClick={handleIterate}
              disabled={!feedbackInput.trim() || solomonWorking}
              style={{
                padding: "12px 20px",
                background: feedbackInput.trim() && !solomonWorking
                  ? "linear-gradient(135deg, #2F80FF, #10B981)"
                  : "rgba(255,255,255,0.1)",
                borderRadius: 8,
                border: "none",
                color: feedbackInput.trim() && !solomonWorking ? "#FFF" : "#6B7186",
                fontSize: 14,
                fontWeight: 600,
                cursor: feedbackInput.trim() && !solomonWorking ? "pointer" : "not-allowed",
              }}
            >
              🔄 Iterate
            </button>
          </div>
        </div>
      )}

      {/* Continue/Lock Panel */}
      {(isComplete || messages.length >= 6) && (
        <div style={{
          padding: "16px 24px",
          background: isLocking 
            ? "linear-gradient(135deg, #10B98130, #10B98120)"
            : "linear-gradient(135deg, #10B98120, #10B98110)",
          borderTop: `1px solid ${isLocking ? "#10B981" : "#2F80FF"}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}>
          {/* Solomon Working Status */}
          {solomonWorking && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 20px",
              background: "rgba(47,128,255,0.1)",
              borderRadius: 8,
              border: "1px solid rgba(47,128,255,0.3)",
            }}>
              <span style={{ animation: "pulse 1s infinite" }}>👑</span>
              <span style={{ color: "#2F80FF", fontSize: 14 }}>
                Solomon is creating your character bible...
              </span>
            </div>
          )}

          {/* Deliverable Ready */}
          {deliverableReady && !solomonWorking && !isLocking && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 20px",
              background: "rgba(16,185,129,0.1)",
              borderRadius: 8,
              border: "1px solid rgba(16,185,129,0.3)",
            }}>
              <span>✅</span>
              <span style={{ color: "#10B981", fontSize: 14 }}>
                Character bible ready!
              </span>
              <button
                onClick={() => setShowDeliverable(!showDeliverable)}
                style={{
                  marginLeft: 8,
                  padding: "4px 12px",
                  background: "rgba(16,185,129,0.2)",
                  borderRadius: 4,
                  border: "1px solid rgba(16,185,129,0.4)",
                  color: "#10B981",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {showDeliverable ? "Hide" : "Preview"}
              </button>
            </div>
          )}

          {/* Locking Status */}
          {isLocking && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 20px",
              background: "rgba(16,185,129,0.1)",
              borderRadius: 8,
              border: "1px solid rgba(16,185,129,0.3)",
            }}>
              <span style={{ animation: "pulse 1s infinite" }}>🔒</span>
              <span style={{ color: "#10B981", fontSize: 14 }}>
                Locking Character Bible and saving to Google Drive...
              </span>
            </div>
          )}

          {/* Action Buttons */}
          {deliverableReady && !solomonWorking && !isLocking && (
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleLock}
                style={{
                  padding: "16px 40px",
                  background: "linear-gradient(135deg, #10B981, #059669)",
                  borderRadius: 10,
                  border: "none",
                  color: "#FFF",
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Orbitron', monospace",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                🔒 Lock & Continue to Revenue Planner
              </button>
            </div>
          )}

          {/* Still working - show generate button */}
          {!deliverableReady && !solomonWorking && messages.length >= 6 && (
            <button
              onClick={() => {
                triggerSolomonWork(messages);
              }}
              style={{
                padding: "16px 40px",
                background: "linear-gradient(135deg, #2F80FF, #10B981)",
                borderRadius: 10,
                border: "none",
                color: "#FFF",
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Orbitron', monospace",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              🎭 Generate Character Bible
            </button>
          )}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: "16px 24px 24px",
        background: "#111624",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-end",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your AI character's personality..."
            disabled={isLoading || showDeliverable}
            rows={1}
            style={{
              flex: 1,
              padding: "14px 18px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              color: "#F5F7FA",
              fontSize: 15,
              resize: "none",
              minHeight: 50,
              maxHeight: 120,
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading || showDeliverable}
            style={{
              padding: "14px 24px",
              background: input.trim() && !isLoading && !showDeliverable
                ? "linear-gradient(135deg, #2F80FF, #10B981)"
                : "rgba(255,255,255,0.1)",
              borderRadius: 12,
              border: "none",
              color: input.trim() && !isLoading && !showDeliverable ? "#FFF" : "#6B7186",
              fontSize: 15,
              fontWeight: 600,
              cursor: input.trim() && !isLoading && !showDeliverable ? "pointer" : "not-allowed",
            }}
          >
            Send
          </button>
        </div>
        <p style={{
          fontSize: 11,
          color: "#6B7186",
          marginTop: 10,
          textAlign: "center",
        }}>
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #8A8F98;
          animation: pulse 1s infinite;
        }
      `}</style>
    </div>
  );
}
