import type { ReactNode } from "react";

export default function PremiumPreview({
  title,
  label = "Preview",
  badge,
  description,
  children,
  actions,
}: {
  title: string;
  label?: string;
  badge?: ReactNode;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="py-8">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-neutral-500">{title}</h2>
          {badge}
        </div>
        <span className="rounded-full bg-indigo-600/15 px-2.5 py-0.5 text-[10px] font-medium text-indigo-400">
          {label}
        </span>
      </div>

      <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-5">
        {children}

        {(description || actions) && (
          <div className="mt-5 border-t border-neutral-800/60 pt-5">
            {description && (
              <p className="text-xs leading-relaxed text-neutral-600">
                {description}
              </p>
            )}
            {actions && (
              <div className="mt-4 flex items-center gap-3">{actions}</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
