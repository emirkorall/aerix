"use client";

import Link from "next/link";
import { useMemo } from "react";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const WEEKLY_PLAN: {
  focus: string;
  time: string;
  goals: [string, string?];
}[] = [
  {
    focus: "Car Control",
    time: "25 min",
    goals: [
      "Practice air roll and landing recovery",
      "Focus on smooth turning at speed",
    ],
  },
  {
    focus: "Ball Control",
    time: "20 min",
    goals: [
      "Dribble the ball on your car for extended periods",
      "Work on flicks from carry position",
    ],
  },
  {
    focus: "Shooting",
    time: "30 min",
    goals: [
      "Hit power shots from different angles",
      "Practice redirect shots off the wall",
    ],
  },
  {
    focus: "Defense & Saves",
    time: "25 min",
    goals: [
      "Shadow defend without overcommitting",
      "Practice backboard saves and clears",
    ],
  },
  {
    focus: "Recoveries",
    time: "20 min",
    goals: [
      "Land on all four wheels after every aerial",
      "Chain wave dashes into play",
    ],
  },
  {
    focus: "Free Play Discipline",
    time: "35 min",
    goals: [
      "Combine skills from the week in free play",
      "Stay intentional — pick a focus each 5 minutes",
    ],
  },
  {
    focus: "Review & Light Play",
    time: "20 min",
    goals: [
      "Replay one or two recent matches and note patterns",
      "Play casually and apply what you practiced",
    ],
  },
];

export default function WeeklyPlanPage() {
  const todayIndex = useMemo(() => (new Date().getDay() + 6) % 7, []);

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
            Dashboard
          </Link>
        </nav>

        <section className="pt-20 pb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Training
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Weekly Training Plan
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            Structured practice beats random grinding. Follow this plan to
            build real skill — one focused session at a time.
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <div className="flex flex-col gap-3">
            {WEEKLY_PLAN.map((day, i) => {
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
                          Today
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
                    {day.goals.map(
                      (goal, gi) =>
                        goal && (
                          <li
                            key={gi}
                            className="flex items-start gap-2 text-xs leading-relaxed text-neutral-500"
                          >
                            <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-neutral-700" />
                            {goal}
                          </li>
                        )
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <div className="flex flex-col gap-3">
            <Link
              href="/training"
              className="flex h-11 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Start Today&apos;s Session
            </Link>
            <Link
              href="/dashboard"
              className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
            >
              Back to Dashboard
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
