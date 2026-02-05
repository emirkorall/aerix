import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#060608] text-white">
      <div className="mx-auto max-w-5xl px-6">
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
            <Link
              href="/dashboard"
              className="rounded-md bg-white/[0.07] px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/[0.12]"
            >
              Sign in
            </Link>
          </div>
        </nav>

        <section className="flex flex-col items-center pt-24 pb-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.07] px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            <span className="text-xs font-medium text-indigo-300">
              For the Rocket League community
            </span>
          </div>

          <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl">
            Train together.
            <br />
            Improve together.
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-neutral-400">
            AERIX is a home for players who want to get better — at any level.
            Track your sessions, find teammates, and build habits that actually
            stick.
          </p>

          <div className="mt-10 flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-neutral-800 px-6 py-3 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-600 hover:text-neutral-200"
            >
              View Plans
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-20">
          <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-neutral-500">
            Explore
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/dashboard"
              className="group rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6 transition-colors hover:border-indigo-500/30 hover:bg-[#0e0e14]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                <svg
                  className="h-5 w-5 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white">Dashboard</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                Your sessions, stats, and streaks — all in one place.
              </p>
              <span className="mt-4 inline-block text-xs font-medium text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                Open →
              </span>
            </Link>

            <Link
              href="/training"
              className="group rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6 transition-colors hover:border-indigo-500/30 hover:bg-[#0e0e14]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                <svg
                  className="h-5 w-5 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white">Training</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                Structured programs for mechanics, game sense, and consistency.
              </p>
              <span className="mt-4 inline-block text-xs font-medium text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                Open →
              </span>
            </Link>

            <Link
              href="/play"
              className="group rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6 transition-colors hover:border-indigo-500/30 hover:bg-[#0e0e14]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                <svg
                  className="h-5 w-5 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white">Find Players</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                Looking for a duo or trio? Find players who match your vibe.
              </p>
              <span className="mt-4 inline-block text-xs font-medium text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                Open →
              </span>
            </Link>

            <Link
              href="/pricing"
              className="group rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6 transition-colors hover:border-indigo-500/30 hover:bg-[#0e0e14]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                <svg
                  className="h-5 w-5 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white">Pricing</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                Free to start. Upgrade when you&apos;re ready for more.
              </p>
              <span className="mt-4 inline-block text-xs font-medium text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                Open →
              </span>
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-between py-8">
          <span className="text-xs text-neutral-600">
            © 2025 AERIX
          </span>
          <span className="text-xs text-neutral-600">
            Made for the RL community
          </span>
        </footer>
      </div>
    </main>
  );
}
