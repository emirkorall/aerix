"use client";

import { Link } from "@/src/i18n/routing";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const DRAFT_KEY = "aerix.feedbackDraft";
const TYPES = ["Bug", "Feature", "Other"] as const;
type FeedbackType = (typeof TYPES)[number];

function loadDraft(): { type: FeedbackType; message: string } {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.message === "string") {
        return {
          type: TYPES.includes(parsed.type) ? parsed.type : "Bug",
          message: parsed.message,
        };
      }
    }
  } catch { /* ignore */ }
  return { type: "Bug", message: "" };
}

function formatMessage(type: FeedbackType, message: string): string {
  return `[AERIX Feedback — ${type}]\n\n${message.trim()}`;
}

export default function FeedbackPage() {
  const t = useTranslations("Feedback");
  const tNav = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const [type, setType] = useState<FeedbackType>("Bug");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    setType(draft.type);
    setMessage(draft.message);
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ type, message }));
  }, [type, message]);

  const typeLabels: Record<FeedbackType, string> = {
    Bug: t("bug"),
    Feature: t("feature"),
    Other: t("other"),
  };

  const formatted = formatMessage(type, message);
  const mailtoHref = `mailto:feedback@aerix.gg?subject=AERIX Feedback — ${type}&body=${encodeURIComponent(message.trim())}`;

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
            href="/dashboard"
            className="text-sm text-neutral-400 transition-colors hover:text-white"
          >
            {tNav("dashboard")}
          </Link>
        </nav>

        <section className="pt-20 pb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            {t("label")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            {t("desc")}
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            <div>
              <p className="mb-2 text-[11px] font-medium text-neutral-400">
                {t("type")}
              </p>
              <div className="flex gap-2">
                {TYPES.map((tp) => (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => {
                      setType(tp);
                      setCopied(false);
                    }}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      type === tp
                        ? "border-indigo-500/40 bg-indigo-600/20 text-indigo-300"
                        : "border-neutral-800/60 bg-transparent text-neutral-500 hover:border-neutral-700 hover:text-neutral-400"
                    }`}
                  >
                    {typeLabels[tp]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <label
                htmlFor="feedback-message"
                className="mb-1.5 block text-[11px] font-medium text-neutral-400"
              >
                {t("message")}
              </label>
              <textarea
                id="feedback-message"
                rows={5}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setCopied(false);
                }}
                placeholder={t("placeholder")}
                className="w-full resize-none rounded-lg border border-neutral-800/60 bg-[#060608] px-3.5 py-2.5 text-sm text-white placeholder-neutral-700 outline-none transition-colors focus:border-neutral-700"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={async () => {
                  if (!message.trim()) return;
                  await navigator.clipboard.writeText(formatted);
                  setCopied(true);
                }}
                disabled={!message.trim()}
                className={`flex h-10 flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                  !message.trim()
                    ? "cursor-not-allowed bg-neutral-800/60 text-neutral-600"
                    : copied
                      ? "bg-indigo-600/20 text-indigo-400"
                      : "bg-indigo-600 text-white hover:bg-indigo-500"
                }`}
              >
                {copied ? "Copied!" : t("copyMessage")}
              </button>
              <a
                href={message.trim() ? mailtoHref : undefined}
                className={`flex h-10 flex-1 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                  !message.trim()
                    ? "pointer-events-none border-neutral-800/60 text-neutral-600"
                    : "border-neutral-800/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
                }`}
              >
                {t("emailUs")}
              </a>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-center py-8">
          <Link
            href="/dashboard"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            {tCommon("backDashboard")}
          </Link>
        </footer>
      </div>
    </main>
  );
}
