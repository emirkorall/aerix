"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import {
  isCompletedToday,
  setCompletedToday,
  onCompletionChange,
  getCompletedDates,
  getToday,
  getSessionNotes,
  saveSessionNote,
} from "@/src/lib/training-completion";
import type { SessionNote } from "@/src/lib/training-completion";

type Plan = "free" | "starter" | "pro";

const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

const PLAN_INTROS: Record<Plan, string> = {
  free: "Consistency matters more than intensity. A short, focused session beats a long, unfocused one. Show up, do the work, and move on.",
  starter:
    "Your Starter plan gives you a structured path. Each session builds on the last — follow the flow and trust the process.",
  pro: "You\u2019re training with intent. Push your comfort zone each session, but stay controlled. Precision under pressure is the goal.",
};

const tasks = [
  {
    id: "warmup",
    label: "Warm-up",
    detail: "5–10 minutes of free play to loosen up.",
  },
  {
    id: "focus",
    label: "Training focus",
    detail: "Work through today's guided blocks below.",
  },
  {
    id: "freeplay",
    label: "Free play or drills",
    detail: "Run a training pack or just play with intention.",
  },
  {
    id: "reflect",
    label: "Review or reflection",
    detail: "Think about what clicked and what felt off today.",
  },
];

const focusBlocks = [
  {
    id: "car-control",
    skill: "Car Control",
    description:
      "Good car control is the foundation of everything in Rocket League. Before you can hit advanced shots, you need to feel comfortable moving your car in the air and on the ground. This drill builds that muscle memory.",
    videoId: "ed8owajA0Lc",
    credit: "Kevpert",
    tier: "free" as Plan,
  },
  {
    id: "basic-aerials",
    skill: "Basic Aerials",
    description:
      "Aerials open up an entirely new dimension of play. Start with simple touches — getting off the ground with control matters more than hitting the ball hard. Accuracy first, power later.",
    videoId: "R3k9O-k_XC0",
    credit: "Wayton Pilkin",
    tier: "free" as Plan,
  },
  {
    id: "positioning",
    skill: "Rotation & Positioning",
    description:
      "Mechanics win individual plays, but positioning wins games. Understanding when to challenge, when to rotate back, and where to be is what separates improving players from stuck ones.",
    videoId: "THcMLWOEc_o",
    credit: "SunlessKhan",
    tier: "free" as Plan,
  },
  {
    id: "power-shots",
    skill: "Power Shots & Accuracy",
    description:
      "Clean, deliberate shots win more games than flashy ones. Focus on hitting the ball with the nose of your car and placing it where defenders aren\u2019t. Consistency here translates directly to wins.",
    videoId: "lsSq0cFEAcE",
    credit: "Thanovic",
    tier: "starter" as Plan,
  },
  {
    id: "fast-aerials",
    skill: "Fast Aerials & Air Control",
    description:
      "Fast aerials let you contest the ball before your opponent can react. Combine jump timing with boost management and directional air roll for maximum efficiency in the air.",
    videoId: "lkBZg0Ldhls",
    credit: "Virge",
    tier: "pro" as Plan,
  },
];

const TIER_ORDER: Plan[] = ["free", "starter", "pro"];

function getVisibleBlocks(plan: Plan) {
  const tierIndex = TIER_ORDER.indexOf(plan);
  return focusBlocks.filter(
    (b) => TIER_ORDER.indexOf(b.tier) <= tierIndex
  );
}

export default function Training() {
  return (
    <Suspense>
      <TrainingContent />
    </Suspense>
  );
}

