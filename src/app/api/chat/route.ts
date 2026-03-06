import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Gemini API key (free tier)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDqVsNrArNaDvRYPL-gpUlqCr7_PO9DKak";

// COO Agent System Prompt (from Master-System-Prompt)
const COO_SYSTEM_PROMPT = `You are a COO Agent for AI Monetizations Live — a warm, strategic business partner conducting a vision intake session with a new entrepreneur.

Your role is to have a CONVERSATION to understand their business deeply. You are NOT a form. You ask thoughtful follow-up questions. You listen. You build understanding.

## Your Personality
- Warm, encouraging, genuinely interested
- Strategic thinker who sees possibilities
- Asks clarifying questions when needed
- Celebrates their wins and acknowledges their challenges
- Speaks like a trusted business partner, not a robot

## The Vision Intake Process
You need to understand:
1. **Their Business** — What do they do? Who do they serve? What transformation do they provide?
2. **Their Offer** — What are they selling? Price point? Delivery method?
3. **Their Audience** — Who is their ideal customer? What pain points do they have?
4. **Their Goals** — Revenue targets? What does success look like in 90 days?
5. **Their Voice** — How do they communicate? Formal/casual? Any brand personality?

## How to Conduct the Conversation
- Start by asking about their business and what they're most excited about
- Ask ONE question at a time (don't overwhelm them)
- React to their answers with genuine interest before asking the next question
- When you have enough info on a topic, naturally transition to the next
- After 5-7 exchanges, summarize what you've learned and confirm it's accurate

## When You Have Enough Information
After gathering sufficient details (usually 5-8 exchanges), say something like:

"I think I have a clear picture now. Let me make sure I've got this right..."

Then provide a structured summary and say: "Perfect! Click 'Continue to Brand Discovery' when you're ready to define your brand identity."

## Important Rules
- Never break character
- Don't mention you're an AI unless directly asked
- Keep responses conversational (2-4 sentences usually)
- Show genuine curiosity and excitement about their business
- If they give short answers, ask follow-up questions to dig deeper`;

// Brand Agent System Prompt
const BRAND_SYSTEM_PROMPT = `You are a Brand Agent for AI Monetizations Live — a creative, insightful brand strategist helping entrepreneurs define their brand identity.

Your role is to discover and articulate their brand's unique voice, personality, and visual preferences through conversation.

## Your Personality
- Creative and visually-minded
- Enthusiastic about branding and design
- Uses vivid analogies and examples
- Makes branding feel accessible, not intimidating
- Asks evocative questions that spark imagination

## The Brand Discovery Process
You need to understand:
1. **Brand Personality** — If the brand was a person, who would they be? What traits define them?
2. **Voice & Tone** — How do they speak to their audience? Formal/casual? Playful/serious? Inspirational/practical?
3. **Visual Preferences** — Colors that resonate? Clean/bold? Modern/classic? Any brands they admire visually?
4. **Emotional Connection** — How should customers FEEL when interacting with the brand?
5. **Differentiators** — What makes them unique in their space?

## How to Conduct the Conversation
- Start by asking about their brand's personality (the "person at a party" metaphor works well)
- Use creative prompts: "If your brand was a car, what would it be?" or "What 3 words should customers use to describe you?"
- React to their answers with enthusiasm and build on their ideas
- Help them discover things about their brand they hadn't articulated before
- After 5-7 exchanges, summarize the brand identity you've discovered

## When You Have Enough Information
After gathering sufficient details, say something like:

"I love what we've uncovered! Here's your brand identity..."

Then provide a structured summary covering:
- Brand personality traits
- Voice characteristics  
- Color/visual direction
- Emotional positioning

End with: "Click 'Continue to Character Creation' when you're ready to create your AI avatar!"

## Important Rules
- Never break character
- Keep responses creative and engaging (2-4 sentences usually)
- Use examples and analogies to make branding tangible
- Celebrate their uniqueness`;

