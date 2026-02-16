"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { fetchUserPlan } from "@/src/lib/user-plan";
import type { PlanTier } from "@/src/lib/weekly-plan";
import {
  TRAINING_PACKS,
  canAccessPack,
} from "@/src/lib/trainingPacks";
import type { TrainingPack, PackDrill } from "@/src/lib/trainingPacks";
import {
  SAVE_LIMITS,
  QUEUE_LIMITS,
  getLocalSaves,
  setLocalSaves,
  getLocalQueue,
  setLocalQueue,
} from "@/src/lib/drill-library";
import {
  syncDrillSaves,
  syncDrillQueue,
  upsertDrillSave,
  replaceQueue,
} from "@/src/lib/supabase/sync-drills";
import {
  getLocalPackProgress,
  setLocalPackProgress,
  getPackStatus,
  getCompletedCount,
  mergeRemoteProgress,
} from "@/src/lib/packProgress";
import type { PackProgressMap, PackStatus } from "@/src/lib/packProgress";
import { getPackProgressMap, upsertPackProgress } from "@/src/lib/supabase/packProgress";

type Filter = "all" | "in_progress" | "completed";

const STATUS_LABEL: Record<PackStatus, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

const STATUS_STYLE: Record<PackStatus, string> = {
  not_started: "bg-neutral-800/60 text-neutral-500",
  in_progress: "bg-indigo-600/20 text-indigo-400",
  completed: "bg-emerald-600/20 text-emerald-400",
};

