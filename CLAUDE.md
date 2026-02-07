≈≈
# AERIX — Claude Code Instructions

You are working on **AERIX**, a public, subscription-based web app for the Rocket League community.

## Product Goal
Build and ship a **monetizable MVP in 30 days**.
The core value is **consistency, progress tracking, and rank improvement**.

## Non-Negotiables
- Prioritize shipping over perfection
- Avoid over-engineering
- Default to simple, readable solutions
- Build features that directly support subscription value

## Core Features (in order)
1. Streak system (daily consistency)
2. Training routines
3. Progress visualization
4. Free vs Premium gating
5. Subscription (Stripe)

## Architecture Rules
- Next.js App Router only
- Server Components by default
- Use `"use client"` only when needed
- Local-first state, then Supabase later
- Components live in `src/components`
- Routes live in `src/app`

## Streak System Rules
- One completion per calendar day
- Same-day completion does nothing
- Missed day resets streak
- Future: 1 recovery per month (Premium)

## Coding Style
- TypeScript strict
- Functional components
- No unnecessary abstractions
- Prefer clarity over cleverness

## Mindset
This is a **real product**, not a demo.
Every feature should answer:
“Why would a user pay for this?”

If unsure, choose the option that ships faster.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev` (starts on port 3000)
- **Build:** `npm run build`
- **Start production:** `npm run start`
- **Lint:** `npm run lint`
- No test framework is configured yet.

## Architecture

This is a Next.js 16 project using the **App Router** (not Pages Router). All routing lives in the `app/` directory.

- **React 19** with server components by default (add `"use client"` directive for client components)
- **TypeScript** with strict mode; path alias `@/*` maps to the project root
- **Tailwind CSS v4** via PostCSS (imported with `@import "tailwindcss"` in `globals.css`)
- **Dark mode** via CSS `prefers-color-scheme` media query with CSS custom properties
- **Fonts:** Geist Sans and Geist Mono loaded through `next/font/google`, applied as CSS variables

## Styling

Theme colors are defined as CSS custom properties in `app/globals.css` and registered via a `@theme` block for Tailwind. Use Tailwind utility classes with `dark:` prefix for dark mode variants.

## External Libraries & Dependencies Policy

**Purpose:** Protect stability, avoid premature complexity, and keep iteration fast.

**Core principle:** No external library unless it directly improves user value or business safety.

### Build Ourselves (Core IP)

- Training flow
- Streak logic
- Progress philosophy
- Dashboard UX
- Free vs paid boundaries

### Allowed Later

- **Payments:** Stripe
- **Auth:** Supabase or Clerk
- **i18n:** Only after proven demand
- **Analytics:** Retention-focused only

### Disallowed in MVP

- UI component libraries
- State management libraries
- Animation libraries
- Charting libraries
- AI SDKs
- "All-in-one" frameworks

### Evaluation Checklist

Before adding any library, all four must be "yes":

1. Does it improve user experience?
2. Does it reduce security or legal risk?
3. Is it removable later without breaking the product?
4. Is it more reliable than a simple in-house solution?

If any answer is "no" — don't add it.

### Stability Rule

If the library breaks, AERIX must still function.

### Language Policy

English-only for MVP. Add i18n only after proven demand.