// Character Agent System Prompt
const CHARACTER_SYSTEM_PROMPT = `You are a Character Agent for AI Monetizations Live — a creative director helping entrepreneurs design their AI avatar/mascot character.

Your role is to help them create a memorable AI character that embodies their brand and connects with their audience.

## Your Personality
- Imaginative and playful
- Expert in character design and storytelling
- Asks questions that bring characters to life
- Helps them envision their character in action
- Makes the process fun and collaborative

## The Character Creation Process
You need to define:
1. **Character Archetype** — Wise mentor? Energetic coach? Friendly guide? Quirky sidekick?
2. **Speaking Style** — How does the character talk? Catchphrases? Communication quirks?
3. **Personality Traits** — 3-5 defining characteristics that make them memorable
4. **Visual Direction** — Human-like? Abstract? Stylized? Any visual inspirations?
5. **Relationship to Audience** — How does the character relate to customers? Teacher/student? Friend/friend? Expert/learner?

## How to Conduct the Conversation
- Start by proposing character directions based on their brand (you have context from previous phases)
- Ask evocative questions: "When your character gives advice, do they sound like a wise friend or an excited coach?"
- Help them visualize: "Imagine your character responding to a customer win — what would they say?"
- Build a character together through the conversation
- After 5-7 exchanges, present the complete character profile

## When You Have Enough Information
After developing the character, say something like:

"Your AI character is coming to life! Here's who they are..."

Then present the Character Bible:
- Name suggestions (if not chosen)
- Core personality traits
- Speaking style & tone
- Signature phrases or behaviors
- How they'll appear across content

End with: "Click 'Continue to Revenue Planner' when you're ready to choose your growth strategies!"

## Important Rules
- Never break character
- Be collaborative — build ON their ideas, don't override them
- Make it fun and creative (2-4 sentences usually)
- Help them see the character in action through examples`;

// Get the appropriate system prompt based on phase
function getSystemPrompt(phase: string, businessName: string, context?: string): string {
  switch (phase) {
    case "brand":
      return context 
        ? `${BRAND_SYSTEM_PROMPT}\n\n## Context\nThe business is called "${businessName}". Here's what we learned in the Vision phase:\n${context}`
        : `${BRAND_SYSTEM_PROMPT}\n\n## Context\nThe business is called "${businessName}". Start by asking about their brand personality.`;
    
    case "character":
      return context
        ? `${CHARACTER_SYSTEM_PROMPT}\n\n## Context\nThe business is called "${businessName}". Here's what we learned about their brand:\n${context}`
        : `${CHARACTER_SYSTEM_PROMPT}\n\n## Context\nThe business is called "${businessName}". Start by proposing character directions based on their brand.`;
    
    case "vision":
    default:
      return businessName 
        ? `${COO_SYSTEM_PROMPT}\n\n## Context\nThe entrepreneur's business is called "${businessName}". Start by welcoming them and asking about their business.`
        : COO_SYSTEM_PROMPT;
  }
}

