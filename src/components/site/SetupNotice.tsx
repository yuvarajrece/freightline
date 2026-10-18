import { Database } from "lucide-react";

interface SetupNoticeProps {
  title: string;
  steps: string[];
  detail?: string;
}

/** Shown instead of the site when Supabase is not configured or the schema has not been applied. */
export function SetupNotice({ title, steps, detail }: SetupNoticeProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-ink-950 px-5 py-16 text-white">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.04] p-8">
        <span className="grid size-12 place-items-center rounded-xl bg-signal-400 text-ink-950">
          <Database className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-3xl font-semibold">{title}</h1>
        <ol className="mt-6 list-decimal space-y-3 pl-5 text-ink-200">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {detail ? (
          <pre className="mt-6 overflow-x-auto rounded-lg bg-ink-900 p-4 text-xs text-ink-300">{detail}</pre>
        ) : null}
      </div>
    </main>
  );
}
