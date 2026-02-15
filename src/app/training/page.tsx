"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  getOnboarding,
} from "@/src/lib/training-completion";
import type { SessionNote, FocusTag, OnboardingData } from "@/src/lib/training-completion";
import { getTodayPlan, getTodayIndex, DAY_LABELS } from "@/src/lib/weekly-plan";
import type { PlanTier } from "@/src/lib/weekly-plan";
import { TRAINING_PROGRAMS, getBlocksBySection } from "@/src/lib/trainingPrograms";
import type { TrainingBlock } from "@/src/lib/trainingPrograms";
import PremiumPreview from "@/src/components/PremiumPreview";
import { fetchUserPlan } from "@/src/lib/user-plan";
import { fetchOnboardingStatus } from "@/src/lib/onboarding";
import { createClient } from "@/src/lib/supabase/client";
import { getDrillById, getLocalQueue, setLocalQueue, QUEUE_LIMITS } from "@/src/lib/drill-library";
import { syncDrillQueue, replaceQueue } from "@/src/lib/supabase/sync-drills";

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
      <TrainingRouter />
    </Suspense>
  );
}

function TrainingRouter() {
  const params = useSearchParams();
  if (params.get("mode") === "queue") {
    return <QueueSession />;
  }
  return <TrainingContent />;
}

// ── Queue Session Mode ──

