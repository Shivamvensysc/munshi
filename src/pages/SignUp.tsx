import { useState, type FormEvent, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  ShieldCheck,
  Zap,
  ArrowRight,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import PhoneField from "../components/PhoneField";
import Button from "../components/Button";
import { authService } from "../services";
import type { ApiError } from "../lib/apiClient";

export default function SignUp() {
  const navigate = useNavigate();

  // Form State
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  // UI Flow & Interaction States
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Register
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  // Step 1: Send OTP API Call
  const handleSendOtp = async (e?: FormEvent | MouseEvent) => {
    e?.preventDefault();

    if (!mobileNumber || mobileNumber.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.sendOtp(mobileNumber.replace(/\D/g, ""), "REGISTRATION");

      if (data.success) {
        toast.success(data.message || "OTP sent successfully!");

        // Auto-fill OTP in development environment if returned by API
        if (data.otp) {
          setOtpCode(data.otp);
        }

        setStep(2);
      } else {
        toast.error(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Send OTP Error:", error);
      toast.error(apiError.message || "Server connection error. Please check your network.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Register Account API Call
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    const cleanMobile = mobileNumber.replace(/\D/g, "");

    if (!cleanMobile) {
      toast.error("Mobile number is required.");
      return;
    }

    if (!otpCode || otpCode.length < 4) {
      toast.error("Please enter a valid OTP code.");
      return;
    }

    if (!pin || pin.length !== 4) {
      toast.error("Password/PIN must be exactly 4 digits.");
      return;
    }

    if (pin !== confirmPin) {
      toast.error("Passwords/PINs do not match!");
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.register(cleanMobile, otpCode, pin);

      if (data.success) {
        toast.success(data.message || "Account registered successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 1200);
      } else {
        toast.error(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error("Registration Error:", error);
      toast.error(apiError.message || "Server connection error. Please check your network.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-950 font-sans text-slate-100">
      
      {/* LEFT SIDE: Clean & Premium Showcase */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 lg:flex xl:p-16">
        
        {/* Ambient Mesh Glows & Grid */}
        <div className="absolute -top-10 -left-10 h-80 w-80 rounded-full bg-indigo-600/25 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 h-96 w-96 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* TOP BRAND HEADER */}
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

        {/* Hero Showcase Block */}
        <div className="relative z-10 my-auto max-w-lg space-y-8 py-6">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
              <Zap size={13} className="text-indigo-400 fill-indigo-400/20" />
              Instant Setup
            </span>

            <h1 className="text-4xl font-extrabold tracking-tight text-white xl:text-5xl leading-[1.15]">
              Start your digital ledger in <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">seconds.</span>
            </h1>

            <p className="text-sm font-normal text-slate-400 leading-relaxed max-w-md">
              Keep full control of customer credits, set up automated reminders, and streamline daily account tracking effortlessly.
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
                  100% Secure & Cloud Synced
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your financial data is encrypted and backed up automatically.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-white/5 pt-5">
          <span>Munshi — Daily Expenses Manager App</span>
          <span>
            Need Help?{" "}
            <a href="tel:+918295674272" className="text-slate-400 font-medium hover:text-slate-200 transition-colors underline underline-offset-2">
              +91 82956 74272
            </a>
          </span>
        </div>
      </div>

      {/* RIGHT SIDE: SignUp Interactive Form Container */}
      <div className="flex w-full flex-col justify-between bg-white px-6 py-8 dark:bg-slate-900 lg:w-1/2 sm:px-12 xl:px-20">
        
        {/* Navigation Top Header */}
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
            Sign In Instead &rarr;
          </Link>
        </div>

        {/* Form Main Section */}
        <div className="my-auto mx-auto w-full max-w-md space-y-6 py-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {step === 1 ? "Get Started ✨" : "Verify & Complete Setup 🔒"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {step === 1
                ? "Enter your phone number to receive a verification OTP."
                : `Enter the OTP sent to +91 ${mobileNumber} and set your 4-digit PIN.`}
            </p>
          </div>

          <form onSubmit={step === 1 ? handleSendOtp : handleRegister} className="space-y-4">
            
            {/* Mobile Number Input */}
            <div>
              <PhoneField
                value={mobileNumber}
                onChange={(val) => setMobileNumber(val)}
                disabled={step === 2 || isLoading}
              />
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-1 text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Change phone number?
                </button>
              )}
            </div>

            {/* STEP 2 FIELDS: OTP and PIN Inputs */}
            {step === 2 && (
              <>
                {/* OTP Code Input */}
                <div>
                  <label htmlFor="otp-code" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    6-Digit Verification OTP
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 transition-all focus-within:border-indigo-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-600/20 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/50 dark:focus-within:border-indigo-500 dark:focus-within:bg-slate-800">
                    <KeyRound size={18} className="shrink-0 text-slate-400" />
                    <input
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 6-digit OTP"
                      disabled={isLoading}
                      className="w-full bg-transparent py-3 pl-3 pr-2 text-sm tracking-[0.2em] font-semibold text-slate-900 outline-none placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 dark:text-white disabled:opacity-60"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 shrink-0 disabled:opacity-50"
                    >
                      Resend
                    </button>
                  </div>
                </div>

                {/* New Password / PIN Input */}
                <div>
                  <label htmlFor="new-password" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    New 4-Digit Password (PIN)
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 transition-all focus-within:border-indigo-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-600/20 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/50 dark:focus-within:border-indigo-500 dark:focus-within:bg-slate-800">
                    <Lock size={18} className="shrink-0 text-slate-400" />
                    <input
                      id="new-password"
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 4-digit PIN"
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

                {/* Confirm Password / PIN Input */}
                <div>
                  <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Re-type Password (PIN)
                  </label>
                  <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 transition-all focus-within:border-indigo-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-600/20 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/50 dark:focus-within:border-indigo-500 dark:focus-within:bg-slate-800">
                    <Lock size={18} className="shrink-0 text-slate-400" />
                    <input
                      id="confirm-password"
                      type={showConfirmPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                      placeholder="Confirm 4-digit PIN"
                      disabled={isLoading}
                      className="w-full bg-transparent py-3 pl-3 pr-2 text-sm tracking-[0.3em] font-semibold text-slate-900 outline-none placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-400 dark:text-white disabled:opacity-60"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showConfirmPin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Submit Action */}
            <Button
              type="submit"
              loading={isLoading}
              loadingText="Processing..."
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {step === 1 ? (
                <span className="flex items-center gap-1.5">
                  Send Verification OTP <ArrowRight size={16} />
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  Create Account <CheckCircle2 size={16} />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:bg-slate-900 dark:text-slate-500">
              Already registered?
            </span>
          </div>

          {/* Back to Sign In */}
          <Link to="/login" className="block w-full">
            <Button
              variant="secondary"
              type="button"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
            >
              Sign In to Existing Account
            </Button>
          </Link>
        </div>

        {/* Mobile View Footer */}
        <div className="text-center text-xs text-slate-400 lg:hidden">
          Munshi — Daily Expenses Manager App
        </div>
      </div>

    </div>
  );
}
