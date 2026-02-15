"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { isSupabaseConfigured } from "@/src/lib/supabase/validate";
import { syncCompletions } from "@/src/lib/supabase/sync-completions";
import SupabaseNotConfigured from "@/src/components/SupabaseNotConfigured";
import { fetchUserProfile, startTrial } from "@/src/lib/user-plan";
import type { UserProfile } from "@/src/lib/user-plan";
import { fetchTotalUnreadCount } from "@/src/lib/supabase/matchmaking";
import { canStartTrial, isTrialActive, trialDaysRemaining } from "@/src/lib/trial";
import type { PlanTier } from "@/src/lib/weekly-plan";
import {
  getCompletedDates,
  setCompletedDate,
  getToday,
  getWeekDates,
  computeStreaks,
  onCompletionChange,
  getSessionTags,
  getSessionDurations,
  getRankSnapshots,
  getSavedPlaylist,
  getOnboarding,
  saveOnboarding,
  GOALS,
  PLAYLISTS,
} from "@/src/lib/training-completion";
import type { FocusTag, RankSnapshot, OnboardingData, Goal, Playlist } from "@/src/lib/training-completion";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export default function Dashboard() {
  const todayIndex = useMemo(() => (new Date().getDay() + 6) % 7, []);
  const weekDates = useMemo(() => getWeekDates(0), []);

  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [streak, setStreak] = useState(0);
  const [todayTags, setTodayTags] = useState<FocusTag[]>([]);
  const [todayDuration, setTodayDuration] = useState<number | null>(null);
  const [currentRank, setCurrentRank] = useState<RankSnapshot | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingData | null | undefined>(undefined);
  const [obGoal, setObGoal] = useState<Goal>("Rank Up");
  const [obPlaylist, setObPlaylist] = useState<Playlist>("2v2");
  const [obJustSaved, setObJustSaved] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<PlanTier>("free");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [trialStarting, setTrialStarting] = useState(false);
  const [configError, setConfigError] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [billingLabel, setBillingLabel] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUserEmail(user?.email ?? null);
        setUserId(user?.id ?? null);
        if (user) {
          syncCompletions().then(syncFromStorage);
          fetchUserProfile().then((p) => {
            setUserProfile(p);
            setUserPlan(p.plan);
          });
          fetchTotalUnreadCount().then(setUnreadCount);
          fetch("/api/stripe/status")
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
              if (!data || data.status === "none") return;
              if (data.cancel_at_period_end && data.cancel_at) {
                const date = new Date(data.cancel_at * 1000);
                setBillingLabel(`Cancels ${date.toLocaleDateString()}`);
              } else if (data.status === "active") {
                setBillingLabel("Active");
              } else if (data.status === "past_due") {
                setBillingLabel("Past due");
              } else if (data.status === "trialing") {
                setBillingLabel("Trial");
              } else if (data.status === "canceled") {
                setBillingLabel("Canceled");
              } else if (data.status === "incomplete") {
                setBillingLabel("Incomplete");
              }
            })
            .catch(() => {});
        }
      });
    } catch {
      setConfigError(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncFromStorage = useCallback(() => {
    const dates = getCompletedDates();
    const daySet = new Set<number>();
    weekDates.forEach((date, i) => {
      if (dates.has(date)) daySet.add(i);
    });
    setCompletedDays(daySet);
    setStreak(computeStreaks().current);
  }, [weekDates]);

  useEffect(() => {
    syncFromStorage();
    const today = getToday();
    const tags = getSessionTags();
    if (tags[today]) setTodayTags(tags[today]);
    const durations = getSessionDurations();
    if (durations[today]) setTodayDuration(durations[today]);
    const playlist = getSavedPlaylist();
    const snapshots = getRankSnapshots().filter((s) => s.playlist === playlist);
    if (snapshots.length > 0) setCurrentRank(snapshots[snapshots.length - 1]);
    setOnboarding(getOnboarding());
    return onCompletionChange(syncFromStorage);
  }, [syncFromStorage]);

  const trainedToday = completedDays.has(todayIndex);
  const supabaseReady = isSupabaseConfigured();

  if (configError || !supabaseReady) {
    return <SupabaseNotConfigured />;
  }

  const toggleDay = useCallback(
    (index: number) => {
      const date = weekDates[index];
      const wasCompleted = completedDays.has(index);
      setCompletedDate(date, !wasCompleted);
    },
    [weekDates, completedDays]
  );

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
          <div className="flex items-center gap-4">
            <Link
              href="/feedback"
              className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
            >
              Feedback
            </Link>
            <Link
              href="/settings"
              className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
            >
              Settings
            </Link>
            <Link
              href="/messages"
              className="relative text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Messages
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/library"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Library
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Plans
            </Link>
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
            >
              Sign out
            </button>
          </div>
        </nav>

        <section className="pt-20 pb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Dashboard
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome back.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            Here&apos;s where you are. Keep showing up — that&apos;s all it
            takes.
          </p>
          {onboarding && !obJustSaved && (
            <p className="mt-3 text-xs text-neutral-500">
              Goal: <span className="text-neutral-400">{onboarding.goal}</span>
              {" "}&middot;{" "}
              Playlist: <span className="text-neutral-400">{onboarding.playlist}</span>
            </p>
          )}
        </section>

        {/* ── Onboarding ── */}
        {onboarding === null && (
          <section className="pb-10">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-6">
              <h2 className="text-sm font-semibold text-white">
                Let&apos;s set up your training.
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                Two quick picks so AERIX can guide you better.
              </p>

              <div className="mt-5">
                <p className="mb-2 text-[11px] font-medium text-neutral-400">
                  What&apos;s your main goal?
                </p>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setObGoal(g)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        obGoal === g
                          ? "border-indigo-500/40 bg-indigo-600/20 text-indigo-300"
                          : "border-neutral-800/60 bg-[#0c0c10] text-neutral-500 hover:border-neutral-700 hover:text-neutral-400"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-[11px] font-medium text-neutral-400">
                  Main playlist?
                </p>
                <div className="flex gap-2">
                  {PLAYLISTS.map((pl) => (
                    <button
                      key={pl}
                      type="button"
                      onClick={() => setObPlaylist(pl)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                        obPlaylist === pl
                          ? "border-indigo-500/40 bg-indigo-600/20 text-indigo-300"
                          : "border-neutral-800/60 bg-[#0c0c10] text-neutral-500 hover:border-neutral-700 hover:text-neutral-400"
                      }`}
                    >
                      {pl}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  const data: OnboardingData = { goal: obGoal, playlist: obPlaylist };
                  saveOnboarding(data);
                  setOnboarding(data);
                  setObJustSaved(true);
                }}
                className="mt-6 flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                Save &amp; Start
              </button>
            </div>
          </section>
        )}

        {obJustSaved && (
          <section className="pb-10">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-5 text-center">
              <p className="text-sm font-medium text-indigo-300">
                Saved. Let&apos;s get a clean week in.
              </p>
            </div>
          </section>
        )}

        {/* ── Trial Banner ── */}
        {userProfile && isTrialActive(userProfile) && (
          <section className="pb-10">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-indigo-300">
                    Starter trial ends in {trialDaysRemaining(userProfile)} day{trialDaysRemaining(userProfile) === 1 ? "" : "s"}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Enjoying the extra features? Keep them after your trial.
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  View Plans
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Trial Expired Note ── */}
        {userProfile && userProfile.trial_used && userPlan === "free" && !userProfile.stripe_subscription_id && (
          <section className="pb-10">
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
              <p className="text-sm text-neutral-400">
                Trial ended — you can keep training on Free or{" "}
                <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300">
                  upgrade anytime
                </Link>.
              </p>
            </div>
          </section>
        )}

        {/* ── Start Trial CTA ── */}
        {userProfile && canStartTrial(userProfile) && (
          <section className="pb-10">
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">
                    Try Starter free for 7 days
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Unlock more training blocks, focus tags, and insights.
                  </p>
                </div>
                <button
                  disabled={trialStarting}
                  onClick={async () => {
                    setTrialStarting(true);
                    const ok = await startTrial();
                    if (ok) {
                      const p = await fetchUserProfile();
                      setUserProfile(p);
                      setUserPlan(p.plan);
                    }
                    setTrialStarting(false);
                  }}
                  className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                >
                  {trialStarting ? "Starting…" : "Start Trial"}
                </button>
              </div>
            </div>
          </section>
        )}

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Your Streak
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{streak}</span>
              <span className="text-sm text-neutral-500">
                {streak === 1 ? "day" : "days"} in a row
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-neutral-600">
              {streak === 0
                ? "Start a new streak today. One session is all it takes."
                : streak < 7
                  ? "You're building momentum. Stay consistent."
                  : "Solid consistency. Keep it going."}
            </p>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">Today</h2>
          <div
            className={`rounded-xl border p-6 ${
              trainedToday
                ? "border-indigo-500/30 bg-indigo-500/[0.05]"
                : "border-neutral-800/60 bg-[#0c0c10]"
            }`}
          >
            {trainedToday ? (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600/20">
                  <svg
                    className="h-4.5 w-4.5 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-300">
                    Training complete
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    You showed up today. Come back tomorrow.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">
                    Not trained yet
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Your daily session is waiting. Even a short one counts.
                  </p>
                </div>
                <div className="h-2 w-2 shrink-0 rounded-full bg-neutral-700" />
              </div>
            )}
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── Today Summary ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Today Summary
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
            <div className="flex flex-col gap-4">
              {/* Focus tags */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-neutral-500">
                    Focus
                  </p>
                  {todayTags.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {todayTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-indigo-500/30 bg-indigo-600/10 px-2.5 py-0.5 text-[11px] font-medium text-indigo-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-neutral-600">
                      No focus tags yet
                    </p>
                  )}
                </div>
              </div>

              <div className="h-px w-full bg-neutral-800/40" />

              {/* Duration + Rank row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-medium text-neutral-500">
                    Duration
                  </p>
                  {todayDuration ? (
                    <p className="mt-1 text-sm font-medium text-white">
                      {todayDuration === 60 ? "60+" : todayDuration} min
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-neutral-600">
                      Not logged yet
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500">
                    Rank ({currentRank?.playlist ?? "2v2"})
                  </p>
                  {currentRank ? (
                    <p className="mt-1 text-sm font-medium text-white">
                      {currentRank.rank}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-neutral-600">
                      Not set
                    </p>
                  )}
                </div>
              </div>

              <div className="h-px w-full bg-neutral-800/40" />

              {/* Quick links */}
              <div className="flex items-center gap-4">
                <Link
                  href={`/training?plan=${userPlan}`}
                  className="text-[11px] font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                >
                  {trainedToday ? "Edit session" : "Start session"} &rarr;
                </Link>
                <Link
                  href="/rank"
                  className="text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-300"
                >
                  Update rank &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            This Week
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            <div className="grid grid-cols-7 gap-2">
              {DAY_LABELS.map((label, i) => {
                const isToday = i === todayIndex;
                const isDone = completedDays.has(i);

                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={isDone}
                    aria-label={`${label}${isToday ? " (today)" : ""}: ${isDone ? "completed" : "not completed"}`}
                    onClick={() => toggleDay(i)}
                    className={`flex flex-col items-center gap-2.5 cursor-pointer rounded-lg py-2 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 hover:bg-white/[0.03] ${
                      isToday ? "ring-1 ring-neutral-700" : ""
                    }`}
                  >
                    <span
                      className={`text-[11px] font-medium ${
                        isToday ? "text-white" : "text-neutral-600"
                      }`}
                    >
                      {label}
                    </span>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isDone
                          ? "bg-indigo-600/20"
                          : i < todayIndex
                            ? "bg-neutral-800/40"
                            : isToday
                              ? "bg-transparent"
                              : "bg-transparent"
                      }`}
                    >
                      {isDone ? (
                        <svg
                          className="h-3.5 w-3.5 text-indigo-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
                        </svg>
                      ) : i < todayIndex ? (
                        <div className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
                      ) : isToday ? (
                        <div className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-neutral-800" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-5 text-center text-xs text-neutral-600">
              Trained {completedDays.size} / 7 days this week
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-neutral-700">
              Click any day to toggle your training.
            </p>
            <Link
              href={`/training/plan?plan=${userPlan}`}
              className="text-xs text-neutral-500 hover:text-neutral-300"
            >
              View Weekly Plan &rarr;
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Training Library
          </h2>
          <Link
            href="/library"
            className="flex items-center gap-4 rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5 transition-colors hover:border-neutral-700/60"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600/15">
              <svg
                className="h-4 w-4 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">
                Open Library
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                Save drills and build your next session.
              </p>
            </div>
            <svg
              className="h-4 w-4 shrink-0 text-neutral-700"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Play Together
          </h2>
          <Link
            href="/matchmaking"
            className="flex items-center gap-4 rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5 transition-colors hover:border-neutral-700/60"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600/15">
              <svg
                className="h-4 w-4 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">
                Find a Duo / Trio
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                Team up with players who match your rank and goals.
              </p>
            </div>
            <svg
              className="h-4 w-4 shrink-0 text-neutral-700"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Messages
          </h2>
          <Link
            href="/messages"
            className="flex items-center gap-4 rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5 transition-colors hover:border-neutral-700/60"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600/15">
              {unreadCount > 0 ? (
                <span className="text-xs font-bold text-indigo-400">
                  {unreadCount}
                </span>
              ) : (
                <svg
                  className="h-4 w-4 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`
                  : "Inbox is clear"}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {unreadCount > 0 ? "Open Inbox" : "No new messages right now."}
              </p>
            </div>
            <svg
              className="h-4 w-4 shrink-0 text-neutral-700"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Streak Protection
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600/10">
                <svg
                  className="h-4 w-4 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  1 Streak Save available this month
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  If you miss a day, use a save to keep your streak going.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="/pricing"
                className="flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Unlock Streak Protection
              </Link>
              <Link
                href="/plans/starter"
                className="text-xs text-neutral-500 hover:text-neutral-300"
              >
                Learn more
              </Link>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <div className="flex flex-col gap-3">
            <Link
              href={`/training?plan=${userPlan}`}
              className="flex h-11 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              {trainedToday ? "Review Training" : "Go to Training"}
            </Link>
            <Link
              href={`/training/plan?plan=${userPlan}`}
              className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
            >
              Weekly Plan
            </Link>
            <Link
              href="/progress"
              className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
            >
              View Progress
            </Link>
            <Link
              href="/library"
              className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
            >
              Drill Library
            </Link>
            {!trainedToday && (
              <button
                onClick={() => toggleDay(todayIndex)}
                className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
              >
                Mark today as done
              </button>
            )}
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── Account ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Account
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[11px] font-medium text-neutral-500">Plan</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${
                    userPlan === "pro"
                      ? "bg-indigo-600/20 text-indigo-300"
                      : userPlan === "starter"
                        ? "bg-indigo-600/15 text-indigo-400"
                        : "bg-neutral-800 text-neutral-400"
                  }`}>
                    {userPlan}{userProfile && isTrialActive(userProfile) ? " (Trial)" : ""}
                  </span>
                  {userPlan === "free" ? (
                    <Link
                      href="/pricing"
                      className="text-[11px] text-indigo-400 transition-colors hover:text-indigo-300"
                    >
                      View Plans
                    </Link>
                  ) : (
                    <button
                      disabled={portalLoading}
                      onClick={async () => {
                        setPortalLoading(true);
                        try {
                          const res = await fetch("/api/stripe/portal", { method: "POST" });
                          if (res.status === 401) {
                            router.push("/login?returnTo=/dashboard");
                            return;
                          }
                          const { url } = await res.json();
                          if (url) window.location.href = url;
                        } finally {
                          setPortalLoading(false);
                        }
                      }}
                      className="text-[11px] text-indigo-400 transition-colors hover:text-indigo-300 disabled:text-neutral-600"
                    >
                      {portalLoading ? "Loading…" : "Manage Subscription"}
                    </button>
                  )}
                </div>
                {billingLabel && (
                  <p className="mt-1 text-[11px] text-neutral-500">
                    Billing: <span className={
                      billingLabel === "Active" ? "text-emerald-400" :
                      billingLabel.startsWith("Cancels") ? "text-amber-400" :
                      billingLabel === "Past due" ? "text-red-400" :
                      "text-neutral-400"
                    }>{billingLabel}</span>
                  </p>
                )}
              </div>
              <div>
                <p className="text-[11px] font-medium text-neutral-500">Email</p>
                <p className="mt-0.5 text-sm text-white">
                  {userEmail ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-neutral-500">User ID</p>
                <p className="mt-0.5 font-mono text-sm text-neutral-400">
                  {userId ? `${userId.slice(0, 8)}…` : "—"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-center py-8">
          <Link
            href="/"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            &larr; Back to home
          </Link>
        </footer>
      </div>
    </main>
  );
}
