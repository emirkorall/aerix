"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { fetchUserPlan } from "@/src/lib/user-plan";
import type { PlanTier } from "@/src/lib/weekly-plan";
import type { TrainingBlock } from "@/src/lib/trainingPrograms";
import {
  ALL_DRILLS,
  getDrillById,
  drillTier,
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
  deleteDrillSave,
  replaceQueue,
} from "@/src/lib/supabase/sync-drills";

type Tab = "catalog" | "saved" | "queue";

const SECTION_TAG: Record<string, string> = {
  Mechanics: "mechanics",
  "Control / Free Play": "control",
  "Game Sense / Review": "game sense",
};

export default function LibraryPage() {
  const [plan, setPlan] = useState<PlanTier>("free");
  const [signedIn, setSignedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("catalog");
  const [saves, setSaves] = useState<string[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setSaves(getLocalSaves());
    setQueue(getLocalQueue());

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setSignedIn(true);
        const p = await fetchUserPlan();
        setPlan(p);
        await Promise.all([syncDrillSaves(), syncDrillQueue()]);
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

  const saveLimit = SAVE_LIMITS[plan];
  const queueLimit = QUEUE_LIMITS[plan];

  function toggleSave(drillId: string) {
    const isSaved = saves.includes(drillId);
    if (isSaved) {
      const next = saves.filter((id) => id !== drillId);
      setSaves(next);
      setLocalSaves(next);
      if (signedIn) deleteDrillSave(drillId);
      showToast("Drill removed");
    } else {
      if (saves.length >= saveLimit) {
        showToast(
          saveLimit === 5
            ? "Free limit reached (5). Upgrade for more."
            : `Save limit reached (${saveLimit}).`
        );
        return;
      }
      const next = [...saves, drillId];
      setSaves(next);
      setLocalSaves(next);
      if (signedIn) upsertDrillSave(drillId);
      showToast("Drill saved");
    }
  }

  function addToQueue(drillId: string) {
    if (queue.includes(drillId)) {
      showToast("Already in queue");
      return;
    }
    if (queue.length >= queueLimit) {
      showToast(
        queueLimit === 1
          ? "Free plan: 1 queued drill. Upgrade for more."
          : `Queue limit reached (${queueLimit}).`
      );
      return;
    }
    const next = [...queue, drillId];
    setQueue(next);
    setLocalQueue(next);
    if (signedIn) replaceQueue(next);
    showToast("Added to queue");
  }

  function removeFromQueue(drillId: string) {
    const next = queue.filter((id) => id !== drillId);
    setQueue(next);
    setLocalQueue(next);
    if (signedIn) replaceQueue(next);
  }

  const savedDrills = saves
    .map(getDrillById)
    .filter((d): d is TrainingBlock => !!d);

  const queuedDrills = queue
    .map(getDrillById)
    .filter((d): d is TrainingBlock => !!d);

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
              href="/training"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Training
            </Link>
          </div>
        </nav>

        {/* Header */}
        <section className="pt-20 pb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Training Library
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your drills.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            Save drills you like. Queue up your next session.
          </p>
          <p className="mt-3 text-xs text-neutral-600">
            Looking for curated bundles?{" "}
            <Link
              href="/packs"
              className="text-indigo-400 hover:text-indigo-300"
            >
              Browse Training Packs &rarr;
            </Link>
          </p>
          {ready && !signedIn && (
            <p className="mt-3 text-xs text-neutral-600">
              Preview mode &mdash; local only.{" "}
              <Link
                href="/login?returnTo=/library"
                className="text-indigo-400 hover:text-indigo-300"
              >
                Sign in to sync.
              </Link>
            </p>
          )}
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* Tabs */}
        <div className="flex gap-1 py-4">
          {([
            ["catalog", "All Drills"],
            ["saved", `Saved (${saves.length})`],
            ["queue", `Queue (${queue.length})`],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                tab === key
                  ? "bg-indigo-600/20 text-indigo-300"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* Catalog */}
        {tab === "catalog" && (
          <section className="py-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs text-neutral-600">
                {ALL_DRILLS.length} drills across all plans
              </p>
              <p className="text-[11px] text-neutral-700">
                Saves: {saves.length}/{saveLimit === Infinity ? "∞" : saveLimit}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {ALL_DRILLS.map((drill) => (
                <DrillCard
                  key={drill.id}
                  drill={drill}
                  isSaved={saves.includes(drill.id)}
                  isQueued={queue.includes(drill.id)}
                  onToggleSave={() => toggleSave(drill.id)}
                  onAddToQueue={() => addToQueue(drill.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Saved */}
        {tab === "saved" && (
          <section className="py-8">
            {savedDrills.length === 0 ? (
              <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6 text-center">
                <p className="text-sm text-neutral-500">
                  No saved drills yet. Browse the catalog to save some.
                </p>
                <button
                  type="button"
                  onClick={() => setTab("catalog")}
                  className="mt-4 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Go to catalog &rarr;
                </button>
              </div>
            ) : (
              <>
                <p className="mb-4 text-xs text-neutral-600">
                  {saves.length}/{saveLimit === Infinity ? "∞" : saveLimit} saved
                  {plan === "free" && (
                    <> &middot;{" "}
                      <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300">
                        Upgrade for more
                      </Link>
                    </>
                  )}
                </p>
                <div className="flex flex-col gap-3">
                  {savedDrills.map((drill) => (
                    <DrillCard
                      key={drill.id}
                      drill={drill}
                      isSaved
                      isQueued={queue.includes(drill.id)}
                      onToggleSave={() => toggleSave(drill.id)}
                      onAddToQueue={() => addToQueue(drill.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* Queue */}
        {tab === "queue" && (
          <section className="py-8">
            {queuedDrills.length === 0 ? (
              <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6 text-center">
                <p className="text-sm text-neutral-500">
                  Your next session queue is empty.
                </p>
                <button
                  type="button"
                  onClick={() => setTab("catalog")}
                  className="mt-4 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Add drills from catalog &rarr;
                </button>
              </div>
            ) : (
              <>
                <p className="mb-4 text-xs text-neutral-600">
                  {queue.length}/{queueLimit} queued
                  {plan === "free" && queue.length >= queueLimit && (
                    <> &middot;{" "}
                      <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[9px] font-medium text-neutral-500">
                        Starter+
                      </span>
                    </>
                  )}
                </p>
                <div className="flex flex-col gap-2">
                  {queuedDrills.map((drill, i) => (
                    <div
                      key={drill.id}
                      className="flex items-center gap-3 rounded-xl border border-neutral-800/60 bg-[#0c0c10] px-4 py-3"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-neutral-800 text-[11px] font-bold text-neutral-400">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {drill.title}
                        </p>
                        <p className="text-[11px] text-neutral-600">
                          {drill.creator} &middot; {SECTION_TAG[drill.section] ?? drill.section}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromQueue(drill.id)}
                        className="shrink-0 text-[11px] text-neutral-600 transition-colors hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <Link
                  href="/training?mode=queue"
                  className="mt-6 flex h-11 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Start Session
                </Link>
              </>
            )}
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
            href="/training"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            Training
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

// ── Drill Card ──

function DrillCard({
  drill,
  isSaved,
  isQueued,
  onToggleSave,
  onAddToQueue,
}: {
  drill: TrainingBlock;
  isSaved: boolean;
  isQueued: boolean;
  onToggleSave: () => void;
  onAddToQueue: () => void;
}) {
  const tier = drillTier(drill.id);
  const tag = SECTION_TAG[drill.section] ?? drill.section;

  return (
    <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-white">
              {drill.title}
            </h3>
            {tier !== "free" && (
              <span className="shrink-0 rounded-full border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-[9px] font-medium text-neutral-500 capitalize">
                {tier}
              </span>
            )}
          </div>
          <ul className="mt-1.5 flex flex-col gap-0.5">
            {drill.goals.slice(0, 2).map((goal, i) => (
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
      </div>

      {/* Tags + attribution */}
      <div className="mt-2.5 flex items-center gap-2">
        <span className="rounded-full bg-neutral-800/60 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
          {tag}
        </span>
        <span className="text-[10px] text-neutral-700">&middot;</span>
        <span className="text-[10px] text-neutral-600">
          {drill.creator}
        </span>
        <span className="text-[10px] text-neutral-700">&middot;</span>
        <a
          href={`https://www.youtube.com/watch?v=${drill.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-neutral-600 transition-colors hover:text-neutral-400"
        >
          YouTube &nearr;
        </a>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSave}
          className={`rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors ${
            isSaved
              ? "border-indigo-500/30 bg-indigo-600/15 text-indigo-300"
              : "border-neutral-800/60 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300"
          }`}
        >
          {isSaved ? "Saved" : "Save"}
        </button>
        <button
          type="button"
          onClick={onAddToQueue}
          disabled={isQueued}
          className={`rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors ${
            isQueued
              ? "border-neutral-800/40 text-neutral-700 cursor-default"
              : "border-neutral-800/60 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300"
          }`}
        >
          {isQueued ? "Queued" : "+ Queue"}
        </button>
      </div>
    </div>
  );
}
