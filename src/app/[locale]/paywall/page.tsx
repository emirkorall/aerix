import Link from "next/link";

export default function PaywallPage() {
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
            href="/pricing"
            className="text-sm text-neutral-400 transition-colors hover:text-white"
          >
            Plans
          </Link>
        </nav>

        <section className="flex flex-col items-center pt-24 pb-10 text-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600/15">
            <svg
              className="h-6 w-6 text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            This feature is part of a paid plan
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400">
            Some features — like finding teammates and community tools — are
            available on Starter and Pro plans.
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-5 text-sm font-medium text-neutral-500">
            Why is this paid?
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-600/15">
                  <svg
                    className="h-3 w-3 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Quality over quantity
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                    Paid features help us keep the community focused on players
                    who genuinely want to improve together.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-600/15">
                  <svg
                    className="h-3 w-3 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Better coordination
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                    Matchmaking and team features need active maintenance.
                    Subscriptions let us keep them running smoothly.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-600/15">
                  <svg
                    className="h-3 w-3 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Free training stays free
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">
                    Your daily training, streak system, and progress tracking
                    are always free. Paid plans add extras on top.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-5 text-sm font-medium text-neutral-500">
            Plans that unlock this
          </h2>
          <div className="flex flex-col gap-3">
            <Link
              href="/plans/starter"
              className="flex items-center justify-between rounded-xl border border-neutral-800/60 bg-[#0c0c10] px-5 py-4 transition-colors hover:border-neutral-700/60"
            >
              <div>
                <p className="text-sm font-semibold text-white">Starter</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Duo/Trio finder, training history, streak protection
                </p>
              </div>
              <span className="text-xs font-medium text-indigo-400">
                &euro;5.99/mo
              </span>
            </Link>
            <Link
              href="/plans/pro"
              className="flex items-center justify-between rounded-xl border border-neutral-800/60 bg-[#0c0c10] px-5 py-4 transition-colors hover:border-neutral-700/60"
            >
              <div>
                <p className="text-sm font-semibold text-white">Pro</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  Everything in Starter, plus priority matching &amp; summaries
                </p>
              </div>
              <span className="text-xs font-medium text-indigo-400">
                &euro;11.99/mo
              </span>
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <div className="flex flex-col gap-3">
            <Link
              href="/pricing"
              className="flex h-11 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              View Plans
            </Link>
            <Link
              href="/training"
              className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-300"
            >
              Continue Free Training
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-center py-8">
          <Link
            href="/"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            &larr; Back to home
          </Link>
        </footer>
      </div>
    </main>
  );
}