export default function PacksPage() {
  const [plan, setPlan] = useState<PlanTier>("free");
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [saves, setSaves] = useState<string[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [expandedPack, setExpandedPack] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [progress, setProgress] = useState<PackProgressMap>({});
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    setSaves(getLocalSaves());
    setQueue(getLocalQueue());
    setProgress(getLocalPackProgress());

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setSignedIn(true);
        const p = await fetchUserPlan();
        setPlan(p);
        const [remoteProgress] = await Promise.all([
          getPackProgressMap(),
          syncDrillSaves(),
          syncDrillQueue(),
        ]);
        const merged = mergeRemoteProgress(remoteProgress);
        setProgress(merged);
        setSaves(getLocalSaves());
        setQueue(getLocalQueue());
      }
      setReady(true);
    });
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function toggleDrillDone(pack: TrainingPack, drillId: string) {
    const map = { ...progress };
    const entry = map[pack.id] ?? { completedDrillIds: [], lastStartedAt: null };
    const has = entry.completedDrillIds.includes(drillId);

    if (has) {
      entry.completedDrillIds = entry.completedDrillIds.filter((id) => id !== drillId);
    } else {
      entry.completedDrillIds = [...entry.completedDrillIds, drillId];
      if (!entry.lastStartedAt) entry.lastStartedAt = new Date().toISOString();
    }

    map[pack.id] = { ...entry };
    setProgress(map);
    setLocalPackProgress(map);

    if (signedIn) {
      upsertPackProgress(pack.id, has ? [] : [drillId], !has && !entry.lastStartedAt);
    }
  }

  function savePack(pack: TrainingPack) {
    const saveLimit = SAVE_LIMITS[plan];
    const current = [...saves];
    let added = 0;

    for (const drill of pack.drills) {
      if (current.includes(drill.id)) continue;
      if (current.length >= saveLimit) {
        showToast(
          added > 0
            ? `Saved ${added} drill${added === 1 ? "" : "s"} — save limit reached (${saveLimit}).`
            : `Save limit reached (${saveLimit}). Upgrade for more.`
        );
        setSaves(current);
        setLocalSaves(current);
        return;
      }
      current.push(drill.id);
      if (signedIn) upsertDrillSave(drill.id);
      added++;
    }

    setSaves(current);
    setLocalSaves(current);
    showToast(`Saved ${added} drill${added === 1 ? "" : "s"} from pack`);
  }

  function queuePack(pack: TrainingPack) {
    const queueLimit = QUEUE_LIMITS[plan];
    const current = [...queue];
    let added = 0;

    for (const drill of pack.drills) {
      if (current.includes(drill.id)) continue;
      if (current.length >= queueLimit) break;
      current.push(drill.id);
      added++;
    }

    if (added === 0) {
      showToast(
        current.length >= queueLimit
          ? `Queue full (${queueLimit}). Upgrade for more.`
          : "All drills already queued"
      );
      return;
    }

    setQueue(current);
    setLocalQueue(current);
    if (signedIn) replaceQueue(current);
    showToast(`Queued ${added} drill${added === 1 ? "" : "s"}`);
  }

  const filteredPacks = TRAINING_PACKS.filter((pack) => {
    if (filter === "all") return true;
    const status = getPackStatus(pack, progress[pack.id]);
    return status === filter;
  });

  return (
    <main className="min-h-screen bg-[#060608] text-white">
      <div className="mx-auto max-w-xl px-6">
        {/* Nav */}
        <nav className="flex items-center justify-between py-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.2em] uppercase text-white"
          >
            Aerix
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/library"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Library
            </Link>
          </div>
        </nav>

        {/* Header */}
        <section className="pt-20 pb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Premium Content
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Training Packs
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            Curated drill bundles to level up specific skills. Save or queue an
            entire pack in one click.
          </p>
          {ready && !signedIn && (
            <p className="mt-3 text-xs text-neutral-600">
              Preview mode &mdash; local only.{" "}
              <Link
                href="/login?returnTo=/packs"
                className="text-indigo-400 hover:text-indigo-300"
              >
                Sign in to sync.
              </Link>
            </p>
          )}
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* Filter Toggle */}
        <div className="flex gap-1 py-4">
          {(["all", "in_progress", "completed"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-indigo-600/20 text-indigo-300"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {f === "all" ? "All" : f === "in_progress" ? "In Progress" : "Completed"}
            </button>
          ))}
        </div>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* Pack List */}
        <section className="py-8">
          {filteredPacks.length === 0 ? (
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6 text-center">
              <p className="text-sm text-neutral-500">
                No packs match this filter.
              </p>
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="mt-3 text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                Show all packs &rarr;
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {filteredPacks.map((pack) => {
                const unlocked = canAccessPack(pack, plan);
                const isExpanded = expandedPack === pack.id;
                const status = getPackStatus(pack, progress[pack.id]);
                const doneCount = getCompletedCount(pack, progress[pack.id]);
                const total = pack.drills.length;
                const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

                return (
                  <div
                    key={pack.id}
                    className={`rounded-xl border p-5 ${
                      unlocked
                        ? "border-neutral-800/60 bg-[#0c0c10]"
                        : "border-neutral-800/40 bg-[#0a0a0d]"
                    }`}
                  >
                    {/* Pack Header */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedPack(isExpanded ? null : pack.id)
                      }
                      className="flex w-full items-start justify-between gap-3 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-semibold text-white">
                            {pack.title}
                          </h2>
                          <span className="shrink-0 rounded-full bg-neutral-800/60 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                            {pack.levelTag}
                          </span>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLE[status]}`}>
                            {STATUS_LABEL[status]}
                          </span>
                          {!unlocked && (
                            <span className="shrink-0 rounded-full border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-[9px] font-medium text-neutral-500 capitalize">
                              {pack.planAccess}
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                          {pack.description}
                        </p>

                        {/* Progress line + bar */}
                        <div className="mt-2 flex items-center gap-2.5">
                          <p className="text-[11px] text-neutral-600">
                            {doneCount} / {total} drills
                          </p>
                          <div className="h-1.5 flex-1 rounded-full bg-neutral-800/60">
                            <div
                              className={`h-full rounded-full transition-all ${
                                pct >= 100 ? "bg-emerald-500" : "bg-indigo-500"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <svg
                        className={`mt-0.5 h-4 w-4 shrink-0 text-neutral-600 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </button>

                    {/* Expanded Drills */}
                    {isExpanded && (
                      <div className="mt-4">
                        <div className="h-px w-full bg-neutral-800/40" />
                        <div className="mt-4 flex flex-col gap-3">
                          {(unlocked
                            ? pack.drills
                            : pack.drills.slice(0, 1)
                          ).map((drill) => (
                            <PackDrillCard
                              key={drill.id}
                              drill={drill}
                              done={
                                progress[pack.id]?.completedDrillIds.includes(
                                  drill.id
                                ) ?? false
                              }
                              canToggle={unlocked}
                              onToggle={() => toggleDrillDone(pack, drill.id)}
                            />
                          ))}

                          {!unlocked && pack.drills.length > 1 && (
                            <div className="rounded-lg border border-neutral-800/40 bg-neutral-900/30 p-4 text-center">
                              <p className="text-xs text-neutral-500">
                                +{pack.drills.length - 1} more drill
                                {pack.drills.length - 1 === 1 ? "" : "s"} in
                                this pack
                              </p>
                              <Link
                                href="/pricing"
                                className="mt-2 inline-block text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                              >
                                Upgrade to unlock full pack &rarr;
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Pack actions */}
                        {unlocked && (
                          <div className="mt-4 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => savePack(pack)}
                              className="rounded-lg border border-neutral-800/60 px-3.5 py-2 text-[11px] font-medium text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-300"
                            >
                              Save Pack
                            </button>
                            <button
                              type="button"
                              onClick={() => queuePack(pack)}
                              className="rounded-lg border border-neutral-800/60 px-3.5 py-2 text-[11px] font-medium text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-300"
                            >
                              Queue Pack Session
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* Disclosure */}
        <p className="py-6 text-center text-[10px] text-neutral-700">
          Videos are embedded from YouTube and belong to their respective
          creators.
        </p>

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
            href="/library"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            Library
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

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-neutral-800/60 bg-[#0c0c10] px-4 py-2.5 text-xs font-medium text-neutral-300 shadow-lg">
          {toast}
        </div>
      )}
    </main>
  );
}

// ── Pack Drill Card ──

function PackDrillCard({
  drill,
  done,
  canToggle,
  onToggle,
}: {
  drill: PackDrill;
  done: boolean;
  canToggle: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`rounded-lg border p-3.5 ${
        done
          ? "border-indigo-500/30 bg-indigo-500/[0.04]"
          : "border-neutral-800/40 bg-[#060608]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-white">{drill.title}</h3>
          <ul className="mt-1.5 flex flex-col gap-0.5">
            {drill.goals.map((goal, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-[11px] leading-relaxed text-neutral-500"
              >
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-indigo-500/40" />
                <span className="line-clamp-1">{goal}</span>
              </li>
            ))}
          </ul>
        </div>
        {canToggle && (
          <button
            type="button"
            onClick={onToggle}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
              done
                ? "border-indigo-500 bg-indigo-600"
                : "border-neutral-700 bg-transparent hover:border-neutral-600"
            }`}
          >
            {done && (
              <svg
                className="h-3 w-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <span className="rounded-full bg-neutral-800/60 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
          {drill.section}
        </span>
        <span className="text-[10px] text-neutral-700">&middot;</span>
        <span className="text-[10px] text-neutral-600">{drill.creator}</span>
        {drill.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-neutral-800/40 px-1.5 py-0.5 text-[9px] text-neutral-600"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-2">
        <a
          href={`https://www.youtube.com/watch?v=${drill.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-neutral-600 transition-colors hover:text-neutral-400"
        >
          Watch on YouTube &nearr;
        </a>
      </div>
    </div>
  );
}
