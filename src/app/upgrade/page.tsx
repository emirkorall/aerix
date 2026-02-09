import Link from "next/link";

const plans = {
  starter: {
    name: "Starter",
    price: "5.99",
    symbol: "€",
    period: "/month",
    description: "Train & play with others",
    detail:
      "Starter is for players who want to go beyond solo training. Unlock duo and trio matchmaking, keep your streak protected, and start playing with people who actually want to improve.",
    features: [
      "Daily training tracking",
      "Full training history",
      "Duo / Trio finder",
      "1 streak save per month",
    ],
  },
  pro: {
    name: "Pro",
    price: "11.99",
    symbol: "€",
    period: "/month",
    description: "For competitive grinders",
    detail:
      "Pro is built for players who take ranking up seriously. Get priority matchmaking, extended streak protection, and weekly summaries to track exactly where you're improving.",
    features: [
      "Everything in Starter",
      "Priority in Duo / Trio finder",
      "3 streak saves per month",
      "Weekly & monthly summaries",
    ],
  },
} as const;

type PlanKey = keyof typeof plans;

function parsePlan(value: string | undefined): PlanKey {
  if (value === "pro") return "pro";
  return "starter";
}

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const planKey = parsePlan(typeof params.plan === "string" ? params.plan : undefined);
  const plan = plans[planKey];

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
            className="text-sm text-neutral-500 hover:text-neutral-300"
          >
            ← Back to pricing
          </Link>
        </nav>

        <section className="flex flex-col items-center pt-20 pb-16 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Upgrade to {plan.name}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">{plan.description}</p>
        </section>

        <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
          <div className="flex items-baseline justify-between border-b border-neutral-800/60 pb-5">
            <h2 className="text-base font-semibold text-white">
              {plan.name} Plan
            </h2>
            <p>
              <span className="text-2xl font-bold text-white">
                {plan.symbol}
                {plan.price}
              </span>
              <span className="ml-1 text-sm text-neutral-500">
                {plan.period}
              </span>
            </p>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-neutral-400">
            {plan.detail}
          </p>

          <ul className="mt-5 flex flex-col gap-2.5 border-t border-neutral-800/60 pt-5">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-neutral-400">
                <svg
                  className="h-4 w-4 shrink-0 text-indigo-400"
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
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.04] p-5 text-center">
          <p className="text-sm leading-relaxed text-indigo-300/80">
            Payments are coming soon. For now this is a preview.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/pricing"
            className="flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            View Pricing
          </Link>
          <Link
            href="/training"
            className="flex h-11 w-full items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-300"
          >
            Back to Training
          </Link>
          <Link
            href={`/plans/${planKey}`}
            className="mt-1 text-center text-xs text-neutral-500 transition-colors hover:text-neutral-300"
          >
            See {plan.name} plan details &rarr;
          </Link>
        </div>

        <footer className="flex items-center justify-center py-10">
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
