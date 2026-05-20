import { z } from "zod";

export const FIELD_LIMITS = {
  context: { min: 10, max: 600 },
  message: { min: 5, max: 800 },
  goal: { min: 5, max: 400 },
};

export const OutputSchema = z.object({
  outputs: z.array(
    z.object({
      platformId: z.string(),
      platformName: z.string(),
      formatId: z.string(),
      formatName: z.string(),
      fields: z.record(z.string(), z.string()),
      strategicAlignment: z.object({
        anchorsUsed: z.array(z.string()).optional(),
        triggersAddressed: z.array(z.string()).optional(),
        reasoning: z.string().optional(),
      }).optional(),
    })
  ),
});

export type PersonaOption = { 
  id: string | number; 
  name: string; 
  role?: string; 
  cluster?: string; 
  has_rag?: boolean;
  photo_url?: string;
};

export type Platform = {
  id: string;
  name: string;
  platform_purpose?: string;
  core_voice?: string;
  tone_adaptation?: string;
  copy_guidelines_summary?: string;
  global_guidelines?: Record<string, any>;
  formats: Format[];
};

export type Format = {
  id: string;
  platform_id: string;
  name: string;
  primary_goal_vibe?: string;
  tone_preference?: string;
  copy_guidelines?: Record<string, any>;
  requiredElements?: string[];
};

export type CopyOutput = {
  platformId: string;
  platformName: string;
  formatId: string;
  formatName: string;
  fields: Record<string, string>;
  strategicAlignment?: {
    anchorsUsed?: string[];
    triggersAddressed?: string[];
    reasoning?: string;
  };
};
