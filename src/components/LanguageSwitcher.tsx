"use client";

import { useLocale } from "next-intl";
import { usePathname } from "@/src/i18n/routing";
import { useState, useRef, useEffect } from "react";
import { routing, type Locale } from "@/src/i18n/routing";

const labels: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  "pt-BR": "PT-BR",
  fr: "FR",
  de: "DE",
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-md px-2 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-200"
      >
        {labels[locale]}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[80px] rounded-lg border border-neutral-800/60 bg-[#0c0c10] py-1 shadow-xl">
          {routing.locales.map((l) => {
            const href = `/${l}${pathname === "/" ? "" : pathname}`;
            return (
              <a
                key={l}
                href={href}
                onClick={() => {
                  document.cookie = `NEXT_LOCALE=${l};path=/;max-age=${365 * 24 * 60 * 60}`;
                }}
                className={`block w-full px-3 py-1.5 text-left text-xs font-medium transition-colors ${
                  l === locale
                    ? "text-indigo-400"
                    : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
                }`}
              >
                {labels[l]}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
