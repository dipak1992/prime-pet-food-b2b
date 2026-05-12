/**
 * AI Agent Feature Flags & Configuration
 * Controls which agents are active and their operational parameters.
 */

export type AgentId =
  | "lead_finder"
  | "lead_qualifier"
  | "outreach_drafter"
  | "follow_up"
  | "reorder_predictor"
  | "churn_detector"
  | "sales_copilot";

export interface AgentConfig {
  id: AgentId;
  name: string;
  description: string;
  enabled: boolean;
  schedule?: string; // cron expression
  maxRunsPerDay: number;
  requiresApproval: boolean;
}

export interface AiConfig {
  globalEnabled: boolean;
  provider: "openai" | "anthropic" | "google";
  model: string;
  fallbackModel?: string;
  maxTokens: number;
  temperature: number;
  safetyLimits: {
    maxEmailsPerDay: number;
    maxLeadsPerRun: number;
    businessHoursOnly: boolean;
    businessHoursStart: number; // 0-23
    businessHoursEnd: number; // 0-23
    businessTimezone: string;
    deduplicationWindowHours: number;
  };
  agents: Record<AgentId, AgentConfig>;
}

const defaultAgentConfigs: Record<AgentId, AgentConfig> = {
  lead_finder: {
    id: "lead_finder",
    name: "Lead Finder",
    description: "Discovers potential wholesale leads from Google Places and other sources",
    enabled: false,
    schedule: "0 9 * * 1-5", // 9 AM weekdays
    maxRunsPerDay: 3,
    requiresApproval: false,
  },
  lead_qualifier: {
    id: "lead_qualifier",
    name: "Lead Qualifier",
    description: "Scores and qualifies leads using AI analysis",
    enabled: false,
    schedule: "30 9 * * 1-5",
    maxRunsPerDay: 5,
    requiresApproval: false,
  },
  outreach_drafter: {
    id: "outreach_drafter",
    name: "Outreach Drafter",
    description: "Generates personalized outreach emails for qualified leads",
    enabled: false,
    schedule: "0 10 * * 1-5",
    maxRunsPerDay: 3,
    requiresApproval: true,
  },
  follow_up: {
    id: "follow_up",
    name: "Follow-Up Agent",
    description: "Manages follow-up sequences and generates follow-up drafts",
    enabled: false,
    schedule: "0 10 * * 1-5",
    maxRunsPerDay: 3,
    requiresApproval: true,
  },
  reorder_predictor: {
    id: "reorder_predictor",
    name: "Reorder Predictor",
    description: "Predicts when buyers need to reorder with AI-powered insights",
    enabled: false,
    schedule: "0 8 * * 1-5",
    maxRunsPerDay: 2,
    requiresApproval: false,
  },
  churn_detector: {
    id: "churn_detector",
    name: "Churn Detector",
    description: "Identifies at-risk customers and suggests retention actions",
    enabled: false,
    schedule: "0 8 * * 1",
    maxRunsPerDay: 1,
    requiresApproval: false,
  },
  sales_copilot: {
    id: "sales_copilot",
    name: "Sales Copilot",
    description: "Interactive chat assistant for querying business data and insights",
    enabled: false,
    maxRunsPerDay: 50,
    requiresApproval: false,
  },
};

export const defaultAiConfig: AiConfig = {
  globalEnabled: false,
  provider: "openai",
  model: "gpt-4o-mini",
  fallbackModel: "gpt-4o",
  maxTokens: 2048,
  temperature: 0.7,
  safetyLimits: {
    maxEmailsPerDay: 20,
    maxLeadsPerRun: 25,
    businessHoursOnly: true,
    businessHoursStart: 8,
    businessHoursEnd: 18,
    businessTimezone: "America/Chicago",
    deduplicationWindowHours: 72,
  },
  agents: defaultAgentConfigs,
};

/**
 * Get the current AI configuration.
 * In production, this would load from database/env.
 * For now, uses defaults with env overrides.
 */
export function getAiConfig(): AiConfig {
  const config = { ...defaultAiConfig };

  // Override from environment
  if (process.env.AI_ENABLED === "true") {
    config.globalEnabled = true;
  }

  if (process.env.AI_PROVIDER) {
    config.provider = process.env.AI_PROVIDER as AiConfig["provider"];
  }

  if (process.env.AI_MODEL) {
    config.model = process.env.AI_MODEL;
  }

  if (process.env.AI_MAX_EMAILS_PER_DAY) {
    config.safetyLimits.maxEmailsPerDay = parseInt(process.env.AI_MAX_EMAILS_PER_DAY, 10);
  }

  return config;
}

export function isAgentEnabled(agentId: AgentId): boolean {
  const config = getAiConfig();
  if (!config.globalEnabled) return false;
  return config.agents[agentId]?.enabled ?? false;
}

export function isWithinBusinessHours(): boolean {
  const config = getAiConfig();
  if (!config.safetyLimits.businessHoursOnly) return true;

  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: config.safetyLimits.businessTimezone,
    hour: "numeric",
    hour12: false,
  });
  const hour = parseInt(formatter.format(now), 10);

  return hour >= config.safetyLimits.businessHoursStart && hour < config.safetyLimits.businessHoursEnd;
}
