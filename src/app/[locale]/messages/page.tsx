"use client";

import { Link } from "@/src/i18n/routing";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/src/lib/supabase/client";
import type { MessageThread } from "@/src/lib/matchmaking";
import { fetchThreads } from "@/src/lib/supabase/matchmaking";
import { fetchBlockedUserIds } from "@/src/lib/supabase/moderation";

export default function MessagesPage() {
  const t = useTranslations("MessagesPage");
  const tNav = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const blocked = await fetchBlockedUserIds();
      const data = await fetchThreads(blocked);
      setThreads(data);
      setReady(true);
    }).catch(() => setError(true));
  }, []);

  return (
    <main className="min-h-screen bg-[#060608] text-white aerix-grid">
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
              {tNav("dashboard")}
            </Link>
            <Link
              href="/matchmaking"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              {tNav("matchmaking")}
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
          ) : threads.length === 0 ? (
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] px-6 py-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600/10">
                <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-neutral-300">
                {t("emptyTitle")}
              </p>
              <p className="mt-1.5 text-xs text-neutral-600">
                {t("emptySub")}
              </p>
              <Link
                href="/matchmaking"
                className="cta-glow mt-5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                {t("findTeammates")}
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
                        {thread.other_user_name ?? t("player")}
                      </p>
                      {thread.status === "pending" && (
                        <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                          {t("pending")}
                        </span>
                      )}
                      {thread.status === "declined" && (
                        <span className="shrink-0 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-medium text-red-400">
                          {t("declined")}
                        </span>
                      )}
                    </div>
                    {thread.last_message ? (
                      <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                        {thread.last_message}
                      </p>
                    ) : thread.status === "pending" ? (
                      <p className="mt-0.5 text-[11px] text-amber-500/60">
                        {t("waitingResponse")}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-[11px] text-neutral-600">
                        {t("noMessagesYet")}
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
            {tNav("matchmaking")}
          </Link>
          <span className="text-neutral-800">&middot;</span>
          <Link
            href="/dashboard"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            {tNav("dashboard")}
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
