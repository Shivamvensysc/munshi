import { Link } from "react-router-dom";
import { BookOpenCheck, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-brand-950 via-brand-700 to-brand-400 px-5 py-10">
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-violet-600/30 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow-lift ring-1 ring-white/25 backdrop-blur">
          <BookOpenCheck size={30} className="text-white" strokeWidth={2.2} />
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lift sm:p-10">
          <p className="text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-700 to-violet-700 sm:text-8xl">
            404
          </p>
          <h1 className="mt-2 text-xl font-extrabold text-ink-900 sm:text-2xl">
            This page went missing from the ledger
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            The page you're looking for doesn't exist, was moved, or the link is broken.
          </p>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50 active:scale-[0.99]"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
            <Link
              to="/dashboard"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-800 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_-8px_rgba(74,39,168,0.6)] transition hover:from-violet-700 hover:to-violet-500 active:scale-[0.99]"
            >
              <Home size={16} />
              Go to Dashboard
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-brand-100/70">
          LiveMunshi — Daily Expenses Manager App
          <br />
          Help: +91 82956 74272 · Sector 46, Gurgaon, Haryana
        </p>
      </div>
    </div>
  );
}
