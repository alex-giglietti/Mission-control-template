import { getAdminClient } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OAuthConfig {
  client_id: string;
  client_secret: string;
  authorize_url: string;
  token_url: string;
  scopes: string[];
  token_format?: string;
}

export interface ServiceMeta {
  id: string;
  name: string;
  icon: string;
  authType: "oauth2" | "api_key";
  description: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const BASE_URL: string =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * Registry of all built-in services the platform supports, including both
 * OAuth2 and API-key-based integrations.
 */
export const BUILT_IN_SERVICES: ServiceMeta[] = [
  {
    id: "google",
    name: "Google Workspace",
    icon: "\uD83D\uDCE7", // envelope emoji
    authType: "oauth2",
    description:
      "Gmail, Google Calendar, Google Drive, and other Google Workspace APIs",
  },
  {
    id: "ghl",
    name: "GoHighLevel",
    icon: "\uD83D\uDE80", // rocket emoji
    authType: "oauth2",
    description:
      "CRM, marketing automation, and business management platform",
  },
  {
    id: "meta",
    name: "Meta Business",
    icon: "\uD83D\uDCF1", // mobile phone emoji
    authType: "oauth2",
    description:
      "Facebook, Instagram, and WhatsApp business APIs",
  },
  {
    id: "zoom",
    name: "Zoom",
    icon: "\uD83C\uDFA5", // video camera emoji
    authType: "oauth2",
    description: "Video conferencing, webinars, and meeting management",
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    icon: "\uD83D\uDCB0", // money bag emoji
    authType: "oauth2",
    description: "Accounting, invoicing, and financial management",
  },
  {
    id: "stripe",
    name: "Stripe",
    icon: "\uD83D\uDCB3", // credit card emoji
    authType: "api_key",
    description: "Payment processing, subscriptions, and billing",
  },
  {
    id: "klaviyo",
    name: "Klaviyo",
    icon: "\uD83D\uDCE8", // incoming envelope emoji
    authType: "api_key",
    description: "Email and SMS marketing automation",
  },
  {
    id: "supabase",
    name: "Supabase",
    icon: "\u26A1", // lightning emoji
    authType: "api_key",
    description: "Open-source backend-as-a-service with Postgres database",
  },
  {
    id: "vercel",
    name: "Vercel",
    icon: "\u25B2", // triangle emoji
    authType: "api_key",
    description: "Frontend deployment and serverless functions platform",
  },
  {
    id: "nanobanana",
    name: "NanoBanana 2",
    icon: "\uD83C\uDF4C", // banana emoji
    authType: "api_key",
    description: "NanoBanana 2 integration service",
  },
  {
    id: "mission-control",
    name: "Mission Control",
    icon: "\uD83C\uDFAF", // bullseye emoji
    authType: "api_key",
    description: "Mission Control project management and operations hub",
  },
];

// ---------------------------------------------------------------------------
// Built-in OAuth2 configurations
// ---------------------------------------------------------------------------

interface BuiltInOAuthSpec {
  envPrefix: string;
  authorize_url: string;
  token_url: string;
  scopes: string[];
}

const BUILT_IN_OAUTH: Record<string, BuiltInOAuthSpec> = {
  google: {
    envPrefix: "GOOGLE",
    authorize_url: "https://accounts.google.com/o/oauth2/v2/auth",
    token_url: "https://oauth2.googleapis.com/token",
    scopes: [
      "openid",
      "email",
      "profile",
      // Gmail
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/gmail.settings.basic",
      "https://www.googleapis.com/auth/gmail.labels",
      // Calendar
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
      // Drive
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      // Docs & Sheets
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/spreadsheets",
      // YouTube
      "https://www.googleapis.com/auth/youtube",
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.force-ssl",
      "https://www.googleapis.com/auth/yt-analytics.readonly",
      // Google Ads
      "https://www.googleapis.com/auth/adwords",
      // Google Business Profile
      "https://www.googleapis.com/auth/business.manage",
    ],
  },
  ghl: {
    envPrefix: "GHL",
    authorize_url:
      "https://marketplace.gohighlevel.com/oauth/chooselocation",
    token_url:
      "https://services.leadconnectorhq.com/oauth/token",
    scopes: [
      // Businesses
      "businesses.readonly", "businesses.write",
      // Calendars
      "calendars.readonly", "calendars.write",
      "calendars/groups.readonly", "calendars/groups.write",
      "calendars/resources.readonly", "calendars/resources.write",
      "calendars/events.readonly", "calendars/events.write",
      // Campaigns
      "campaigns.readonly",
      // Contacts
      "contacts.readonly", "contacts.write",
      // Custom Objects
      "objects/schema.readonly", "objects/schema.write",
      "objects/record.readonly", "objects/record.write",
      // Conversations
      "conversations.readonly", "conversations.write",
      "conversations/message.readonly", "conversations/message.write",
      // Forms
      "forms.readonly", "forms.write",
      // Invoices
      "invoices.readonly", "invoices.write",
      "invoices/schedule.readonly", "invoices/schedule.write",
      "invoices/template.readonly", "invoices/template.write",
      "invoices/estimate.readonly", "invoices/estimate.write",
      // Links
      "links.readonly", "links.write",
      // Locations
      "locations.readonly", "locations.write",
      "locations/customValues.readonly", "locations/customValues.write",
      "locations/customFields.readonly", "locations/customFields.write",
      "locations/tags.readonly", "locations/tags.write",
      "locations/templates.readonly",
      "locations/tasks.readonly",
      // Media
      "medias.readonly", "medias.write",
      // Funnels
      "funnels/redirect.readonly", "funnels/redirect.write",
      "funnels/page.readonly",
      "funnels/funnel.readonly",
      "funnels/pagecount.readonly",
      // Opportunities
      "opportunities.readonly", "opportunities.write",
      // Payments
      "payments/integration.readonly", "payments/integration.write",
      "payments/orders.readonly", "payments/orders.write",
      "payments/transactions.readonly",
      "payments/subscriptions.readonly",
      "payments/coupons.readonly", "payments/coupons.write",
      "payments/custom-provider.readonly", "payments/custom-provider.write",
      // Products
      "products.readonly", "products.write",
      "products/prices.readonly", "products/prices.write",
      "products/collection.readonly", "products/collection.write",
      // OAuth
      "oauth.readonly", "oauth.write",
      // SaaS
      "saas/location.read", "saas/location.write",
      "saas/company.write",
      // Snapshots
      "snapshots.readonly", "snapshots.write",
      // Social Planner
      "socialplanner/account.readonly", "socialplanner/account.write",
      "socialplanner/csv.readonly", "socialplanner/csv.write",
      "socialplanner/category.readonly",
      "socialplanner/oauth.readonly", "socialplanner/oauth.write",
      "socialplanner/post.readonly", "socialplanner/post.write",
      "socialplanner/tag.readonly",
      "socialplanner/statistics.readonly",
      // Surveys
      "surveys.readonly",
      // Users
      "users.readonly", "users.write",
      // Workflows
      "workflows.readonly",
      // Courses
      "courses.write",
      // Blogs
      "blogs/post.write", "blogs/post-update.write",
      "blogs/check-slug.readonly",
      "blogs/category.readonly",
      "blogs/author.readonly",
      // Companies
      "companies.readonly",
      // Associations
      "associations.readonly", "associations.write",
      "associations/relation.readonly", "associations/relation.write",
      // Email Builder
      "emails/builder.readonly", "emails/builder.write",
      "emails/schedule.readonly",
      // Custom Menu
      "custom-menu-link.readonly", "custom-menu-link.write",
      // Documents/Contracts
      "documents_contracts/list.readonly",
      "documents_contracts/sendlink.write",
      "documents_contracts_templates/list.readonly",
      "documents_contracts_templates/sendlink.write",
      // Marketplace
      "marketplace-installer-details.readonly",
      "charges.readonly", "charges.write",
      // Voice AI
      "voice-ai-dashboard.readonly",
      "voice-ai-agents.readonly", "voice-ai-agents.write",
      "voice-ai-agent-goals.readonly", "voice-ai-agent-goals.write",
      // Phone
      "phonenumbers.read",
      "numberpools.read",
    ],
  },
  meta: {
    envPrefix: "META",
    authorize_url: "https://www.facebook.com/v19.0/dialog/oauth",
    token_url:
      "https://graph.facebook.com/v19.0/oauth/access_token",
    scopes: [
      "email",
      "public_profile",
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
      "pages_manage_metadata",
      "pages_messaging",
      "instagram_basic",
      "instagram_content_publish",
      "instagram_manage_comments",
      "instagram_manage_insights",
      "ads_management",
      "ads_read",
      "leads_retrieval",
      "business_management",
      "catalog_management",
      "read_insights",
      "whatsapp_business_management",
      "whatsapp_business_messaging",
    ],
  },
  zoom: {
    envPrefix: "ZOOM",
    authorize_url: "https://zoom.us/oauth/authorize",
    token_url: "https://zoom.us/oauth/token",
    scopes: [
      "meeting:read", "meeting:write",
      "webinar:read", "webinar:write",
      "recording:read", "recording:write",
      "phone:read", "phone:write",
      "chat_message:read", "chat_message:write",
      "chat_channel:read", "chat_channel:write",
      "report:read",
      "user:read", "user:write",
      "contact:read", "contact:write",
      "group:read", "group:write",
      "dashboard:read",
      "billing:read",
      "account:read", "account:write",
      "pac:read", "pac:write",
    ],
  },
  quickbooks: {
    envPrefix: "QUICKBOOKS",
    authorize_url:
      "https://appcenter.intuit.com/connect/oauth2",
    token_url:
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
    scopes: [
      "com.intuit.quickbooks.accounting",
      "com.intuit.quickbooks.payment",
      "openid",
      "profile",
      "email",
      "phone",
      "address",
    ],
  },
};

// ---------------------------------------------------------------------------
// getOAuthConfig
// ---------------------------------------------------------------------------

/**
 * Retrieve OAuth configuration for a service.
 *
 * - For built-in OAuth2 services, config is derived from environment variables
 *   and hard-coded endpoint URLs.
 * - For custom services (id starts with "custom:"), config is loaded from the
 *   `custom_connectors` table using the provided userId and slug.
 *
 * @param service  Service identifier (e.g. "google", "custom:my-app").
 * @param userId   Required when loading custom connectors.
 */
export async function getOAuthConfig(
  service: string,
  userId?: string
): Promise<OAuthConfig> {
  // ---- Custom connectors ----
  if (service.startsWith("custom:")) {
    if (!userId) {
      throw new Error(
        "userId is required when loading a custom connector config"
      );
    }

    const slug = service.slice("custom:".length);
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("custom_connectors")
      .select(
        "client_id, client_secret, authorize_url, token_url, scopes, token_format"
      )
      .eq("user_id", userId)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Database error loading custom connector "${slug}": ${error.message}`
      );
    }
    if (!data) {
      throw new Error(
        `Custom connector "${slug}" not found for user ${userId}`
      );
    }

    return {
      client_id: data.client_id,
      client_secret: data.client_secret,
      authorize_url: data.authorize_url,
      token_url: data.token_url,
      scopes: data.scopes ?? [],
      token_format: data.token_format ?? undefined,
    };
  }

  // ---- Built-in OAuth2 services ----
  const spec = BUILT_IN_OAUTH[service];
  if (!spec) {
    throw new Error(
      `Unknown OAuth service "${service}". ` +
        `Built-in services: ${Object.keys(BUILT_IN_OAUTH).join(", ")}`
    );
  }

  const clientId = process.env[`${spec.envPrefix}_CLIENT_ID`];
  const clientSecret = process.env[`${spec.envPrefix}_CLIENT_SECRET`];

  if (!clientId || !clientSecret) {
    throw new Error(
      `Missing environment variables ${spec.envPrefix}_CLIENT_ID and/or ` +
        `${spec.envPrefix}_CLIENT_SECRET for service "${service}"`
    );
  }

  return {
    client_id: clientId,
    client_secret: clientSecret,
    authorize_url: spec.authorize_url,
    token_url: spec.token_url,
    scopes: spec.scopes,
  };
}
