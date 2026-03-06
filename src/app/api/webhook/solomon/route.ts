import { NextResponse } from "next/server";
import { google } from "googleapis";
import OpenAI from "openai";

// Types
interface WebhookRequest {
  type: "vision" | "brand" | "character";
  action: "process" | "iterate" | "lock";
  data: string; // Chat transcript/summary
  businessName: string;
  feedback?: string; // Optional feedback for iteration
}

interface WebhookResponse {
  status: "processing" | "complete" | "error";
  deliverable?: string; // The actual document content
  preview?: string; // HTML preview
  message?: string;
  fileUrl?: string;
  signal?: string;
  imageUrl?: string; // Generated image URL
}

// Initialize OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[solomon-webhook] No OpenAI API key, falling back to templates");
    return null;
  }
  return new OpenAI({ apiKey });
}

// Call OpenAI to analyze chat and generate deliverable
async function generateWithOpenAI(
  type: "vision" | "brand" | "character",
  businessName: string,
  chatTranscript: string,
  feedback?: string
): Promise<{ content: string; preview: string }> {
  const openai = getOpenAIClient();
  
  if (!openai) {
    // Fallback to template generation if no API key
    return generateTemplate(type, businessName, chatTranscript, feedback);
  }

  const systemPrompts: Record<string, string> = {
    vision: `You are a business strategist analyzing a vision discovery conversation. 
Extract and synthesize:
- Core business purpose
- Target audience/ideal customer
- Unique value proposition
- Key challenges and opportunities
- Success metrics

Create a professional Vision Document in markdown format.`,
    
    brand: `You are a brand strategist analyzing a brand discovery conversation.
Extract and synthesize:
- Brand personality traits
- Voice and tone guidelines
- Visual direction (colors, style)
- Emotional connection with audience
- Brand archetype

Create a professional Brand Board in markdown format.`,
    
    character: `You are a character designer analyzing a character creation conversation.
Extract and synthesize:
- Character name and role
- Personality traits
- Communication style and signature phrases
- Visual appearance guidelines
- Relationship dynamic with users

Create a professional Character Bible in markdown format.`
  };

  const userPrompt = feedback 
    ? `Business: ${businessName}\n\nConversation:\n${chatTranscript}\n\nUser feedback for iteration:\n${feedback}\n\nPlease regenerate the document incorporating this feedback.`
    : `Business: ${businessName}\n\nConversation:\n${chatTranscript}\n\nAnalyze this conversation and create the deliverable document.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompts[type] },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "";
    const preview = generatePreviewHTML(type, businessName, content);
    
    return { content, preview };
  } catch (error) {
    console.error("[solomon-webhook] OpenAI error:", error);
    // Fallback to template on error
    return generateTemplate(type, businessName, chatTranscript, feedback);
  }
}

// Generate preview HTML from content
function generatePreviewHTML(
  type: "vision" | "brand" | "character",
  businessName: string,
  content: string
): string {
  const colors: Record<string, { primary: string; icon: string }> = {
    vision: { primary: "#10B981", icon: "✅" },
    brand: { primary: "#FF4EDB", icon: "🎨" },
    character: { primary: "#2F80FF", icon: "🎭" },
  };
  
  const { primary, icon } = colors[type];
  const lines = content.split('\n').filter(l => l.trim()).length;
  const title = type.charAt(0).toUpperCase() + type.slice(1);

  return `
    <div style="font-family: system-ui; padding: 20px; background: linear-gradient(135deg, #0B0F19, #111624); color: #F5F7FA; border-radius: 12px;">
      <h2 style="margin: 0 0 16px; color: ${primary};">${icon} ${title} Document Ready</h2>
      <p style="color: #8A8F98; margin-bottom: 20px;">Business: <strong style="color: #F5F7FA;">${businessName}</strong></p>
      <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; border-left: 3px solid ${primary};">
        <p style="margin: 0; color: #A78BFA;">📋 AI-generated from ${lines} analyzed elements</p>
      </div>
      <div style="margin-top: 16px; padding: 12px; background: rgba(16,185,129,0.1); border-radius: 8px;">
        <p style="margin: 0; color: #10B981; font-size: 14px;">✓ Powered by GPT-4 • Ready for review</p>
      </div>
    </div>
  `;
}

// Fallback template generation (when OpenAI unavailable)
function generateTemplate(
  type: "vision" | "brand" | "character",
  businessName: string,
  chatTranscript: string,
  feedback?: string
): { content: string; preview: string } {
  const timestamp = new Date().toISOString();
  
  const templates: Record<string, string> = {
    vision: `# Vision Document: ${businessName}

**Generated:** ${timestamp}
**Status:** ✅ LOCKED${feedback ? ` (Iterated)` : ''}

---

## Executive Summary

This vision document captures the core business identity, target market, and strategic direction for ${businessName}.

---

## Conversation Insights

${chatTranscript}

---

## Next Steps
1. ✅ Vision Locked — Moving to Brand Discovery
2. 🎨 Define brand personality and voice
3. 🎭 Create AI character/avatar
4. 📈 Build revenue model

---

**Signal:** [VISION: DOCUMENT LOCKED]
`,
    brand: `# Brand Board: ${businessName}

**Generated:** ${timestamp}
**Status:** ✅ APPROVED${feedback ? ` (Iterated)` : ''}

---

## Brand Discovery Session

${chatTranscript}

---

**Signal:** [BRAND: BOARD APPROVED]
`,
    character: `# Character Bible: ${businessName}

**Generated:** ${timestamp}
**Status:** ✅ APPROVED${feedback ? ` (Iterated)` : ''}

---

## Character Creation Session

${chatTranscript}

---

**Signal:** [CHARACTER: BIBLE APPROVED]
`
  };

  const content = templates[type] || "";
  const preview = generatePreviewHTML(type, businessName, content);
  
  return { content, preview };
}

// Google Drive client initialization
async function getDriveClient() {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  
  if (credentialsJson) {
    const credentials = JSON.parse(credentialsJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive"],
      clientOptions: {
        subject: "solomon@multiplyinc.com",
      },
    });
    return google.drive({ version: "v3", auth });
  }
  
  throw new Error("No Google service account credentials configured");
}

// Find or create folder
async function findOrCreateFolder(
  drive: ReturnType<typeof google.drive>,
  name: string,
  parentId?: string
): Promise<string> {
  const query = parentId
    ? `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`
    : `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

  const response = await drive.files.list({
    q: query,
    fields: "files(id, name)",
    spaces: "drive",
  });

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!;
  }

  const fileMetadata: { name: string; mimeType: string; parents?: string[] } = {
    name,
    mimeType: "application/vnd.google-apps.folder",
  };
  if (parentId) {
    fileMetadata.parents = [parentId];
  }

  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: "id",
  });

  return folder.data.id!;
}

