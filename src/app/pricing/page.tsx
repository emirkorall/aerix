"use client";

import { Link } from "@/src/i18n/routing";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { fetchUserProfile, startTrial } from "@/src/lib/user-plan";
import type { UserProfile } from "@/src/lib/user-plan";
import { canStartTrial } from "@/src/lib/trial";

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

const clockIcon = (
  <svg className="h-4 w-4 shrink-0 text-neutral-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

type Region = "eu" | "us";

const prices = {
  eu: { symbol: "€", starter: "5.99", pro: "11.99", free: "0", label: "EUR" },
  us: { symbol: "$", starter: "6.99", pro: "14.99", free: "0", label: "USD" },
} as const;

function Feature({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5">{icon}</span>
      <span>{children}</span>
    </li>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-800/60">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-neutral-200 transition-colors hover:text-white"
      >
        {q}
        <svg
          className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <p className="pb-4 text-sm leading-relaxed text-neutral-500">
          {a}
        </p>
      )}
    </div>
  );
}

export default function Pricing() {
  const t = useTranslations("Pricing");
  const nav = useTranslations("Nav");
  const [region, setRegion] = useState<Region>("eu");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trialStarting, setTrialStarting] = useState(false);
  const p = prices[region];

  useEffect(() => {
    fetchUserProfile().then(setProfile).catch(() => {});
  }, []);

  const trialAvailable = profile && canStartTrial(profile);

  return (
    <main className="min-h-screen bg-[#060608] text-white aerix-grid">
      <div className="mx-auto max-w-5xl px-6">
        {/* Nav */}
        <nav className="flex items-center justify-between py-6">
          <Link href="/" className="text-sm font-semibold tracking-[0.2em] uppercase text-white">
            Aerix
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md bg-white/[0.07] px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/[0.12]"
          >
            {nav("signIn")}
          </Link>
        </nav>

        {/* Header */}
        <section className="flex flex-col items-center pt-16 pb-12 lg:pt-20 lg:pb-16 text-center">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-neutral-400">
            {t("subtitle")}
          </p>
          <span className="accent-line mx-auto mt-4" />
          <p className="mt-3 text-xs text-neutral-600">
            {t("betaNote")}
          </p>

          {/* Region toggle */}
          <div className="mt-6 flex items-center gap-1 rounded-lg border border-neutral-800/60 bg-[#0c0c10] p-1">
            <button
              onClick={() => setRegion("eu")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
                region === "eu"
                  ? "bg-white/[0.07] text-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {t("europe")}
            </button>
            <button
              onClick={() => setRegion("us")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
                region === "us"
                  ? "bg-white/[0.07] text-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {t("usa")}
            </button>
          </div>
          <p className="mt-3 text-[11px] text-neutral-600">
            {t("priceNote", { currency: p.label })}
          </p>
        </section>

        {/* Plan cards */}
        <div className="grid gap-6 pb-6 sm:grid-cols-3">
          {/* ── Free ── */}
          <div className="flex flex-col rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-white">{t("freeName")}</h2>
              <p className="mt-1 text-xs text-neutral-500">{t("freeSub")}</p>
            </div>

            <p className="mb-6">
              <span className="text-3xl font-bold text-white">{p.symbol}0</span>
              <span className="ml-1 text-sm text-neutral-500">{t("month")}</span>
            </p>

            <Link
              href="/plans/free"
              className="mb-8 flex h-10 items-center justify-center rounded-lg border border-neutral-800 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white"
            >
              {t("getStarted")}
            </Link>

            <ul className="flex flex-col gap-3 text-sm text-neutral-400">
              <Feature icon={check}>{t("freeA")}</Feature>
              <Feature icon={check}>{t("freeB")}</Feature>
              <Feature icon={check}>{t("freeC")}</Feature>
              <Feature icon={check}>{t("freeD")}</Feature>
            </ul>

            <p className="mt-auto pt-6 text-xs leading-relaxed text-neutral-600">
              {t("freeBestFor")}
            </p>
          </div>

          {/* ── Starter ── */}
          <div className="relative flex flex-col rounded-xl border border-indigo-500/30 bg-[#0c0c10] p-6">
            <div className="absolute -top-3 right-6 rounded-full bg-indigo-600 px-3 py-0.5 text-[11px] font-semibold text-white">
              {t("popular")}
            </div>

            <div className="mb-6">
              <h2 className="text-base font-semibold text-white">{t("starterName")}</h2>
              <p className="mt-1 text-xs text-neutral-500">{t("starterSub")}</p>
            </div>

            <p className="mb-6">
              <span className="text-3xl font-bold text-white">{p.symbol}{p.starter}</span>
              <span className="ml-1 text-sm text-neutral-500">{t("month")}</span>
            </p>

            {trialAvailable ? (
              <button
                disabled={trialStarting}
                onClick={async () => {
                  setTrialStarting(true);
                  const ok = await startTrial();
                  if (ok) {
                    window.location.href = "/dashboard";
                  }
                  setTrialStarting(false);
                }}
                className="cta-glow mb-2 flex h-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
              >
                {trialStarting ? "Starting…" : t("tryFree")}
              </button>
            ) : (
              <Link
                href="/upgrade?plan=starter"
                className="cta-glow mb-2 flex h-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                {t("subscribe")}
              </Link>
            )}
            <p className="mb-6 text-center text-[11px] text-neutral-600">
              {t("starterMicrocopy")}
            </p>

            <ul className="flex flex-col gap-3 text-sm text-neutral-400">
              <Feature icon={check}>{t("starterA")}</Feature>
              <Feature icon={checkAccent}>
                <span className="text-indigo-300">{t("starterB")}</span>
              </Feature>
              <Feature icon={checkAccent}>
                <span className="text-indigo-300">{t("starterC")}</span>
              </Feature>
              <Feature icon={checkAccent}>
                <span className="text-indigo-300">{t("starterD")}</span>
              </Feature>
              <Feature icon={checkAccent}>
                <span className="text-indigo-300">{t("starterE")}</span>
              </Feature>
              <Feature icon={check}>{t("starterF")}</Feature>
            </ul>

            <div className="mt-6 rounded-lg border border-indigo-500/10 bg-indigo-500/[0.05] px-3.5 py-2.5">
              <p className="text-xs leading-relaxed text-indigo-300/80">
                {t("starterOutcome")}
              </p>
            </div>
          </div>

          {/* ── Pro ── */}
          <div className="flex flex-col rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-white">{t("proName")}</h2>
              <p className="mt-1 text-xs text-neutral-500">{t("proSub")}</p>
            </div>

            <p className="mb-6">
              <span className="text-3xl font-bold text-white">{p.symbol}{p.pro}</span>
              <span className="ml-1 text-sm text-neutral-500">{t("month")}</span>
            </p>

            <Link
              href="/upgrade?plan=pro"
              className="mb-8 flex h-10 items-center justify-center rounded-lg border border-neutral-800 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white"
            >
              {t("proSubscribe")}
            </Link>

            <ul className="flex flex-col gap-3 text-sm text-neutral-400">
              <Feature icon={check}>{t("proA")}</Feature>
              <Feature icon={checkAccent}>
                <span className="text-indigo-300">{t("proB")}</span>
              </Feature>
              <Feature icon={checkAccent}>
                <span className="text-indigo-300">{t("proC")}</span>
              </Feature>
              <Feature icon={check}>{t("proD")}</Feature>
              <Feature icon={check}>{t("proE")}</Feature>
            </ul>

            <div className="mt-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-neutral-600">
                {t("proComingSoon")}
              </p>
              <ul className="flex flex-col gap-2 text-sm text-neutral-600">
                <Feature icon={clockIcon}>{t("proF")}</Feature>
                <Feature icon={clockIcon}>{t("proG")}</Feature>
              </ul>
            </div>

            <div className="mt-auto pt-6">
              <div className="rounded-lg border border-neutral-800/40 bg-neutral-800/10 px-3.5 py-2.5">
                <p className="text-xs leading-relaxed text-neutral-500">
                  {t("proOutcome")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade difference line */}
        <p className="pb-12 text-center text-sm text-neutral-500">
          {t("upgradeDiff")}
        </p>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* Why pay? */}
        <section className="py-16 lg:py-20">
          <h3 className="mb-6 text-center text-sm font-medium text-neutral-300">
            {t("whyPay")}
          </h3>
          <div className="mx-auto max-w-lg space-y-4 text-center text-sm leading-relaxed text-neutral-500">
            <p>{t("whyPayP1")}</p>
            <p>{t("whyPayP2")}</p>
            <p>{t("whyPayP3")}</p>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* FAQ */}
        <section className="py-16 lg:py-20">
          <h3 className="mb-8 text-center text-sm font-medium text-neutral-300">
            {t("faqTitle")}
          </h3>
          <div className="mx-auto max-w-lg">
            <FaqItem q={t("faq1Q")} a={t("faq1A")} />
            <FaqItem q={t("faq2Q")} a={t("faq2A")} />
            <FaqItem q={t("faq3Q")} a={t("faq3A")} />
            <FaqItem q={t("faq4Q")} a={t("faq4A")} />
            <FaqItem q={t("faq5Q")} a={t("faq5A")} />
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* Footer reassurance */}
        <section className="py-12 text-center">
          <p className="text-sm font-medium text-neutral-400">{t("footerLine1")}</p>
          <p className="mt-2 text-xs text-neutral-600">{t("footerLine2")}</p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-center py-8">
          <Link href="/" className="text-xs text-neutral-600 transition-colors hover:text-neutral-400">
            {t("backHome")}
          </Link>
        </footer>
      </div>
    </main>
  );
}
