import type { ReactNode } from "react";
import { BookOpenCheck } from "lucide-react";

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-full items-center justify-center overflow-hidden bg-gradient-to-b from-brand-950 via-brand-700 to-brand-400 px-5 py-10">
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-violet-600/30 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow-lift ring-1 ring-white/25 backdrop-blur">
            <BookOpenCheck size={30} className="text-white" strokeWidth={2.2} />
          </div>
          {eyebrow && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-100/80">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-brand-100/90">{subtitle}</p>}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lift">{children}</div>

        {footer && <div className="mt-6 text-center text-sm text-brand-100/90">{footer}</div>}

        <p className="mt-8 text-center text-xs leading-relaxed text-brand-100/70">
          LiveMunshi — Daily Expenses Manager App
          <br />
          Help: +91 82956 74272 · Sector 46, Gurgaon, Haryana
        </p>
      </div>
    </div>
  );
}
