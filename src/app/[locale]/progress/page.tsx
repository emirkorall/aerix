"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { syncCompletions } from "@/src/lib/supabase/sync-completions";
import { syncRankSnapshots, upsertRankSnapshot } from "@/src/lib/supabase/sync-rank-snapshots";
import PremiumPreview from "@/src/components/PremiumPreview";
import { fetchUserPlan } from "@/src/lib/user-plan";
import {
  getCompletedDates,
  getToday,
  getSessionNotes,
  getSessionTags,
  getSessionDurations,
  getWeekDates,
  computeStreaks,
  getRankSnapshots,
  saveRankSnapshot,
  getSavedPlaylist,
  setSavedPlaylist,
  getRankIndex,
  getOnboarding,
  PLAYLISTS,
  RANKS,
} from "@/src/lib/training-completion";
import type {
  SessionNote,
  FocusTag,
  RankSnapshot,
  OnboardingData,
  Playlist,
  Rank,
} from "@/src/lib/training-completion";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ProgressPage() {
  return (
    <Suspense>
      <ProgressContent />
    </Suspense>
  );
}

function StatCard({
  label,
  value,
  sub,
  locked,
  lockLabel,
}: {
  label: string;
  value: string;
  sub: string;
  locked?: boolean;
  lockLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-neutral-500">{label}</p>
        {locked && lockLabel && (
          <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[9px] font-medium text-neutral-500">
            {lockLabel}
          </span>
        )}
      </div>
      {locked ? (
        <p className="mt-2 text-2xl font-bold text-neutral-700">—</p>
      ) : (
        <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      )}
      <p className="mt-1 text-[11px] text-neutral-600">{locked ? `Unlock with ${lockLabel}` : sub}</p>
    </div>
  );
}

