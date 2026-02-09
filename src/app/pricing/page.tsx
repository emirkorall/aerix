"use client";

import Link from "next/link";
import { useState } from "react";

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
  const [region, setRegion] = useState<Region>("eu");
  const p = prices[region];

  return (
    <main className="min-h-screen bg-[#060608] text-white">
      <div className="mx-auto max-w-5xl px-6">
        <nav className="flex items-center justify-between py-6">
          <Link href="/" className="text-sm font-semibold tracking-[0.2em] uppercase text-white">
            Aerix
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md bg-white/[0.07] px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/[0.12]"
          >
            Sign in
          </Link>
        </nav>

        <section className="flex flex-col items-center pt-20 pb-16 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Simple pricing, no surprises.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-400">
            Free to start training. Upgrade for deeper tools. Cancel anytime.
          </p>

          <div className="mt-6 flex items-center gap-1 rounded-lg border border-neutral-800/60 bg-[#0c0c10] p-1">
            <button
              onClick={() => setRegion("eu")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
                region === "eu"
                  ? "bg-white/[0.07] text-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Europe (EUR)
            </button>
            <button
              onClick={() => setRegion("us")}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
                region === "us"
                  ? "bg-white/[0.07] text-white"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              USA (USD)
            </button>
          </div>
        </section>

        <div className="grid gap-4 pb-20 sm:grid-cols-3">
          <div className="flex flex-col rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-white">Free</h2>
              <p className="mt-1 text-xs text-neutral-500">Solo training &amp; consistency</p>
            </div>

            <p className="mb-6">
              <span className="text-3xl font-bold text-white">{p.symbol}0</span>
              <span className="ml-1 text-sm text-neutral-500">/month</span>
            </p>

            <Link
              href="/plans/free"
              className="mb-8 flex h-10 items-center justify-center rounded-lg border border-neutral-800 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white"
            >
              Get Started
            </Link>

            <ul className="flex flex-col gap-3 text-sm text-neutral-400">
              <Feature icon={check}>Daily training + streak tracking</Feature>
              <Feature icon={check}>Basic weekly progress view</Feature>
              <Feature icon={check}>Session notes after each day</Feature>
              <Feature icon={check}>3 training blocks with videos</Feature>
              <Feature icon={dash}>
                <span className="text-neutral-600">Focus tags &amp; time tracking (limited)</span>
              </Feature>
              <Feature icon={dash}>
                <span className="text-neutral-600">Insights &amp; deeper analysis</span>
              </Feature>
            </ul>
          </div>

          <div className="relative flex flex-col rounded-xl border border-indigo-500/30 bg-[#0c0c10] p-6">
            <div className="absolute -top-3 right-6 rounded-full bg-indigo-600 px-3 py-0.5 text-[11px] font-semibold text-white">
              Popular
            </div>

            <div className="mb-6">
              <h2 className="text-base font-semibold text-white">Starter</h2>
              <p className="mt-1 text-xs text-neutral-500">Train smarter, track everything</p>
            </div>

            <p className="mb-6">
              <span className="text-3xl font-bold text-white">{p.symbol}{p.starter}</span>
              <span className="ml-1 text-sm text-neutral-500">/month</span>
            </p>

            <Link
              href="/upgrade?plan=starter"
              className="mb-8 flex h-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Subscribe
            </Link>

            <ul className="flex flex-col gap-3 text-sm text-neutral-400">
              <Feature icon={check}>Everything in Free</Feature>
              <Feature icon={checkAccent}>
                <span className="text-indigo-300">6 training blocks with videos</span>
              </Feature>
              <Feature icon={checkAccent}>
                <span className="text-indigo-300">Full weekly plan depth</span>
              </Feature>
              <Feature icon={checkAccent}>
                <span className="text-indigo-300">Focus tags &amp; session duration tracking</span>
              </Feature>
              <Feature icon={checkAccent}>
                <span className="text-indigo-300">Personalized weekly insights</span>
              </Feature>
              <Feature icon={check}>Manual rank tracking</Feature>
            </ul>

            <div className="mt-6 rounded-lg border border-indigo-500/10 bg-indigo-500/[0.05] px-3.5 py-2.5">
              <p className="text-xs leading-relaxed text-indigo-300/80">
                See what you practiced, how long, and what&apos;s improving — all in one place.
              </p>
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-white">Pro</h2>
              <p className="mt-1 text-xs text-neutral-500">For competitive grinders</p>
            </div>

            <p className="mb-6">
              <span className="text-3xl font-bold text-white">{p.symbol}{p.pro}</span>
              <span className="ml-1 text-sm text-neutral-500">/month</span>
            </p>

            <Link
              href="/upgrade?plan=pro"
              className="mb-8 flex h-10 items-center justify-center rounded-lg border border-neutral-800 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white"
            >
              Subscribe
            </Link>

            <ul className="flex flex-col gap-3 text-sm text-neutral-400">
              <Feature icon={check}>Everything in Starter</Feature>
              <Feature icon={checkAccent}>
                <span className="text-indigo-300">9 advanced training blocks</span>
              </Feature>
              <Feature icon={checkAccent}>
                <span className="text-indigo-300">Rank trend insights</span>
              </Feature>
              <Feature icon={check}>Deeper weekly summaries</Feature>
              <Feature icon={check}>
                Competitive mindset tools{" "}
                <span className="text-neutral-600">(coming soon)</span>
              </Feature>
              <Feature icon={check}>
                Duo / Trio finder{" "}
                <span className="text-neutral-600">(coming soon)</span>
              </Feature>
            </ul>
          </div>
        </div>

        <p className="pb-6 text-center text-[11px] text-neutral-600">
          Prices shown in {p.label}. We adjust pricing by region to keep things fair.
        </p>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-16">
          <h3 className="mb-6 text-center text-sm font-medium text-neutral-500">
            Why pay?
          </h3>
          <p className="mx-auto max-w-lg text-center text-sm leading-relaxed text-neutral-500">
            Free gives you real training tools — streaks, progress, and session notes. Starter
            and Pro unlock more drills, deeper tracking, and personalized insights so you can
            see patterns in how you practice. We build for players who want to improve, and
            every dollar goes back into making AERIX better.
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-between py-8">
          <Link href="/" className="text-xs text-neutral-600 transition-colors hover:text-neutral-400">
            ← Back to home
          </Link>
          <span className="text-xs text-neutral-600">
            Cancel anytime. No questions asked.
          </span>
        </footer>
      </div>
    </main>
  );
}
