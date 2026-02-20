"use client";

import { Link } from "@/src/i18n/routing";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";

const plans = {
  starter: {
    name: "Starter",
    price: "5.99",
    symbol: "\u20ac",
    period: "/month",
  },
  pro: {
    name: "Pro",
    price: "11.99",
    symbol: "\u20ac",
    period: "/month",
  },
} as const;

type PlanKey = keyof typeof plans;

function parsePlan(value: string | null): PlanKey {
  if (value === "pro") return "pro";
  return "starter";
}

export default function UpgradePage() {
  return (
    <Suspense>
      <UpgradeContent />
    </Suspense>
  );
}

function UpgradeContent() {
  const t = useTranslations("Upgrade");
  const tCommon = useTranslations("Common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const planKey = parsePlan(searchParams.get("plan"));
  const plan = plans[planKey];

  const desc = planKey === "starter" ? t("starterDesc") : t("proDesc");

  const features =
    planKey === "starter"
      ? [t("starterA"), t("starterB"), t("starterC"), t("starterD"), t("starterE")]
      : [t("proA"), t("proB"), t("proC"), t("proD"), t("proE")];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });

      if (res.status === 401) {
        router.push(`/login?returnTo=/upgrade?plan=${planKey}`);
        return;
      }

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || t("error"));
        setLoading(false);
      }
    } catch {
      setError(t("networkError"));
      setLoading(false);
    }
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
            href="/pricing"
            className="text-sm text-neutral-500 hover:text-neutral-300"
          >
            {t("backPricing")}
          </Link>
        </nav>

        <section className="flex flex-col items-center pt-20 pb-16 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t("title", { plan: plan.name })}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">{desc}</p>
        </section>

        <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
          <div className="flex items-baseline justify-between border-b border-neutral-800/60 pb-5">
            <h2 className="text-base font-semibold text-white">
              {t("planName", { plan: plan.name })}
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

          <ul className="mt-5 flex flex-col gap-2.5">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2.5 text-sm text-neutral-400"
              >
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

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? t("redirecting") : t("checkout")}
          </button>
          {error && (
            <p className="text-center text-xs text-red-400">{error}</p>
          )}
          <Link
            href="/pricing"
            className="flex h-11 w-full items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-300"
          >
            {tCommon("comparePlans")}
          </Link>
        </div>

        <footer className="flex items-center justify-center py-10">
          <Link
            href="/"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            {tCommon("backHome")}
          </Link>
        </footer>
      </div>
    </main>
  );
}
