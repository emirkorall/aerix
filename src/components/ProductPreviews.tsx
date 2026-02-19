"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/src/i18n/routing";
import { useTranslations } from "next-intl";

const FALLBACK_ICONS: Record<string, React.ReactNode> = {
  dashboard: (
    <svg className="h-8 w-8 text-indigo-400/70" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
    </svg>
  ),
  training: (
    <svg className="h-8 w-8 text-indigo-400/70" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
    </svg>
  ),
  progress: (
    <svg className="h-8 w-8 text-indigo-400/70" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  matchmaking: (
    <svg className="h-8 w-8 text-indigo-400/70" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  ),
};

type CardKey = "dashboard" | "training" | "progress" | "matchmaking";

const CARDS: { key: CardKey; href: string; image: string }[] = [
  { key: "dashboard", href: "/dashboard", image: "/previews/dashboard.png" },
  { key: "training", href: "/training", image: "/previews/training.png" },
  { key: "progress", href: "/progress", image: "/previews/progress.png" },
  { key: "matchmaking", href: "/matchmaking", image: "/previews/matchmaking.png" },
];

function PreviewImage({ src, alt, cardKey }: { src: string; alt: string; cardKey: CardKey }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center rounded-2xl border border-neutral-800/60 bg-gradient-to-br from-[#0c0c10] to-[#111118]">
        <div className="flex flex-col items-center gap-2">
          {FALLBACK_ICONS[cardKey]}
          <span className="text-[11px] font-medium text-neutral-600">{alt}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-800/60">
      <Image
        src={src}
        alt={alt}
        width={640}
        height={400}
        className="h-auto w-full"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function ProductPreviews() {
  const t = useTranslations("Home");

  return (
    <section className="py-16 lg:py-20">
      <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-neutral-500">
        {t("previewLabel")}
      </p>
      <h2 className="mb-14 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {t("previewTitle")}
      </h2>

      <div className="grid gap-6 sm:grid-cols-2">
        {CARDS.map((card) => (
          <div
            key={card.key}
            className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5"
          >
            <PreviewImage
              src={card.image}
              alt={t(`preview_${card.key}_title` as Parameters<typeof t>[0])}
              cardKey={card.key}
            />

            <h3 className="mt-4 text-base font-semibold text-white">
              {t(`preview_${card.key}_title` as Parameters<typeof t>[0])}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-neutral-500">
              {t(`preview_${card.key}_desc` as Parameters<typeof t>[0])}
            </p>

            <ul className="mt-3 flex flex-col gap-1.5">
              <li className="flex items-start gap-2 text-sm text-neutral-400">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400/60" />
                {t(`preview_${card.key}_a` as Parameters<typeof t>[0])}
              </li>
              <li className="flex items-start gap-2 text-sm text-neutral-400">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-indigo-400/60" />
                {t(`preview_${card.key}_b` as Parameters<typeof t>[0])}
              </li>
            </ul>

            <Link
              href={card.href}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              {t(`preview_${card.key}_cta` as Parameters<typeof t>[0])}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
