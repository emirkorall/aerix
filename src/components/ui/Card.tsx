export function Card({
  children,
  className,
  highlighted,
}: {
  children: React.ReactNode;
  className?: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border ${
        highlighted
          ? "border-indigo-500/30 bg-indigo-500/[0.05]"
          : "border-neutral-800/60 bg-[#0c0c10]"
      } p-5${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
