export function Container({
  children,
  className,
  wide,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`mx-auto ${wide ? "max-w-5xl" : "max-w-xl"} px-6${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
