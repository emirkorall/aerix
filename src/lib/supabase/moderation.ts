import { createClient } from "./client";

export type ReportTargetType = "post" | "message" | "user";

export const REPORT_REASONS = [
  "Spam",
  "Harassment",
  "Scam",
  "Other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

// ── Reports ──

/** Max reports a user can submit per hour. */
const MAX_REPORTS_PER_HOUR = 3;

/** Check if user has exceeded the hourly report limit. */
async function canReport(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("reporter_id", user.id)
    .gte("created_at", oneHourAgo);

  return (count ?? 0) < MAX_REPORTS_PER_HOUR;
}

/** Submit a report. Returns true on success. */
export async function submitReport(fields: {
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  details?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const allowed = await canReport();
  if (!allowed) {
    return { ok: false, error: "Report limit reached. Try again later." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: fields.target_type,
    target_id: fields.target_id,
    reason: fields.reason,
    details: fields.details?.trim().slice(0, 500) || null,
  });

  if (error) {
    console.warn("[aerix] submitReport failed:", error);
    return { ok: false, error: "Failed to submit report." };
  }
  return { ok: true };
}

// ── Blocks ──

/** Fetch all user IDs the current user has blocked. */
export async function fetchBlockedUserIds(): Promise<Set<string>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from("blocks")
    .select("blocked_user_id")
    .eq("blocker_id", user.id);

  return new Set(
    (data ?? []).map((r: { blocked_user_id: string }) => r.blocked_user_id)
  );
}

/** Block a user. Returns true on success. */
export async function blockUser(
  blockedUserId: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  if (user.id === blockedUserId)
    return { ok: false, error: "Cannot block yourself." };

  const { error } = await supabase.from("blocks").upsert(
    { blocker_id: user.id, blocked_user_id: blockedUserId },
    { onConflict: "blocker_id,blocked_user_id" }
  );

  if (error) {
    console.warn("[aerix] blockUser failed:", error);
    return { ok: false, error: "Failed to block user." };
  }
  return { ok: true };
}

/** Unblock a user. */
export async function unblockUser(blockedUserId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("blocks")
    .delete()
    .eq("blocker_id", user.id)
    .eq("blocked_user_id", blockedUserId);
}

// ── Server-side message timestamp check ──

/** Check if user's last message in thread was sent within cooldown seconds. */
export async function isMessageCooldownActive(
  threadId: string,
  cooldownSec: number
): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return true;

  const cutoff = new Date(
    Date.now() - cooldownSec * 1000
  ).toISOString();

  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("thread_id", threadId)
    .eq("sender_id", user.id)
    .gte("created_at", cutoff);

  return (count ?? 0) > 0;
}
