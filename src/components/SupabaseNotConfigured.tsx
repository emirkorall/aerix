import Link from "next/link";

export default function SupabaseNotConfigured() {
  return (
    <main className="min-h-screen bg-[#060608] text-white">
      <div className="mx-auto max-w-lg px-6">
        <nav className="flex items-center py-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.2em] uppercase text-white"
          >
            Aerix
          </Link>
        </nav>

        <section className="pt-24 pb-10">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Supabase not configured
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            AERIX needs your Supabase Project URL + anon key to enable
            authentication.
          </p>
        </section>

        <div className="rounded-xl border border-neutral-800/60 bg-[#0c0c10] p-6">
          <h2 className="text-sm font-semibold text-white">Setup steps</h2>
          <ol className="mt-4 flex flex-col gap-3 text-sm leading-relaxed text-neutral-400">
            <li className="flex gap-2.5">
              <span className="shrink-0 text-indigo-400">1.</span>
              Open{" "}
              <span className="text-neutral-200">
                Supabase Dashboard &rarr; your project &rarr; Project Settings
                &rarr; API
              </span>
            </li>
            <li className="flex gap-2.5">
              <span className="shrink-0 text-indigo-400">2.</span>
              Copy <span className="text-neutral-200">Project URL</span>
            </li>
            <li className="flex gap-2.5">
              <span className="shrink-0 text-indigo-400">3.</span>
              Copy the{" "}
              <span className="text-neutral-200">anon&nbsp;public</span> key
            </li>
            <li className="flex gap-2.5">
              <span className="shrink-0 text-indigo-400">4.</span>
              Paste into{" "}
              <span className="text-neutral-200">.env.local</span> and restart
              the dev server
            </li>
          </ol>

          <div className="mt-6 rounded-lg border border-neutral-800/60 bg-[#060608] p-4">
            <pre className="text-xs leading-relaxed text-neutral-300">
              <code>
                {`NEXT_PUBLIC_SUPABASE_URL=<your Project URL>\nNEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon public key>`}
              </code>
            </pre>
          </div>
        </div>

        <footer className="flex items-center justify-center py-10">
          <Link
            href="/"
            className="text-xs text-neutral-600 transition-colors hover:text-neutral-400"
          >
            &larr; Back to home
          </Link>
        </footer>
      </div>
    </main>
  );
}
