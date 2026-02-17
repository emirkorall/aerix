"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/src/lib/supabase/client";
import { MESSAGE_COOLDOWN_SEC } from "@/src/lib/matchmaking";
import type { MessageThread, Message, ThreadStatus } from "@/src/lib/matchmaking";
import {
  fetchThread,
  fetchMessages,
  sendMessage,
  markThreadRead,
  acceptThread,
  declineThread,
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
  const [threadStatus, setThreadStatus] = useState<ThreadStatus>("pending");
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [responding, setResponding] = useState(false);
  const [reportingMsgId, setReportingMsgId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<ReportReason>("Spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isStarter = thread ? userId === thread.starter_id : false;
  const isReceiver = thread ? userId === thread.receiver_id : false;
  const chatEnabled = threadStatus === "accepted" && !blocked;

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
      if (t) {
        setThreadStatus((t.status as ThreadStatus) ?? "pending");
        const otherId =
          t.starter_id === user.id ? t.receiver_id : t.starter_id;
        if (blockedIds.has(otherId)) setBlocked(true);
        if (t.status === "accepted") markThreadRead(threadId);
      }
      setReady(true);
    });
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription for new messages
  const realtimeActive = useRef(false);

  useEffect(() => {
    if (!ready || blocked || threadStatus !== "accepted") return;

    const supabase = createClient();
    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe((status) => {
        realtimeActive.current = status === "SUBSCRIBED";
      });

    return () => {
      realtimeActive.current = false;
      supabase.removeChannel(channel);
    };
  }, [ready, threadId, blocked, threadStatus]);

  // Poll as fallback only when realtime is not active
  useEffect(() => {
    if (!ready || blocked) return;
    const interval = setInterval(async () => {
      if (realtimeActive.current && threadStatus === "accepted") return;
      const [t, msgs] = await Promise.all([
        fetchThread(threadId),
        threadStatus === "accepted" ? fetchMessages(threadId) : Promise.resolve(messages),
      ]);
      if (t) {
        const newStatus = (t.status as ThreadStatus) ?? "pending";
        if (newStatus !== threadStatus) setThreadStatus(newStatus);
        setThread(t);
      }
      if (threadStatus === "accepted") {
        const seen = new Set<string>();
        const unique = msgs.filter((m) => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
        setMessages(unique);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [ready, threadId, blocked, threadStatus, messages]);

  async function handleAccept() {
    setResponding(true);
    const ok = await acceptThread(threadId);
    setResponding(false);
    if (ok) {
      setThreadStatus("accepted");
      toast("Request accepted! You can now chat.");
    } else {
      toast("Failed to accept. Try again.");
    }
  }

  async function handleDecline() {
    setResponding(true);
    const ok = await declineThread(threadId);
    setResponding(false);
    if (ok) {
      setThreadStatus("declined");
      toast("Request declined.");
    } else {
      toast("Failed to decline. Try again.");
    }
  }

  async function handleSend() {
    if (!body.trim() || sending || cooldown || !chatEnabled) return;
    setSending(true);
    const msg = await sendMessage(threadId, body);
    setSending(false);
    if (msg) {
      setMessages((prev) => [...prev, msg]);
      setBody("");
      toast("Message sent");
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
      toast("User blocked.");
    } else {
      toast(result.error ?? "Failed to block.");
    }
  }

  async function handleReportMessage() {
    if (!reportingMsgId || !thread || !userId) return;
    setReportSubmitting(true);
    const otherId =
      thread.starter_id === userId ? thread.receiver_id : thread.starter_id;
    const isUserReport = reportingMsgId === otherId;
    const result = await submitReport({
      target_type: isUserReport ? "user" : "message",
      target_id: reportingMsgId,
      reason: reportReason,
      details: reportDetails || undefined,
    });
    setReportSubmitting(false);
    if (result.ok) {
      setReportingMsgId(null);
      setReportDetails("");
      toast("Report submitted.");
    } else {
      toast(result.error ?? "Report failed.");
    }
  }

  const otherName = thread?.other_user_name ?? "Player";

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
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white">{otherName}</h1>
              {threadStatus === "pending" && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                  Pending
                </span>
              )}
              {threadStatus === "declined" && (
                <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400">
                  Declined
                </span>
              )}
            </div>
            {thread && (
              <Link
                href={`/matchmaking/${thread.post_id}`}
                className="text-[11px] text-neutral-500 transition-colors hover:text-neutral-300"
              >
                View original post &rarr;
              </Link>
            )}
          </div>
          {/* Report & Block in header */}
          {thread && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const otherId =
                    thread.starter_id === userId
                      ? thread.receiver_id
                      : thread.starter_id;
                  setReportingMsgId(reportingMsgId ? null : otherId);
                }}
                className="rounded-lg border border-neutral-800/60 px-2.5 py-1 text-[10px] font-medium text-neutral-600 transition-colors hover:border-neutral-700 hover:text-neutral-400"
              >
                Report
              </button>
              {!blocked && (
                <>
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
                </>
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

        {/* Pending state — requester view */}
        {threadStatus === "pending" && isStarter && !blocked && (
          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-6 text-center">
            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-amber-500/10">
              <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <p className="mt-4 text-sm font-medium text-amber-300">
              Request sent!
            </p>
            <p className="mt-1.5 text-xs text-neutral-400">
              Waiting for {otherName} to respond. You&apos;ll be able to chat once they accept.
            </p>
          </div>
        )}

        {/* Pending state — receiver (post owner) view */}
        {threadStatus === "pending" && isReceiver && !blocked && (
          <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-6 text-center">
            <p className="text-sm font-medium text-white">
              {otherName} wants to play with you!
            </p>
            <p className="mt-1.5 text-xs text-neutral-400">
              Accept to start chatting, or decline if you&apos;re not interested.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={handleAccept}
                disabled={responding}
                className="flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
              >
                {responding ? "..." : "Accept"}
              </button>
              <button
                onClick={handleDecline}
                disabled={responding}
                className="flex h-10 items-center justify-center rounded-lg border border-neutral-800/60 px-5 text-sm font-medium text-neutral-400 transition-colors hover:border-neutral-700 hover:text-neutral-300 disabled:opacity-50"
              >
                {responding ? "..." : "Decline"}
              </button>
            </div>
          </div>
        )}

        {/* Declined state */}
        {threadStatus === "declined" && !blocked && (
          <div className="mt-6 rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6 text-center">
            <p className="text-sm text-neutral-400">
              {isReceiver
                ? "You declined this request."
                : "This request was declined."}
            </p>
            <Link
              href="/matchmaking"
              className="mt-4 inline-block text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              Back to matchmaking &rarr;
            </Link>
          </div>
        )}

        {/* Messages — only shown when accepted */}
        {threadStatus === "accepted" && (
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
        )}

        {/* Spacer for non-accepted states */}
        {threadStatus !== "accepted" && <div className="flex-1" />}

        {/* Inline report form */}
        {reportingMsgId && (
          <div className="rounded-lg border border-neutral-800/60 bg-[#0a0a0e] p-3 mb-3">
            <p className="mb-2 text-[11px] font-medium text-neutral-400">
              Report this {thread && userId && reportingMsgId === (thread.starter_id === userId ? thread.receiver_id : thread.starter_id) ? "user" : "message"}
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

        {/* Input — only when chat is enabled */}
        <div className="border-t border-neutral-800/60 py-4">
          {blocked ? (
            <p className="text-center text-xs text-neutral-600">
              Messaging disabled — user is blocked.
            </p>
          ) : !chatEnabled ? (
            <p className="text-center text-xs text-neutral-600">
              {threadStatus === "pending"
                ? "Chat will be available once the request is accepted."
                : "This conversation is closed."}
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

    </main>
  );
}
