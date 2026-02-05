export default function Training() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center gap-16 px-16 py-32 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Training
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Programs designed to elevate your performance.
          </p>
        </div>
        <div className="grid w-full gap-8 sm:grid-cols-2">
          <div className="group flex flex-col gap-4 rounded-2xl border border-black/[.08] p-8 transition-colors hover:border-black/[.2] dark:border-white/[.145] dark:hover:border-white/[.3]">
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Endurance
            </h2>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Build stamina and cardiovascular fitness with structured interval
              and distance training.
            </p>
            <span className="text-sm font-medium text-black dark:text-zinc-50">
              8 weeks &middot; 4 sessions/week
            </span>
          </div>
          <div className="group flex flex-col gap-4 rounded-2xl border border-black/[.08] p-8 transition-colors hover:border-black/[.2] dark:border-white/[.145] dark:hover:border-white/[.3]">
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Strength
            </h2>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Develop power and resilience through progressive overload and
              compound movements.
            </p>
            <span className="text-sm font-medium text-black dark:text-zinc-50">
              12 weeks &middot; 3 sessions/week
            </span>
          </div>
          <div className="group flex flex-col gap-4 rounded-2xl border border-black/[.08] p-8 transition-colors hover:border-black/[.2] dark:border-white/[.145] dark:hover:border-white/[.3]">
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Agility
            </h2>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Sharpen reflexes and coordination with drills focused on speed,
              balance, and footwork.
            </p>
            <span className="text-sm font-medium text-black dark:text-zinc-50">
              6 weeks &middot; 5 sessions/week
            </span>
          </div>
          <div className="group flex flex-col gap-4 rounded-2xl border border-black/[.08] p-8 transition-colors hover:border-black/[.2] dark:border-white/[.145] dark:hover:border-white/[.3]">
            <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
              Recovery
            </h2>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Restore and maintain with mobility work, stretching, and active
              recovery sessions.
            </p>
            <span className="text-sm font-medium text-black dark:text-zinc-50">
              Ongoing &middot; 2 sessions/week
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
