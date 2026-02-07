"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export default function Dashboard() {
  const [streak] = useState(3);
  const todayIndex = useMemo(() => (new Date().getDay() + 6) % 7, []);

  // Placeholder: Mon, Tue, Wed pre-completed
  const [completedDays, setCompletedDays] = useState<Set<number>>(
    () => new Set([0, 1, 2].filter((i) => i < todayIndex))
  );

  const trainedToday = completedDays.has(todayIndex);

  const toggleDay = useCallback((index: number) => {
    setCompletedDays((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
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
          <Link
            href="/pricing"
            className="text-sm text-neutral-400 transition-colors hover:text-white"
          >
            Plans
          </Link>
        </nav>

        <section className="pt-20 pb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Dashboard
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome back.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            Here&apos;s where you are. Keep showing up — that&apos;s all it
            takes.
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Your Streak
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">{streak}</span>
              <span className="text-sm text-neutral-500">
                {streak === 1 ? "day" : "days"} in a row
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-neutral-600">
              {streak === 0
                ? "Start a new streak today. One session is all it takes."
                : streak < 7
                  ? "You're building momentum. Stay consistent."
                  : "Solid consistency. Keep it going."}
            </p>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">Today</h2>
          <div
            className={`rounded-xl border p-6 ${
              trainedToday
                ? "border-indigo-500/30 bg-indigo-500/[0.05]"
                : "border-neutral-800/60 bg-[#0c0c10]"
            }`}
          >
            {trainedToday ? (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600/20">
                  <svg
                    className="h-4.5 w-4.5 text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-300">
                    Training complete
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    You showed up today. Come back tomorrow.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">
                    Not trained yet
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Your daily session is waiting. Even a short one counts.
                  </p>
                </div>
                <div className="h-2 w-2 shrink-0 rounded-full bg-neutral-700" />
              </div>
            )}
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            This Week
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            <div className="grid grid-cols-7 gap-2">
              {DAY_LABELS.map((label, i) => {
                const isToday = i === todayIndex;
                const isDone = completedDays.has(i);

                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={isDone}
                    aria-label={`${label}${isToday ? " (today)" : ""}: ${isDone ? "completed" : "not completed"}`}
                    onClick={() => toggleDay(i)}
                    className={`flex flex-col items-center gap-2.5 cursor-pointer rounded-lg py-2 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 hover:bg-white/[0.03] ${
                      isToday ? "ring-1 ring-neutral-700" : ""
                    }`}
                  >
                    <span
                      className={`text-[11px] font-medium ${
                        isToday ? "text-white" : "text-neutral-600"
                      }`}
                    >
                      {label}
                    </span>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isDone
                          ? "bg-indigo-600/20"
                          : i < todayIndex
                            ? "bg-neutral-800/40"
                            : isToday
                              ? "bg-transparent"
                              : "bg-transparent"
                      }`}
                    >
                      {isDone ? (
                        <svg
                          className="h-3.5 w-3.5 text-indigo-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
                        </svg>
                      ) : i < todayIndex ? (
                        <div className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
                      ) : isToday ? (
                        <div className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-neutral-800" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-5 text-center text-xs text-neutral-600">
              Trained {completedDays.size} / 7 days this week
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-neutral-700">
              Click any day to toggle your training.
            </p>
            <Link
              href="/training/plan"
              className="text-xs text-neutral-500 hover:text-neutral-300"
            >
              View Weekly Plan &rarr;
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Streak Protection
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600/10">
                <svg
                  className="h-4 w-4 text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  1 Streak Save available this month
                </p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  If you miss a day, use a save to keep your streak going.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="/pricing"
                className="flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Unlock Streak Protection
              </Link>
              <Link
                href="/plans/starter"
                className="text-xs text-neutral-500 hover:text-neutral-300"
              >
                Learn more
              </Link>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <div className="flex flex-col gap-3">
            <Link
              href="/training"
              className="flex h-11 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              {trainedToday ? "Review Training" : "Go to Training"}
            </Link>
            <Link
              href="/training/plan"
              className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
            >
              Weekly Plan
            </Link>
            {!trainedToday && (
              <button
                onClick={() => toggleDay(todayIndex)}
                className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
              >
                Mark today as done
              </button>
            )}
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-center py-8">
          <Link
            href="/"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            ← Back to home
          </Link>
        </footer>
      </div>
    </main>
  );
}
