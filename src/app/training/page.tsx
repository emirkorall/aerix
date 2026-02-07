"use client";

import Link from "next/link";
import { useState } from "react";

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
  },
  {
    id: "basic-aerials",
    skill: "Basic Aerials",
    description:
      "Aerials open up an entirely new dimension of play. Start with simple touches — getting off the ground with control matters more than hitting the ball hard. Accuracy first, power later.",
    videoId: "R3k9O-k_XC0",
    credit: "Wayton Pilkin",
  },
  {
    id: "positioning",
    skill: "Rotation & Positioning",
    description:
      "Mechanics win individual plays, but positioning wins games. Understanding when to challenge, when to rotate back, and where to be is what separates improving players from stuck ones.",
    videoId: "THcMLWOEc_o",
    credit: "SunlessKhan",
  },
];

export default function Training() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [blocksDone, setBlocksDone] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);

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
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Daily Training
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Today&apos;s Training
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-neutral-400">
            Consistency matters more than intensity. A short, focused session
            beats a long, unfocused one. Show up, do the work, and move on.
          </p>
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
                {focusBlocks.map((block) => (
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
                {blocksDoneCount} of {focusBlocks.length} blocks completed
              </p>
              <p className="mt-2 text-center text-[11px] text-neutral-700">
                Curated from the Rocket League community
              </p>
            </section>

            <div className="h-px w-full bg-neutral-800/60" />

            <section className="py-10">
              <button
                onClick={() => setCompleted(true)}
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
              }}
              className="mt-8 text-xs text-neutral-600 transition-colors hover:text-neutral-400"
            >
              Reset checklist
            </button>
          </section>
        )}

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
