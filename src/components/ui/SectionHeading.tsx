export function SectionHeading({
  label,
  title,
  subtitle,
  center,
  as: Tag = "h2",
}: {
  label?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  as?: "h1" | "h2" | "h3";
}) {
  const align = center ? "text-center" : "";
  return (
    <div className={align}>
      {label && (
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-500">
          {label}
        </p>
      )}
      {Tag === "h1" ? (
        <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
      ) : Tag === "h3" ? (
        <h3 className="text-lg font-bold tracking-tight text-white">
          {title}
        </h3>
      ) : (
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-neutral-400">
          {subtitle}
        </p>
      )}
      <span className={`accent-line${center ? " mx-auto" : ""}`} />
    </div>
  );
}
