import type { PlanTier } from "@/src/lib/weekly-plan";

// ── Types ──

export type LookingFor = "duo" | "trio";
export type Region = "NA" | "EU" | "OCE" | "SAM" | "ME" | "ASIA";

export interface LfgPost {
  id: string;
  user_id: string;
  looking_for: LookingFor;
  rank: string;
  playlist: string;
  region: Region;
  note: string;
  status: "open" | "closed";
  created_at: string;
  /** Joined from profiles */
  display_name?: string;
}

export interface MessageThread {
  id: string;
  post_id: string;
  starter_id: string;
  receiver_id: string;
  created_at: string;
  last_message?: string;
  last_message_at?: string;
  other_user_name?: string;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

// ── Constants ──

export const REGIONS: readonly Region[] = ["NA", "EU", "OCE", "SAM", "ME", "ASIA"];
export const LOOKING_FOR_OPTIONS: readonly LookingFor[] = ["duo", "trio"];

/** Whether a plan can create posts and send messages. */
export function canUseMatchmaking(plan: PlanTier): boolean {
  return plan === "starter" || plan === "pro";
}

/** Max open posts per user (all plans that can post). */
export const MAX_OPEN_POSTS = 1;

/** Minimum seconds between messages (anti-spam). */
export const MESSAGE_COOLDOWN_SEC = 3;