function TrainingContent() {
  const searchParams = useSearchParams();
  const rawPlan = searchParams.get("plan") ?? "free";
  const plan: Plan = (["free", "starter", "pro"] as const).includes(
    rawPlan as Plan
  )
    ? (rawPlan as Plan)
    : "free";

  const visibleBlocks = getVisibleBlocks(plan);

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [blocksDone, setBlocksDone] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);

  const [historyDates, setHistoryDates] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<SessionNote>({ better: "", tomorrow: "" });
  const [allNotes, setAllNotes] = useState<Record<string, SessionNote>>({});
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    setCompleted(isCompletedToday());
    setHistoryDates(getCompletedDates());
    const all = getSessionNotes();
    setAllNotes(all);
    const today = getToday();
    if (all[today]) {
      setNotes(all[today]);
      setNotesSaved(true);
    }
    return onCompletionChange(() => {
      setCompleted(isCompletedToday());
      setHistoryDates(getCompletedDates());
    });
  }, []);

  const last7Days = useMemo(() => {
    const days: { dateStr: string; label: string; dateLabel: string; isToday: boolean }[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({
        dateStr,
        label: dayNames[d.getDay()],
        dateLabel: `${d.getMonth() + 1}/${d.getDate()}`,
        isToday: i === 0,
      });
    }
    return days;
  }, []);

  const [proTrack, setProTrack] = useState<"mechanics" | "game-sense">(
    "mechanics"
  );

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleBlock(id: string) {
    setBlocksDone((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const blocksDoneCount = Object.values(blocksDone).filter(Boolean).length;

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
          <div className="mb-3 flex items-center gap-3">
            <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
              Daily Training
            </p>
            <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2.5 py-0.5 text-[10px] font-medium text-neutral-400">
              Plan: {PLAN_LABELS[plan]}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Today&apos;s Training
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-400">
            {PLAN_INTROS[plan]}
          </p>
          {plan !== "free" && (
            <Link
              href="/training/plan"
              className="mt-4 inline-block text-xs text-neutral-500 hover:text-neutral-300"
            >
              View Weekly Plan &rarr;
            </Link>
          )}
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {!completed ? (
          <>
            <section className="py-10">
              <h2 className="mb-6 text-sm font-medium text-neutral-500">
                Checklist
              </h2>
              <ul className="flex flex-col gap-3">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <button
                      onClick={() => toggle(task.id)}
                      className={`flex w-full items-start gap-3.5 rounded-xl border p-4 text-left transition-colors ${
                        checked[task.id]
                          ? "border-indigo-500/30 bg-indigo-500/[0.05]"
                          : "border-neutral-800/60 bg-[#0c0c10] hover:border-neutral-700/60"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          checked[task.id]
                            ? "border-indigo-500 bg-indigo-600"
                            : "border-neutral-700 bg-transparent"
                        }`}
                      >
                        {checked[task.id] && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m4.5 12.75 6 6 9-13.5"
                            />
                          </svg>
                        )}
                      </span>
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            checked[task.id] ? "text-indigo-300" : "text-white"
                          }`}
                        >
                          {task.label}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {task.detail}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <div className="h-px w-full bg-neutral-800/60" />

            <section className="py-10">
              <div className="mb-6">
                <h2 className="text-sm font-medium text-neutral-500">
                  Today&apos;s Training Focus
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                  Watch, practice, and check off each block when you&apos;re
                  done. No rush — even one block is progress.
                </p>
              </div>

              <div className="flex flex-col gap-5">
                {visibleBlocks.map((block) => (
                  <div
                    key={block.id}
                    className={`rounded-xl border p-5 transition-colors ${
                      blocksDone[block.id]
                        ? "border-indigo-500/30 bg-indigo-500/[0.05]"
                        : "border-neutral-800/60 bg-[#0c0c10]"
                    }`}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3
                          className={`text-sm font-semibold ${
                            blocksDone[block.id]
                              ? "text-indigo-300"
                              : "text-white"
                          }`}
                        >
                          {block.skill}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
                          {block.description}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleBlock(block.id)}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          blocksDone[block.id]
                            ? "border-indigo-500 bg-indigo-600"
                            : "border-neutral-700 bg-transparent hover:border-neutral-600"
                        }`}
                      >
                        {blocksDone[block.id] && (
                          <svg
                            className="h-3 w-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m4.5 12.75 6 6 9-13.5"
                            />
                          </svg>
                        )}
                      </button>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-neutral-800/60">
                      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                        <iframe
                          className="absolute inset-0 h-full w-full"
                          src={`https://www.youtube-nocookie.com/embed/${block.videoId}`}
                          title={block.skill}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-right text-[11px] text-neutral-600">
                      Video by {block.credit}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-center text-xs text-neutral-600">
                {blocksDoneCount} of {visibleBlocks.length} blocks completed
              </p>
              <p className="mt-2 text-center text-[11px] text-neutral-700">
                Curated from the Rocket League community
              </p>
            </section>

            {plan === "starter" && (
              <>
                <div className="h-px w-full bg-neutral-800/60" />
                <section className="py-10">
                  <h2 className="mb-4 text-sm font-medium text-neutral-500">
                    Coach Note
                  </h2>
                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-5">
                    <p className="text-sm leading-relaxed text-neutral-300">
                      Focus on one mechanic per session rather than switching
                      between many. Depth beats breadth — 20 focused minutes
                      will improve you more than an hour of scattered practice.
                    </p>
                    <p className="mt-3 text-xs text-neutral-600">
                      Tip from the Aerix training philosophy
                    </p>
                  </div>
                </section>
              </>
            )}

            {plan === "pro" && (
              <>
                <div className="h-px w-full bg-neutral-800/60" />
                <section className="py-10">
                  <h2 className="mb-4 text-sm font-medium text-neutral-500">
                    Pro Track
                  </h2>
                  <p className="mb-5 text-xs leading-relaxed text-neutral-600">
                    Choose a focus for this session. Both paths build toward
                    the same goal — becoming a more complete player.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setProTrack("mechanics")}
                      className={`rounded-xl border p-4 text-left ${
                        proTrack === "mechanics"
                          ? "border-indigo-500/30 bg-indigo-500/[0.05]"
                          : "border-neutral-800/60 bg-[#0c0c10] hover:border-neutral-700/60"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          proTrack === "mechanics"
                            ? "text-indigo-300"
                            : "text-white"
                        }`}
                      >
                        Mechanics
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Aerial control, flicks, and recoveries
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProTrack("game-sense")}
                      className={`rounded-xl border p-4 text-left ${
                        proTrack === "game-sense"
                          ? "border-indigo-500/30 bg-indigo-500/[0.05]"
                          : "border-neutral-800/60 bg-[#0c0c10] hover:border-neutral-700/60"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          proTrack === "game-sense"
                            ? "text-indigo-300"
                            : "text-white"
                        }`}
                      >
                        Game Sense
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Positioning, reads, and decision-making
                      </p>
                    </button>
                  </div>
                  <p className="mt-4 text-center text-xs text-neutral-600">
                    Today&apos;s focus:{" "}
                    <span className="text-neutral-400">
                      {proTrack === "mechanics"
                        ? "Mechanics"
                        : "Game Sense"}
                    </span>
                  </p>
                </section>
              </>
            )}

            <div className="h-px w-full bg-neutral-800/60" />

            <section className="py-10">
              <button
                onClick={() => {
                  setCompleted(true);
                  setCompletedToday(true);
                }}
                disabled={checkedCount === 0}
                className={`flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                  checkedCount > 0
                    ? "bg-indigo-600 text-white hover:bg-indigo-500"
                    : "cursor-not-allowed bg-neutral-800/60 text-neutral-600"
                }`}
              >
                Mark today as complete
              </button>
              <p className="mt-3 text-center text-xs text-neutral-600">
                {checkedCount} of {tasks.length} checked — do what you can.
              </p>
            </section>
          </>
        ) : (
          <>
            <section className="flex flex-col items-center py-20 text-center">
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
              <h2 className="text-2xl font-bold tracking-tight text-white">
                You showed up today.
              </h2>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-400">
                That&apos;s progress. It doesn&apos;t matter if the session was
                short or messy — you did the work. Come back tomorrow.
              </p>
              <button
                onClick={() => {
                  setChecked({});
                  setBlocksDone({});
                  setCompleted(false);
                  setCompletedToday(false);
                }}
                className="mt-8 text-xs text-neutral-600 transition-colors hover:text-neutral-400"
              >
                Reset checklist
              </button>
            </section>

            <div className="h-px w-full bg-neutral-800/60" />

            <section className="py-10">
              <h2 className="mb-2 text-sm font-medium text-neutral-500">
                Session Notes
              </h2>
              <p className="mb-6 text-xs text-neutral-600">
                Quick reflection — no pressure, just a few words.
              </p>
              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="note-better"
                    className="mb-1.5 block text-xs font-medium text-neutral-400"
                  >
                    What felt better today?
                  </label>
                  <textarea
                    id="note-better"
                    rows={2}
                    value={notes.better}
                    onChange={(e) => {
                      setNotes((prev) => ({ ...prev, better: e.target.value }));
                      setNotesSaved(false);
                    }}
                    placeholder="e.g. Aerials felt more controlled"
                    className="w-full resize-none rounded-lg border border-neutral-800/60 bg-[#0c0c10] px-3.5 py-2.5 text-sm text-white placeholder-neutral-700 outline-none transition-colors focus:border-neutral-700"
                  />
                </div>
                <div>
                  <label
                    htmlFor="note-tomorrow"
                    className="mb-1.5 block text-xs font-medium text-neutral-400"
                  >
                    What will you focus on tomorrow?
                  </label>
                  <textarea
                    id="note-tomorrow"
                    rows={2}
                    value={notes.tomorrow}
                    onChange={(e) => {
                      setNotes((prev) => ({
                        ...prev,
                        tomorrow: e.target.value,
                      }));
                      setNotesSaved(false);
                    }}
                    placeholder="e.g. Work on backboard reads"
                    className="w-full resize-none rounded-lg border border-neutral-800/60 bg-[#0c0c10] px-3.5 py-2.5 text-sm text-white placeholder-neutral-700 outline-none transition-colors focus:border-neutral-700"
                  />
                </div>
                <button
                  onClick={() => {
                    const today = getToday();
                    saveSessionNote(today, notes);
                    setAllNotes((prev) => ({ ...prev, [today]: notes }));
                    setNotesSaved(true);
                  }}
                  disabled={!notes.better.trim() && !notes.tomorrow.trim()}
                  className={`flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    notes.better.trim() || notes.tomorrow.trim()
                      ? notesSaved
                        ? "bg-indigo-600/20 text-indigo-400"
                        : "bg-indigo-600 text-white hover:bg-indigo-500"
                      : "cursor-not-allowed bg-neutral-800/60 text-neutral-600"
                  }`}
                >
                  {notesSaved ? "Notes saved" : "Save notes"}
                </button>
              </div>
            </section>
          </>
        )}

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            Recent Training
          </h2>
          <div className="flex flex-col gap-2">
            {last7Days.map((day) => {
              const done =
                (day.isToday && completed) || historyDates.has(day.dateStr);
              return (
                <div
                  key={day.dateStr}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                    done
                      ? "border-indigo-500/20 bg-indigo-500/[0.04]"
                      : "border-neutral-800/60 bg-[#0c0c10]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 text-xs font-medium ${
                        day.isToday ? "text-white" : "text-neutral-500"
                      }`}
                    >
                      {day.isToday ? "Today" : day.label}
                    </span>
                    <span className="text-[11px] text-neutral-600">
                      {day.dateLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {allNotes[day.dateStr] &&
                      (allNotes[day.dateStr].better.trim() ||
                        allNotes[day.dateStr].tomorrow.trim()) && (
                        <span className="text-[11px] text-neutral-500">
                          Note
                        </span>
                      )}
                    {done ? (
                      <div className="flex items-center gap-1.5">
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
                        <span className="text-xs text-indigo-400">Completed</span>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-600">
                        Not completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
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
