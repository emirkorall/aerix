# CLAUDE.md

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