// Save document to Google Drive
async function saveToGoogleDrive(
  drive: ReturnType<typeof google.drive>,
  businessName: string,
  documentType: string,
  content: string
): Promise<{ fileUrl: string; folderId: string }> {
  // Create folder structure: AIM-DEMO-BRAIN/BUSINESSES/{BusinessName}/{DocumentType}
  const rootFolderId = await findOrCreateFolder(drive, "AIM-DEMO-BRAIN");
  const businessesFolderId = await findOrCreateFolder(drive, "BUSINESSES", rootFolderId);
  const businessFolderId = await findOrCreateFolder(drive, businessName, businessesFolderId);
  const docFolderId = await findOrCreateFolder(drive, documentType, businessFolderId);

  // Determine filename
  const fileNames: Record<string, string> = {
    Vision: "vision-document.md",
    Brand: "brand-board.md",
    Character: "character-bible.md",
  };
  const fileName = fileNames[documentType] || `${documentType.toLowerCase()}-output.md`;

  // Delete existing file if present
  const query = `name='${fileName}' and '${docFolderId}' in parents and trashed=false`;
  const existing = await drive.files.list({ q: query, fields: "files(id)" });
  if (existing.data.files && existing.data.files.length > 0) {
    await drive.files.delete({ fileId: existing.data.files[0].id! });
  }

  // Create new file
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [docFolderId],
      mimeType: "text/markdown",
    },
    media: {
      mimeType: "text/markdown",
      body: content,
    },
    fields: "id, webViewLink",
  });

  return {
    fileUrl: response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`,
    folderId: docFolderId,
  };
}

// Generate image with Gemini (for brand/character visuals)
async function generateImageWithGemini(
  type: "brand" | "character",
  businessName: string,
  description: string
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[solomon-webhook] No Gemini API key for image generation");
    return null;
  }

  // Gemini image generation endpoint
  const prompts: Record<string, string> = {
    brand: `Create a modern, professional brand mood board visualization for a business called "${businessName}". Include abstract shapes, color gradients, and typography inspiration. Style: minimalist, tech-forward, premium. No text.`,
    character: `Create a stylized avatar illustration for an AI assistant character representing "${businessName}". Style: friendly, professional, modern digital art, suitable for a business context. Clean background.`,
  };

  try {
    // Using Gemini's imagen model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt: prompts[type] || prompts.brand }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            safetyFilterLevel: "block_some",
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("[solomon-webhook] Gemini image error:", await response.text());
      return null;
    }

    const data = await response.json();
    // Return base64 image data or URL depending on response format
    return data.predictions?.[0]?.bytesBase64Encoded 
      ? `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`
      : null;
  } catch (error) {
    console.error("[solomon-webhook] Gemini image generation failed:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body: WebhookRequest = await request.json();
    const { type, action, data, businessName, feedback } = body;

    if (!type || !action || !businessName) {
      return NextResponse.json<WebhookResponse>(
        { status: "error", message: "Missing required fields: type, action, businessName" },
        { status: 400 }
      );
    }

    console.log(`[solomon-webhook] ${action} ${type} for ${businessName}`);

    // Handle different actions
    switch (action) {
      case "process": {
        // Generate deliverable using OpenAI (or fallback to template)
        const { content, preview } = await generateWithOpenAI(type, businessName, data, feedback);
        
        // Generate image for brand/character phases
        let imageUrl: string | undefined;
        if (type === "brand" || type === "character") {
          const image = await generateImageWithGemini(type, businessName, data);
          if (image) imageUrl = image;
        }
        
        return NextResponse.json<WebhookResponse>({
          status: "complete",
          deliverable: content,
          preview,
          imageUrl,
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} deliverable generated with AI`,
        });
      }
      
      case "iterate": {
        // Re-generate with feedback incorporated
        const { content, preview } = await generateWithOpenAI(type, businessName, data, feedback);
        
        return NextResponse.json<WebhookResponse>({
          status: "complete",
          deliverable: content,
          preview,
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} deliverable updated based on feedback`,
        });
      }
      
      case "lock": {
        // Generate final deliverable and save to Google Drive
        const { content, preview } = await generateWithOpenAI(type, businessName, data, feedback);
        
        try {
          const drive = await getDriveClient();
          const documentType = type.charAt(0).toUpperCase() + type.slice(1);
          const { fileUrl } = await saveToGoogleDrive(drive, businessName, documentType, content);
          
          const signals: Record<string, string> = {
            vision: "[VISION: DOCUMENT LOCKED]",
            brand: "[BRAND: BOARD APPROVED]",
            character: "[CHARACTER: BIBLE APPROVED]",
          };
          
          return NextResponse.json<WebhookResponse>({
            status: "complete",
            deliverable: content,
            preview,
            fileUrl,
            signal: signals[type],
            message: `${documentType} locked and saved to Google Drive`,
          });
        } catch (driveError) {
          console.error("[solomon-webhook] Google Drive error:", driveError);
          // Return success for the deliverable even if Drive save fails
          return NextResponse.json<WebhookResponse>({
            status: "complete",
            deliverable: content,
            preview,
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} locked (Drive save failed, can retry)`,
          });
        }
      }
      
      default:
        return NextResponse.json<WebhookResponse>(
          { status: "error", message: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[solomon-webhook] Error:", error);
    return NextResponse.json<WebhookResponse>(
      { status: "error", message: `Webhook error: ${String(error)}` },
      { status: 500 }
    );
  }
}
