import { Link } from "react-router-dom";
import {
  Lock,
  Eye,
  BookOpen,
  ShieldCheck,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import PhoneField from "../components/PhoneField";
import Button from "../components/Button";

export default function ForgotPassword() {
  return (
    <div className="flex min-h-screen w-full bg-slate-950 font-sans text-slate-100">
      
      {/* LEFT SIDE: Premium Showcase Panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:flex xl:p-16">
        
        {/* Ambient Mesh Glows & Grid */}
        <div className="absolute -top-10 -left-10 h-80 w-80 rounded-full bg-indigo-600/25 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 h-96 w-96 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 border border-white/10">
            <BookOpen size={22} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-2xl font-bold tracking-tight text-white leading-none">
              Live<span className="text-indigo-400">Munshi</span>
            </span>
            <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase mt-1">
              Smart Ledger System
            </span>
          </div>
        </div>

        {/* Hero Showcase Block */}
        <div className="relative z-10 my-auto max-w-lg space-y-8 py-6">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
              <KeyRound size={13} className="text-indigo-400" />
              Account Recovery
            </span>

            <h1 className="text-4xl font-extrabold tracking-tight text-white xl:text-5xl leading-[1.15]">
              Securely restore your account <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">access.</span>
            </h1>

            <p className="text-sm font-normal text-slate-400 leading-relaxed max-w-md">
              Easily reset your 4-digit security PIN in a few steps and regain full access to your business ledger.
            </p>
          </div>

          {/* Feature Badge Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">
                  100% Protected Process
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your credentials are end-to-end encrypted and safeguarded.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-white/5 pt-5">
          <span>LiveMunshi — Daily Expenses Manager App</span>
          <span>
            Need Help?{" "}
            <a href="tel:+918295674272" className="text-slate-400 font-medium hover:text-slate-200 transition-colors underline underline-offset-2">
              +91 82956 74272
            </a>
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: Static Form Container */}
      <div className="flex w-full flex-col justify-between bg-white px-6 py-8 dark:bg-slate-900 lg:w-1/2 sm:px-12 xl:px-20">
        
        {/* Top Navigation Link */}
        <div className="flex items-center justify-between lg:justify-end">
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <BookOpen size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Live<span className="text-indigo-600">Munshi</span>
            </span>
          </div>

          <Link
            to="/login"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Back to Sign In &rarr;
          </Link>
        </div>

        {/* Center Container */}
        <div className="my-auto mx-auto w-full max-w-md space-y-6 py-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Forgot Password? 🔑
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter your registered mobile number to reset your password PIN.
            </p>
          </div>

          <form className="space-y-4">
            <div>
              <PhoneField value="" onChange={() => {}} />
            </div>

            <Button
              type="button"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-[0.99] transition-all"
            >
              <span className="flex items-center gap-1.5">
                Continue <ArrowRight size={16} />
              </span>
            </Button>
          </form>

          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:bg-slate-900 dark:text-slate-500">
              Remembered your password?
            </span>
          </div>

          <Link to="/login" className="block w-full">
            <Button
              variant="secondary"
              type="button"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
            >
              Return to Sign In
            </Button>
          </Link>
        </div>

        {/* Mobile View Footer */}
        <div className="text-center text-xs text-slate-400 lg:hidden">
          LiveMunshi — Daily Expenses Manager App
        </div>
      </div>

    </div>
  );
}