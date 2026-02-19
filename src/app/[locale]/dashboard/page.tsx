"use client";

import { Link } from "@/src/i18n/routing";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/src/lib/supabase/client";
import { isSupabaseConfigured } from "@/src/lib/supabase/validate";
import { syncCompletions } from "@/src/lib/supabase/sync-completions";
import SupabaseNotConfigured from "@/src/components/SupabaseNotConfigured";
import { fetchUserProfile, startTrial } from "@/src/lib/user-plan";
import type { UserProfile } from "@/src/lib/user-plan";
import { fetchTotalUnreadCount } from "@/src/lib/supabase/matchmaking";
import { canStartTrial, isTrialActive, trialDaysRemaining } from "@/src/lib/trial";
import { fetchOnboardingStatus, fetchWeeklyGoal, saveWeeklyGoal } from "@/src/lib/onboarding";
import { fetchReminderSettings, shouldShowReminder } from "@/src/lib/reminders";
import { getCompletedDaysLastNDays, computeConsistencyScore } from "@/src/lib/consistency";
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
import { TRAINING_PACKS, canAccessPack } from "@/src/lib/trainingPacks";
import type { TrainingPack } from "@/src/lib/trainingPacks";
import {
  getLocalPackProgress,
  getCompletedCount,
  recommendNextPack,
  mergeRemoteProgress,
} from "@/src/lib/packProgress";
import { getPackProgressMap } from "@/src/lib/supabase/packProgress";
import { syncProfileStats } from "@/src/lib/supabase/publicProfile";
import type { FocusTag, RankSnapshot, OnboardingData, Goal, Playlist } from "@/src/lib/training-completion";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export default function Dashboard() {
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("Common");
  const tNav = useTranslations("Nav");

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
  const [showWelcome, setShowWelcome] = useState(false);
  const [focusGoal, setFocusGoal] = useState<string | null>(null);
  const [focusPlaylist, setFocusPlaylist] = useState<string | null>(null);
  const [weeklyGoal, setWeeklyGoal] = useState(3);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [consistencyScore, setConsistencyScore] = useState(0);
  const [goalPickerOpen, setGoalPickerOpen] = useState(false);
  const [goalSaving, setGoalSaving] = useState(false);
  const [reminderNudge, setReminderNudge] = useState(false);
  const [recommendedPack, setRecommendedPack] = useState<{ pack: TrainingPack; done: number; total: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUserEmail(user?.email ?? null);
        setUserId(user?.id ?? null);
        if (user) {
          // Check onboarding — redirect if not completed
          fetchOnboardingStatus().then((ob) => {
            if (!ob.onboarding_completed) {
              router.replace("/onboarding");
              return;
            }
            setFocusGoal(ob.focus_goal);
            setFocusPlaylist(ob.focus_playlist);
          });
          // Check for welcome param
          const params = new URLSearchParams(window.location.search);
          if (params.get("welcome") === "1") {
            setShowWelcome(true);
            window.history.replaceState({}, "", "/dashboard");
          }
          syncCompletions().then(syncFromStorage);
          fetchUserProfile().then(async (p) => {
            setUserProfile(p);
            setUserPlan(p.plan);
            // Load pack progress and compute recommendation
            try {
              const remote = await getPackProgressMap();
              const merged = mergeRemoteProgress(remote);
              const accessible = TRAINING_PACKS.filter((pk) => canAccessPack(pk, p.plan));
              const rec = recommendNextPack(accessible, merged);
              if (rec) {
                setRecommendedPack({
                  pack: rec,
                  done: getCompletedCount(rec, merged[rec.id]),
                  total: rec.drills.length,
                });
              }
              // Sync streak + packs count + consistency for public profile
              const streaks = computeStreaks();
              const packsCount = TRAINING_PACKS.filter((pk) => {
                const prog = merged[pk.id];
                return prog && getCompletedCount(pk, prog) >= pk.drills.length;
              }).length;
              const dates = getCompletedDates();
              const count14 = getCompletedDaysLastNDays(dates, 14);
              const cs = computeConsistencyScore(count14, 14);
              syncProfileStats(streaks.current, packsCount, cs);
            } catch {
              // Fall back to local-only
              const local = getLocalPackProgress();
              const accessible = TRAINING_PACKS.filter((pk) => canAccessPack(pk, p.plan));
              const rec = recommendNextPack(accessible, local);
              if (rec) {
                setRecommendedPack({
                  pack: rec,
                  done: getCompletedCount(rec, local[rec.id]),
                  total: rec.drills.length,
                });
              }
            }
          });
          fetchWeeklyGoal().then(setWeeklyGoal);
          fetchReminderSettings().then((s) => {
            const show = shouldShowReminder(
              { enabled: s.reminder_enabled, days: s.reminder_days },
              false // trainedToday not known yet; will update via syncFromStorage
            );
            setReminderNudge(show);
          });
          fetchTotalUnreadCount().then(setUnreadCount);
          fetch("/api/stripe/status")
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
              if (!data || data.status === "none") return;
              if (data.cancel_at_period_end && data.cancel_at) {
                const date = new Date(data.cancel_at * 1000);
                setBillingLabel(`cancelsOn:${date.toLocaleDateString()}`);
              } else if (data.status === "active") {
                setBillingLabel("active");
              } else if (data.status === "past_due") {
                setBillingLabel("pastDue");
              } else if (data.status === "trialing") {
                setBillingLabel("trial");
              } else if (data.status === "canceled") {
                setBillingLabel("canceled");
              } else if (data.status === "incomplete") {
                setBillingLabel("incomplete");
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
    // Weekly progress = completed days this week
    let wp = 0;
    weekDates.forEach((d) => { if (dates.has(d)) wp++; });
    setWeeklyProgress(wp);
    // Consistency score (last 14 days)
    const count14 = getCompletedDaysLastNDays(dates, 14);
    setConsistencyScore(computeConsistencyScore(count14, 14));
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

  const renderBillingLabel = () => {
    if (!billingLabel) return null;
    if (billingLabel.startsWith("cancelsOn:")) {
      const date = billingLabel.slice("cancelsOn:".length);
      return t("cancelsOn", { date });
    }
    if (billingLabel === "active") return tCommon("active");
    if (billingLabel === "pastDue") return tCommon("pastDue");
    if (billingLabel === "trial") return tCommon("trial");
    if (billingLabel === "canceled") return tCommon("canceled");
    if (billingLabel === "incomplete") return tCommon("incomplete");
    return billingLabel;
  };

  const billingColorClass = () => {
    if (!billingLabel) return "";
    if (billingLabel === "active") return "text-emerald-400";
    if (billingLabel.startsWith("cancelsOn:")) return "text-amber-400";
    if (billingLabel === "pastDue") return "text-red-400";
    return "text-neutral-400";
  };

  return (
    <main className="min-h-screen bg-[#060608] text-white aerix-grid">
      <div className="mx-auto max-w-xl px-6">
        <nav className="flex items-center justify-between py-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.2em] uppercase text-white"
          >
            Aerix
          </Link>
          <div className="flex items-center gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link
              href="/messages"
              className="relative shrink-0 py-1 text-sm text-neutral-400 transition-colors hover:text-white"
            >
              {tNav("messages")}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/library"
              className="shrink-0 py-1 text-sm text-neutral-400 transition-colors hover:text-white"
            >
              {tCommon("library")}
            </Link>
            <Link
              href="/pricing"
              className="shrink-0 py-1 text-sm text-neutral-400 transition-colors hover:text-white"
            >
              {tCommon("plans")}
            </Link>
            <Link
              href="/settings"
              className="shrink-0 py-1 text-xs text-neutral-600 transition-colors hover:text-neutral-400"
            >
              {tCommon("settings")}
            </Link>
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="shrink-0 py-1 text-xs text-neutral-600 transition-colors hover:text-neutral-400"
            >
              {tCommon("signOut")}
            </button>
          </div>
        </nav>

        <section className="pt-20 pb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            {t("label")}
          </p>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
            {t("welcome")}
          </h1>
          <span className="accent-line" />
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            {t("welcomeSub")}
          </p>
          {focusGoal && focusPlaylist && (
            <p className="mt-3 text-xs text-neutral-500">
              {t("focus")} <span className="text-neutral-400">{focusGoal}</span>
              {" "}&middot;{" "}
              <span className="text-neutral-400">{focusPlaylist}</span>
              {" "}&middot;{" "}
              <Link href="/onboarding" className="text-indigo-400 hover:text-indigo-300">
                {t("change")}
              </Link>
            </p>
          )}
        </section>

        {/* ── Reminder Nudge ── */}
        {reminderNudge && !trainedToday && (
          <section className="pb-10">
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-neutral-400">
                  {t("nudge")}
                </p>
                <Link
                  href={`/training?plan=${userPlan}`}
                  className="cta-glow shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  {tCommon("startSession")}
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Welcome Banner ── */}
        {showWelcome && (
          <section className="pb-10">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-indigo-300">
                    {t("welcomeBanner")}
                  </p>
                </div>
                <Link
                  href={`/training?plan=${userPlan}`}
                  className="cta-glow shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  {tCommon("startSession")}
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Onboarding ── */}
        {onboarding === null && (
          <section className="pb-10">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-6">
              <h2 className="text-sm font-semibold text-white">
                {t("setupTitle")}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                {t("setupSub")}
              </p>

              <div className="mt-5">
                <p className="mb-2 text-[11px] font-medium text-neutral-400">
                  {t("goalLabel")}
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
                  {t("playlistLabel")}
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
                {t("saveStart")}
              </button>
            </div>
          </section>
        )}

        {obJustSaved && (
          <section className="pb-10">
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-5 text-center">
              <p className="text-sm font-medium text-indigo-300">
                {t("goalSaved")}
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
                    {t("trialBanner", { n: trialDaysRemaining(userProfile) })}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {t("trialSub")}
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  {tCommon("viewPlans")}
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
                {t("trialEnded").split(t("upgradeAnytime"))[0]}
                <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300">
                  {t("upgradeAnytime")}
                </Link>
                {t("trialEnded").split(t("upgradeAnytime"))[1]}
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
                    {t("tryStarter")}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {t("tryStarterSub")}
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
                  {trialStarting ? t("starting") : t("startTrial")}
                </button>
              </div>
            </div>
          </section>
        )}

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            {t("streak")}
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{streak}</span>
              <span className="text-sm text-neutral-500">
                {t("streakDays", { n: streak })}
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-neutral-600">
              {streak === 0
                ? t("streakTip0")
                : streak < 7
                  ? t("streakTip1")
                  : t("streakTip2")}
            </p>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── Weekly Goal + Consistency ── */}
        <section className="py-10">
          <div className="grid grid-cols-2 gap-4">
            {/* Weekly Goal */}
            <div className={`rounded-xl border p-5 ${
              weeklyProgress >= weeklyGoal
                ? "border-indigo-500/30 bg-indigo-500/[0.05]"
                : "border-neutral-800/60 bg-[#0c0c10]"
            }`}>
              <p className="text-[11px] font-medium text-neutral-500">
                {t("weeklyGoal")}
              </p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className={`text-2xl font-bold ${
                  weeklyProgress >= weeklyGoal ? "text-indigo-300" : "text-white"
                }`}>
                  {weeklyProgress}
                </span>
                <span className="text-sm text-neutral-500">/ {weeklyGoal}</span>
              </div>
              {weeklyProgress >= weeklyGoal ? (
                <p className="mt-2 text-xs text-indigo-400">{t("goalReached")}</p>
              ) : (
                <p className="mt-2 text-xs text-neutral-600">
                  {t("goalRemaining", { n: weeklyGoal - weeklyProgress })}
                </p>
              )}
              {!goalPickerOpen ? (
                <button
                  onClick={() => setGoalPickerOpen(true)}
                  className="mt-3 text-[11px] text-indigo-400 transition-colors hover:text-indigo-300"
                >
                  {t("changeGoal")}
                </button>
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  {([3, 5, 7] as const).map((d) => (
                    <button
                      key={d}
                      disabled={goalSaving}
                      onClick={async () => {
                        setGoalSaving(true);
                        const ok = await saveWeeklyGoal(d);
                        if (ok) setWeeklyGoal(d);
                        setGoalSaving(false);
                        setGoalPickerOpen(false);
                      }}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        weeklyGoal === d
                          ? "border-indigo-500/40 bg-indigo-600/20 text-indigo-300"
                          : "border-neutral-800/60 bg-[#0c0c10] text-neutral-500 hover:border-neutral-700 hover:text-neutral-400"
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Consistency Score */}
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
              <p className="text-[11px] font-medium text-neutral-500">
                {t("consistencyScore")}
              </p>
              {userPlan === "free" ? (
                <div className="mt-3">
                  <p className="text-sm text-neutral-600">—</p>
                  <p className="mt-2 text-[11px] text-neutral-600">
                    <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300">
                      {tCommon("starterPlus")}
                    </Link>{" "}
                    {tCommon("toUnlock")}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className={`text-2xl font-bold ${
                      consistencyScore >= 70 ? "text-indigo-300" : "text-white"
                    }`}>
                      {consistencyScore}
                    </span>
                    <span className="text-sm text-neutral-500">%</span>
                  </div>
                  <p className="mt-2 text-xs text-neutral-600">{t("last14")}</p>
                </>
              )}
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">{t("todaySection")}</h2>
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
                    {t("trainedTitle")}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {t("trainedSub")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">
                    {t("notTrainedTitle")}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {t("notTrainedSub")}
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
            {t("todaySummary")}
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
            <div className="flex flex-col gap-4">
              {/* Focus tags */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-neutral-500">
                    {t("focusLabel")}
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
                      {t("noFocusTags")}
                    </p>
                  )}
                </div>
              </div>

              <div className="h-px w-full bg-neutral-800/40" />

              {/* Duration + Rank row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-medium text-neutral-500">
                    {t("duration")}
                  </p>
                  {todayDuration ? (
                    <p className="mt-1 text-sm font-medium text-white">
                      {todayDuration === 60 ? "60+" : todayDuration} min
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-neutral-600">
                      {t("notLogged")}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-medium text-neutral-500">
                    {t("rankPlaylist", { playlist: currentRank?.playlist ?? "2v2" })}
                  </p>
                  {currentRank ? (
                    <p className="mt-1 text-sm font-medium text-white">
                      {currentRank.rank}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-neutral-600">
                      {t("notSet")}
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
                  {trainedToday ? t("editSession") : t("startSessionArrow")}
                </Link>
                <Link
                  href="/rank"
                  className="text-[11px] font-medium text-neutral-500 transition-colors hover:text-neutral-300"
                >
                  {t("updateRank")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            {t("thisWeek")}
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
                    aria-label={`${label}${isToday ? ` (${tCommon("today").toLowerCase()})` : ""}: ${isDone ? tCommon("completed").toLowerCase() : tCommon("notCompleted").toLowerCase()}`}
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
              {t("trainedWeek", { n: completedDays.size })}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-neutral-700">
              {t("clickToggle")}
            </p>
            <Link
              href={`/training/plan?plan=${userPlan}`}
              className="text-xs text-neutral-500 hover:text-neutral-300"
            >
              {t("viewWeeklyPlan")}
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── Recommended Pack ── */}
        {recommendedPack && (
          <section className="py-10">
            <h2 className="mb-6 text-sm font-medium text-neutral-500">
              {t("recommendedPack")}
            </h2>
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">
                    {recommendedPack.pack.title}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {t("drillsCompleted", { done: recommendedPack.done, total: recommendedPack.total })}
                  </p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-800/60">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{
                        width: `${Math.round(
                          (recommendedPack.done / recommendedPack.total) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                <Link
                  href="/packs"
                  className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  {recommendedPack.done > 0 ? t("continuePack") : t("startPack")}
                </Link>
              </div>
            </div>
          </section>
        )}

        {recommendedPack && <div className="h-px w-full bg-neutral-800/60" />}

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            {t("trainingLibrary")}
          </h2>
          <div className="flex flex-col gap-3">
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
                  {t("openLibrary")}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {t("librarySub")}
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
            <Link
              href="/packs"
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
                    d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0 4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">
                  {t("trainingPacks")}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {t("packsSub")}
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
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            {t("seasonUpdates")}
          </h2>
          <Link
            href="/updates"
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
                  d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6V7.5Z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">
                {t("seasonUpdates")}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {t("updatesSub")}
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
            {t("playTogether")}
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
                {t("findTeam")}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {t("teamSub")}
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
            {t("inviteSection")}
          </h2>
          <Link
            href="/invite"
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
                  d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">
                {t("inviteTeammate")}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {t("inviteSub")}
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
            {tNav("messages")}
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
                  ? t("unreadMessages", { n: unreadCount })
                  : t("inboxClear")}
              </p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {unreadCount > 0 ? t("openInbox") : t("noNewMessages")}
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
            {t("streakProtection")}
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
                  {t("saveAvailable")}
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {t("saveSub")}
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="/pricing"
                className="flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                {t("unlockProtection")}
              </Link>
              <Link
                href="/plans/starter"
                className="text-xs text-neutral-500 hover:text-neutral-300"
              >
                {t("learnMore")}
              </Link>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <div className="flex flex-col gap-3">
            <Link
              href={`/training?plan=${userPlan}`}
              className="cta-glow flex h-11 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              {trainedToday
                ? t("reviewTraining")
                : focusGoal === "Mechanics"
                  ? t("mechanicsSession")
                  : focusGoal === "Game Sense"
                    ? t("reviewSession")
                    : focusGoal === "Consistency"
                      ? t("keepStreak")
                      : focusGoal === "Rank Up"
                        ? t("rankedPrep")
                        : t("goToTraining")}
            </Link>
            <Link
              href={`/training/plan?plan=${userPlan}`}
              className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
            >
              {t("weeklyPlan")}
            </Link>
            <Link
              href="/progress"
              className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
            >
              {t("viewProgress")}
            </Link>
            <Link
              href="/library"
              className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
            >
              {t("drillLibrary")}
            </Link>
            {!trainedToday && (
              <button
                onClick={() => toggleDay(todayIndex)}
                className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
              >
                {t("markDone")}
              </button>
            )}
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── Account ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            {t("account")}
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[11px] font-medium text-neutral-500">{t("plan")}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${
                    userPlan === "pro"
                      ? "bg-indigo-600/20 text-indigo-300"
                      : userPlan === "starter"
                        ? "bg-indigo-600/15 text-indigo-400"
                        : "bg-neutral-800 text-neutral-400"
                  }`}>
                    {userPlan}{userProfile && isTrialActive(userProfile) ? ` ${t("trialBadge")}` : ""}
                  </span>
                  {userPlan === "free" ? (
                    <Link
                      href="/pricing"
                      className="text-[11px] text-indigo-400 transition-colors hover:text-indigo-300"
                    >
                      {tCommon("viewPlans")}
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
                      {portalLoading ? tCommon("loading") : t("manageSubscription")}
                    </button>
                  )}
                </div>
                {billingLabel && (
                  <p className="mt-1 text-[11px] text-neutral-500">
                    {t("billing")} <span className={billingColorClass()}>{renderBillingLabel()}</span>
                  </p>
                )}
              </div>
              <div>
                <p className="text-[11px] font-medium text-neutral-500">{t("email")}</p>
                <p className="mt-0.5 text-sm text-white">
                  {userEmail ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-neutral-500">{t("userId")}</p>
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
            {tCommon("backHome")}
          </Link>
        </footer>
      </div>
    </main>
  );
}
