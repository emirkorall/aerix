import { Link } from "@/src/i18n/routing";
import { getTranslations } from "next-intl/server";

const check = (
  <svg className="h-4 w-4 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const checkAccent = (
  <svg className="h-4 w-4 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

export default async function StarterPlan() {
  const t = await getTranslations("PlanStarter");
  const tCommon = await getTranslations("Common");

  return (
    <main className="min-h-screen bg-[#060608] text-white">
      <div className="mx-auto max-w-xl px-6">
        <nav className="flex items-center justify-between py-6">
          <Link href="/" className="text-sm font-semibold tracking-[0.2em] uppercase text-white">
            Aerix
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-neutral-400 transition-colors hover:text-white"
          >
            {tCommon("comparePlans")}
          </Link>
        </nav>

        <section className="pt-20 pb-10">
          <div className="mb-4 inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-400">
            {t("popular")}
          </div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            {t("label")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {t("title")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            {t("desc")}
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            {t("includesPlus")}
          </h2>
          <ul className="flex flex-col gap-4 text-sm text-neutral-300">
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5">{checkAccent}</span>
              <div>
                <p className="font-medium text-indigo-300">{t("feat1Title")}</p>
                <p className="mt-0.5 text-neutral-500">{t("feat1Desc")}</p>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5">{check}</span>
              <div>
                <p className="font-medium text-white">{t("feat2Title")}</p>
                <p className="mt-0.5 text-neutral-500">{t("feat2Desc")}</p>
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5">{check}</span>
              <div>
                <p className="font-medium text-white">{t("feat3Title")}</p>
                <p className="mt-0.5 text-neutral-500">{t("feat3Desc")}</p>
              </div>
            </li>
          </ul>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <h2 className="mb-4 text-sm font-medium text-neutral-500">
            {t("whoFor")}
          </h2>
          <p className="text-sm leading-relaxed text-neutral-400">
            {t("whoDesc")}
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="py-10">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-white">{t("price")}</p>
            <span className="text-sm text-neutral-500">{tCommon("month")}</span>
          </div>
          <p className="mt-1 text-xs text-neutral-600">
            {t("priceNote")}
          </p>
          <Link
            href="/upgrade?plan=starter"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            {t("chooseStarter")}
          </Link>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-between py-8">
          <Link href="/plans/free" className="text-xs text-neutral-600 transition-colors hover:text-neutral-400">
            {t("freePlan")}
          </Link>
          <Link href="/plans/pro" className="text-xs text-neutral-600 transition-colors hover:text-neutral-400">
            {t("proPlan")}
          </Link>
        </footer>
      </div>
    </main>
  );
}
