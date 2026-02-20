"use client";

import { Link } from "@/src/i18n/routing";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { createClient } from "@/src/lib/supabase/client";
import { fetchUserPlan } from "@/src/lib/user-plan";
import type { PlanTier } from "@/src/lib/weekly-plan";
import { canUseMatchmaking } from "@/src/lib/matchmaking";
import type { LfgPost } from "@/src/lib/matchmaking";
import { fetchPost, getOrCreateThread } from "@/src/lib/supabase/matchmaking";
import {
  REPORT_REASONS,
  submitReport,
  fetchBlockedUserIds,
  blockUser,
  unblockUser,
} from "@/src/lib/supabase/moderation";
import type { ReportReason } from "@/src/lib/supabase/moderation";

export default function PostDetailPage() {
  const t = useTranslations("MatchmakingPost");
  const tCommon = useTranslations("Common");
  const tNav = useTranslations("Nav");
  const params = useParams();
  const router = useRouter();
  const postId = params.postId as string;

  const [plan, setPlan] = useState<PlanTier>("free");
  const [userId, setUserId] = useState<string | null>(null);
  const [post, setPost] = useState<LfgPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // Report state
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>("Spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const [p, postData, blocked] = await Promise.all([
        fetchUserPlan(),
        fetchPost(postId),
        fetchBlockedUserIds(),
      ]);
      setPlan(p);
      setPost(postData);
      if (postData && blocked.has(postData.user_id)) {
        setIsBlocked(true);
      }
      setLoading(false);
    });
  }, [postId]);

  async function handleContact() {
    if (!post || !canUseMatchmaking(plan)) return;
    setContacting(true);
    const threadId = await getOrCreateThread(post.id, post.user_id);
    setContacting(false);
    if (threadId) {
      router.push(`/messages/${threadId}`);
    }
  }

  async function handleReport() {
    if (!post) return;
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
      toast(tCommon("reportSubmitted"));
    } else {
      toast(result.error ?? tCommon("reportFailed"));
    }
  }

  async function handleBlock() {
    if (!post) return;
    const result = await blockUser(post.user_id);
    if (result.ok) {
      setIsBlocked(true);
      toast(tCommon("userBlocked"));
    } else {
      toast(result.error ?? tCommon("blockFailed"));
    }
  }

  const allowed = canUseMatchmaking(plan);
  const isOwn = post?.user_id === userId;

  return (
    <main className="min-h-screen bg-[#060608] text-white">
      <div className="mx-auto max-w-xl px-6">
        {/* Nav */}
        <nav className="flex items-center justify-between py-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.2em] uppercase text-white"
          >
            Aerix
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/matchmaking"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              {t("backToFeed")}
            </Link>
            <Link
              href="/messages"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              {tNav("messages")}
            </Link>
          </div>
        </nav>

        <section className="pt-20 pb-10">
          {loading ? (
            <p className="text-sm text-neutral-600">{tCommon("loading")}</p>
          ) : !post ? (
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6 text-center">
              <p className="text-sm text-neutral-500">{t("notFound")}</p>
              <Link
                href="/matchmaking"
                className="mt-4 inline-block text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                {t("backToFeedLink")}
              </Link>
            </div>
          ) : isBlocked ? (
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6 text-center">
              <p className="text-sm text-neutral-500">
                {t("blockedPlayer")}
              </p>
              <button
                type="button"
                onClick={async () => {
                  if (!post) return;
                  await unblockUser(post.user_id);
                  setIsBlocked(false);
                  toast(t("userUnblocked"));
                }}
                className="mt-4 inline-block rounded-lg border border-neutral-800/60 px-3 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:border-neutral-700 hover:text-white"
              >
                {t("unblock")}
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">
                  {post.display_name ?? "Player"}
                </h1>
                <span className="rounded-full bg-indigo-600/15 px-2 py-0.5 text-[10px] font-medium text-indigo-300 capitalize">
                  LF {post.looking_for}
                </span>
                {post.status === "closed" && (
                  <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                    {t("closed")}
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-neutral-300">
                {post.note}
              </p>

              {/* Details */}
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-neutral-800/60 px-2.5 py-1 text-[11px] font-medium text-neutral-400">
                  {post.rank}
                </span>
                <span className="rounded-full bg-neutral-800/60 px-2.5 py-1 text-[11px] font-medium text-neutral-400">
                  {post.playlist}
                </span>
                <span className="rounded-full bg-neutral-800/60 px-2.5 py-1 text-[11px] font-medium text-neutral-400">
                  {post.region}
                </span>
              </div>

              <p className="mt-3 text-[10px] text-neutral-600">
                {t("postedOn", {
                  date: new Date(post.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                })}
              </p>

              {/* Actions */}
              <div className="mt-6">
                {post.status === "closed" ? (
                  <p className="text-xs text-neutral-500">
                    {t("postClosed")}
                  </p>
                ) : isOwn ? (
                  <p className="text-xs text-neutral-500">
                    {t("ownPost")}
                  </p>
                ) : allowed ? (
                  <button
                    onClick={handleContact}
                    disabled={contacting}
                    className="flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {contacting ? t("sendingRequest") : t("requestToPlay")}
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-neutral-500">
                      {t("upgradeCta")}
                    </p>
                    <Link
                      href="/pricing"
                      className="mt-2 inline-block text-xs font-medium text-indigo-400 hover:text-indigo-300"
                    >
                      {t("viewPlansLink")}
                    </Link>
                  </div>
                )}
              </div>

              {/* Report & Block (not on own posts) */}
              {!isOwn && (
                <div className="mt-4 flex items-center gap-2 border-t border-neutral-800/40 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowReport((v) => !v)}
                    className="rounded-lg border border-neutral-800/60 px-3 py-1.5 text-[11px] font-medium text-neutral-600 transition-colors hover:border-neutral-700 hover:text-neutral-400"
                  >
                    {tCommon("report")}
                  </button>
                  {!confirmBlock ? (
                    <button
                      type="button"
                      onClick={() => setConfirmBlock(true)}
                      className="rounded-lg border border-neutral-800/60 px-3 py-1.5 text-[11px] font-medium text-neutral-600 transition-colors hover:border-red-500/30 hover:text-red-400"
                    >
                      {t("blockUser")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmBlock(false);
                        handleBlock();
                      }}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/20"
                    >
                      {tCommon("confirmBlock")}
                    </button>
                  )}
                </div>
              )}

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
          )}
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-center py-8">
          <Link
            href="/matchmaking"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            &larr; {tNav("matchmaking")}
          </Link>
        </footer>
      </div>

    </main>
  );
}
