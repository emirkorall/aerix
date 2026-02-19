"use client";

import { Link } from "@/src/i18n/routing";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import {
  DAY_LABELS,
  WEEKLY_PLANS,
  PLAN_TIER_LABELS,
  getTodayIndex,
  getTodayPlan,
  parsePlanTier,
} from "@/src/lib/weekly-plan";
import type { PlanTier } from "@/src/lib/weekly-plan";

export default function WeeklyPlanPage() {
  return (
    <Suspense>
      <WeeklyPlanContent />
    </Suspense>
  );
}

const TIERS: PlanTier[] = ["free", "starter", "pro"];

function WeeklyPlanContent() {
  const t = useTranslations("TrainingPlan");
  const tNav = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const searchParams = useSearchParams();
  const plan = parsePlanTier(searchParams.get("plan"));
  const weeklyPlan = WEEKLY_PLANS[plan];
  const todayIndex = useMemo(() => getTodayIndex(), []);

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
            href="/dashboard"
            className="text-sm text-neutral-400 transition-colors hover:text-white"
          >
            {tNav("dashboard")}
          </Link>
        </nav>

        <section className="pt-20 pb-10">
          <div className="mb-3 flex items-center gap-3">
            <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
              {t("label")}
            </p>
            <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-0.5 text-[10px] font-medium text-neutral-400">
              {t("planLabel", { label: PLAN_TIER_LABELS[plan] })}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            {t("desc")}
          </p>
        </section>

        <div className="flex items-center gap-1.5 pb-6">
          {TIERS.map((tier) => (
            <Link
              key={tier}
              href={`/training/plan?plan=${tier}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                tier === plan
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {PLAN_TIER_LABELS[tier]}
            </Link>
          ))}
        </div>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <div className="flex flex-col gap-3">
            {weeklyPlan.map((day, i) => {
              const isToday = i === todayIndex;

              return (
                <div
                  key={DAY_LABELS[i]}
                  className={`rounded-xl border p-5 ${
                    isToday
                      ? "border-indigo-500/30 bg-indigo-500/[0.04]"
                      : "border-neutral-800/60 bg-[#0c0c10]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-semibold uppercase tracking-wider ${
                          isToday ? "text-indigo-400" : "text-neutral-600"
                        }`}
                      >
                        {DAY_LABELS[i]}
                      </span>
                      {isToday && (
                        <span className="rounded-full bg-indigo-600/20 px-2 py-0.5 text-[10px] font-medium text-indigo-400">
                          {t("todayBadge")}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-600">{day.time}</span>
                  </div>

                  <p
                    className={`mt-2.5 text-sm font-medium ${
                      isToday ? "text-white" : "text-neutral-300"
                    }`}
                  >
                    {day.focus}
                  </p>

                  <ul className="mt-2 flex flex-col gap-1">
                    {day.goals.map((goal, gi) => (
                      <li
                        key={gi}
                        className="flex items-start gap-2 text-xs leading-relaxed text-neutral-500"
                      >
                        <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-neutral-700" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                  {isToday && (
                    <Link
                      href={`/training?plan=${plan}#${day.blockSlug}`}
                      className="mt-3 inline-block text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                    >
                      {t("startSession")}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <div className="flex flex-col gap-3">
            <Link
              href={`/training?plan=${plan}#${getTodayPlan(plan).blockSlug}`}
              className="flex h-11 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              {t("startToday")}
            </Link>
            <Link
              href="/dashboard"
              className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
            >
              {t("backDashboard")}
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-center gap-4 py-8">
          <Link
            href="/dashboard"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            {tNav("dashboard")}
          </Link>
          <span className="text-neutral-800">&middot;</span>
          <Link
            href="/"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            {tCommon("home")}
          </Link>
        </footer>
      </div>
    </main>
  );
}
