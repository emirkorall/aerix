export default function Profile() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center gap-16 px-16 py-32 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Profile
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Your stats, progress, and account settings.
          </p>
        </div>
        <div className="flex w-full flex-col gap-10">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xl font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              A
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                Athlete
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Free plan &middot; Member since 2025
              </p>
            </div>
          </div>
          <div className="grid w-full gap-6 sm:grid-cols-3">
            <div className="flex flex-col gap-1 rounded-2xl border border-black/[.08] p-6 dark:border-white/[.145]">
              <span className="text-2xl font-semibold text-black dark:text-zinc-50">
                0
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Sessions completed
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border border-black/[.08] p-6 dark:border-white/[.145]">
              <span className="text-2xl font-semibold text-black dark:text-zinc-50">
                0h
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Total training time
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-2xl border border-black/[.08] p-6 dark:border-white/[.145]">
              <span className="text-2xl font-semibold text-black dark:text-zinc-50">
                --
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Current streak
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Settings
            </h3>
            <div className="flex flex-col divide-y divide-black/[.08] rounded-2xl border border-black/[.08] dark:divide-white/[.145] dark:border-white/[.145]">
              <a
                href="#"
                className="flex items-center justify-between px-6 py-4 text-sm text-black transition-colors hover:bg-black/[.02] dark:text-zinc-50 dark:hover:bg-white/[.02]"
              >
                Edit profile
                <span className="text-zinc-400">&rarr;</span>
              </a>
              <a
                href="#"
                className="flex items-center justify-between px-6 py-4 text-sm text-black transition-colors hover:bg-black/[.02] dark:text-zinc-50 dark:hover:bg-white/[.02]"
              >
                Manage subscription
                <span className="text-zinc-400">&rarr;</span>
              </a>
              <a
                href="#"
                className="flex items-center justify-between px-6 py-4 text-sm text-black transition-colors hover:bg-black/[.02] dark:text-zinc-50 dark:hover:bg-white/[.02]"
              >
                Notifications
                <span className="text-zinc-400">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
