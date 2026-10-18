import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink-950 px-5 text-center text-white">
      <div>
        <p className="font-display text-7xl font-semibold text-signal-400">404</p>
        <h1 className="mt-4 text-3xl font-semibold">This route does not exist</h1>
        <p className="mt-3 text-ink-300">The page you are looking for was moved or never existed.</p>
        <Link href="/" className={buttonStyles("primary", "lg", "mt-8")}>
          Back to the home page
        </Link>
      </div>
    </main>
  );
}
