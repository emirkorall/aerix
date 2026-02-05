import Link from "next/link";

const check = (
  <svg className="h-4 w-4 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const checkAccent = (
  <svg className="h-4 w-4 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

export default function StarterPlan() {
  return (
    <main className="min-h-screen bg-[#060608] text-white">
      <div className="mx-auto max-w-xl px-6">
        <nav className="flex items-center justify-between py-6">
          <Link href="/" className="text-sm font-semibold tracking-[0.2em] uppercase text-white">
            Aerix
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-neutral-400 transition-colors hover:text-white"
          >
            All plans
          </Link>
        </nav>

        <section className="pt-20 pb-10">
          <div className="mb-4 inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-400">
            Most popular
          </div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Starter Plan
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Train hard. Play together.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            Starter is for players who want more than solo grind. You get
            everything in Free, plus access to the Duo / Trio finder so you can
            actually play with people who care about improving. This is the plan
            most players pick.
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Everything in Free, plus
          </h2>
          <ul className="flex flex-col gap-4 text-sm text-neutral-300">
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5">{checkAccent}</span>
              <div>
                <p className="font-medium text-indigo-300">Duo / Trio finder</p>
                <p className="mt-0.5 text-neutral-500">
                  Find teammates who match your rank, schedule, and playstyle.
                  No more random queues with people who don&apos;t communicate.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5">{check}</span>
              <div>
                <p className="font-medium text-white">Full training history</p>
                <p className="mt-0.5 text-neutral-500">
                  See all your past sessions — not just the last 7 days. Spot
                  patterns and track what&apos;s actually working.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5">{check}</span>
              <div>
                <p className="font-medium text-white">Streak protection</p>
                <p className="mt-0.5 text-neutral-500">
                  Life happens. Get 1 streak save per month so a missed day
                  doesn&apos;t reset everything.
                </p>
              </div>
            </li>
          </ul>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-4 text-sm font-medium text-neutral-500">
            Who is this for?
          </h2>
          <p className="text-sm leading-relaxed text-neutral-400">
            You play a few times a week. You want to improve, but you also want
            to find people to queue with who take it at least a little seriously.
            You don&apos;t need every feature — just the ones that matter.
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">€5.99</p>
            <span className="text-sm text-neutral-500">/month</span>
          </div>
          <p className="mt-1 text-xs text-neutral-600">
            Regional pricing available. Cancel anytime.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Upgrade to Starter
          </Link>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-between py-8">
          <Link href="/plans/free" className="text-xs text-neutral-600 transition-colors hover:text-neutral-400">
            ← Free plan
          </Link>
          <Link href="/plans/pro" className="text-xs text-neutral-600 transition-colors hover:text-neutral-400">
            Pro plan →
          </Link>
        </footer>
      </div>
    </main>
  );
}
