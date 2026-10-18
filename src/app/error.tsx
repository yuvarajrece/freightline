"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-ink-950 px-5 text-center text-white">
      <div>
        <h1 className="text-3xl font-semibold">Something went wrong</h1>
        <p className="mt-3 max-w-md text-ink-300">
          We hit an unexpected problem loading this page. Try again, and if it keeps happening contact support
          {error.digest ? ` with reference ${error.digest}` : ""}.
        </p>
        <Button variant="primary" size="lg" className="mt-8" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
