/**
 * Re-export standard Next.js navigation as named exports.
 * This keeps existing `import { Link } from "@/src/i18n/routing"` working
 * after removing locale-based routing.
 */
export { default as Link } from "next/link";
export { redirect, usePathname, useRouter } from "next/navigation";
