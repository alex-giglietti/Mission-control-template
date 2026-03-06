import { NextResponse } from "next/server";
import { google } from "googleapis";
import * as path from "path";

// Parent folder ID for AIM-DEMO-BRAIN (we'll create if needed)
const AIM_DEMO_ROOT_NAME = "AIM-DEMO-BRAIN";

interface SaveOutputRequest {
  businessName: string;
  protocol: "vision" | "brand" | "character";
  content: string;
  fileName?: string;
}

// Initialize Google Drive client with impersonation
async function getDriveClient() {
  // Check for environment variable first (for Vercel deployment)
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  
  if (credentialsJson) {
    console.log("[save-output] Using credentials from environment variable");
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
  
  // Fall back to file-based credentials (for local development)
  const possiblePaths = [
    "/Users/solomonmoltbot/.openclaw/workspace/config/google-service-account.json",
    path.join(process.cwd(), "..", "config", "google-service-account.json"),
    path.join(process.cwd(), "config", "google-service-account.json"),
  ];
  
  let keyFilePath = possiblePaths[0];
  
  // Use the first path that exists
  for (const p of possiblePaths) {
    try {
      require("fs").accessSync(p);
      keyFilePath = p;
      break;
    } catch {
      continue;
    }
  }
  
  console.log("[save-output] Using key file:", keyFilePath);
  
  const auth = new google.auth.GoogleAuth({
    keyFile: keyFilePath,
    scopes: ["https://www.googleapis.com/auth/drive"],
    clientOptions: {
      subject: "solomon@multiplyinc.com",
    },
  });

  return google.drive({ version: "v3", auth });
}

// Find or create a folder by name under a parent
async function findOrCreateFolder(
  drive: ReturnType<typeof google.drive>,
  name: string,
  parentId?: string
): Promise<string> {
  // Search for existing folder
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

  // Create new folder
  const fileMetadata: any = {
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

// Create a markdown file in Google Drive
async function createMarkdownFile(
  drive: ReturnType<typeof google.drive>,
  name: string,
  content: string,
  parentId: string
): Promise<{ id: string; url: string }> {
  // Check if file already exists and delete it
  const query = `name='${name}' and '${parentId}' in parents and trashed=false`;
  const existing = await drive.files.list({
    q: query,
    fields: "files(id)",
  });

  if (existing.data.files && existing.data.files.length > 0) {
    await drive.files.delete({ fileId: existing.data.files[0].id! });
  }

  // Create new file
  const response = await drive.files.create({
    requestBody: {
      name,
      parents: [parentId],
      mimeType: "text/markdown",
    },
    media: {
      mimeType: "text/markdown",
      body: content,
    },
    fields: "id, webViewLink",
  });

  return {
    id: response.data.id!,
    url: response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`,
  };
}

// Generate structured markdown content based on protocol
function generateMarkdownContent(
  protocol: "vision" | "brand" | "character",
  businessName: string,
  rawContent: string
): string {
  const timestamp = new Date().toISOString();

  switch (protocol) {
    case "vision":
      return `# Vision Intake: ${businessName}

**Generated:** ${timestamp}  
**Protocol:** VISION INTAKE  
**Status:** ✅ COMPLETE

---

## Conversation Summary

${rawContent}

---

## Extracted Insights

*Vision insights extracted from conversation above*

### Business Overview
- Business Name: ${businessName}
- Industry/Niche: [Extracted from conversation]
- Target Audience: [Extracted from conversation]

### Core Values
[Extracted from conversation]

### Key Goals
[Extracted from conversation]

---

**Signal:** [VISION: INTAKE COMPLETE]
`;

    case "brand":
      return `# Brand Board: ${businessName}

**Generated:** ${timestamp}  
**Protocol:** BRAND DISCOVERY  
**Status:** ✅ APPROVED

---

## Brand Discovery Conversation

${rawContent}

---

## Brand Identity

### Personality
[Extracted from conversation]

### Voice & Tone
[Extracted from conversation]

### Visual Direction
[Extracted from conversation]

### Key Messages
[Extracted from conversation]

---

**Signal:** [BRAND: BOARD APPROVED]
`;

    case "character":
      return `# Character Bible: ${businessName}

**Generated:** ${timestamp}  
**Protocol:** CHARACTER CREATION  
**Status:** ✅ APPROVED

---

## Character Creation Conversation

${rawContent}

---

## AI Character Profile

### Name & Identity
[Extracted from conversation]

### Personality Traits
[Extracted from conversation]

### Communication Style
[Extracted from conversation]

### Background Story
[Extracted from conversation]

### Key Behaviors
[Extracted from conversation]

---

**Signal:** [CHARACTER: BIBLE APPROVED]
`;

    default:
      return rawContent;
  }
}

export async function POST(request: Request) {
  try {
    const body: SaveOutputRequest = await request.json();
    const { businessName, protocol, content, fileName } = body;

    if (!businessName || !protocol || !content) {
      return NextResponse.json(
        { error: "Missing required fields: businessName, protocol, content" },
        { status: 400 }
      );
    }

    console.log(`[save-output] Saving ${protocol} output for ${businessName}`);

    const drive = await getDriveClient();

    // Create folder structure: AIM-DEMO-BRAIN/BUSINESSES/{BusinessName}/{Protocol}/
    const rootFolderId = await findOrCreateFolder(drive, AIM_DEMO_ROOT_NAME);
    const businessesFolderId = await findOrCreateFolder(drive, "BUSINESSES", rootFolderId);
    const businessFolderId = await findOrCreateFolder(drive, businessName, businessesFolderId);
    const protocolFolderId = await findOrCreateFolder(
      drive,
      protocol.charAt(0).toUpperCase() + protocol.slice(1), // Capitalize
      businessFolderId
    );

    // Generate structured markdown
    const markdownContent = generateMarkdownContent(protocol, businessName, content);

    // Determine file name
    let outputFileName: string;
    switch (protocol) {
      case "vision":
        outputFileName = fileName || "vision-intake.md";
        break;
      case "brand":
        outputFileName = fileName || "brand-board.md";
        break;
      case "character":
        outputFileName = fileName || "character-bible.md";
        break;
      default:
        outputFileName = fileName || `${protocol}-output.md`;
    }

    // Create the file
    const file = await createMarkdownFile(drive, outputFileName, markdownContent, protocolFolderId);

    console.log(`[save-output] File created: ${file.id} - ${file.url}`);

    // Return success with file info and signal
    const signal = protocol === "vision"
      ? "[VISION: INTAKE COMPLETE]"
      : protocol === "brand"
      ? "[BRAND: BOARD APPROVED]"
      : "[CHARACTER: BIBLE APPROVED]";

    return NextResponse.json({
      success: true,
      fileId: file.id,
      fileUrl: file.url,
      signal,
      folderPath: `AIM-DEMO-BRAIN/BUSINESSES/${businessName}/${protocol.charAt(0).toUpperCase() + protocol.slice(1)}`,
    });
  } catch (error) {
    console.error("[save-output] Error:", error);
    return NextResponse.json(
      { error: "Failed to save output to Google Drive", details: String(error) },
      { status: 500 }
    );
  }
}
