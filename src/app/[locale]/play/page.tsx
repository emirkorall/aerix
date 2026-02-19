import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function Play({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Play");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center gap-16 px-16 py-32 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            {t("title")}
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {t("desc")}
          </p>
        </div>
        <div className="flex w-full flex-col gap-6">
          <div className="flex items-center justify-between rounded-2xl border border-black/[.08] p-8 dark:border-white/[.145]">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                {t("quickMatch")}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {t("quickMatchDesc")}
              </p>
            </div>
            <a
              href="#"
              className="flex h-12 shrink-0 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              {t("start")}
            </a>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-black/[.08] p-8 dark:border-white/[.145]">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                {t("soloDrill")}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {t("soloDrillDesc")}
              </p>
            </div>
            <a
              href="#"
              className="flex h-12 shrink-0 items-center justify-center rounded-full border border-black/[.08] px-6 text-sm font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            >
              {t("start")}
            </a>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-black/[.08] p-8 dark:border-white/[.145]">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                {t("challenge")}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {t("challengeDesc")}
              </p>
            </div>
            <a
              href="#"
              className="flex h-12 shrink-0 items-center justify-center rounded-full border border-black/[.08] px-6 text-sm font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
            >
              {t("start")}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
