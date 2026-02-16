"use client";

import Link from "next/link";
import { useState } from "react";
import { UPDATES, ALL_CATEGORIES } from "@/src/lib/updates";
import type { UpdateCategory, UpdateItem } from "@/src/lib/updates";

const CATEGORY_COLORS: Record<UpdateCategory, string> = {
  Season: "border-indigo-500/40 bg-indigo-600/20 text-indigo-300",
  Patch: "border-amber-500/40 bg-amber-600/20 text-amber-300",
  Esports: "border-emerald-500/40 bg-emerald-600/20 text-emerald-300",
  Meta: "border-purple-500/40 bg-purple-600/20 text-purple-300",
};

export default function UpdatesPage() {
  const [activeCategory, setActiveCategory] = useState<UpdateCategory | null>(
    null
  );

  const filtered = activeCategory
    ? UPDATES.filter((u) => u.category === activeCategory)
    : UPDATES;

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
              Dashboard
            </Link>
            <Link
              href="/training"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Training
            </Link>
          </div>
        </nav>

        {/* Header */}
        <section className="pt-20 pb-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
            Season Updates
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Stay current. Train smarter.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-neutral-400">
            Patch notes, meta shifts, and esports trends — summarized with
            training implications so you know what to practice.
          </p>
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 py-4">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === null
                ? "bg-indigo-600/20 text-indigo-300"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            All
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() =>
                setActiveCategory(activeCategory === cat ? null : cat)
              }
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-indigo-600/20 text-indigo-300"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* Update cards */}
        <section className="py-8">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6 text-center">
              <p className="text-sm text-neutral-500">
                No updates in this category yet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {filtered.map((item) => (
                <UpdateCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        <div className="h-px w-full bg-neutral-800/60" />

        {/* Disclosure */}
        <p className="py-6 text-center text-[10px] text-neutral-700">
          Updates are summarized by AERIX in our own words.
        </p>

        <div className="h-px w-full bg-neutral-800/60" />

        <footer className="flex items-center justify-center gap-4 py-8">
          <Link
            href="/dashboard"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            Dashboard
          </Link>
          <span className="text-neutral-800">&middot;</span>
          <Link
            href="/training"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            Training
          </Link>
          <span className="text-neutral-800">&middot;</span>
          <Link
            href="/"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            Home
          </Link>
        </footer>
      </div>
    </main>
  );
}

function UpdateCard({ item }: { item: UpdateItem }) {
  const formattedDate = new Date(item.date + "T00:00:00").toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  return (
    <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
      {/* Date + category badge */}
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] text-neutral-600">{formattedDate}</span>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[item.category]}`}
        >
          {item.category}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-2.5 text-sm font-semibold text-white">{item.title}</h3>

      {/* Summary */}
      <p className="mt-2 text-xs leading-relaxed text-neutral-400">
        {item.summary}
      </p>

      {/* Training impact */}
      <div className="mt-4">
        <p className="mb-2 text-[11px] font-medium text-neutral-500">
          Training impact
        </p>
        <ul className="flex flex-col gap-1">
          {item.trainingImpact.map((bullet, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5 text-[11px] leading-relaxed text-neutral-500"
            >
              <span className="mt-1.5 block h-1 w-1 shrink-0 rounded-full bg-indigo-500/40" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Links */}
      {item.links && item.links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {item.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-neutral-600 transition-colors hover:text-neutral-400"
            >
              {link.label} &nearr;
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