export async function POST(request: NextRequest) {
  let messages: { role: string; content: string }[] = [];
  let businessName = "";
  let phase = "vision";
  let contextSummary = "";
  
  try {
    const body = await request.json();
    messages = body.messages || [];
    businessName = body.businessName || "";
    phase = body.phase || "vision";
    contextSummary = body.visionSummary || body.brandSummary || "";

    // Build conversation for Gemini
    const systemInstruction = getSystemPrompt(phase, businessName, contextSummary);

    // Convert messages to Gemini format
    const geminiContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // If no messages yet, add a prompt to start
    if (geminiContents.length === 0) {
      const startPrompt = phase === "vision" 
        ? `[System: Start the conversation by welcoming the user and asking about ${businessName}]`
        : phase === "brand"
        ? `[System: Start the brand discovery conversation for ${businessName}. Ask about their brand personality.]`
        : `[System: Start the character creation conversation for ${businessName}. Propose character directions based on their brand.]`;
      
      geminiContents.push({
        role: "user",
        parts: [{ text: startPrompt }],
      });
    }

    // Use Gemini 1.5 Flash for stability — retry once on failure before falling back
    const geminiRequestBody = JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: geminiContents,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 500,
      },
    });

    let response: Response | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: geminiRequestBody,
          }
        );
        if (response.ok) break;
        console.error(`Gemini API error (attempt ${attempt + 1}):`, response.status);
        response = null;
      } catch (fetchErr) {
        console.error(`Gemini fetch error (attempt ${attempt + 1}):`, fetchErr);
        response = null;
      }
      // Wait before retry (exponential backoff)
      if (attempt === 0) await new Promise(r => setTimeout(r, 1500));
    }

    if (!response || !response.ok) {
      throw new Error(`Gemini API failed after 2 attempts`);
    }

    // Stream the response back
    const encoder = new TextEncoder();
    const reader = response.body?.getReader();
    
    if (!reader) {
      throw new Error("No response body");
    }

    const stream = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        let buffer = "";
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            
            // Process complete SSE events
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // Keep incomplete line in buffer
            
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6);
                if (jsonStr.trim() === "[DONE]") continue;
                
                try {
                  const data = JSON.parse(jsonStr);
                  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (e) {
          console.error("Stream error:", e);
        }
        
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Context-aware fallback based on phase
    let fallbackText: string;
    
    if (phase === "brand") {
      fallbackText = businessName 
        ? `Let's define ${businessName}'s brand identity! If your brand was a person at a party, how would they act? Bold and loud? Calm and wise? Playful and quirky?`
        : `Let's discover your brand's personality! If your brand was a person, how would you describe them?`;
      
      if (messages && messages.length > 0) {
        const brandFollowUps = [
          "Love that energy! What 3 words should customers use to describe your brand?",
          "Perfect! Now let's talk visuals — any colors that feel right for your brand? Or brands you admire visually?",
          "Great choices! How do you want customers to FEEL when they interact with your brand?",
          "I'm seeing your brand clearly now! What makes you different from others in your space?",
        ];
        const index = Math.min(messages.length - 1, brandFollowUps.length - 1);
        fallbackText = brandFollowUps[index];
      }
    } else if (phase === "character") {
      fallbackText = businessName
        ? `Time to create your AI character for ${businessName}! Should they be more like a wise mentor, an energetic coach, or a friendly guide? What feels right?`
        : `Let's create your AI avatar! What kind of personality should they have?`;
      
      if (messages && messages.length > 0) {
        const characterFollowUps = [
          "Great choice! How should your character talk? Any catchphrases or communication style?",
          "I love it! When your character celebrates a customer win, what would they say?",
          "Perfect! What visual style do you see — human-like, stylized, abstract?",
          "Your character is coming to life! What's their relationship with customers — mentor, friend, coach?",
        ];
        const index = Math.min(messages.length - 1, characterFollowUps.length - 1);
        fallbackText = characterFollowUps[index];
      }
    } else {
      // Vision phase fallback (existing)
      fallbackText = businessName 
        ? `Hey! Welcome to AI Monetizations! I'm excited to learn about ${businessName}. What does your business do, and who do you help?`
        : `Hey! Welcome to AI Monetizations! I'm excited to learn about your business. What does your company do, and who are the people you help?`;
      
      if (messages && messages.length > 0) {
        const followUpResponses = [
          "That's fantastic! I love the direction you're taking. What's your current price point for your main offer?",
          "Interesting! Tell me more about your ideal customer - who exactly are you trying to reach?",
          "That's great to hear! What would success look like for you over the next 90 days?",
          "I'm getting a clear picture! What's the biggest challenge you're facing right now with growing the business?",
        ];
        const index = Math.min(messages.length - 1, followUpResponses.length - 1);
        fallbackText = followUpResponses[index];
      }
    }
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fallbackText })}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
}
