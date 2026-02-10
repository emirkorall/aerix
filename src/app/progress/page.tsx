"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { parsePlanTier } from "@/src/lib/weekly-plan";
import PremiumPreview from "@/src/components/PremiumPreview";
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

function ProgressContent() {
  const searchParams = useSearchParams();
  const plan = parsePlanTier(searchParams.get("plan"));
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

  useEffect(() => {
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
  }, []);

  const thisWeekDates = getWeekDates(0);
  const lastWeekDates = getWeekDates(1);
  const today = getToday();

  const thisWeekCount = thisWeekDates.filter((d) => completedDates.has(d)).length;
  const lastWeekCount = lastWeekDates.filter((d) => completedDates.has(d)).length;

  const recentNotes = Object.entries(allNotes)
    .filter(([, note]) => note.better.trim() || note.tomorrow.trim())
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 3);

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

  let weeklyTotalMinutes = 0;
  let weeklySessionsWithDuration = 0;
  for (const date of thisWeekDates) {
    if (allDurations[date]) {
      weeklyTotalMinutes += allDurations[date];
      weeklySessionsWithDuration++;
    }
  }
  const weeklyAvgMinutes =
    weeklySessionsWithDuration > 0
      ? Math.round(weeklyTotalMinutes / weeklySessionsWithDuration)
      : 0;

  const delta = thisWeekCount - lastWeekCount;
  const trainedToday = completedDates.has(today);

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
            Dashboard
          </Link>
        </nav>

        <section className="pt-20 pb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Progress
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your progress.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            Consistency compounds. Here&apos;s proof you&apos;re showing up.
          </p>
          <div className="mt-5 flex gap-1">
            {(["free", "starter", "pro"] as const).map((p) => (
              <Link
                key={p}
                href={`/progress?plan=${p}`}
                className={`rounded-full px-3 py-1 text-[11px] font-medium capitalize transition-colors ${
                  plan === p
                    ? "bg-indigo-600/20 text-indigo-300"
                    : "text-neutral-600 hover:text-neutral-400"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── This Week ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            This Week
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">
                {thisWeekCount}
              </span>
              <span className="text-sm text-neutral-500">/ 7 days trained</span>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
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
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── Last Week ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Last Week
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">
                  {lastWeekCount}
                </span>
                <span className="text-sm text-neutral-500">
                  / 7 days trained
                </span>
              </div>
              {delta !== 0 && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    delta > 0
                      ? "bg-indigo-600/15 text-indigo-400"
                      : "bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {delta > 0 ? "+" : ""}
                  {delta} vs this week
                </span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {lastWeekDates.map((date, i) => {
                const done = completedDates.has(date);
                return (
                  <div key={date} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-medium text-neutral-600">
                      {DAY_LABELS[i]}
                    </span>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        done ? "bg-indigo-600/20" : "bg-neutral-800/30"
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
                        <div className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── Streak ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Streak
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
              <p className="text-xs font-medium text-neutral-500">Current</p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-white">
                  {streaks.current}
                </span>
                <span className="text-xs text-neutral-600">
                  {streaks.current === 1 ? "day" : "days"}
                </span>
              </div>
              {streaks.current > 0 && (
                <p className="mt-2 text-[11px] text-neutral-600">
                  Keep it going.
                </p>
              )}
            </div>
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
              <p className="text-xs font-medium text-neutral-500">Best</p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-white">
                  {streaks.best}
                </span>
                <span className="text-xs text-neutral-600">
                  {streaks.best === 1 ? "day" : "days"}
                </span>
              </div>
              {streaks.best > 0 && streaks.current >= streaks.best && (
                <p className="mt-2 text-[11px] text-indigo-400">
                  Personal best!
                </p>
              )}
            </div>
          </div>
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
          {(() => {
            const filtered = rankSnapshots.filter(
              (s) => s.playlist === rankPlaylist
            );
            const current = filtered.length > 0 ? filtered[filtered.length - 1] : null;
            const previous = filtered.length > 1 ? filtered[filtered.length - 2] : null;

            let trend: "up" | "down" | "same" | null = null;
            if (current && previous) {
              const ci = getRankIndex(current.rank);
              const pi = getRankIndex(previous.rank);
              if (ci > pi) trend = "up";
              else if (ci < pi) trend = "down";
              else trend = "same";
            }

            return (
              <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
                {current ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">
                        {current.rank}
                      </span>
                      {trend && (
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
                      )}
                    </div>
                    <p className="mt-2 text-[11px] text-neutral-600">
                      Last updated: {formatDate(current.date)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-neutral-600">
                    Not set yet. Add your current rank to start tracking.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setShowRankForm((v) => !v)}
                  className="mt-4 text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                >
                  {showRankForm ? "Cancel" : "Update Rank"}
                </button>
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
            );
          })()}
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── This Week Insight ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            This Week Insight
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
            <p className="text-sm leading-relaxed text-neutral-300">
              {insight}
            </p>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── This Week Focus ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            This Week Focus
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

        {/* ── This Week Time ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            This Week Time
          </h2>
          {weeklySessionsWithDuration === 0 ? (
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
              <p className="text-sm text-neutral-600">
                No duration logged yet. After each session, note how long you
                trained.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
                <p className="text-xs font-medium text-neutral-500">Total</p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-white">
                    {weeklyTotalMinutes}
                  </span>
                  <span className="text-xs text-neutral-600">min</span>
                </div>
              </div>
              <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
                <p className="text-xs font-medium text-neutral-500">
                  Avg / session
                </p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-white">
                    {weeklyAvgMinutes}
                  </span>
                  <span className="text-xs text-neutral-600">min</span>
                </div>
              </div>
            </div>
          )}
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
            {/* Real stat */}
            <div className="flex items-start gap-2.5">
              <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              <span className="text-sm leading-relaxed text-neutral-300">
                This week: <strong className="text-white">{thisWeekCount}/7</strong> sessions completed.
              </span>
            </div>

            {/* Muted example insights */}
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
                {/* Top focus tag */}
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  <span className="text-sm leading-relaxed text-neutral-300">
                    {weeklyTagCounts.length > 0
                      ? <>Top focus: <strong className="text-white">{weeklyTagCounts[0].tag}</strong> — tagged {weeklyTagCounts[0].count} {weeklyTagCounts[0].count === 1 ? "time" : "times"} this week.</>
                      : "No focus tags this week. Tag your sessions to see patterns."}
                  </span>
                </li>
                {/* Time invested */}
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  <span className="text-sm leading-relaxed text-neutral-300">
                    {weeklySessionsWithDuration > 0
                      ? <>{weeklyTotalMinutes} minutes across {weeklySessionsWithDuration} {weeklySessionsWithDuration === 1 ? "session" : "sessions"} — averaging <strong className="text-white">{weeklyAvgMinutes} min</strong> each.</>
                      : "No session durations logged yet. Track your time to see totals."}
                  </span>
                </li>
                {/* Best day */}
                <li className="flex items-start gap-2.5">
                  <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                  <span className="text-sm leading-relaxed text-neutral-300">
                    {(() => {
                      const firstIdx = thisWeekDates.findIndex((d) =>
                        completedDates.has(d)
                      );
                      if (firstIdx === -1)
                        return "No sessions this week yet. Start one today.";
                      return <>First session this week: <strong className="text-white">{DAY_LABELS[firstIdx]}</strong>.{" "}
                        {thisWeekCount >= 4
                          ? "Strong rhythm — keep protecting it."
                          : thisWeekCount >= 2
                            ? "Building momentum. Stay consistent."
                            : "One session down. Aim for two this week."}</>;
                    })()}
                  </span>
                </li>
                {/* Coach line */}
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
                {/* Pro-only: rank trend context */}
                {plan === "pro" && (() => {
                  const playlist = rankPlaylist;
                  const filtered = rankSnapshots.filter(
                    (s) => s.playlist === playlist
                  );
                  if (filtered.length < 2) return null;
                  const latest = filtered[filtered.length - 1];
                  const prev = filtered[filtered.length - 2];
                  const ci = getRankIndex(latest.rank);
                  const pi = getRankIndex(prev.rank);
                  const diff = ci - pi;
                  if (diff === 0) return null;
                  return (
                    <li className="flex items-start gap-2.5">
                      <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                      <span className="text-sm leading-relaxed text-neutral-300">
                        {diff > 0
                          ? <>Rank climbed from <strong className="text-white">{prev.rank}</strong> to <strong className="text-white">{latest.rank}</strong> in {playlist}. Training is translating to results.</>
                          : <>Rank dropped from <strong className="text-white">{prev.rank}</strong> to <strong className="text-white">{latest.rank}</strong> in {playlist}. Stay patient — progress isn&apos;t always linear.</>}
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
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Next Action
          </h2>
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
                href="/training/plan?plan=free"
                className="flex h-11 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                View Weekly Plan
              </Link>
            ) : (
              <Link
                href="/training?plan=free"
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
