export function StateView({
  type,
  icon,
  title,
  description,
  action,
}: {
  type: "empty" | "loading" | "error";
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  if (type === "loading") {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div className="mb-4 h-8 w-8 animate-pulse rounded-full bg-indigo-600/20" />
        <p className="text-sm text-neutral-500">{title}</p>
      </div>
    );
  }

  const borderColor =
    type === "error" ? "border-red-500/20" : "border-neutral-800/60";
  const iconBg =
    type === "error" ? "bg-red-500/10" : "bg-indigo-600/10";
  const iconColor =
    type === "error" ? "text-red-400" : "text-indigo-400";

  const defaultIcon =
    type === "error" ? (
      <svg
        className={`h-6 w-6 ${iconColor}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
        />
      </svg>
    ) : (
      <svg
        className={`h-6 w-6 ${iconColor}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
        />
      </svg>
    );

  return (
    <div
      className={`rounded-xl border ${borderColor} bg-[#0c0c10] px-6 py-10 text-center`}
    >
      <div
        className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}
      >
        {icon ?? defaultIcon}
      </div>
      <p className="text-sm font-medium text-neutral-300">{title}</p>
      {description && (
        <p className="mt-1.5 text-xs text-neutral-600">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
