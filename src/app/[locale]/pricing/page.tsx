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

const dash = (
  <svg className="h-4 w-4 shrink-0 text-neutral-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
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

  return (
    <main className="min-h-screen bg-[#060608] text-white aerix-grid">
      <div className="mx-auto max-w-5xl px-6">
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

        <section className="flex flex-col items-center pt-16 pb-12 lg:pt-20 lg:pb-16 text-center">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-400">
            {t("subtitle")}
          </p>
          <span className="accent-line mx-auto mt-4" />

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
        </section>

        <div className="grid gap-6 pb-20 sm:grid-cols-3">
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
              <Feature icon={dash}>
                <span className="text-neutral-600">{t("freeE")}</span>
              </Feature>
              <Feature icon={dash}>
                <span className="text-neutral-600">{t("freeF")}</span>
              </Feature>
            </ul>
          </div>

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

            <Link
              href="/upgrade?plan=starter"
              className="cta-glow mb-2 flex h-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              {t("subscribe")}
            </Link>
            {profile && canStartTrial(profile) && (
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
                className="mb-6 flex h-9 w-full items-center justify-center rounded-lg border border-indigo-500/30 text-xs font-medium text-indigo-300 transition-colors hover:border-indigo-500/50 hover:text-indigo-200 disabled:opacity-50"
              >
                {trialStarting ? "Starting…" : t("tryFree")}
              </button>
            )}
            {!(profile && canStartTrial(profile)) && <div className="mb-6" />}

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
                {t("starterNote")}
              </p>
            </div>
          </div>

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
              {t("subscribe")}
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
              <Feature icon={check}>
                {t("proE")}{" "}
                <span className="text-neutral-600">({t("comingSoon")})</span>
              </Feature>
              <Feature icon={check}>
                {t("proF")}{" "}
                <span className="text-neutral-600">({t("comingSoon")})</span>
              </Feature>
            </ul>
          </div>
        </div>

        <p className="pb-6 text-center text-[11px] text-neutral-600">
          {t("priceNote", { currency: p.label })}
        </p>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-16 lg:py-20">
          <h3 className="mb-6 text-center text-sm font-medium text-neutral-500">
            {t("whyPay")}
          </h3>
          <p className="mx-auto max-w-lg text-center text-sm leading-relaxed text-neutral-500">
            {t("whyPayDesc")}
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-between py-8">
          <Link href="/" className="text-xs text-neutral-600 transition-colors hover:text-neutral-400">
            {t("backHome")}
          </Link>
          <span className="text-xs text-neutral-600">
            {t("cancelNote")}
          </span>
        </footer>
      </div>
    </main>
  );
}
