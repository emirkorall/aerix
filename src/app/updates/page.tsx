import { Link } from "@/src/i18n/routing";
import { getTranslations } from "next-intl/server";
import { fetchPatchNotes } from "@/src/lib/rlUpdates";
import type { PatchNote } from "@/src/lib/rlUpdates";

export const revalidate = 21600; // 6 hours

export default async function UpdatesPage() {
  const t = await getTranslations("Updates");
  const tNav = await getTranslations("Nav");
  const tCommon = await getTranslations("Common");
  const notes = await fetchPatchNotes();

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
              {tNav("dashboard")}
            </Link>
            <Link
              href="/training"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              {tNav("training")}
            </Link>
          </div>
        </nav>

        {/* Header */}
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

        {/* Cards */}
        <section className="py-8">
          {notes.length === 0 ? (
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6 text-center">
              <p className="text-sm text-neutral-400">
                {t("errorLoading")}
              </p>
              <a
                href="https://www.rocketleague.com/news/tag/patch-notes"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
              >
                {t("viewOnRL")}
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {notes.map((note) => (
                <NoteCard key={note.href} note={note} readLabel={t("readOnRL")} />
              ))}
            </div>
          )}
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* Disclaimer */}
        <p className="py-6 text-center text-[10px] text-neutral-700">
          {t("disclaimer")}
          {" "}{t("sourceNote")}
        </p>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-center gap-4 py-8">
          <Link
            href="/dashboard"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            {tNav("dashboard")}
          </Link>
          <span className="text-neutral-800">&middot;</span>
          <Link
            href="/training"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            {tNav("training")}
          </Link>
          <span className="text-neutral-800">&middot;</span>
          <Link
            href="/"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            {tCommon("home")}
          </Link>
        </footer>
      </div>
    </main>
  );
}

function NoteCard({ note, readLabel }: { note: PatchNote; readLabel: string }) {
  return (
    <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
      <div className="flex items-center gap-2.5">
        {note.date && (
          <span className="text-[11px] text-neutral-600">{note.date}</span>
        )}
        <span className="rounded-full border border-amber-500/40 bg-amber-600/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
          {note.tag}
        </span>
      </div>

      <h3 className="mt-2.5 text-sm font-semibold text-white">{note.title}</h3>

      <a
        href={note.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-400 transition-colors hover:text-indigo-300"
      >
        {readLabel}
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
          />
        </svg>
      </a>
    </div>
  );
}
