"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchUserPlan } from "@/src/lib/user-plan";
import type { PlanTier } from "@/src/lib/weekly-plan";

export default function UpgradeSuccess() {
  const [plan, setPlan] = useState<PlanTier | null>(null);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    function poll() {
      fetchUserPlan().then((p) => {
        if (p !== "free") {
          setPlan(p);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 2000);
        } else {
          // Give up polling, show dashboard link anyway
          setPlan("free");
        }
      });
    }

    poll();
  }, []);

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
        </nav>

        <section className="flex flex-col items-center pt-32 pb-20 text-center">
          {plan === null ? (
            <>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800/60">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-600 border-t-indigo-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Activating your plan&hellip;
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-400">
                This usually takes a few seconds.
              </p>
            </>
          ) : (
            <>
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600/20">
                <svg
                  className="h-7 w-7 text-indigo-400"
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
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                You&apos;re in.
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-neutral-400">
                Thanks for supporting AERIX.
                {plan !== "free" && (
                  <>
                    {" "}Your <span className="text-white font-medium capitalize">{plan}</span> plan is active.
                  </>
                )}
              </p>
              <Link
                href="/dashboard"
                className="mt-10 flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                Go to Dashboard
              </Link>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
