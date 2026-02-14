"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { MESSAGE_COOLDOWN_SEC } from "@/src/lib/matchmaking";
import type { MessageThread, Message } from "@/src/lib/matchmaking";
import {
  fetchThread,
  fetchMessages,
  sendMessage,
} from "@/src/lib/supabase/matchmaking";
import {
  REPORT_REASONS,
  submitReport,
  fetchBlockedUserIds,
  blockUser,
} from "@/src/lib/supabase/moderation";
import type { ReportReason } from "@/src/lib/supabase/moderation";

export default function ThreadPage() {
  const params = useParams();
  const threadId = params.threadId as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [reportingMsgId, setReportingMsgId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<ReportReason>("Spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      const [t, msgs, blockedIds] = await Promise.all([
        fetchThread(threadId),
        fetchMessages(threadId),
        fetchBlockedUserIds(),
      ]);
      setThread(t);
      setMessages(msgs);
      // Check if the other user in this thread is blocked
      if (t) {
        const otherId =
          t.starter_id === user.id ? t.receiver_id : t.starter_id;
        if (blockedIds.has(otherId)) setBlocked(true);
      }
      setReady(true);
    });
  }, [threadId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 5s (only if not blocked)
  useEffect(() => {
    if (!ready || blocked) return;
    const interval = setInterval(async () => {
      const msgs = await fetchMessages(threadId);
      setMessages(msgs);
    }, 5000);
    return () => clearInterval(interval);
  }, [ready, threadId, blocked]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function handleSend() {
    if (!body.trim() || sending || cooldown || blocked) return;
    setSending(true);
    const msg = await sendMessage(threadId, body);
    setSending(false);
    if (msg) {
      setMessages((prev) => [...prev, msg]);
      setBody("");
      // Anti-spam cooldown
      setCooldown(true);
      setTimeout(() => setCooldown(false), MESSAGE_COOLDOWN_SEC * 1000);
    }
  }

  async function handleBlockUser() {
    if (!thread || !userId) return;
    const otherId =
      thread.starter_id === userId ? thread.receiver_id : thread.starter_id;
    const result = await blockUser(otherId);
    if (result.ok) {
      setBlocked(true);
      showToast("User blocked.");
    } else {
      showToast(result.error ?? "Failed to block.");
    }
  }

  async function handleReportMessage() {
    if (!reportingMsgId) return;
    setReportSubmitting(true);
    const result = await submitReport({
      target_type: "message",
      target_id: reportingMsgId,
      reason: reportReason,
      details: reportDetails || undefined,
    });
    setReportSubmitting(false);
    if (result.ok) {
      setReportingMsgId(null);
      setReportDetails("");
      showToast("Report submitted.");
    } else {
      showToast(result.error ?? "Report failed.");
    }
  }

  const otherName =
    thread?.other_user_name ??
    (thread && userId
      ? thread.starter_id === userId
        ? "Player"
        : "Player"
      : "Player");

  return (
    <main className="flex min-h-screen flex-col bg-[#060608] text-white">
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-6">
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
              href="/messages"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Inbox
            </Link>
            <Link
              href="/matchmaking"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Matchmaking
            </Link>
          </div>
        </nav>

        {/* Thread header */}
        <div className="flex items-center justify-between border-b border-neutral-800/60 pb-4">
          <div>
            <h1 className="text-sm font-semibold text-white">{otherName}</h1>
            {thread && (
              <Link
                href={`/matchmaking/${thread.post_id}`}
                className="text-[11px] text-neutral-500 transition-colors hover:text-neutral-300"
              >
                View original post &rarr;
              </Link>
            )}
          </div>
          {/* Block user in header */}
          {thread && !blocked && (
            <div>
              {!confirmBlock ? (
                <button
                  type="button"
                  onClick={() => setConfirmBlock(true)}
                  className="rounded-lg border border-neutral-800/60 px-2.5 py-1 text-[10px] font-medium text-neutral-600 transition-colors hover:border-red-500/30 hover:text-red-400"
                >
                  Block
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmBlock(false);
                    handleBlockUser();
                  }}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-medium text-red-400 transition-colors hover:bg-red-500/20"
                >
                  Confirm
                </button>
              )}
            </div>
          )}
        </div>

        {/* Blocked banner */}
        {blocked && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/[0.05] px-4 py-3 mt-4">
            <p className="text-xs text-red-300">
              You blocked this user. Messaging is disabled.
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-6">
          {!ready ? (
            <p className="text-center text-sm text-neutral-600">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-neutral-600">
              No messages yet. Say hi!
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {messages.map((msg) => {
                const isMine = msg.sender_id === userId;
                return (
                  <div
                    key={msg.id}
                    className={`group flex ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <div className="flex items-end gap-1.5">
                      {/* Report button on other's messages */}
                      {!isMine && (
                        <button
                          type="button"
                          onClick={() =>
                            setReportingMsgId(
                              reportingMsgId === msg.id ? null : msg.id
                            )
                          }
                          className="mb-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Report message"
                        >
                          <svg
                            className="h-3 w-3 text-neutral-700 hover:text-red-400 transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
                            />
                          </svg>
                        </button>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
                          isMine
                            ? "rounded-br-md bg-indigo-600/20 text-indigo-100"
                            : "rounded-bl-md bg-neutral-800/60 text-neutral-200"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.body}</p>
                        <p
                          className={`mt-1 text-[10px] ${
                            isMine ? "text-indigo-400/50" : "text-neutral-600"
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleTimeString(
                            undefined,
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Inline report form for a message */}
        {reportingMsgId && (
          <div className="rounded-lg border border-neutral-800/60 bg-[#0a0a0e] p-3 mb-3">
            <p className="mb-2 text-[11px] font-medium text-neutral-400">
              Report this message
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
              placeholder="Additional details (optional)"
              rows={2}
              className="mt-2 w-full rounded-lg border border-neutral-800/60 bg-[#0c0c10] px-2.5 py-1.5 text-xs text-white placeholder:text-neutral-700 outline-none focus:border-indigo-500/40 resize-none"
            />
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleReportMessage}
                disabled={reportSubmitting}
                className="rounded-lg bg-red-500/20 px-3 py-1.5 text-[11px] font-medium text-red-300 transition-colors hover:bg-red-500/30 disabled:opacity-50"
              >
                {reportSubmitting ? "Sending..." : "Submit Report"}
              </button>
              <button
                onClick={() => {
                  setReportingMsgId(null);
                  setReportDetails("");
                }}
                className="text-[11px] text-neutral-600 hover:text-neutral-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-neutral-800/60 py-4">
          {blocked ? (
            <p className="text-center text-xs text-neutral-600">
              Messaging disabled — user is blocked.
            </p>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, 500))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-neutral-800/60 bg-[#0c0c10] px-3 py-2.5 text-sm text-white placeholder:text-neutral-700 outline-none focus:border-indigo-500/40"
                />
                <button
                  onClick={handleSend}
                  disabled={!body.trim() || sending || cooldown}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? "..." : "Send"}
                </button>
              </div>
              {cooldown && (
                <p className="mt-1.5 text-[10px] text-neutral-600">
                  Please wait a few seconds...
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-neutral-800/60 bg-[#0c0c10] px-4 py-2.5 text-xs font-medium text-neutral-300 shadow-lg">
          {toast}
        </div>
      )}
    </main>
  );
}
