"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  isCompletedToday,
  setCompletedToday,
  onCompletionChange,
  getCompletedDates,
  getToday,
  getSessionNotes,
  saveSessionNote,
  getSessionTags,
  saveSessionTags,
  FOCUS_TAGS,
  getSessionDurations,
  saveSessionDuration,
  DURATION_OPTIONS,
} from "@/src/lib/training-completion";
import type { SessionNote, FocusTag } from "@/src/lib/training-completion";
import { getTodayPlan, getTodayIndex, DAY_LABELS, parsePlanTier } from "@/src/lib/weekly-plan";
import type { PlanTier } from "@/src/lib/weekly-plan";
import { TRAINING_PROGRAMS, getBlocksBySection } from "@/src/lib/trainingPrograms";
import type { TrainingBlock } from "@/src/lib/trainingPrograms";
import PremiumPreview from "@/src/components/PremiumPreview";

type Plan = "free" | "starter" | "pro";

const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
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


export default function Training() {
  return (
    <Suspense>
      <TrainingContent />
    </Suspense>
  );
}

function TodaysPlan({ plan, onJumpToDrill }: { plan: PlanTier; onJumpToDrill: (slug: string) => void }) {
  const todayIndex = getTodayIndex();
  const today = getTodayPlan(plan);
  const dayLabel = DAY_LABELS[todayIndex];

  return (
    <>
      <section className="py-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-neutral-500">
            Today&apos;s Plan
          </h2>
          <span className="rounded-full bg-indigo-600/20 px-2.5 py-0.5 text-[10px] font-medium text-indigo-400">
            {dayLabel}
          </span>
        </div>
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">{today.focus}</p>
            <span className="text-xs text-neutral-500">{today.time}</span>
          </div>
          <ul className="mt-3 flex flex-col gap-1.5">
            {today.goals.map((goal, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs leading-relaxed text-neutral-400"
              >
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-indigo-500/40" />
                {goal}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between">
            <a
              href={`#${today.blockSlug}`}
              onClick={() => onJumpToDrill(today.blockSlug)}
              className="text-[11px] font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Jump to today&apos;s drill &darr;
            </a>
            <Link
              href={`/training/plan?plan=${plan}`}
              className="text-[11px] text-neutral-500 transition-colors hover:text-neutral-300"
            >
              View full weekly plan &rarr;
            </Link>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-neutral-800/60" />
    </>
  );
}

function VideoBlock({
  block,
  done,
  onToggle,
  highlighted,
}: {
  block: TrainingBlock;
  done: boolean;
  onToggle: () => void;
  highlighted: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlighted && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlighted]);

  return (
    <div
      ref={ref}
      id={block.slug}
      className={`rounded-xl border p-5 transition-colors ${
        highlighted
          ? "ring-1 ring-indigo-500/50 border-indigo-500/40 bg-indigo-500/[0.06]"
          : done
            ? "border-indigo-500/30 bg-indigo-500/[0.05]"
            : "border-neutral-800/60 bg-[#0c0c10]"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3
            className={`text-sm font-semibold ${
              done ? "text-indigo-300" : "text-white"
            }`}
          >
            {block.title}
          </h3>
          <ul className="mt-2 flex flex-col gap-1">
            {block.goals.map((goal, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs leading-relaxed text-neutral-500"
              >
                <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-indigo-500/40" />
                {goal}
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={onToggle}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
            done
              ? "border-indigo-500 bg-indigo-600"
              : "border-neutral-700 bg-transparent hover:border-neutral-600"
          }`}
        >
          {done && (
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
            title={block.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[11px] text-neutral-700">
          If the embed doesn&apos;t load, use &ldquo;Watch on YouTube&rdquo;.
        </p>
        <div className="flex items-center gap-2.5">
          <a
            href={`https://www.youtube.com/watch?v=${block.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-neutral-600 transition-colors hover:text-neutral-400"
          >
            Watch on YouTube &nearr;
          </a>
          <span className="text-[11px] text-neutral-700">&middot;</span>
          <p className="text-[11px] text-neutral-600">By {block.creator}</p>
        </div>
      </div>
    </div>
  );
}

function LockedTierPreview({ tier }: { tier: "starter" | "pro" }) {
  const program = TRAINING_PROGRAMS[tier];
  const sections = getBlocksBySection(tier);
  const sampleBlock = sections[0]?.blocks[0];
  const remainingCount = program.blocks.length - 1;

  return (
    <PremiumPreview
      title={`${program.label} Program`}
      badge={
        <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
          {program.blocks.length} blocks
        </span>
      }
      description={`Full program is part of ${program.label} so we can keep quality high and keep building new drills.`}
      actions={
        <div className="flex w-full flex-col items-center gap-3">
          <Link
            href={`/upgrade?plan=${tier}`}
            className="flex h-9 w-full items-center justify-center rounded-lg bg-indigo-600 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Unlock {program.label}
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/pricing"
              className="text-xs text-neutral-500 transition-colors hover:text-neutral-300"
            >
              Compare plans
            </Link>
            <span className="text-neutral-800">&middot;</span>
            <Link
              href={`/plans/${tier}`}
              className="text-xs text-neutral-500 transition-colors hover:text-neutral-300"
            >
              See what&apos;s included
            </Link>
          </div>
          {remainingCount > 0 && (
            <p className="text-[11px] text-neutral-700">
              +{remainingCount} more {remainingCount === 1 ? "block" : "blocks"}
            </p>
          )}
        </div>
      }
    >
      {/* Sample block — fully visible */}
      {sampleBlock && (
        <>
          <h3 className="text-sm font-semibold text-white">
            {sampleBlock.title}
          </h3>
          {sampleBlock.goals[0] && (
            <p className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-neutral-500">
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-indigo-500/40" />
              {sampleBlock.goals[0]}
            </p>
          )}
          <div className="mt-3 flex h-10 items-center justify-center rounded-lg bg-neutral-800/40">
            <span className="text-[11px] text-neutral-600">
              Video available with {program.label}
            </span>
          </div>
        </>
      )}

      {/* Remaining blocks — muted */}
      <div className="mt-4 rounded-xl border border-neutral-800/40 bg-[#0a0a0e] opacity-40">
        <div className="flex flex-col gap-2 p-4">
          {sections.map(({ section, blocks }) =>
            blocks.slice(section === sections[0].section ? 1 : 0).map((block) => (
              <div key={block.id} className="flex items-center gap-2.5">
                <div className="h-5 w-8 shrink-0 rounded bg-neutral-800/60" />
                <span className="text-xs text-neutral-600">
                  {block.title}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </PremiumPreview>
  );
}

function TrainingContent() {
  const searchParams = useSearchParams();
  const plan: Plan = parsePlanTier(searchParams.get("plan")) as Plan;

  const program = TRAINING_PROGRAMS[plan];
  const sections = getBlocksBySection(plan);

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [blocksDone, setBlocksDone] = useState<Record<string, boolean>>({});
  const [completed, setCompleted] = useState(false);

  const [historyDates, setHistoryDates] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<SessionNote>({ better: "", tomorrow: "" });
  const [allNotes, setAllNotes] = useState<Record<string, SessionNote>>({});
  const [notesSaved, setNotesSaved] = useState(false);
  const [selectedTags, setSelectedTags] = useState<FocusTag[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [activeSlug, setActiveSlug] = useState("");

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) setActiveSlug(hash);
  }, []);

  useEffect(() => {
    if (!activeSlug) return;
    const timer = setTimeout(() => setActiveSlug(""), 3000);
    return () => clearTimeout(timer);
  }, [activeSlug]);

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
    const tags = getSessionTags();
    if (tags[today]) {
      setSelectedTags(tags[today]);
    }
    const durations = getSessionDurations();
    if (durations[today]) {
      setSelectedDuration(durations[today]);
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
            {program.tagline}
          </p>
          <Link
            href={`/training/plan?plan=${plan}`}
            className="mt-4 inline-block text-xs text-neutral-500 hover:text-neutral-300"
          >
            View Weekly Plan &rarr;
          </Link>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <TodaysPlan plan={plan} onJumpToDrill={setActiveSlug} />

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
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-neutral-500">
                    Training Program
                  </h2>
                  <span className="text-xs text-neutral-600">
                    {program.blocks.length} blocks
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                  Watch, practice, and check off each block when you&apos;re
                  done. No rush — even one block is progress.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {sections.map(({ section, blocks }) => (
                  <details
                    key={section}
                    open
                    className="group rounded-xl border border-neutral-800/60 bg-[#0c0c10]"
                  >
                    <summary className="flex cursor-pointer items-center justify-between px-5 py-4 select-none">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-white">
                          {section}
                        </span>
                        <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                          {blocks.filter((b) => blocksDone[b.id]).length}/{blocks.length}
                        </span>
                      </div>
                      <svg
                        className="h-4 w-4 text-neutral-600 transition-transform group-open:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </summary>
                    <div className="flex flex-col gap-4 px-4 pb-4">
                      {blocks.map((block) => (
                        <VideoBlock
                          key={block.id}
                          block={block}
                          done={!!blocksDone[block.id]}
                          onToggle={() => toggleBlock(block.id)}
                          highlighted={activeSlug === block.slug}
                        />
                      ))}
                    </div>
                  </details>
                ))}
              </div>

              <p className="mt-4 text-center text-xs text-neutral-600">
                {blocksDoneCount} of {program.blocks.length} blocks completed
              </p>
              <p className="mt-2 text-center text-[11px] text-neutral-700">
                Videos are embedded from YouTube and belong to their respective creators.
              </p>
            </section>

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

            <div className="h-px w-full bg-neutral-800/60" />

            <section className="py-10">
              <h2 className="mb-2 text-sm font-medium text-neutral-500">
                Focus Tags
              </h2>
              <p className="mb-6 text-xs text-neutral-600">
                What did you work on today? Pick up to 2.
              </p>
              <div className="flex flex-wrap gap-2">
                {FOCUS_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const next = active
                          ? selectedTags.filter((t) => t !== tag)
                          : selectedTags.length < 2
                            ? [...selectedTags, tag]
                            : selectedTags;
                        setSelectedTags(next);
                        saveSessionTags(getToday(), next);
                      }}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "border-indigo-500/40 bg-indigo-600/20 text-indigo-300"
                          : "border-neutral-800/60 bg-[#0c0c10] text-neutral-500 hover:border-neutral-700 hover:text-neutral-400"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              {selectedTags.length === 2 && (
                <p className="mt-3 text-[11px] text-neutral-600">
                  Max 2 tags selected.
                </p>
              )}
            </section>

            <div className="h-px w-full bg-neutral-800/60" />

            <section className="py-10">
              <h2 className="mb-2 text-sm font-medium text-neutral-500">
                Session Duration
              </h2>
              <p className="mb-6 text-xs text-neutral-600">
                Roughly how long did you train?
              </p>
              <div className="flex gap-2">
                {DURATION_OPTIONS.map((mins) => {
                  const active = selectedDuration === mins;
                  const label = mins === 60 ? "60m+" : `${mins}m`;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        setSelectedDuration(mins);
                        saveSessionDuration(getToday(), mins);
                      }}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "border-indigo-500/40 bg-indigo-600/20 text-indigo-300"
                          : "border-neutral-800/60 bg-[#0c0c10] text-neutral-500 hover:border-neutral-700 hover:text-neutral-400"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="h-px w-full bg-neutral-800/60" />

            <section className="py-10">
              <div className="flex flex-col gap-3">
                <Link
                  href="/dashboard"
                  className="flex h-11 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Back to Dashboard
                </Link>
                <Link
                  href={`/training/plan?plan=${plan}`}
                  className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
                >
                  View Weekly Plan
                </Link>
              </div>
            </section>
          </>
        )}

        {plan === "free" && (
          <>
            <div className="h-px w-full bg-neutral-800/60" />

            <div className="pt-10 pb-2">
              <p className="text-center text-xs text-neutral-600">
                See what&apos;s included in other plans
              </p>
            </div>

            <LockedTierPreview tier="starter" />

            <div className="h-px w-full bg-neutral-800/60" />

            <LockedTierPreview tier="pro" />

            <div className="flex justify-center pb-2 pt-1">
              <Link
                href="/pricing"
                className="text-xs text-neutral-500 transition-colors hover:text-neutral-300"
              >
                Compare all plans &rarr;
              </Link>
            </div>
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

        <footer className="flex items-center justify-center gap-4 py-8">
          <Link
            href="/dashboard"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            Dashboard
          </Link>
          <span className="text-neutral-800">&middot;</span>
          <Link
            href="/"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            Home
          </Link>
        </footer>
      </div>
    </main>
  );
}