function QueueSession() {
  const [plan, setPlan] = useState<Plan>("free");
  const [signedIn, setSignedIn] = useState(false);
  const [queueIds, setQueueIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [doneDrills, setDoneDrills] = useState<Set<string>>(new Set());
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    setQueueIds(getLocalQueue());

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setSignedIn(true);
        const p = await fetchUserPlan();
        setPlan(p as Plan);
        await syncDrillQueue();
        setQueueIds(getLocalQueue());
      }
      setLoading(false);
    });
  }, []);

  const allDrills = queueIds
    .map(getDrillById)
    .filter((d): d is TrainingBlock => !!d);
  const limit = QUEUE_LIMITS[plan];
  const drills = allDrills.slice(0, limit);
  const gated = allDrills.length > drills.length;

  const currentDrill = drills[currentIndex] ?? null;

  function markDone() {
    if (!currentDrill) return;
    const next = new Set(doneDrills);
    next.add(currentDrill.id);
    setDoneDrills(next);

    // Auto-advance to next incomplete
    const nextIdx = drills.findIndex((d, i) => i > currentIndex && !next.has(d.id));
    if (nextIdx !== -1) {
      setCurrentIndex(nextIdx);
    } else if (next.size >= drills.length) {
      // All done
      setSessionComplete(true);
      setLocalQueue([]);
      if (signedIn) replaceQueue([]);
      setCompletedToday(true);
    }
  }

  function nextDrill() {
    const nextIdx = drills.findIndex((d, i) => i > currentIndex && !doneDrills.has(d.id));
    if (nextIdx !== -1) setCurrentIndex(nextIdx);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#060608] text-white">
        <div className="mx-auto max-w-xl px-6 py-20">
          <p className="text-sm text-neutral-600">Loading queue…</p>
        </div>
      </main>
    );
  }

  // Empty queue
  if (drills.length === 0) {
    return (
      <main className="min-h-screen bg-[#060608] text-white">
        <div className="mx-auto max-w-xl px-6">
          <nav className="flex items-center justify-between py-6">
            <Link href="/" className="text-sm font-semibold tracking-[0.2em] uppercase text-white">
              Aerix
            </Link>
            <Link href="/dashboard" className="text-sm text-neutral-400 transition-colors hover:text-white">
              Dashboard
            </Link>
          </nav>
          <section className="flex flex-col items-center py-32 text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800/40">
              <svg className="h-6 w-6 text-neutral-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">No drills queued</h2>
            <p className="mt-3 text-sm text-neutral-400">
              Add drills to your queue from the library to start a session.
            </p>
            <Link
              href="/library"
              className="mt-8 flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Go to Library
            </Link>
          </section>
        </div>
      </main>
    );
  }

  // Session complete
  if (sessionComplete) {
    return (
      <main className="min-h-screen bg-[#060608] text-white">
        <div className="mx-auto max-w-xl px-6">
          <nav className="flex items-center justify-between py-6">
            <Link href="/" className="text-sm font-semibold tracking-[0.2em] uppercase text-white">
              Aerix
            </Link>
            <Link href="/dashboard" className="text-sm text-neutral-400 transition-colors hover:text-white">
              Dashboard
            </Link>
          </nav>
          <section className="flex flex-col items-center py-32 text-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600/20">
              <svg className="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Session complete.
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-400">
              You worked through {drills.length} {drills.length === 1 ? "drill" : "drills"}. Queue cleared — add more from the library anytime.
            </p>
            <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
              <Link
                href="/progress"
                className="flex h-11 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                View Progress
              </Link>
              <Link
                href="/dashboard"
                className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-300"
              >
                Back to Dashboard
              </Link>
              <Link
                href="/library"
                className="flex h-11 items-center justify-center rounded-lg border border-neutral-800/60 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-300"
              >
                Drill Library
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const hasNext = drills.some((d, i) => i > currentIndex && !doneDrills.has(d.id));
  const isDone = currentDrill ? doneDrills.has(currentDrill.id) : false;

  return (
    <main className="min-h-screen bg-[#060608] text-white">
      <div className="mx-auto max-w-xl px-6">
        <nav className="flex items-center justify-between py-6">
          <Link href="/" className="text-sm font-semibold tracking-[0.2em] uppercase text-white">
            Aerix
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/library" className="text-sm text-neutral-400 transition-colors hover:text-white">
              Library
            </Link>
            <Link href="/dashboard" className="text-sm text-neutral-400 transition-colors hover:text-white">
              Dashboard
            </Link>
          </div>
        </nav>

        <section className="pt-20 pb-10">
          <div className="mb-3 flex items-center gap-3">
            <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
              Session Queue
            </p>
            <span className="rounded-full bg-indigo-600/20 px-2.5 py-0.5 text-[10px] font-medium text-indigo-400">
              {doneDrills.size}/{drills.length} done
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your queued session.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            Work through each drill in order. Mark done when you&apos;re ready to move on.
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* Queue overview */}
        <section className="py-6">
          <div className="flex flex-col gap-1.5">
            {drills.map((drill, i) => {
              const done = doneDrills.has(drill.id);
              const isCurrent = i === currentIndex;
              return (
                <button
                  key={drill.id}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    isCurrent
                      ? "bg-indigo-600/10 ring-1 ring-indigo-500/30"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
                      done
                        ? "bg-indigo-600/20 text-indigo-400"
                        : isCurrent
                          ? "bg-neutral-700 text-white"
                          : "bg-neutral-800/60 text-neutral-600"
                    }`}
                  >
                    {done ? (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span
                    className={`truncate text-sm ${
                      done
                        ? "text-neutral-600 line-through"
                        : isCurrent
                          ? "font-medium text-white"
                          : "text-neutral-400"
                    }`}
                  >
                    {drill.title}
                  </span>
                </button>
              );
            })}
          </div>
          {gated && (
            <p className="mt-3 text-xs text-neutral-600">
              +{allDrills.length - drills.length} more queued.{" "}
              <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-[9px] font-medium text-neutral-500">
                Starter+
              </span>{" "}
              <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300">
                queues multiple drills.
              </Link>
            </p>
          )}
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* Current drill */}
        {currentDrill && (
          <section className="py-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-medium text-neutral-500">
                Drill {currentIndex + 1} of {drills.length}
              </h2>
              {isDone && (
                <span className="rounded-full bg-indigo-600/20 px-2.5 py-0.5 text-[10px] font-medium text-indigo-400">
                  Completed
                </span>
              )}
            </div>
            <VideoBlock
              block={currentDrill}
              done={isDone}
              onToggle={markDone}
              highlighted={false}
            />
            <div className="mt-4 flex gap-3">
              {!isDone ? (
                <button
                  type="button"
                  onClick={markDone}
                  className="flex h-10 flex-1 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Mark Drill Done
                </button>
              ) : hasNext ? (
                <button
                  type="button"
                  onClick={nextDrill}
                  className="flex h-10 flex-1 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Next Drill &rarr;
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSessionComplete(true);
                    setLocalQueue([]);
                    if (signedIn) replaceQueue([]);
                    setCompletedToday(true);
                  }}
                  className="flex h-10 flex-1 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Finish Session
                </button>
              )}
            </div>
          </section>
        )}

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-center gap-4 py-8">
          <Link href="/library" className="text-xs text-neutral-600 transition-colors hover:text-neutral-400">
            Library
          </Link>
          <span className="text-neutral-800">&middot;</span>
          <Link href="/dashboard" className="text-xs text-neutral-600 transition-colors hover:text-neutral-400">
            Dashboard
          </Link>
          <span className="text-neutral-800">&middot;</span>
          <Link href="/" className="text-xs text-neutral-600 transition-colors hover:text-neutral-400">
            Home
          </Link>
        </footer>
      </div>
    </main>
  );
}

// ── Normal Training Mode ──

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
          <Link
            href="/library"
            className="text-[11px] text-neutral-600 transition-colors hover:text-indigo-400"
          >
            Save to Library
          </Link>
          <span className="text-[11px] text-neutral-700">&middot;</span>
          <a
            href={`https://www.youtube.com/watch?v=${block.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-neutral-600 transition-colors hover:text-neutral-400"
          >
            YouTube &nearr;
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

const GOAL_SECTION_MAP: Record<string, string> = {
  "Mechanics": "Mechanics",
  "Game Sense": "Game Sense / Review",
  "Rank Up": "Mechanics",
  "Consistency": "Mechanics",
};

function TrainingContent() {
  const [plan, setPlan] = useState<Plan>("free");
  const [focusGoal, setFocusGoal] = useState<string | null>(null);

  useEffect(() => {
    fetchUserPlan().then((dbPlan) => setPlan(dbPlan as Plan));
    fetchOnboardingStatus().then((ob) => {
      if (ob.onboarding_completed && ob.focus_goal) {
        setFocusGoal(ob.focus_goal);
      }
    });
  }, []);

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
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);

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
    setOnboarding(getOnboarding());
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
          <div className="flex items-center gap-4">
            <Link
              href="/library"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Library
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Plans
            </Link>
          </div>
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
          <div className="mt-4 flex items-center gap-4">
            <Link
              href={`/training/plan?plan=${plan}`}
              className="text-xs text-neutral-500 hover:text-neutral-300"
            >
              View Weekly Plan &rarr;
            </Link>
            <Link
              href="/library"
              className="text-xs text-neutral-500 hover:text-neutral-300"
            >
              Build a custom session in Library &rarr;
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <TodaysPlan plan={plan} onJumpToDrill={setActiveSlug} />

        {onboarding && (
          <div className="pb-6">
            <p className="text-xs leading-relaxed text-neutral-500">
              {onboarding.goal === "Rank Up"
                ? "Small sessions daily beat big sessions sometimes."
                : onboarding.goal === "Build Consistency"
                  ? "Just show up \u2014 the streak does the heavy lifting."
                  : onboarding.goal === "Mechanics"
                    ? "Focus on clean reps, not flashy clips."
                    : "Play slower in your head, faster in your decisions."}
            </p>
          </div>
        )}

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
                {sections.map(({ section, blocks }) => {
                  const isRecommended = focusGoal != null && GOAL_SECTION_MAP[focusGoal] === section;
                  return (
                  <details
                    key={section}
                    open
                    className={`group rounded-xl border bg-[#0c0c10] ${
                      isRecommended
                        ? "border-indigo-500/30"
                        : "border-neutral-800/60"
                    }`}
                  >
                    <summary className="flex cursor-pointer items-center justify-between px-5 py-4 select-none">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-white">
                          {section}
                        </span>
                        <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-400">
                          {blocks.filter((b) => blocksDone[b.id]).length}/{blocks.length}
                        </span>
                        {isRecommended && (
                          <span className="rounded-full bg-indigo-600/20 px-2 py-0.5 text-[10px] font-medium text-indigo-400">
                            Recommended for your focus
                          </span>
                        )}
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
                  );
                })}
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

        {plan === "starter" && (
          <>
            <div className="h-px w-full bg-neutral-800/60" />

            <div className="pt-10 pb-2">
              <p className="text-center text-xs text-neutral-600">
                See what&apos;s included in Pro
              </p>
            </div>

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
