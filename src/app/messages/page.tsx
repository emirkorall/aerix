"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import type { MessageThread } from "@/src/lib/matchmaking";
import { fetchThreads } from "@/src/lib/supabase/matchmaking";
import { fetchBlockedUserIds } from "@/src/lib/supabase/moderation";

export default function MessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const blocked = await fetchBlockedUserIds();
      const data = await fetchThreads(blocked);
      setThreads(data);
      setReady(true);
    });
  }, []);

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
              href="/dashboard"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/matchmaking"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Matchmaking
            </Link>
          </div>
        </nav>

        {/* Header */}
        <section className="pt-20 pb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Inbox
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Messages
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            Your conversations with other players.
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-8">
          {!ready ? (
            <p className="text-center text-sm text-neutral-600">Loading...</p>
          ) : threads.length === 0 ? (
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6 text-center">
              <p className="text-sm text-neutral-500">No messages yet.</p>
              <Link
                href="/matchmaking"
                className="mt-4 inline-block text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                Find players to team up with &rarr;
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/messages/${thread.id}`}
                  className="flex items-center gap-3 rounded-xl border border-neutral-800/60 bg-[#0c0c10] px-4 py-3 transition-colors hover:border-neutral-700/60"
                >
                  {/* Avatar placeholder */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600/15">
                    <span className="text-xs font-bold text-indigo-400">
                      {(thread.other_user_name ?? "P").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-white">
                        {thread.other_user_name ?? "Player"}
                      </p>
                      {thread.status === "pending" && (
                        <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                          Pending
                        </span>
                      )}
                      {thread.status === "declined" && (
                        <span className="shrink-0 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400">
                          Declined
                        </span>
                      )}
                    </div>
                    {thread.last_message ? (
                      <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                        {thread.last_message}
                      </p>
                    ) : thread.status === "pending" ? (
                      <p className="mt-0.5 text-[11px] text-amber-500/60">
                        Waiting for response
                      </p>
                    ) : (
                      <p className="mt-0.5 text-[11px] text-neutral-600">
                        No messages yet
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {thread.last_message_at && (
                      <span className="text-[10px] text-neutral-600">
                        {timeAgo(thread.last_message_at)}
                      </span>
                    )}
                    {(thread.unread_count ?? 0) > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">
                        {thread.unread_count}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-center gap-4 py-8">
          <Link
            href="/matchmaking"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            Matchmaking
          </Link>
          <span className="text-neutral-800">&middot;</span>
          <Link
            href="/dashboard"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            Dashboard
          </Link>
        </footer>
      </div>
    </main>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}
