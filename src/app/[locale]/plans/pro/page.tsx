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

export default function ProPlan() {
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
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Pro Plan
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Built for the grind.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-neutral-400">
            Pro is for players who are serious about ranking up. You get
            everything in Starter, plus better matchmaking visibility, more
            streak flexibility, and training summaries that actually help you
            see the bigger picture.
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Everything in Starter, plus
          </h2>
          <ul className="flex flex-col gap-4 text-sm text-neutral-300">
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5">{checkAccent}</span>
              <div>
                <p className="font-medium text-indigo-300">Priority in Duo / Trio finder</p>
                <p className="mt-0.5 text-neutral-500">
                  Your profile shows up higher when other players are looking for
                  teammates. More visibility means better matches, faster.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5">{check}</span>
              <div>
                <p className="font-medium text-white">3 streak saves per month</p>
                <p className="mt-0.5 text-neutral-500">
                  More room for off days without losing your momentum. Because
                  consistency shouldn&apos;t punish you for having a life.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5">{check}</span>
              <div>
                <p className="font-medium text-white">Weekly &amp; monthly summaries</p>
                <p className="mt-0.5 text-neutral-500">
                  See how your training volume, focus areas, and consistency
                  change over time. Not fancy charts — just clear, useful data.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5">{check}</span>
              <div>
                <p className="font-medium text-white">Extended streak protection</p>
                <p className="mt-0.5 text-neutral-500">
                  More flexible streak rules that adapt to how you actually
                  play, not a rigid daily requirement.
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
            You&apos;re grinding ranked almost every day. You care about your
            mechanics and your game sense. You want to find teammates who take
            it seriously, and you want to see whether your training is actually
            translating into results. Pro gives you the tools to stay honest
            with yourself.
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-white">€11.99</p>
            <span className="text-sm text-neutral-500">/month</span>
          </div>
          <p className="mt-1 text-xs text-neutral-600">
            Regional pricing available. Cancel anytime.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Link
              href="/upgrade?plan=pro"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Go Pro
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
            >
              Compare all plans
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-between py-8">
          <Link href="/plans/starter" className="text-xs text-neutral-600 transition-colors hover:text-neutral-400">
            ← Starter plan
          </Link>
          <Link href="/pricing" className="text-xs text-neutral-600 transition-colors hover:text-neutral-400">
            Compare all plans →
          </Link>
        </footer>
      </div>
    </main>
  );
}
