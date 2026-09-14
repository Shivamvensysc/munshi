import { Link } from "react-router-dom";
import {  ShieldCheck, KeyRound, ArrowRight } from "lucide-react";
import PhoneField from "../components/PhoneField";
import Button from "../components/Button";

export default function ForgotPassword() {
  return (
    <div className="flex min-h-screen w-full bg-ledger-bg font-sans text-ledger-ink">
      {/* LEFT SIDE: Premium Showcase Panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-ledger-ink p-12 lg:flex xl:p-16">
        {/* Ambient Glows & Ledger Rule Texture */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-80 w-80 rounded-full bg-ledger-brass-light/15 blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-ledger-green/10 blur-[140px]" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 34px)",
          }}
        />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-ledger-brass-light/30 bg-ledger-brass-light/15 shadow-lg overflow-hidden">
  <img
    src="/image.png"
    alt="Online Khata Logo"
    className="h-8 w-8 object-contain"
  />
</div>
          <div className="flex flex-col justify-center">
            <span className="font-serif text-2xl font-semibold leading-none tracking-tight text-white">
              <span className="text-ledger-gold">Online Khata</span>
            </span>
            <span className="mt-1 text-[10px] font-medium tracking-widest text-white/50">
              Smart Ledger System
            </span>
          </div>
        </div>

        {/* Hero Showcase Block */}
        <div className="relative z-10 my-auto max-w-lg space-y-8 py-6">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-ledger-brass-light/30 bg-ledger-brass-light/10 px-3.5 py-1 text-xs font-semibold text-ledger-gold">
              <KeyRound size={13} className="text-ledger-gold" />
              Account Recovery
            </span>

            <h1 className="font-serif text-4xl font-semibold leading-[1.15] tracking-tight text-white xl:text-5xl">
              Securely restore your account{" "}
              <span className="text-ledger-gold">access.</span>
            </h1>

            <p className="max-w-md text-sm font-normal leading-relaxed text-white/60">
              Easily reset your 4-digit security PIN in a few steps and regain
              full access to your business ledger.
            </p>
          </div>

          {/* Feature Badge Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ledger-brass-light/25 bg-ledger-brass-light/10 text-ledger-gold">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold tracking-wide text-white">
                  100% Protected Process
                </h4>
                <p className="mt-0.5 text-xs text-white/55">
                  Your credentials are end-to-end encrypted and safeguarded.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/50">
          <span>Online Khata — Daily Expenses Manager App</span>
          <span>
            Need Help?{" "}
            <a
              href="tel:+918295674272"
              className="font-medium text-white/70 underline underline-offset-2 transition-colors hover:text-ledger-gold"
            >
              +91 82956 74272
            </a>
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: Static Form Container */}
      <div className="flex w-full flex-col justify-between bg-ledger-paper px-6 py-8 sm:px-12 lg:w-1/2 xl:px-20">
        {/* Top Navigation Link */}
        <div className="flex items-center justify-between lg:justify-end">
          <div className="flex items-center gap-2.5 lg:hidden">
           <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-ledger-brass-light/30 bg-ledger-brass-light/15 shadow-lg overflow-hidden">
  <img
    src="/image.png"
    alt="Online Khata Logo"
    className="h-8 w-8 object-contain"
  />
</div>
            <span className="font-serif text-xl font-semibold tracking-tight text-ledger-ink">
              <span className="text-ledger-brass-dark">Online Khata</span>
            </span>
          </div>

          <Link
            to="/login"
            className="text-xs font-semibold text-ledger-brass-dark hover:text-ledger-brass-darker"
          >
            Back to Sign In &rarr;
          </Link>
        </div>

        {/* Center Container */}
        <div className="mx-auto my-auto w-full max-w-md space-y-6 py-6">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-ledger-ink sm:text-3xl">
              Forgot Password? 🔑
            </h2>
            <p className="text-sm text-ledger-subtle">
              Enter your registered mobile number to reset your password PIN.
            </p>
          </div>

          <form className="space-y-4">
            <div>
              <PhoneField value="" onChange={() => {}} />
            </div>

            <Button
              type="button"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl !bg-ledger-brass py-3 text-sm font-semibold text-white shadow-sm transition-all hover:!bg-ledger-brass-dark active:scale-[0.99]"
            >
              <span className="flex items-center gap-1.5">
                Continue <ArrowRight size={16} />
              </span>
            </Button>
          </form>

          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-ledger-border" />
            <span className="absolute bg-ledger-paper px-3 text-[11px] font-semibold tracking-wider text-ledger-faint">
              Remembered your password?
            </span>
          </div>

          <Link to="/login" className="block w-full">
            <Button
              variant="secondary"
              type="button"
              className="w-full rounded-xl border border-ledger-border bg-ledger-hover py-3 text-xs font-semibold text-ledger-muted hover:bg-ledger-border-soft"
            >
              Return to Sign In
            </Button>
          </Link>
        </div>

        {/* Mobile View Footer */}
        <div className="text-center text-xs text-ledger-faint lg:hidden">
          Online Khata — Daily Expenses Manager App
        </div>
      </div>
    </div>
  );
}
