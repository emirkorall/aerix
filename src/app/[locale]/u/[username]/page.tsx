import Link from "next/link";
import { isSupabaseConfigured } from "@/src/lib/supabase/validate";
import CopyLinkButton from "./CopyLinkButton";

interface PublicProfile {
  username: string;
  focus_goal: string | null;
  focus_playlist: string | null;
  rank_tier: string | null;
  rank_division: string | null;
  weekly_goal_days: number;
  current_streak: number;
  packs_completed_count: number;
  consistency_score: number;
  created_at: string;
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  let profile: PublicProfile | null = null;

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import("@/src/lib/supabase/server");
      const supabase = await createClient();
      const { data } = await supabase
        .from("public_profiles_view")
        .select("*")
        .eq("username", username)
        .single();
      profile = data;
    } catch {
      // Not found or query error
    }
  }

  if (!profile) {
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
          </nav>
          <section className="flex flex-col items-center pt-32 pb-20 text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800/40">
              <svg
                className="h-6 w-6 text-neutral-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Profile not found</h1>
            <p className="mt-3 text-sm text-neutral-400">
              This profile doesn&apos;t exist or isn&apos;t public yet.
            </p>
            <Link
              href="/pricing"
              className="mt-8 flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Try AERIX
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const rankDisplay = profile.rank_tier
    ? profile.rank_division
      ? `${profile.rank_tier} ${profile.rank_division}`
      : profile.rank_tier
    : null;

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
        </nav>

        {/* Header */}
        <section className="pt-20 pb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {profile.username}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Rocket League grind &mdash; tracked on AERIX
          </p>
          <p className="mt-1 text-xs text-neutral-600">
            Member since{" "}
            {new Date(profile.created_at).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* Stats */}
        <section className="py-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
              <p className="text-[11px] font-medium text-neutral-500">
                Current Streak
              </p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span
                  className={`text-2xl font-bold ${
                    profile.current_streak >= 7 ? "text-indigo-300" : "text-white"
                  }`}
                >
                  {profile.current_streak}
                </span>
                <span className="text-sm text-neutral-500">days</span>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
              <p className="text-[11px] font-medium text-neutral-500">
                Weekly Goal
              </p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-white">
                  {profile.weekly_goal_days}
                </span>
                <span className="text-sm text-neutral-500">days/week</span>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
              <p className="text-[11px] font-medium text-neutral-500">
                Consistency
              </p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span
                  className={`text-2xl font-bold ${
                    profile.consistency_score >= 70 ? "text-indigo-300" : "text-white"
                  }`}
                >
                  {profile.consistency_score}
                </span>
                <span className="text-sm text-neutral-500">%</span>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
              <p className="text-[11px] font-medium text-neutral-500">
                Packs Completed
              </p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-white">
                  {profile.packs_completed_count}
                </span>
              </div>
            </div>

            {rankDisplay && (
              <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
                <p className="text-[11px] font-medium text-neutral-500">Rank</p>
                <p className="mt-2 text-lg font-bold text-white">
                  {rankDisplay}
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* Focus */}
        {(profile.focus_goal || profile.focus_playlist) && (
          <>
            <section className="py-10">
              <h2 className="mb-6 text-sm font-medium text-neutral-500">
                Focus
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.focus_goal && (
                  <span className="rounded-full border border-indigo-500/30 bg-indigo-600/10 px-3 py-1 text-xs font-medium text-indigo-300">
                    {profile.focus_goal}
                  </span>
                )}
                {profile.focus_playlist && (
                  <span className="rounded-full border border-neutral-800/60 bg-neutral-800/40 px-3 py-1 text-xs font-medium text-neutral-400">
                    {profile.focus_playlist}
                  </span>
                )}
              </div>
            </section>

            <div className="h-px w-full bg-neutral-800/60" />
          </>
        )}

        {/* Actions */}
        <section className="py-10">
          <div className="flex flex-col gap-3">
            <CopyLinkButton username={profile.username} />
            <Link
              href="/pricing"
              className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-300"
            >
              Try AERIX
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-center py-8">
          <Link
            href="/"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            AERIX &mdash; Train smarter
          </Link>
        </footer>
      </div>
    </main>
  );
}
