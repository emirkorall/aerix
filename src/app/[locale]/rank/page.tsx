"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchUserPlan } from "@/src/lib/user-plan";
import {
  getToday,
  saveRankSnapshot,
  getRankSnapshots,
  setSavedPlaylist,
  RANKS,
} from "@/src/lib/training-completion";
import type { Playlist, Rank, RankSnapshot } from "@/src/lib/training-completion";
import { upsertRankSnapshot } from "@/src/lib/supabase/sync-rank-snapshots";

const TIERS = [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Champion",
  "Grand Champion",
  "Supersonic Legend",
] as const;

type Tier = (typeof TIERS)[number];

const DIVISIONS = ["I", "II", "III"] as const;
type Division = (typeof DIVISIONS)[number];

const RANK_NOTES_KEY = "aerix.rankCheckinNotes";

function saveRankNote(date: string, playlist: string, note: string) {
  try {
    const raw = localStorage.getItem(RANK_NOTES_KEY);
    const all: Record<string, string> = raw ? JSON.parse(raw) : {};
    all[`${date}|${playlist}`] = note;
    localStorage.setItem(RANK_NOTES_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export default function RankPage() {
  const [plan, setPlan] = useState<"free" | "starter" | "pro">("free");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [playlist, setPlaylist] = useState<Playlist>("2v2");
  const [tier, setTier] = useState<Tier>("Gold");
  const [division, setDivision] = useState<Division>("I");
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchUserPlan().then((p) => {
      setPlan(p as "free" | "starter" | "pro");
      setLoading(false);
    });
  }, []);

  const isSSL = tier === "Supersonic Legend";
  const rankStr = isSSL ? "Supersonic Legend" : `${tier} ${division}`;
  const isValidRank = RANKS.includes(rankStr as Rank);
  const today = getToday();

  async function handleSave() {
    if (!isValidRank || saving) return;
    setSaving(true);

    const snapshot: RankSnapshot = {
      date: today,
      playlist,
      rank: rankStr as Rank,
    };

    saveRankSnapshot(snapshot);
    setSavedPlaylist(playlist);

    if (note.trim()) {
      saveRankNote(today, playlist, note.trim());
    }

    await upsertRankSnapshot(snapshot);

    // Free plan: keep latest 3 check-ins only
    if (plan === "free") {
      const all = getRankSnapshots();
      if (all.length > 3) {
        const kept = all.slice(all.length - 3);
        localStorage.setItem("aerix.rankSnapshots", JSON.stringify(kept));
      }
    }

    setSaving(false);
    setSaved(true);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#060608] text-white">
        <div className="mx-auto max-w-xl px-6 py-20">
          <p className="text-sm text-neutral-600">Loading…</p>
        </div>
      </main>
    );
  }

  if (saved) {
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

          <section className="flex flex-col items-center py-32 text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600/20">
              <svg
                className="h-7 w-7 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Rank saved.
            </h1>
            <p className="mt-3 text-sm text-neutral-400">
              {rankStr} in {playlist} — recorded for {today}.
            </p>
            <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
              <Link
                href="/progress"
                className="flex h-11 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                View Progress
              </Link>
              <Link
                href="/dashboard"
                className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-300"
              >
                Back to Dashboard
              </Link>
            </div>
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
            Dashboard
          </Link>
        </nav>

        <section className="pt-20 pb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Rank Check-in
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Log your rank.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            Quick rank check-in (30 seconds). Track your climb over time.
          </p>
          {plan === "free" && (
            <p className="mt-3 text-xs text-neutral-600">
              Free plan keeps your latest 3 check-ins.{" "}
              <Link
                href="/pricing"
                className="text-indigo-400 hover:text-indigo-300"
              >
                Upgrade for unlimited.
              </Link>
            </p>
          )}
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <div className="flex flex-col gap-6">
            {/* Playlist */}
            <div>
              <p className="mb-2 text-[11px] font-medium text-neutral-500">
                Playlist
              </p>
              <div className="flex gap-2">
                {(["1v1", "2v2", "3v3"] as Playlist[]).map((pl) => (
                  <button
                    key={pl}
                    type="button"
                    onClick={() => setPlaylist(pl)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      playlist === pl
                        ? "border-indigo-500/40 bg-indigo-600/20 text-indigo-300"
                        : "border-neutral-800/60 bg-[#0c0c10] text-neutral-500 hover:border-neutral-700 hover:text-neutral-400"
                    }`}
                  >
                    {pl}
                  </button>
                ))}
              </div>
            </div>

            {/* Rank Tier */}
            <div>
              <label
                htmlFor="rank-tier"
                className="mb-1.5 block text-[11px] font-medium text-neutral-500"
              >
                Rank
              </label>
              <select
                id="rank-tier"
                value={tier}
                onChange={(e) => setTier(e.target.value as Tier)}
                className="w-full rounded-lg border border-neutral-800/60 bg-[#060608] px-3 py-2.5 text-sm text-white outline-none focus:border-neutral-700"
              >
                {TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Division */}
            {!isSSL && (
              <div>
                <p className="mb-2 text-[11px] font-medium text-neutral-500">
                  Division
                </p>
                <div className="flex gap-2">
                  {DIVISIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDivision(d)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        division === d
                          ? "border-indigo-500/40 bg-indigo-600/20 text-indigo-300"
                          : "border-neutral-800/60 bg-[#0c0c10] text-neutral-500 hover:border-neutral-700 hover:text-neutral-400"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Note */}
            <div>
              <label
                htmlFor="rank-note"
                className="mb-1.5 block text-[11px] font-medium text-neutral-500"
              >
                Note{" "}
                <span className="text-neutral-700">(optional)</span>
              </label>
              <input
                id="rank-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={120}
                placeholder="e.g. Felt confident in rotations today"
                className="w-full rounded-lg border border-neutral-800/60 bg-[#0c0c10] px-3 py-2.5 text-sm text-white placeholder-neutral-700 outline-none transition-colors focus:border-neutral-700"
              />
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-4">
              <p className="text-[11px] font-medium text-neutral-500">
                Saving as
              </p>
              <p className="mt-1 text-lg font-bold text-white">{rankStr}</p>
              <p className="mt-0.5 text-xs text-neutral-600">
                {playlist} &middot; {today}
              </p>
            </div>

            {/* Save */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !isValidRank}
              className={`flex h-11 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                saving || !isValidRank
                  ? "cursor-not-allowed bg-neutral-800/60 text-neutral-600"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
              }`}
            >
              {saving ? "Saving\u2026" : "Save Check-in"}
            </button>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-center gap-4 py-8">
          <Link
            href="/progress"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            Progress
          </Link>
          <span className="text-neutral-800">&middot;</span>
          <Link
            href="/dashboard"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            Dashboard
          </Link>
        </footer>
      </div>
    </main>
  );
}
