"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getOnboarding,
  saveOnboarding,
  GOALS,
  PLAYLISTS,
} from "@/src/lib/training-completion";
import type { Goal, Playlist } from "@/src/lib/training-completion";

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
  const [goal, setGoal] = useState<Goal>("Rank Up");
  const [playlist, setPlaylist] = useState<Playlist>("2v2");
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [didReset, setDidReset] = useState(false);
  const [hasOnboarding, setHasOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const ob = getOnboarding();
    setHasOnboarding(ob !== null);
    if (ob) {
      setGoal(ob.goal);
      setPlaylist(ob.playlist);
    }
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
              Dashboard
            </Link>
          </nav>
          <section className="flex flex-col items-center pt-32 pb-20 text-center">
            <p className="text-sm leading-relaxed text-neutral-400">
              Set up your preferences first to use Settings.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Set up now
            </Link>
            <p className="mt-3 text-xs text-neutral-600">
              No account needed yet.
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
            Dashboard
          </Link>
        </nav>

        <section className="pt-20 pb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Settings
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your preferences.
          </h1>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── Preferences ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Preferences
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            <div>
              <p className="mb-2 text-[11px] font-medium text-neutral-400">
                Goal
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
                Main Playlist
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
              {prefsSaved ? "Saved." : "Save Preferences"}
            </button>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ── Data ── */}
        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">Data</h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            {didReset ? (
              <div className="text-center">
                <p className="text-sm font-medium text-indigo-300">
                  Reset complete.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-3 inline-block text-xs text-neutral-500 transition-colors hover:text-neutral-300"
                >
                  Back to Dashboard &rarr;
                </Link>
              </div>
            ) : (
              <>
                <p className="text-xs leading-relaxed text-neutral-500">
                  This removes all local training data, preferences, and
                  progress from this browser. This cannot be undone.
                </p>
                <button
                  onClick={() => {
                    if (!confirm("Reset all local AERIX data? This cannot be undone.")) return;
                    for (const key of RESET_KEYS) {
                      localStorage.removeItem(key);
                    }
                    setDidReset(true);
                  }}
                  className="mt-4 flex h-10 w-full items-center justify-center rounded-lg border border-red-500/20 bg-red-500/[0.06] text-sm font-medium text-red-400 transition-colors hover:bg-red-500/[0.12]"
                >
                  Reset my local data
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
            &larr; Back to Dashboard
          </Link>
        </footer>
      </div>
    </main>
  );
}
