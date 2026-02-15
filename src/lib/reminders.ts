import { createClient } from "@/src/lib/supabase/client";

export interface ReminderSettings {
  reminder_enabled: boolean;
  reminder_days: string[];
  reminder_time: string | null;
}

const DEFAULT: ReminderSettings = {
  reminder_enabled: false,
  reminder_days: [],
  reminder_time: null,
};

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export type WeekdayKey = (typeof DAY_KEYS)[number];

export const ALL_DAYS: { key: WeekdayKey; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

/** Get the weekday key ('mon'..'sun') for a given Date. */
export function getWeekdayKey(date: Date = new Date()): WeekdayKey {
  return DAY_KEYS[date.getDay()];
}

/** Should we show the training reminder nudge? */
export function shouldShowReminder(
  settings: { enabled: boolean; days: string[] },
  trainedToday: boolean
): boolean {
  if (!settings.enabled) return false;
  if (trainedToday) return false;
  const today = getWeekdayKey();
  return settings.days.includes(today);
}

export async function fetchReminderSettings(): Promise<ReminderSettings> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return DEFAULT;

    const { data } = await supabase
      .from("profiles")
      .select("reminder_enabled, reminder_days, reminder_time")
      .eq("id", user.id)
      .single();

    if (!data) return DEFAULT;

    return {
      reminder_enabled: data.reminder_enabled ?? false,
      reminder_days: data.reminder_days ?? [],
      reminder_time: data.reminder_time ?? null,
    };
  } catch {
    return DEFAULT;
  }
}

export async function saveReminderSettings(
  settings: ReminderSettings
): Promise<boolean> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from("profiles")
      .update({
        reminder_enabled: settings.reminder_enabled,
        reminder_days: settings.reminder_days,
        reminder_time: settings.reminder_time,
      })
      .eq("id", user.id);

    return !error;
  } catch {
    return false;
  }
}
