"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function getWeekDays(): { label: string; date: Date; status: "done" | "missed" | "today" | "upcoming" }[] {
  const now = new Date();
  const todayIndex = (now.getDay() + 6) % 7; // 0 = Mon

  // Placeholder: trained Mon, Tue, Wed of this week (first 3 days)
  const trained = new Set([0, 1, 2]);

  return DAY_LABELS.map((label, i) => {
    const date = new Date(now);
    date.setDate(now.getDate() - todayIndex + i);

    let status: "done" | "missed" | "today" | "upcoming";
    if (i === todayIndex) {
      status = "today";
    } else if (i < todayIndex) {
      status = trained.has(i) ? "done" : "missed";
    } else {
      status = "upcoming";
    }

    return { label, date, status };
  });
}

export default function Dashboard() {
  const [streak] = useState(3);
  const [trainedToday, setTrainedToday] = useState(false);
  const weekDays = useMemo(() => getWeekDays(), []);

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
              {weekDays.map((day) => {
                const isToday = day.status === "today";
                const todayDone = isToday && trainedToday;

                return (
                  <div key={day.label} className="flex flex-col items-center gap-2.5">
                    <span
                      className={`text-[11px] font-medium ${
                        isToday ? "text-white" : "text-neutral-600"
                      }`}
                    >
                      {day.label}
                    </span>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        day.status === "done" || todayDone
                          ? "bg-indigo-600/20"
                          : day.status === "missed"
                            ? "bg-neutral-800/40"
                            : isToday
                              ? "border border-neutral-700 bg-transparent"
                              : "bg-transparent"
                      }`}
                    >
                      {day.status === "done" || todayDone ? (
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
                      ) : day.status === "missed" ? (
                        <svg
                          className="h-3.5 w-3.5 text-neutral-700"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                          />
                        </svg>
                      ) : isToday ? (
                        <div className="h-1.5 w-1.5 rounded-full bg-neutral-500" />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-neutral-800" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-center text-xs text-neutral-600">
              Trained{" "}
              {weekDays.filter((d) => d.status === "done").length +
                (trainedToday ? 1 : 0)}{" "}
              / 7 days
            </p>
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
            {!trainedToday && (
              <button
                onClick={() => setTrainedToday(true)}
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
