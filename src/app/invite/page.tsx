"use client";

import { Link } from "@/src/i18n/routing";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/src/lib/supabase/client";
import { ensureReferralCode } from "@/src/lib/referral";

export default function InvitePage() {
  const t = useTranslations("Invite");
  const tNav = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login?returnTo=/invite");
        return;
      }
      ensureReferralCode().then((c) => {
        setCode(c);
        setLoading(false);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function copyToClipboard(text: string, type: "code" | "link") {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const shareLink = code
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/login?returnTo=/onboarding?ref=${code}`
    : "";

  if (loading) {
    return <main className="min-h-screen bg-[#060608]" />;
  }

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
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            {t("yourCode")}
          </h2>
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
            {code ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-2xl font-bold tracking-widest text-white">
                    {code}
                  </p>
                  <button
                    onClick={() => copyToClipboard(code, "code")}
                    className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                      copied === "code"
                        ? "bg-indigo-600/20 text-indigo-400"
                        : "bg-indigo-600 text-white hover:bg-indigo-500"
                    }`}
                  >
                    {copied === "code" ? t("copied") : t("copyCode")}
                  </button>
                </div>

                <div className="mt-5 h-px w-full bg-neutral-800/40" />

                <div className="mt-5">
                  <p className="mb-2 text-[11px] font-medium text-neutral-500">
                    {t("shareLink")}
                  </p>
                  <div className="flex items-center gap-3">
                    <p className="min-w-0 flex-1 truncate rounded-lg border border-neutral-800/60 bg-[#060608] px-3 py-2.5 text-xs text-neutral-400">
                      {shareLink}
                    </p>
                    <button
                      onClick={() => copyToClipboard(shareLink, "link")}
                      className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                        copied === "link"
                          ? "bg-indigo-600/20 text-indigo-400"
                          : "bg-indigo-600 text-white hover:bg-indigo-500"
                      }`}
                    >
                      {copied === "link" ? t("copied") : t("copyLink")}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-neutral-500">
                {t("codeError")}
              </p>
            )}
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
            <h3 className="text-sm font-medium text-white">{t("howItWorks")}</h3>
            <ol className="mt-3 flex flex-col gap-2 text-xs leading-relaxed text-neutral-400">
              <li>{t("step1")}</li>
              <li>{t("step2")}</li>
              <li>{t("step3")}</li>
            </ol>
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
