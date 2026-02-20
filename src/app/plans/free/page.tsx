import { Link } from "@/src/i18n/routing";
import { getTranslations } from "next-intl/server";

const check = (
  <svg className="h-4 w-4 shrink-0 text-neutral-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const dash = (
  <svg className="h-4 w-4 shrink-0 text-neutral-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
  </svg>
);

export default async function FreePlan() {
  const t = await getTranslations("PlanFree");
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
            {t("whatYouGet")}
          </h2>
          <ul className="flex flex-col gap-4 text-sm text-neutral-300">
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5">{check}</span>
              <div>
                <p className="font-medium text-white">{t("feat1Title")}</p>
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
          <h2 className="mb-6 text-sm font-medium text-neutral-500">
            {t("notIncluded")}
          </h2>
          <ul className="flex flex-col gap-3 text-sm text-neutral-600">
            <li className="flex items-center gap-2.5">
              <span>{dash}</span>
              {t("notA")}
            </li>
            <li className="flex items-center gap-2.5">
              <span>{dash}</span>
              {t("notB")}
            </li>
            <li className="flex items-center gap-2.5">
              <span>{dash}</span>
              {t("notC")}
            </li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-neutral-600">
            {t("notIncNote")}
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <section className="flex flex-col items-start gap-4 py-10">
          <Link
            href="/dashboard"
            className="flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            {t("getStarted")}
          </Link>
          <p className="text-xs text-neutral-600">
            {t("getStartedNote")}
          </p>
          <div className="mt-2 flex items-center gap-4">
            <Link
              href="/upgrade?plan=starter"
              className="text-xs text-neutral-500 transition-colors hover:text-indigo-400"
            >
              {t("upgradeStarter")}
            </Link>
            <Link
              href="/upgrade?plan=pro"
              className="text-xs text-neutral-500 transition-colors hover:text-indigo-400"
            >
              {t("upgradePro")}
            </Link>
          </div>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-between py-8">
          <Link href="/pricing" className="text-xs text-neutral-600 transition-colors hover:text-neutral-400">
            {t("compareAll")}
          </Link>
          <Link href="/plans/starter" className="text-xs text-neutral-600 transition-colors hover:text-neutral-400">
            {t("starterLink")}
          </Link>
        </footer>
      </div>
    </main>
  );
}
