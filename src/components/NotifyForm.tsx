"use client";

import { useState } from "react";

interface InterestEntry {
  date: string;
  plan: string;
  email: string;
}

export default function NotifyForm({ plan }: { plan: string }) {
  const [email, setEmail] = useState("");
  const [checked, setChecked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleSave() {
    setError("");

    if (!checked) {
      setError("Check the box to continue.");
      return;
    }

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }

    try {
      const raw = localStorage.getItem("aerix.upgradeInterest");
      const entries: InterestEntry[] = raw ? JSON.parse(raw) : [];

      const idx = entries.findIndex(
        (e) => e.email === trimmed && e.plan === plan
      );
      const entry: InterestEntry = {
        date: new Date().toISOString(),
        plan,
        email: trimmed,
      };

      if (idx >= 0) {
        entries[idx] = entry;
      } else {
        entries.push(entry);
      }

      localStorage.setItem("aerix.upgradeInterest", JSON.stringify(entries));
      setSaved(true);
    } catch {
      setError("Could not save. Try again.");
    }
  }

  if (saved) {
    return (
      <div className="rounded-xl border border-indigo-500/10 bg-indigo-500/[0.04] p-5 text-center">
        <p className="text-sm font-medium text-indigo-300">
          You&apos;re on the list.
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          We&apos;ll let you know when {plan} payments go live.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
      <h3 className="text-sm font-medium text-white">
        Get notified when upgrades launch
      </h3>

      <input
        type="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-4 h-10 w-full rounded-lg border border-neutral-800/60 bg-transparent px-3 text-sm text-white placeholder:text-neutral-600 focus:border-indigo-500/40 focus:outline-none"
      />

      <label className="mt-3 flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600"
        />
        <span className="text-xs leading-relaxed text-neutral-500">
          Email me when payments are live
        </span>
      </label>

      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}

      <button
        onClick={handleSave}
        className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-white/[0.07] text-sm font-medium text-neutral-300 transition-colors hover:bg-white/[0.12]"
      >
        Save
      </button>
    </div>
  );
}