function ProgressContent() {
  const [plan, setPlan] = useState<"free" | "starter" | "pro">("free");
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());
  const [allNotes, setAllNotes] = useState<Record<string, SessionNote>>({});
  const [allTags, setAllTags] = useState<Record<string, FocusTag[]>>({});
  const [allDurations, setAllDurations] = useState<Record<string, number>>({});
  const [streaks, setStreaks] = useState({ current: 0, best: 0 });
  const [rankSnapshots, setRankSnapshots] = useState<RankSnapshot[]>([]);
  const [rankPlaylist, setRankPlaylist] = useState<Playlist>("2v2");
  const [showRankForm, setShowRankForm] = useState(false);
  const [formPlaylist, setFormPlaylist] = useState<Playlist>("2v2");
  const [formRank, setFormRank] = useState<Rank>("Gold I");
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);

  function loadFromStorage() {
    setCompletedDates(getCompletedDates());
    setAllNotes(getSessionNotes());
    setAllTags(getSessionTags());
    setAllDurations(getSessionDurations());
    setStreaks(computeStreaks());
    setRankSnapshots(getRankSnapshots());
    const pl = getSavedPlaylist();
    setRankPlaylist(pl);
    setFormPlaylist(pl);
    setOnboarding(getOnboarding());
  }

  useEffect(() => {
    // Load local data immediately
    loadFromStorage();

    // Check auth + sync DB for signed-in users
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setSignedIn(true);
        fetchUserPlan().then(setPlan);
        // Sync DB → localStorage, then re-read
        await Promise.all([syncCompletions(), syncRankSnapshots()]);
        loadFromStorage();
      }
      setReady(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const thisWeekDates = getWeekDates(0);
  const lastWeekDates = getWeekDates(1);
  const today = getToday();

  const thisWeekCount = thisWeekDates.filter((d) => completedDates.has(d)).length;
  const lastWeekCount = lastWeekDates.filter((d) => completedDates.has(d)).length;

  let weeklyTotalMinutes = 0;
  let weeklySessionsWithDuration = 0;
  for (const date of thisWeekDates) {
    if (allDurations[date]) {
      weeklyTotalMinutes += allDurations[date];
      weeklySessionsWithDuration++;
    }
  }

  const weeklyTagCounts: { tag: FocusTag; count: number }[] = [];
  {
    const counts = new Map<FocusTag, number>();
    for (const date of thisWeekDates) {
      const tags = allTags[date];
      if (tags) {
        for (const tag of tags) {
          counts.set(tag, (counts.get(tag) || 0) + 1);
        }
      }
    }
    for (const [tag, count] of counts) {
      weeklyTagCounts.push({ tag, count });
    }
    weeklyTagCounts.sort((a, b) => b.count - a.count);
  }

  // Rank delta
  const filteredSnapshots = rankSnapshots.filter((s) => s.playlist === rankPlaylist);
  const latestRank = filteredSnapshots.length > 0 ? filteredSnapshots[filteredSnapshots.length - 1] : null;
  const prevRank = filteredSnapshots.length > 1 ? filteredSnapshots[filteredSnapshots.length - 2] : null;

  let rankDeltaValue = "—";
  let rankDeltaSub = "Add a rank check-in";
  if (latestRank && prevRank) {
    const diff = getRankIndex(latestRank.rank) - getRankIndex(prevRank.rank);
    if (diff > 0) {
      rankDeltaValue = `+${diff}`;
      rankDeltaSub = `${prevRank.rank} → ${latestRank.rank}`;
    } else if (diff < 0) {
      rankDeltaValue = `${diff}`;
      rankDeltaSub = `${prevRank.rank} → ${latestRank.rank}`;
    } else {
      rankDeltaValue = "0";
      rankDeltaSub = `Holding at ${latestRank.rank}`;
    }
  } else if (latestRank) {
    rankDeltaValue = "—";
    rankDeltaSub = `${latestRank.rank} · Need 2+ check-ins`;
  }

  const delta = thisWeekCount - lastWeekCount;
  const trainedToday = completedDates.has(today);

  const recentNotes = Object.entries(allNotes)
    .filter(([, note]) => note.better.trim() || note.tomorrow.trim())
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 3);

  const insight =
    thisWeekCount === 0
      ? "Start with one session today — momentum beats motivation."
      : thisWeekCount >= 5
        ? "Strong week. Protect your rhythm."
        : delta > 0
          ? `You trained ${delta} more ${delta === 1 ? "day" : "days"} than last week.`
          : delta === 0 && thisWeekCount > 0
            ? "Matching last week's pace. Stay steady."
            : lastWeekCount > 0
              ? `${lastWeekCount - thisWeekCount} fewer ${lastWeekCount - thisWeekCount === 1 ? "day" : "days"} than last week. Still time to close the gap.`
              : "You're getting started. One session at a time.";

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
          <Link
            href="/dashboard"
            className="text-sm text-neutral-400 transition-colors hover:text-white"
          >
            Dashboard
          </Link>
        </nav>

        <section className="pt-20 pb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Progress Insights
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your progress.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            Consistency compounds. Here&apos;s proof you&apos;re showing up.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {signedIn && plan !== "free" && (
              <span className="rounded-full bg-indigo-600/20 px-2.5 py-0.5 text-[10px] font-medium text-indigo-400 capitalize">
                {plan}
              </span>
            )}
            {ready && !signedIn && (
              <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-0.5 text-[10px] font-medium text-neutral-500">
                Preview · local data
              </span>
            )}
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── First-time guidance ── */}
        {ready && completedDates.size === 0 && (
          <section className="py-10">
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] px-6 py-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/10">
                <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-neutral-300">
                No training sessions yet
              </p>
              <p className="mt-1.5 text-xs text-neutral-600">
                Complete your first session and your progress will appear here.
              </p>
              <Link
                href="/training"
                className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                Start training
              </Link>
            </div>
          </section>
        )}

        {/* ── Stat Cards ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Overview
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Current Streak"
              value={`${streaks.current}`}
              sub={streaks.current === 0 ? "Start today" : `${streaks.current === 1 ? "day" : "days"} in a row`}
            />
            <StatCard
              label="Best Streak"
              value={`${streaks.best}`}
              sub={
                streaks.current >= streaks.best && streaks.best > 0
                  ? "Personal best!"
                  : `${streaks.best === 1 ? "day" : "days"} record`
              }
              locked={plan === "free"}
              lockLabel="Starter+"
            />
            <StatCard
              label="This Week"
              value={`${thisWeekCount}/7`}
              sub={
                delta > 0
                  ? `+${delta} vs last week`
                  : delta < 0
                    ? `${delta} vs last week`
                    : "Same as last week"
              }
            />
            <StatCard
              label="Last Week"
              value={`${lastWeekCount}/7`}
              sub="Days trained"
            />
            <StatCard
              label="Minutes This Week"
              value={weeklyTotalMinutes > 0 ? `${weeklyTotalMinutes}` : "—"}
              sub={
                weeklySessionsWithDuration > 0
                  ? `${weeklySessionsWithDuration} ${weeklySessionsWithDuration === 1 ? "session" : "sessions"} logged`
                  : "No sessions logged"
              }
            />
            <StatCard
              label={`Rank Delta (${rankPlaylist})`}
              value={rankDeltaValue}
              sub={rankDeltaSub}
              locked={plan !== "pro"}
              lockLabel={plan === "free" ? "Starter+" : "Pro"}
            />
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── This Week Calendar ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            This Week
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            <div className="grid grid-cols-7 gap-1.5">
              {thisWeekDates.map((date, i) => {
                const done = completedDates.has(date);
                const isToday = date === today;
                return (
                  <div key={date} className="flex flex-col items-center gap-1.5">
                    <span
                      className={`text-[10px] font-medium ${
                        isToday ? "text-white" : "text-neutral-600"
                      }`}
                    >
                      {DAY_LABELS[i]}
                    </span>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        done
                          ? "bg-indigo-600/20"
                          : isToday
                            ? "ring-1 ring-neutral-700"
                            : "bg-neutral-800/30"
                      }`}
                    >
                      {done ? (
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
                      ) : (
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            isToday ? "bg-neutral-500" : "bg-neutral-700"
                          }`}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-center text-xs text-neutral-600">
              {insight}
            </p>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── This Week Focus ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Focus Tags
          </h2>
          {weeklyTagCounts.length === 0 ? (
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
              <p className="text-sm text-neutral-600">
                No focus tags yet. Tag what you practiced after each session.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {weeklyTagCounts.map(({ tag, count }) => (
                <span
                  key={tag}
                  className="rounded-full border border-indigo-500/30 bg-indigo-600/10 px-3 py-1.5 text-xs font-medium text-indigo-300"
                >
                  {tag} &middot; {count}
                </span>
              ))}
            </div>
          )}
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── Rank Snapshot ── */}
        <section className="py-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-500">
              Rank Snapshot
            </h2>
            <div className="flex gap-1">
              {PLAYLISTS.map((pl) => (
                <button
                  key={pl}
                  type="button"
                  onClick={() => {
                    setRankPlaylist(pl);
                    setSavedPlaylist(pl);
                  }}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                    rankPlaylist === pl
                      ? "bg-indigo-600/20 text-indigo-300"
                      : "text-neutral-600 hover:text-neutral-400"
                  }`}
                >
                  {pl}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
            {latestRank ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">
                    {latestRank.rank}
                  </span>
                  {prevRank && (() => {
                    const ci = getRankIndex(latestRank.rank);
                    const pi = getRankIndex(prevRank.rank);
                    const trend = ci > pi ? "up" : ci < pi ? "down" : "same";
                    return (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          trend === "up"
                            ? "bg-indigo-600/15 text-indigo-400"
                            : trend === "down"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-neutral-800 text-neutral-500"
                        }`}
                      >
                        {trend === "up"
                          ? "Trending up"
                          : trend === "down"
                            ? "Trending down"
                            : "No change"}
                      </span>
                    );
                  })()}
                </div>
                <p className="mt-2 text-[11px] text-neutral-600">
                  Last updated: {formatDate(latestRank.date)}
                </p>
              </>
            ) : (
              <p className="text-sm text-neutral-600">
                Not set yet.{" "}
                <Link
                  href="/rank"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  Add a rank check-in
                </Link>{" "}
                to start tracking.
              </p>
            )}
            <div className="mt-4 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setShowRankForm((v) => !v)}
                className="text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
              >
                {showRankForm ? "Cancel" : "Quick Update"}
              </button>
              <Link
                href="/rank"
                className="text-xs text-neutral-500 transition-colors hover:text-neutral-300"
              >
                Full check-in &rarr;
              </Link>
            </div>
            {showRankForm && (
              <div className="mt-4 flex flex-col gap-3 border-t border-neutral-800/60 pt-4">
                <div>
                  <label
                    htmlFor="rank-playlist"
                    className="mb-1.5 block text-[11px] font-medium text-neutral-500"
                  >
                    Playlist
                  </label>
                  <select
                    id="rank-playlist"
                    value={formPlaylist}
                    onChange={(e) =>
                      setFormPlaylist(e.target.value as Playlist)
                    }
                    className="w-full rounded-lg border border-neutral-800/60 bg-[#060608] px-3 py-2 text-sm text-white outline-none focus:border-neutral-700"
                  >
                    {PLAYLISTS.map((pl) => (
                      <option key={pl} value={pl}>
                        {pl}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="rank-select"
                    className="mb-1.5 block text-[11px] font-medium text-neutral-500"
                  >
                    Rank
                  </label>
                  <select
                    id="rank-select"
                    value={formRank}
                    onChange={(e) =>
                      setFormRank(e.target.value as Rank)
                    }
                    className="w-full rounded-lg border border-neutral-800/60 bg-[#060608] px-3 py-2 text-sm text-white outline-none focus:border-neutral-700"
                  >
                    {RANKS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const snapshot: RankSnapshot = {
                      date: getToday(),
                      playlist: formPlaylist,
                      rank: formRank,
                    };
                    saveRankSnapshot(snapshot);
                    upsertRankSnapshot(snapshot);
                    setRankSnapshots((prev) => [...prev, snapshot]);
                    setRankPlaylist(formPlaylist);
                    setSavedPlaylist(formPlaylist);
                    setShowRankForm(false);
                  }}
                  className="flex h-9 items-center justify-center rounded-lg bg-indigo-600 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Save Rank
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── Insights ── */}
        {plan === "free" ? (
          <PremiumPreview
            title="Insights"
            description="Starter unlocks insights that connect your focus + time + consistency."
            actions={
              <>
                <Link
                  href="/upgrade?plan=starter"
                  className="flex h-8 items-center justify-center rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Unlock Insights
                </Link>
                <Link
                  href="/pricing"
                  className="text-xs text-neutral-500 transition-colors hover:text-neutral-300"
                >
                  Compare plans
                </Link>
              </>
            }
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              <span className="text-sm leading-relaxed text-neutral-300">
                This week: <strong className="text-white">{thisWeekCount}/7</strong> sessions completed.
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-2.5 opacity-40">
              <div className="flex items-start gap-2.5">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500/50" />
                <span className="text-sm text-neutral-400">
                  Your top focus area and how it connects to your rank trend.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500/50" />
                <span className="text-sm text-neutral-400">
                  Personalized coaching based on your consistency pattern.
                </span>
              </div>
            </div>
          </PremiumPreview>
        ) : (
          <section className="py-10">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-sm font-medium text-neutral-500">Insights</h2>
              <span className="rounded-full bg-indigo-600/20 px-2.5 py-0.5 text-[10px] font-medium text-indigo-400">
                {plan === "pro" ? "Pro" : "Starter"}
              </span>
            </div>
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
              <ul className="flex flex-col gap-3">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  <span className="text-sm leading-relaxed text-neutral-300">
                    {weeklyTagCounts.length > 0
                      ? <>Top focus: <strong className="text-white">{weeklyTagCounts[0].tag}</strong> — tagged {weeklyTagCounts[0].count} {weeklyTagCounts[0].count === 1 ? "time" : "times"} this week.</>
                      : "No focus tags this week. Tag your sessions to see patterns."}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  <span className="text-sm leading-relaxed text-neutral-300">
                    {weeklySessionsWithDuration > 0
                      ? <>{weeklyTotalMinutes} minutes across {weeklySessionsWithDuration} {weeklySessionsWithDuration === 1 ? "session" : "sessions"} — averaging <strong className="text-white">{Math.round(weeklyTotalMinutes / weeklySessionsWithDuration)} min</strong> each.</>
                      : "No session durations logged yet. Track your time to see totals."}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  <span className="text-sm leading-relaxed text-neutral-300">
                    {thisWeekCount === 0
                      ? "This week is a blank page. Write the first line today."
                      : thisWeekCount >= 5
                        ? "You\u2019re putting in real work. Recovery matters too \u2014 listen to your body."
                        : delta > 0
                          ? "Trending up from last week. The consistency is paying off."
                          : "Every session counts. Focus on quality over quantity."}
                  </span>
                </li>
                {plan === "pro" && latestRank && prevRank && (() => {
                  const diff = getRankIndex(latestRank.rank) - getRankIndex(prevRank.rank);
                  if (diff === 0) return null;
                  return (
                    <li className="flex items-start gap-2.5">
                      <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                      <span className="text-sm leading-relaxed text-neutral-300">
                        {diff > 0
                          ? <>Rank climbed from <strong className="text-white">{prevRank.rank}</strong> to <strong className="text-white">{latestRank.rank}</strong> in {rankPlaylist}. Training is translating to results.</>
                          : <>Rank dropped from <strong className="text-white">{prevRank.rank}</strong> to <strong className="text-white">{latestRank.rank}</strong> in {rankPlaylist}. Stay patient — progress isn&apos;t always linear.</>}
                      </span>
                    </li>
                  );
                })()}
              </ul>
            </div>
          </section>
        )}

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── Recent Notes ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Recent Notes
          </h2>
          {recentNotes.length === 0 ? (
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
              <p className="text-sm text-neutral-600">
                No session notes yet. Complete a training session and reflect on
                what went well.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentNotes.map(([date, note]) => (
                <div
                  key={date}
                  className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-400">
                      {formatDate(date)}
                    </span>
                    {completedDates.has(date) && (
                      <span className="rounded-full bg-indigo-600/15 px-2 py-0.5 text-[10px] font-medium text-indigo-400">
                        Trained
                      </span>
                    )}
                  </div>
                  {note.better.trim() && (
                    <div className="mt-3">
                      <p className="text-[11px] font-medium text-neutral-500">
                        What felt better
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-neutral-300">
                        {note.better}
                      </p>
                    </div>
                  )}
                  {note.tomorrow.trim() && (
                    <div className="mt-3">
                      <p className="text-[11px] font-medium text-neutral-500">
                        Focus for next session
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-neutral-300">
                        {note.tomorrow}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── Next Action ── */}
        <section className="py-10">
          {onboarding && (
            <p className="mb-4 text-xs leading-relaxed text-neutral-500">
              {onboarding.goal === "Rank Up"
                ? "Small sessions daily beat big sessions sometimes."
                : onboarding.goal === "Build Consistency"
                  ? "Just show up \u2014 the streak does the heavy lifting."
                  : onboarding.goal === "Mechanics"
                    ? "Focus on clean reps, not flashy clips."
                    : "Play slower in your head, faster in your decisions."}
            </p>
          )}
          <div className="flex flex-col gap-3">
            {trainedToday ? (
              <Link
                href={`/training/plan?plan=${plan}`}
                className="flex h-11 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                View Weekly Plan
              </Link>
            ) : (
              <Link
                href={`/training?plan=${plan}`}
                className="flex h-11 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                Train Today
              </Link>
            )}
            <Link
              href="/dashboard"
              className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-300"
            >
              Back to Dashboard
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {ready && !signedIn && (
          <section className="py-10">
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5 text-center">
              <p className="text-sm text-neutral-400">
                Sign in to sync your data across devices and unlock plan features.
              </p>
              <Link
                href="/login?returnTo=/progress"
                className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                Sign in
              </Link>
            </div>
          </section>
        )}

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-center gap-4 py-8">
          <Link
            href="/dashboard"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            Dashboard
          </Link>
          <span className="text-neutral-800">&middot;</span>
          <Link
            href="/"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            Home
          </Link>
        </footer>
      </div>
    </main>
  );
}
