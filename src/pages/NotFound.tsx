import { Link } from "react-router-dom";
import { BookOpenCheck, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-ledger-ink px-5 py-10">
      <div
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-ledger-brass-light/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-ledger-green/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 34px)",
        }}
        aria-hidden
      />

      <div className="relative w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-ledger-brass-light/30 bg-ledger-brass-light/15 shadow-lg backdrop-blur">
          <BookOpenCheck
            size={30}
            className="text-ledger-gold"
            strokeWidth={2.2}
          />
        </div>

        <div className="rounded-2xl border border-ledger-border bg-ledger-paper p-8 shadow-lg sm:p-10">
          <p className="font-serif text-7xl font-semibold tracking-tight text-ledger-brass sm:text-8xl">
            404
          </p>
          <h1 className="mt-2 font-serif text-xl font-semibold text-ledger-ink sm:text-2xl">
            This page went missing from the ledger
          </h1>
          <p className="mt-2 text-sm text-ledger-subtle">
            The page you're looking for doesn't exist, was moved, or the link is
            broken.
          </p>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-ledger-border bg-ledger-paper px-4 py-3 text-sm font-semibold text-ledger-muted transition hover:bg-ledger-hover active:scale-[0.99]"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
            <Link
              to="/dashboard"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ledger-brass px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ledger-brass-dark active:scale-[0.99]"
            >
              <Home size={16} />
              Go to Dashboard
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-white/50">
          LiveMunshi — Daily Expenses Manager App
          <br />
          Help: +91 82956 74272 · Sector 46, Gurgaon, Haryana
        </p>
      </div>
    </div>
  );
}
