import { Link } from "@/src/i18n/routing";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/src/lib/supabase/server";
import { isSupabaseConfigured } from "@/src/lib/supabase/validate";
import { LanguageSwitcher } from "@/src/components/LanguageSwitcher";
import ProductPreviews from "@/src/components/ProductPreviews";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Home");
  const nav = await getTranslations("Nav");

  let signedIn = false;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = !!user;
  }

  const startFreeHref = signedIn ? "/dashboard" : "/login?returnTo=/onboarding";
  const tryStarterHref = signedIn ? "/pricing" : "/login?returnTo=/pricing";

  return (
    <main className="min-h-screen bg-[#060608] text-white relative overflow-hidden">
      {/* Subtle dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6">
        {/* Nav */}
        <nav className="flex items-center justify-between py-6">
          <span className="text-sm font-semibold tracking-[0.2em] uppercase text-white">
            Aerix
          </span>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/pricing"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              {nav("pricing")}
            </Link>
            {signedIn ? (
              <Link
                href="/dashboard"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
              >
                {nav("dashboard")}
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-white/[0.07] px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/[0.12]"
              >
                {nav("signIn")}
              </Link>
            )}
          </div>
        </nav>

        {/* ───── Hero ───── */}
        <section className="flex flex-col items-center pt-28 pb-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/[0.07] px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            <span className="text-xs font-medium text-indigo-300">
              {t("badge")}
            </span>
          </div>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t("heroTitle1")}
            <br />
            {t("heroTitle2")}
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-neutral-400">
            {t("heroSub")}
          </p>
          <span className="accent-line mx-auto" />

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href={startFreeHref}
              className="cta-glow rounded-lg bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              {t("startFree")}
            </Link>
            <Link
              href={tryStarterHref}
              className="rounded-lg border border-neutral-700 px-7 py-3.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
            >
              {t("tryStarter")}
            </Link>
          </div>

          <p className="mt-6 text-xs text-neutral-600">
            {t("heroNote")}
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ───── Why AERIX ───── */}
        <section className="py-16 lg:py-20">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-neutral-500">
            {t("whyLabel")}
          </p>
          <h2 className="mb-14 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t("whyTitle")}
          </h2>

          <div className="grid gap-5 sm:grid-cols-3">
            {/* Pillar 1 */}
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                </svg>
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">{t("pillar1Title")}</h3>
              <p className="mb-4 text-sm leading-relaxed text-neutral-500">{t("pillar1Desc")}</p>
              <ul className="flex flex-col gap-2 text-sm text-neutral-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400/60" />
                  {t("pillar1a")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400/60" />
                  {t("pillar1b")}
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
                </svg>
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">{t("pillar2Title")}</h3>
              <p className="mb-4 text-sm leading-relaxed text-neutral-500">{t("pillar2Desc")}</p>
              <ul className="flex flex-col gap-2 text-sm text-neutral-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400/60" />
                  {t("pillar2a")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400/60" />
                  {t("pillar2b")}
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">{t("pillar3Title")}</h3>
              <p className="mb-4 text-sm leading-relaxed text-neutral-500">{t("pillar3Desc")}</p>
              <ul className="flex flex-col gap-2 text-sm text-neutral-400">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400/60" />
                  {t("pillar3a")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400/60" />
                  {t("pillar3b")}
                </li>
              </ul>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ───── See AERIX in action ───── */}
        <ProductPreviews />

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ───── How it works ───── */}
        <section className="py-16 lg:py-20">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-neutral-500">
            {t("howLabel")}
          </p>
          <h2 className="mb-14 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {t("howTitle")}
          </h2>

          <div className="grid gap-10 sm:grid-cols-3 sm:gap-5">
            <div className="text-center sm:text-left">
              <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-indigo-500/30 text-sm font-semibold text-indigo-400">1</span>
              <h3 className="mt-4 text-base font-semibold text-white">{t("step1Title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{t("step1Desc")}</p>
            </div>
            <div className="text-center sm:text-left">
              <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-indigo-500/30 text-sm font-semibold text-indigo-400">2</span>
              <h3 className="mt-4 text-base font-semibold text-white">{t("step2Title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{t("step2Desc")}</p>
            </div>
            <div className="text-center sm:text-left">
              <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-indigo-500/30 text-sm font-semibold text-indigo-400">3</span>
              <h3 className="mt-4 text-base font-semibold text-white">{t("step3Title")}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">{t("step3Desc")}</p>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ───── Plans teaser ───── */}
        <section className="py-16 lg:py-20">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-neutral-500">{t("plansLabel")}</p>
          <h2 className="mb-14 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">{t("plansTitle")}</h2>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
              <h3 className="text-base font-semibold text-white">{t("freeName")}</h3>
              <p className="mt-1 mb-5 text-xs text-neutral-500">{t("freeSub")}</p>
              <ul className="flex flex-col gap-2.5 text-sm text-neutral-400">
                <li className="flex items-start gap-2"><CheckIcon className="text-neutral-500" />{t("freeA")}</li>
                <li className="flex items-start gap-2"><CheckIcon className="text-neutral-500" />{t("freeB")}</li>
                <li className="flex items-start gap-2"><CheckIcon className="text-neutral-500" />{t("freeC")}</li>
              </ul>
            </div>

            <div className="relative rounded-xl border border-indigo-500/30 bg-[#0c0c10] p-6">
              <div className="absolute -top-3 right-6 rounded-full bg-indigo-600 px-3 py-0.5 text-[11px] font-semibold text-white">{t("starterBadge")}</div>
              <h3 className="text-base font-semibold text-white">{t("starterName")}</h3>
              <p className="mt-1 mb-5 text-xs text-neutral-500">{t("starterSub")}</p>
              <ul className="flex flex-col gap-2.5 text-sm text-neutral-400">
                <li className="flex items-start gap-2"><CheckIcon className="text-indigo-400" /><span className="text-indigo-300">{t("starterA")}</span></li>
                <li className="flex items-start gap-2"><CheckIcon className="text-indigo-400" /><span className="text-indigo-300">{t("starterB")}</span></li>
                <li className="flex items-start gap-2"><CheckIcon className="text-indigo-400" /><span className="text-indigo-300">{t("starterC")}</span></li>
              </ul>
              <p className="mt-4 text-xs text-indigo-400/70">{t("starterTrial")}</p>
            </div>

            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
              <h3 className="text-base font-semibold text-white">{t("proName")}</h3>
              <p className="mt-1 mb-5 text-xs text-neutral-500">{t("proSub")}</p>
              <ul className="flex flex-col gap-2.5 text-sm text-neutral-400">
                <li className="flex items-start gap-2"><CheckIcon className="text-neutral-500" />{t("proA")}</li>
                <li className="flex items-start gap-2"><CheckIcon className="text-neutral-500" />{t("proB")}</li>
                <li className="flex items-start gap-2"><CheckIcon className="text-neutral-500" />{t("proC")}</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-6 py-3 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white">
              {t("viewPlans")}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ───── Training Packs teaser ───── */}
        <section className="py-16 lg:py-20">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-12">
            <div className="mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-neutral-800/60 bg-[#0c0c10]">
              <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" /></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{t("packsTitle")}</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">{t("packsDesc")}</p>
              <Link href="/packs" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300">
                {t("explorePacks")}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </Link>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ───── Season Updates teaser ───── */}
        <section className="py-16 lg:py-20">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-12">
            <div className="mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-neutral-800/60 bg-[#0c0c10]">
              <svg className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5" /></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{t("updatesTitle")}</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">{t("updatesDesc")}</p>
              <Link href="/updates" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300">
                {t("seeUpdates")}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
              </Link>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* ───── Footer CTA ───── */}
        <section className="py-16 lg:py-20 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{t("footerCta")}</h2>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href={startFreeHref} className="cta-glow rounded-lg bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500">{t("startFree")}</Link>
            <Link href="/pricing" className="rounded-lg border border-neutral-700 px-7 py-3.5 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white">{t("viewPlans")}</Link>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-between py-8">
          <span className="text-xs text-neutral-600">© {new Date().getFullYear()} AERIX</span>
          <span className="text-xs text-neutral-600">{t("footerMade")}</span>
        </footer>
      </div>
    </main>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={`mt-0.5 h-4 w-4 shrink-0 ${className ?? ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}
