import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import PhoneField from "../components/PhoneField";
import Button from "../components/Button";
import { authService } from "../services";
import type { ApiError } from "../lib/apiClient";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // Form State
  const [mobileNumber, setMobileNumber] = useState("");
  const [pin, setPin] = useState("");

  // UI Interaction States
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle Login Form Submission
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    const cleanMobile = mobileNumber.replace(/\D/g, "");

    if (!cleanMobile || cleanMobile.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!pin || pin.length !== 4) {
      toast.error("Please enter your 4-digit PIN.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await authService.login(cleanMobile, pin);

      if (data.success) {
        toast.success(data.message || "Login successful!");

        // Redirect to wherever the user was headed (RequireAuth remembers
        // this), falling back to the dashboard.
        const redirectTo =
          (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ||
          "/dashboard";

        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 600);
      } else {
        toast.error(data.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Login API Error:", error);
      toast.error(apiError.message || "Unable to connect to the server. Please check your network.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-950 font-sans text-slate-100">
      
      {/* LEFT SIDE: Clean & Premium Showcase */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:flex xl:p-16">
        
        {/* Ambient Subtle Mesh Glows */}
        <div className="absolute -top-10 -left-10 h-80 w-80 rounded-full bg-indigo-600/25 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 h-96 w-96 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* REFINED TOP SECTION: Sleek Minimal Logo Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 border border-white/10">
            <BookOpen size={22} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-2xl font-bold tracking-tight text-white leading-none">
              <span className="text-indigo-400">Munshi</span>
            </span>
            <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase mt-1">
              Smart Ledger System
            </span>
          </div>
        </div>

        {/* Showcase Content */}
        <div className="relative z-10 my-auto max-w-lg space-y-8 py-6">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
              <Zap size={13} className="text-indigo-400 fill-indigo-400/20" /> 
              Smart Digital Khata
            </span>
            
            <h1 className="text-4xl font-extrabold tracking-tight text-white xl:text-5xl leading-[1.15]">
              Manage your business accounts <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">effortlessly.</span>
            </h1>
            
            <p className="text-sm font-normal text-slate-400 leading-relaxed max-w-md">
              Track daily expenses, record customer credit/debit balances, and generate instant reports anytime, anywhere.
            </p>
          </div>

          {/* Feature Badge Card */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-400/20 text-indigo-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wide">100% Secure & Cloud Synced</h4>
                <p className="text-xs text-slate-400 mt-0.5">Your financial data is encrypted and backed up automatically.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-white/5 pt-5">
          <span>Munshi — Daily Expenses Manager App</span>
          <span>
            Need Help? <a href="tel:+918295674272" className="text-slate-400 font-medium hover:text-slate-200 transition-colors underline underline-offset-2">+91 82956 74272</a>
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form Dynamic UI */}
      <div className="flex w-full flex-col justify-between bg-white px-6 py-8 dark:bg-slate-900 lg:w-1/2 sm:px-12 xl:px-20">
        
        {/* Mobile Header Logo */}
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
            to="/signup"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Create Account &rarr;
          </Link>
        </div>

        {/* Center Container */}
        <div className="my-auto mx-auto w-full max-w-md space-y-6 py-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Welcome Back 👋
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Please enter your registered phone number and 4-digit PIN to sign in.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Mobile Number Field */}
            <div>
              <PhoneField
                value={mobileNumber}
                onChange={(val) => setMobileNumber(val)}
                disabled={isLoading}
              />
            </div>

            {/* Password PIN Field */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  4-Digit Password / PIN
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 transition-all duration-200 focus-within:border-indigo-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-600/20 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/50 dark:focus-within:border-indigo-500 dark:focus-within:bg-slate-800">
                <Lock size={18} className="shrink-0 text-slate-400" />
                <input
                  id="password"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  disabled={isLoading}
                  className="w-full bg-transparent py-3 pl-3 pr-2 text-sm tracking-[0.3em] font-semibold text-slate-900 outline-none placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 dark:text-white disabled:opacity-60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isLoading}
              loadingText="Signing In..."
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              <span className="flex items-center gap-1.5">
                Sign In <ArrowRight size={16} />
              </span>
            </Button>
          </form>

          {/* OR Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:bg-slate-900 dark:text-slate-500">
              New to Munshi?
            </span>
          </div>

          {/* Secondary Action */}
          <Link to="/signup" className="block w-full">
            <Button
              variant="secondary"
              type="button"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
            >
              Create an Account
            </Button>
          </Link>
        </div>

        {/* Footer for Mobile view */}
        <div className="text-center text-xs text-slate-400 lg:hidden">
          Munshi — Daily Expenses Manager App
        </div>
      </div>

    </div>
  );
}
