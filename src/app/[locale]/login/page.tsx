"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Link } from "@/src/i18n/routing";
import { useTranslations } from "next-intl";
import { createClient } from "@/src/lib/supabase/client";
import { isSupabaseConfigured } from "@/src/lib/supabase/validate";
import SupabaseNotConfigured from "@/src/components/SupabaseNotConfigured";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const t = useTranslations("Login");
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const callbackUrl = new URL("/auth/callback", location.origin);
      if (returnTo) {
        callbackUrl.searchParams.set("returnTo", returnTo);
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callbackUrl.toString() },
      });

      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      setLoading(false);
      setError(
        err instanceof Error ? err.message : "Supabase is not configured."
      );
    }
  }

  if (!isSupabaseConfigured()) {
    return <SupabaseNotConfigured />;
  }

  return (
    <main className="min-h-screen bg-[#060608] text-white">
      <div className="mx-auto max-w-sm px-6">
        <nav className="flex items-center justify-between py-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.2em] uppercase text-white"
          >
            Aerix
          </Link>
        </nav>

        <section className="pt-32 pb-10">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            {t("subtitle")}
          </p>
        </section>

        {sent ? (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-6 text-center">
            <p className="text-sm font-medium text-indigo-300">
              {t("checkEmail")}
            </p>
            <p className="mt-2 text-xs text-neutral-500">
              {t("sentLink", { email })}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("placeholder")}
              className="w-full rounded-lg border border-neutral-800/60 bg-[#0c0c10] px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-neutral-700"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="flex h-11 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? t("sending") : t("sendLink")}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
