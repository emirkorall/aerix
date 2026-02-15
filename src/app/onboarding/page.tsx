"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { saveOnboardingProfile, fetchOnboardingStatus } from "@/src/lib/onboarding";

const GOALS = ["Rank Up", "Mechanics", "Game Sense", "Consistency"] as const;
type Goal = (typeof GOALS)[number];

const PLAYLISTS = ["1v1", "2v2", "3v3"] as const;
type Playlist = (typeof PLAYLISTS)[number];

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

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1
  const [goal, setGoal] = useState<Goal>("Rank Up");
  // Step 2
  const [playlist, setPlaylist] = useState<Playlist>("2v2");
  // Step 3
  const [tier, setTier] = useState<Tier>("Gold");
  const [division, setDivision] = useState<Division>("I");
  const [skipRank, setSkipRank] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login?returnTo=/onboarding");
        return;
      }
      fetchOnboardingStatus().then((status) => {
        if (status.onboarding_completed) {
          router.replace("/dashboard");
          return;
        }
        setLoading(false);
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFinish() {
    setSaving(true);
    const isSSL = tier === "Supersonic Legend";
    const ok = await saveOnboardingProfile({
      focus_goal: goal,
      focus_playlist: playlist,
      rank_tier: skipRank ? null : tier,
      rank_division: skipRank || isSSL ? null : division,
    });
    if (ok) {
      router.push("/dashboard?welcome=1");
    }
    setSaving(false);
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

  const isSSL = tier === "Supersonic Legend";

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
        </nav>

        <section className="pt-20 pb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Step {step} of 3
          </p>
          {/* Progress bar */}
          <div className="mb-8 flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-indigo-600" : "bg-neutral-800"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Goal */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                What&apos;s your main goal?
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                Pick what matters most right now. You can always change this later.
              </p>

              <div className="mt-8 flex flex-col gap-3">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoal(g)}
                    className={`flex h-12 items-center rounded-xl border px-5 text-sm font-medium transition-colors ${
                      goal === g
                        ? "border-indigo-500/40 bg-indigo-600/10 text-indigo-300"
                        : "border-neutral-800/60 bg-[#0c0c10] text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Playlist */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Which playlist do you play most?
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                We&apos;ll tailor your training plan around this mode.
              </p>

              <div className="mt-8 flex flex-col gap-3">
                {PLAYLISTS.map((pl) => (
                  <button
                    key={pl}
                    type="button"
                    onClick={() => setPlaylist(pl)}
                    className={`flex h-12 items-center rounded-xl border px-5 text-sm font-medium transition-colors ${
                      playlist === pl
                        ? "border-indigo-500/40 bg-indigo-600/10 text-indigo-300"
                        : "border-neutral-800/60 bg-[#0c0c10] text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
                    }`}
                  >
                    {pl}
                  </button>
                ))}
              </div>

              <div className="mt-10 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Rank */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                What&apos;s your current rank?
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                Optional — helps us recommend the right drills for your level.
              </p>

              {!skipRank && (
                <div className="mt-8 flex flex-col gap-5">
                  {/* Tier */}
                  <div>
                    <label
                      htmlFor="ob-tier"
                      className="mb-1.5 block text-[11px] font-medium text-neutral-500"
                    >
                      Rank
                    </label>
                    <select
                      id="ob-tier"
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

                  {/* Preview */}
                  <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-4">
                    <p className="text-[11px] font-medium text-neutral-500">
                      Your rank
                    </p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {isSSL ? "Supersonic Legend" : `${tier} ${division}`}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-600">
                      {playlist}
                    </p>
                  </div>
                </div>
              )}

              {skipRank && (
                <div className="mt-8 rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
                  <p className="text-sm text-neutral-400">
                    No worries — you can set your rank anytime from the dashboard.
                  </p>
                </div>
              )}

              <div className="mt-10 flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
                >
                  Back
                </button>
                <div className="flex items-center gap-3">
                  {!skipRank && (
                    <button
                      onClick={() => setSkipRank(true)}
                      className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
                    >
                      Skip
                    </button>
                  )}
                  {skipRank && (
                    <button
                      onClick={() => setSkipRank(false)}
                      className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
                    >
                      Add rank
                    </button>
                  )}
                  <button
                    onClick={handleFinish}
                    disabled={saving}
                    className="flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Finish"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
