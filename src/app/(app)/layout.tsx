"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/training", label: "Training" },
  { href: "/play", label: "Play" },
  { href: "/profile", label: "Profile" },
];

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#06080d] text-neutral-100">
      <header className="border-b border-white/10 bg-[#0b1018]/95">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-8">
          <Link
            href="/dashboard"
            className="text-sm font-semibold tracking-[0.2em] uppercase text-neutral-200"
          >
            AERIX
          </Link>

          <nav className="flex items-center gap-1.5">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-cyan-500/15 text-cyan-300"
                      : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-8 py-10">{children}</main>
    </div>
  );
}
