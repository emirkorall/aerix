"use client";

import { Link } from "@/src/i18n/routing";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { createClient } from "@/src/lib/supabase/client";
import { fetchUserPlan } from "@/src/lib/user-plan";
import type { PlanTier } from "@/src/lib/weekly-plan";
import {
  REGIONS,
  LOOKING_FOR_OPTIONS,
  canUseMatchmaking,
  MAX_OPEN_POSTS,
} from "@/src/lib/matchmaking";
import type { LfgPost, LookingFor, Region } from "@/src/lib/matchmaking";
import { RANKS, PLAYLISTS } from "@/src/lib/training-completion";
import type { Rank, Playlist } from "@/src/lib/training-completion";
import {
  fetchOpenPosts,
  createPost,
  closePost,
  countUserOpenPosts,
} from "@/src/lib/supabase/matchmaking";
import {
  REPORT_REASONS,
  submitReport,
  fetchBlockedUserIds,
  blockUser,
} from "@/src/lib/supabase/moderation";
import type { ReportReason } from "@/src/lib/supabase/moderation";

type View = "feed" | "create";

export default function MatchmakingPage() {
  const router = useRouter();
  const t = useTranslations("Matchmaking");
  const tCommon = useTranslations("Common");
  const tNav = useTranslations("Nav");
  const [plan, setPlan] = useState<PlanTier>("free");
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>("feed");
  const [posts, setPosts] = useState<LfgPost[]>([]);
  const [hasOpenPost, setHasOpenPost] = useState(false);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());

  // Create form state
  const [lookingFor, setLookingFor] = useState<LookingFor>("duo");
  const [rank, setRank] = useState<Rank>("Diamond I");
  const [playlist, setPlaylist] = useState<Playlist>("2v2");
  const [region, setRegion] = useState<Region>("NA");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const [p, openCount, blocked] = await Promise.all([
        fetchUserPlan(),
        countUserOpenPosts(),
        fetchBlockedUserIds(),
      ]);
      setPlan(p);
      setHasOpenPost(openCount >= MAX_OPEN_POSTS);
      setBlockedIds(blocked);
      const feed = await fetchOpenPosts(blocked);
      setPosts(feed);
      setReady(true);
    }).catch(() => setError(true));
  }, []);

  async function handleCreate() {
    if (!canUseMatchmaking(plan)) return;
    if (hasOpenPost) {
      toast(t("alreadyOpen"));
      return;
    }
    if (!note.trim()) {
      toast(t("addNote"));
      return;
    }
    setSubmitting(true);
    const post = await createPost({
      looking_for: lookingFor,
      rank,
      playlist,
      region,
      note: note.trim().slice(0, 300),
    });
    setSubmitting(false);
    if (post) {
      setHasOpenPost(true);
      setPosts((prev) => [{ ...post, display_name: "You" }, ...prev]);
      setView("feed");
      setNote("");
      toast(t("postCreated"));
    } else {
      toast(t("createFailed"));
    }
  }

  async function handleClose(postId: string) {
    await closePost(postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setHasOpenPost(false);
    toast(t("postClosed"));
  }

  async function handleBlock(targetUserId: string) {
    const result = await blockUser(targetUserId);
    if (result.ok) {
      const next = new Set(blockedIds);
      next.add(targetUserId);
      setBlockedIds(next);
      setPosts((prev) => prev.filter((p) => p.user_id !== targetUserId));
      toast(tCommon("userBlocked"));
    } else {
      toast(result.error ?? tCommon("blockFailed"));
    }
  }

  const allowed = canUseMatchmaking(plan);

  return (
    <main className="min-h-screen bg-[#060608] text-white aerix-grid">
      <div className="mx-auto max-w-xl px-6">
        {/* Nav */}
        <nav className="flex items-center justify-between py-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.2em] uppercase text-white"
          >
            {tCommon("aerix")}
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              {tNav("dashboard")}
            </Link>
            <Link
              href="/messages"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              {tNav("messages")}
            </Link>
          </div>
        </nav>

        {/* Header */}
        <section className="pt-20 pb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            {t("label")}
          </p>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            {t("desc")}
          </p>
          <span className="accent-line" />
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* Tabs */}
        <div className="flex items-center justify-between py-4">
          <div className="flex gap-1">
            {(
              [
                ["feed", t("tabBrowse")],
                ["create", t("tabCreate")],
              ] as [View, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === "create" && !allowed) {
                    toast(t("upgradeRequired"));
                    return;
                  }
                  setView(key);
                }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  view === key
                    ? "bg-indigo-600/20 text-indigo-300"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {!allowed && (
            <Link
              href="/pricing"
              className="text-[11px] text-indigo-400 hover:text-indigo-300"
            >
              {t("upgradeToPost")}
            </Link>
          )}
        </div>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* Feed */}
        {view === "feed" && (
          <section className="py-10">
            {error ? (
              <div className="rounded-xl border border-red-500/20 bg-[#0c0c10] px-6 py-10 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-neutral-300">Something went wrong</p>
                <p className="mt-1.5 text-xs text-neutral-600">Please try again later.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="cta-glow mt-5 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Try again
                </button>
              </div>
            ) : !ready ? (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="mb-4 h-8 w-8 animate-pulse rounded-full bg-indigo-600/20" />
                <p className="text-sm text-neutral-500">{tCommon("loading")}</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] px-6 py-10 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/10">
                  <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-neutral-300">
                  {t("emptyTitle")}
                </p>
                <p className="mt-1.5 text-xs text-neutral-600">
                  {t("emptySub")}
                </p>
                {allowed && (
                  <button
                    type="button"
                    onClick={() => setView("create")}
                    className="cta-glow mt-5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
                  >
                    {t("createPost")}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isOwn={post.user_id === userId}
                    canContact={allowed}
                    onClose={() => handleClose(post.id)}
                    onContact={() =>
                      router.push(`/matchmaking/${post.id}`)
                    }
                    onBlock={() => handleBlock(post.user_id)}
                    onReported={() => toast(tCommon("reportSubmitted"))}
                    onReportError={(msg) => toast(msg)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Create */}
        {view === "create" && allowed && (
          <section className="py-10">
            {hasOpenPost ? (
              <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6 text-center">
                <p className="text-sm text-neutral-500">
                  {t("alreadyPosted")}
                </p>
                <button
                  type="button"
                  onClick={() => setView("feed")}
                  className="mt-4 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  {t("backToFeed")}
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
                <h2 className="text-sm font-semibold text-white">
                  {t("createTitle")}
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  {t("createSub")}
                </p>

                {/* Looking for */}
                <div className="mt-5">
                  <p className="mb-2 text-[11px] font-medium text-neutral-400">
                    {t("lookingFor")}
                  </p>
                  <div className="flex gap-2">
                    {LOOKING_FOR_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setLookingFor(opt)}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                          lookingFor === opt
                            ? "border-indigo-500/40 bg-indigo-600/20 text-indigo-300"
                            : "border-neutral-800/60 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rank */}
                <div className="mt-5">
                  <p className="mb-2 text-[11px] font-medium text-neutral-400">
                    {t("yourRank")}
                  </p>
                  <select
                    value={rank}
                    onChange={(e) => setRank(e.target.value as Rank)}
                    className="w-full rounded-lg border border-neutral-800/60 bg-[#0c0c10] px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/40"
                  >
                    {RANKS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Playlist */}
                <div className="mt-5">
                  <p className="mb-2 text-[11px] font-medium text-neutral-400">
                    {t("playlistLabel")}
                  </p>
                  <div className="flex gap-2">
                    {PLAYLISTS.map((pl) => (
                      <button
                        key={pl}
                        type="button"
                        onClick={() => setPlaylist(pl)}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                          playlist === pl
                            ? "border-indigo-500/40 bg-indigo-600/20 text-indigo-300"
                            : "border-neutral-800/60 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300"
                        }`}
                      >
                        {pl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Region */}
                <div className="mt-5">
                  <p className="mb-2 text-[11px] font-medium text-neutral-400">
                    {t("region")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {REGIONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRegion(r)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          region === r
                            ? "border-indigo-500/40 bg-indigo-600/20 text-indigo-300"
                            : "border-neutral-800/60 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div className="mt-5">
                  <p className="mb-2 text-[11px] font-medium text-neutral-400">
                    {t("aboutYou")}
                  </p>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, 300))}
                    placeholder={t("notePlaceholder")}
                    rows={3}
                    className="w-full rounded-lg border border-neutral-800/60 bg-[#0c0c10] px-3 py-2 text-sm text-white placeholder:text-neutral-700 outline-none focus:border-indigo-500/40 resize-none"
                  />
                  <p className="mt-1 text-right text-[10px] text-neutral-700">
                    {t("charCount", { n: note.length })}
                  </p>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={submitting || !note.trim()}
                  className="cta-glow mt-4 flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? t("posting") : t("post")}
                </button>
              </div>
            )}
          </section>
        )}

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
            href="/messages"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            {tNav("messages")}
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

// ── Post Card ──

function PostCard({
  post,
  isOwn,
  canContact,
  onClose,
  onContact,
  onBlock,
  onReported,
  onReportError,
}: {
  post: LfgPost;
  isOwn: boolean;
  canContact: boolean;
  onClose: () => void;
  onContact: () => void;
  onBlock: () => void;
  onReported: () => void;
  onReportError: (msg: string) => void;
}) {
  const t = useTranslations("Matchmaking");
  const tCommon = useTranslations("Common");
  const ago = timeAgo(post.created_at);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>("Spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);

  async function handleReport() {
    setReportSubmitting(true);
    const result = await submitReport({
      target_type: "post",
      target_id: post.id,
      reason: reportReason,
      details: reportDetails || undefined,
    });
    setReportSubmitting(false);
    if (result.ok) {
      setShowReport(false);
      setReportDetails("");
      onReported();
    } else {
      onReportError(result.error ?? tCommon("reportFailed"));
    }
  }

  return (
    <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">
              {post.display_name ?? "Player"}
            </h3>
            <span className="rounded-full bg-indigo-600/15 px-2 py-0.5 text-[10px] font-medium text-indigo-300 capitalize">
              {t("lfType", { type: post.looking_for })}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
            {post.note}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-neutral-800/60 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
          {post.rank}
        </span>
        <span className="rounded-full bg-neutral-800/60 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
          {post.playlist}
        </span>
        <span className="rounded-full bg-neutral-800/60 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
          {post.region}
        </span>
        <span className="text-[10px] text-neutral-700">&middot;</span>
        <span className="text-[10px] text-neutral-600">{ago}</span>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2">
        {isOwn ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-800/60 px-3 py-1.5 text-[11px] font-medium text-neutral-500 transition-colors hover:border-red-500/30 hover:text-red-400"
          >
            {t("closePost")}
          </button>
        ) : canContact ? (
          <button
            type="button"
            onClick={onContact}
            className="rounded-lg border border-indigo-500/30 bg-indigo-600/15 px-3 py-1.5 text-[11px] font-medium text-indigo-300 transition-colors hover:bg-indigo-600/25"
          >
            {t("contact")}
          </button>
        ) : (
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800/60 px-3 py-1.5 text-[11px] font-medium text-neutral-500 transition-colors hover:border-neutral-700"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            {tCommon("starterPlus")}
          </Link>
        )}

        {/* Report & Block (not on own posts) */}
        {!isOwn && (
          <>
            <button
              type="button"
              onClick={() => setShowReport((v) => !v)}
              className="rounded-lg border border-neutral-800/60 px-3 py-1.5 text-[11px] font-medium text-neutral-600 transition-colors hover:border-neutral-700 hover:text-neutral-400"
              data-testid="report-btn"
            >
              {tCommon("report")}
            </button>
            {!confirmBlock ? (
              <button
                type="button"
                onClick={() => setConfirmBlock(true)}
                className="rounded-lg border border-neutral-800/60 px-3 py-1.5 text-[11px] font-medium text-neutral-600 transition-colors hover:border-red-500/30 hover:text-red-400"
              >
                {tCommon("block")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setConfirmBlock(false);
                  onBlock();
                }}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                {tCommon("confirmBlock")}
              </button>
            )}
          </>
        )}
      </div>

      {/* Inline Report Form */}
      {showReport && (
        <div className="mt-3 rounded-lg border border-neutral-800/60 bg-[#0a0a0e] p-3">
          <p className="mb-2 text-[11px] font-medium text-neutral-400">
            {tCommon("reportLabel")}
          </p>
          <select
            value={reportReason}
            onChange={(e) =>
              setReportReason(e.target.value as ReportReason)
            }
            className="w-full rounded-lg border border-neutral-800/60 bg-[#0c0c10] px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500/40"
          >
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <textarea
            value={reportDetails}
            onChange={(e) =>
              setReportDetails(e.target.value.slice(0, 500))
            }
            placeholder={tCommon("reportDetails")}
            rows={2}
            className="mt-2 w-full rounded-lg border border-neutral-800/60 bg-[#0c0c10] px-2.5 py-1.5 text-xs text-white placeholder:text-neutral-700 outline-none focus:border-indigo-500/40 resize-none"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={handleReport}
              disabled={reportSubmitting}
              className="rounded-lg bg-red-500/20 px-3 py-1.5 text-[11px] font-medium text-red-300 transition-colors hover:bg-red-500/30 disabled:opacity-50"
            >
              {reportSubmitting ? tCommon("sendingReport") : tCommon("submitReport")}
            </button>
            <button
              onClick={() => setShowReport(false)}
              className="text-[11px] text-neutral-600 hover:text-neutral-400"
            >
              {tCommon("cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
