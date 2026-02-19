"use client";

import { Link } from "@/src/i18n/routing";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  getOnboarding,
  saveOnboarding,
  GOALS,
  PLAYLISTS,
} from "@/src/lib/training-completion";
import type { Goal, Playlist } from "@/src/lib/training-completion";
import { fetchUserPlan } from "@/src/lib/user-plan";
import type { PlanTier } from "@/src/lib/weekly-plan";
import {
  fetchReminderSettings,
  saveReminderSettings,
  ALL_DAYS,
} from "@/src/lib/reminders";
import type { WeekdayKey } from "@/src/lib/reminders";
import {
  fetchPublicProfileSettings,
  savePublicProfile,
} from "@/src/lib/supabase/publicProfile";

const RESET_KEYS = [
  "aerix.onboarding",
  "aerix.completions",
  "aerix.sessionNotes",
  "aerix.sessionTags",
  "aerix.sessionDurations",
  "aerix.rankSnapshots",
  "aerix.rankPlaylist",
  "aerix.upgradeInterest",
];

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const tNav = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const [goal, setGoal] = useState<Goal>("Rank Up");
  const [playlist, setPlaylist] = useState<Playlist>("2v2");
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [didReset, setDidReset] = useState(false);
  const [hasOnboarding, setHasOnboarding] = useState<boolean | null>(null);
  const [userPlan, setUserPlan] = useState<PlanTier>("free");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDays, setReminderDays] = useState<WeekdayKey[]>([]);
  const [reminderTime, setReminderTime] = useState("18:00");
  const [reminderSaved, setReminderSaved] = useState(false);
  const [reminderSaving, setReminderSaving] = useState(false);
  const [profileUsername, setProfileUsername] = useState("");
  const [profileEnabled, setProfileEnabled] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const ob = getOnboarding();
    setHasOnboarding(ob !== null);
    if (ob) {
      setGoal(ob.goal);
      setPlaylist(ob.playlist);
    }
    fetchUserPlan().then(setUserPlan);
    fetchReminderSettings().then((s) => {
      setReminderEnabled(s.reminder_enabled);
      setReminderDays((s.reminder_days ?? []) as WeekdayKey[]);
      if (s.reminder_time) setReminderTime(s.reminder_time);
    });
    fetchPublicProfileSettings().then((s) => {
      if (s) {
        setProfileUsername(s.username ?? "");
        setProfileEnabled(s.public_profile_enabled);
      }
    });
  }, []);

  if (hasOnboarding === null) {
    return <main className="min-h-screen bg-[#060608]" />;
  }

  if (!hasOnboarding) {
    return (
      <main className="min-h-screen bg-[#060608] text-white">
        <div className="mx-auto max-w-xl px-6">
          <nav className="flex items-center justify-between py-6">
            <Link
              href="/"
              className="text-sm font-semibold tracking-[0.2em] uppercase text-white"
            >
              Aerix
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              {tNav("dashboard")}
            </Link>
          </nav>
          <section className="flex flex-col items-center pt-32 pb-20 text-center">
            <p className="text-sm leading-relaxed text-neutral-400">
              {t("setupFirst")}
            </p>
            <Link
              href="/dashboard"
              className="mt-6 flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              {t("setupNow")}
            </Link>
            <p className="mt-3 text-xs text-neutral-600">
              {t("noAccount")}
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#060608] text-white">
      <div className="mx-auto max-w-xl px-6">
        <nav className="flex items-center justify-between py-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.2em] uppercase text-white"
          >
            Aerix
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-neutral-400 transition-colors hover:text-white"
          >
            {tNav("dashboard")}
          </Link>
        </nav>

        <section className="pt-20 pb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            {t("label")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("title")}
          </h1>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── Preferences ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            {t("preferences")}
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            <div>
              <p className="mb-2 text-[11px] font-medium text-neutral-400">
                {t("goal")}
              </p>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setGoal(g);
                      setPrefsSaved(false);
                    }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      goal === g
                        ? "border-indigo-500/40 bg-indigo-600/20 text-indigo-300"
                        : "border-neutral-800/60 bg-transparent text-neutral-500 hover:border-neutral-700 hover:text-neutral-400"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-[11px] font-medium text-neutral-400">
                {t("mainPlaylist")}
              </p>
              <div className="flex gap-2">
                {PLAYLISTS.map((pl) => (
                  <button
                    key={pl}
                    type="button"
                    onClick={() => {
                      setPlaylist(pl);
                      setPrefsSaved(false);
                    }}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      playlist === pl
                        ? "border-indigo-500/40 bg-indigo-600/20 text-indigo-300"
                        : "border-neutral-800/60 bg-transparent text-neutral-500 hover:border-neutral-700 hover:text-neutral-400"
                    }`}
                  >
                    {pl}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                saveOnboarding({ goal, playlist });
                setPrefsSaved(true);
              }}
              className={`mt-6 flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                prefsSaved
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
              }`}
            >
              {prefsSaved ? tCommon("saved") : t("savePrefs")}
            </button>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── Training Reminders ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            {t("reminders")}
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            {/* Enable toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{t("enableReminders")}</p>
                <p className="mt-0.5 text-xs text-neutral-600">
                  {t("reminderSub")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReminderEnabled(!reminderEnabled);
                  setReminderSaved(false);
                }}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  reminderEnabled ? "bg-indigo-600" : "bg-neutral-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    reminderEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {reminderEnabled && (
              <>
                {/* Day picker */}
                <div className="mt-5">
                  <p className="mb-2 text-[11px] font-medium text-neutral-400">
                    {t("whichDays")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_DAYS.map(({ key, label }) => {
                      const active = reminderDays.includes(key);
                      const atLimit = userPlan === "free" && reminderDays.length >= 2 && !active;
                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={atLimit}
                          onClick={() => {
                            const next = active
                              ? reminderDays.filter((d) => d !== key)
                              : [...reminderDays, key];
                            setReminderDays(next as WeekdayKey[]);
                            setReminderSaved(false);
                          }}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? "border-indigo-500/40 bg-indigo-600/20 text-indigo-300"
                              : atLimit
                                ? "cursor-not-allowed border-neutral-800/60 bg-transparent text-neutral-700"
                                : "border-neutral-800/60 bg-transparent text-neutral-500 hover:border-neutral-700 hover:text-neutral-400"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  {userPlan === "free" && (
                    <p className="mt-2 text-[11px] text-neutral-600">
                      {t("freeDayLimit")}{" "}
                      <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300">
                        {tCommon("starterPlus")}
                      </Link>{" "}
                      {t("forUnlimited")}
                    </p>
                  )}
                </div>

                {/* Time picker */}
                <div className="mt-5">
                  <label
                    htmlFor="reminder-time"
                    className="mb-1.5 block text-[11px] font-medium text-neutral-400"
                  >
                    {t("preferredTime")}
                  </label>
                  <input
                    id="reminder-time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => {
                      setReminderTime(e.target.value);
                      setReminderSaved(false);
                    }}
                    className="w-full rounded-lg border border-neutral-800/60 bg-[#060608] px-3 py-2.5 text-sm text-white outline-none focus:border-neutral-700"
                  />
                </div>
              </>
            )}

            {/* Save */}
            <button
              disabled={reminderSaving}
              onClick={async () => {
                setReminderSaving(true);
                const ok = await saveReminderSettings({
                  reminder_enabled: reminderEnabled,
                  reminder_days: reminderDays,
                  reminder_time: reminderTime,
                });
                if (ok) setReminderSaved(true);
                setReminderSaving(false);
              }}
              className={`mt-6 flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                reminderSaved
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
              }`}
            >
              {reminderSaving ? tCommon("saving") : reminderSaved ? tCommon("saved") : t("saveReminders")}
            </button>

            <p className="mt-3 text-[11px] text-neutral-600">
              {t("reminderNote")}
            </p>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── Public Profile ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            {t("publicProfile")}
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            {/* Enable toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{t("enableProfile")}</p>
                <p className="mt-0.5 text-xs text-neutral-600">
                  {t("profileSub")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileEnabled(!profileEnabled);
                  setProfileSaved(false);
                  setProfileError(null);
                }}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  profileEnabled ? "bg-indigo-600" : "bg-neutral-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    profileEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {profileEnabled && (
              <div className="mt-5">
                <label
                  htmlFor="profile-username"
                  className="mb-1.5 block text-[11px] font-medium text-neutral-400"
                >
                  {t("username")}
                </label>
                <input
                  id="profile-username"
                  type="text"
                  value={profileUsername}
                  onChange={(e) => {
                    setProfileUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                    setProfileSaved(false);
                    setProfileError(null);
                  }}
                  maxLength={20}
                  placeholder="your_username"
                  className="w-full rounded-lg border border-neutral-800/60 bg-[#060608] px-3 py-2.5 text-sm text-white outline-none focus:border-neutral-700"
                />
                <p className="mt-1.5 text-[11px] text-neutral-600">
                  {t("usernameHint")}
                </p>
                {profileUsername.length >= 3 && (
                  <p className="mt-2 text-[11px] text-neutral-500">
                    {t("usernamePreview", { username: profileUsername })}
                  </p>
                )}
              </div>
            )}

            {profileError && (
              <p className="mt-3 text-xs text-red-400">{profileError}</p>
            )}

            <button
              disabled={profileSaving}
              onClick={async () => {
                if (profileEnabled && !/^[a-z0-9_]{3,20}$/.test(profileUsername)) {
                  setProfileError(t("usernameError"));
                  return;
                }
                setProfileSaving(true);
                setProfileError(null);
                const result = await savePublicProfile(profileUsername, profileEnabled);
                if (result.ok) {
                  setProfileSaved(true);
                } else {
                  setProfileError(result.error ?? t("saveError"));
                }
                setProfileSaving(false);
              }}
              className={`mt-6 flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                profileSaved
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
              }`}
            >
              {profileSaving ? tCommon("saving") : profileSaved ? tCommon("saved") : t("saveProfile")}
            </button>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── Data ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">{t("dataSection")}</h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            {didReset ? (
              <div className="text-center">
                <p className="text-sm font-medium text-indigo-300">
                  {t("resetComplete")}
                </p>
                <Link
                  href="/dashboard"
                  className="mt-3 inline-block text-xs text-neutral-500 transition-colors hover:text-neutral-300"
                >
                  {t("backDashboard")}
                </Link>
              </div>
            ) : (
              <>
                <p className="text-xs leading-relaxed text-neutral-500">
                  {t("dataWarning")}
                </p>
                <button
                  onClick={() => {
                    if (!confirm(t("confirmReset"))) return;
                    for (const key of RESET_KEYS) {
                      localStorage.removeItem(key);
                    }
                    setDidReset(true);
                  }}
                  className="mt-4 flex h-10 w-full items-center justify-center rounded-lg border border-red-500/20 bg-red-500/[0.06] text-sm font-medium text-red-400 transition-colors hover:bg-red-500/[0.12]"
                >
                  {t("resetButton")}
                </button>
              </>
            )}
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-center py-8">
          <Link
            href="/dashboard"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            {tCommon("backDashboard")}
          </Link>
        </footer>
      </div>
    </main>
  );
}
