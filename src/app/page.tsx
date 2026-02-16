import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";
import { isSupabaseConfigured } from "@/src/lib/supabase/validate";

export default async function Home() {
  let signedIn = false;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = !!user;
  }

  const startFreeHref = signedIn ? "/dashboard" : "/login?returnTo=/onboarding";
  const tryStarterHref = signedIn ? "/pricing" : "/login?returnTo=/pricing";

  return (
    <main className="min-h-screen bg-[#060608] text-white relative overflow-hidden">
      {/* Subtle dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6">
        {/* Nav */}
        <nav className="flex items-center justify-between py-6">
          <span className="text-sm font-semibold tracking-[0.2em] uppercase text-white">
            Aerix
          </span>
          <div className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Pricing
            </Link>
            {signedIn ? (
              <Link
                href="/dashboard"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-white/[0.07] px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/[0.12]"
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>

        {/* ───── Hero ───── */}
        <section className="flex flex-col items-center pt-28 pb-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.07] px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            <span className="text-xs font-medium text-indigo-300">
              Built for the Rocket League grind
            </span>
          </div>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Your rank-up starts
            <br />
            with consistency.
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-neutral-400">
            Train smarter. Track progress. Find reliable teammates.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href={startFreeHref}
              className="rounded-lg bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Start Free
            </Link>
            <Link
              href={tryStarterHref}
              className="rounded-lg border border-neutral-700 px-7 py-3.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
            >
              Try Starter (7 days)
            </Link>
          </div>

          <p className="mt-6 text-xs text-neutral-600">
            No Rocket League API required. Your progress stays yours.
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ───── Why AERIX ───── */}
        <section className="py-24">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-neutral-500">
            Why AERIX
          </p>
          <h2 className="mb-14 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Discord is great for chat. AERIX is built for progress.
          </h2>

          <div className="grid gap-5 sm:grid-cols-3">
            {/* Pillar 1 */}
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-7">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                </svg>
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">
                Consistency system
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-neutral-500">
                Build habits that actually stick.
              </p>
              <ul className="flex flex-col gap-2 text-sm text-neutral-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400/60" />
                  Daily streak + weekly goal tracking
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400/60" />
                  Consistency score so you see your discipline
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-7">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
                </svg>
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">
                Structured training
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-neutral-500">
                No more random free play sessions.
              </p>
              <ul className="flex flex-col gap-2 text-sm text-neutral-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400/60" />
                  Tiered programs matched to your rank
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400/60" />
                  Curated training packs with video guides
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-7">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">
                Quality matchmaking
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-neutral-500">
                Find teammates who actually show up.
              </p>
              <ul className="flex flex-col gap-2 text-sm text-neutral-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400/60" />
                  Request-to-play handshake — no random invites
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400/60" />
                  Safer and more reliable than Discord LFG
                </li>
              </ul>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ───── How it works ───── */}
        <section className="py-24">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-neutral-500">
            How it works
          </p>
          <h2 className="mb-14 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Three steps. No setup headaches.
          </h2>

          <div className="grid gap-10 sm:grid-cols-3 sm:gap-5">
            <div className="text-center sm:text-left">
              <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-indigo-500/30 text-sm font-semibold text-indigo-400">
                1
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">
                Pick your focus
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                Tell us your rank, playlist, and what you want to improve.
                Onboarding takes 30 seconds.
              </p>
            </div>

            <div className="text-center sm:text-left">
              <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-indigo-500/30 text-sm font-semibold text-indigo-400">
                2
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">
                Run your sessions
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                Follow your training plan, queue up packs, or jump into
                matchmaking when you want a duo.
              </p>
            </div>

            <div className="text-center sm:text-left">
              <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-indigo-500/30 text-sm font-semibold text-indigo-400">
                3
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">
                See your improvement
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                Track streaks, weekly progress, and rank check-ins.
                The data shows what&apos;s working.
              </p>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ───── What you unlock (Plans teaser) ───── */}
        <section className="py-24">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-neutral-500">
            Plans
          </p>
          <h2 className="mb-14 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Free to grind. Upgrade when you&apos;re ready.
          </h2>

          <div className="grid gap-5 sm:grid-cols-3">
            {/* Free */}
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
              <h3 className="text-base font-semibold text-white">Free</h3>
              <p className="mt-1 mb-5 text-xs text-neutral-500">Solo training basics</p>
              <ul className="flex flex-col gap-2.5 text-sm text-neutral-400">
                <li className="flex items-start gap-2">
                  <CheckIcon className="text-neutral-500" />
                  Daily streak tracking
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="text-neutral-500" />
                  3 training blocks
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="text-neutral-500" />
                  Basic progress view
                </li>
              </ul>
            </div>

            {/* Starter */}
            <div className="relative rounded-xl border border-indigo-500/30 bg-[#0c0c10] p-6">
              <div className="absolute -top-3 right-6 rounded-full bg-indigo-600 px-3 py-0.5 text-[11px] font-semibold text-white">
                Most start here
              </div>
              <h3 className="text-base font-semibold text-white">Starter</h3>
              <p className="mt-1 mb-5 text-xs text-neutral-500">
                Full training + insights
              </p>
              <ul className="flex flex-col gap-2.5 text-sm text-neutral-400">
                <li className="flex items-start gap-2">
                  <CheckIcon className="text-indigo-400" />
                  <span className="text-indigo-300">6 training blocks + weekly plan</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="text-indigo-400" />
                  <span className="text-indigo-300">Focus tags + session duration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="text-indigo-400" />
                  <span className="text-indigo-300">Personalized weekly insights</span>
                </li>
              </ul>
              <p className="mt-4 text-xs text-indigo-400/70">
                7-day free trial available
              </p>
            </div>

            {/* Pro */}
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
              <h3 className="text-base font-semibold text-white">Pro</h3>
              <p className="mt-1 mb-5 text-xs text-neutral-500">Competitive grinders</p>
              <ul className="flex flex-col gap-2.5 text-sm text-neutral-400">
                <li className="flex items-start gap-2">
                  <CheckIcon className="text-neutral-500" />
                  9 advanced training blocks
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="text-neutral-500" />
                  Rank trend insights
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon className="text-neutral-500" />
                  Deeper weekly summaries
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-6 py-3 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
            >
              View Plans
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ───── Training Packs teaser ───── */}
        <section className="py-24">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-12">
            <div className="mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-neutral-800/60 bg-[#0c0c10]">
              <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Training Packs
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
                Curated drill packs for aerials, shooting, saves, and more.
                Queue them up and grind with purpose.
              </p>
              <Link
                href="/packs"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Explore Packs
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ───── Season Updates teaser ───── */}
        <section className="py-24">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-12">
            <div className="mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-neutral-800/60 bg-[#0c0c10]">
              <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                Season Updates
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
                Stay current on patches, meta shifts, and what they mean for
                your training. Written for players, not patch note robots.
              </p>
              <Link
                href="/updates"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
              >
                See Updates
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ───── Footer CTA ───── */}
        <section className="py-24 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready for your next rank-up streak?
          </h2>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={startFreeHref}
              className="rounded-lg bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Start Free
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-neutral-700 px-7 py-3.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
            >
              View Plans
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ───── Footer ───── */}
        <footer className="flex items-center justify-between py-8">
          <span className="text-xs text-neutral-600">
            © {new Date().getFullYear()} AERIX
          </span>
          <span className="text-xs text-neutral-600">
            Made for the RL community
          </span>
        </footer>
      </div>
    </main>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`mt-0.5 h-4 w-4 shrink-0 ${className ?? ""}`}
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
  );
}
