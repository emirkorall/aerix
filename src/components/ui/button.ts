/**
 * Returns Tailwind class string for a consistent button style.
 * Use with <button>, <Link>, or any element.
 */
export function btn(
  variant: "primary" | "secondary" | "ghost" = "primary",
  size: "sm" | "md" | "lg" = "md",
): string {
  const base =
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:outline-none";

  const variants: Record<string, string> = {
    primary: "rounded-lg bg-indigo-600 text-white hover:bg-indigo-500",
    secondary:
      "rounded-lg border border-neutral-800/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300",
    ghost: "text-indigo-400 hover:text-indigo-300",
  };

  const sizes: Record<string, string> = {
    sm: "h-9 px-4 text-xs font-semibold",
    md: "h-10 px-5 text-sm font-semibold",
    lg: "h-11 px-7 text-sm font-semibold",
  };

  return `${base} ${variants[variant]} ${sizes[size]}`;
}
