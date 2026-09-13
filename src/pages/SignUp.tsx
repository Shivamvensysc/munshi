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
      const data = await authService.sendOtp(
        mobileNumber.replace(/\D/g, ""),
        "REGISTRATION",
      );

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
      toast.error(
        apiError.message ||
          "Server connection error. Please check your network.",
      );
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
      toast.error(
        apiError.message ||
          "Server connection error. Please check your network.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-ledger-bg font-sans text-ledger-ink">
      {/* LEFT SIDE: Clean & Premium Showcase */}
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

        {/* TOP BRAND HEADER */}
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
              <Zap size={13} className="fill-ledger-gold/20 text-ledger-gold" />
              Instant Setup
            </span>

            <h1 className="font-serif text-4xl font-semibold leading-[1.15] tracking-tight text-white xl:text-5xl">
              Start your digital ledger in{" "}
              <span className="text-ledger-gold">seconds.</span>
            </h1>

            <p className="max-w-md text-sm font-normal leading-relaxed text-white/60">
              Keep full control of customer credits, set up automated reminders,
              and streamline daily account tracking effortlessly.
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
                  100% Secure &amp; Cloud Synced
                </h4>
                <p className="mt-0.5 text-xs text-white/55">
                  Your financial data is encrypted and backed up automatically.
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

      {/* RIGHT SIDE: SignUp Interactive Form Container */}
      <div className="flex w-full flex-col justify-between bg-ledger-paper px-6 py-8 sm:px-12 lg:w-1/2 xl:px-20">
        {/* Navigation Top Header */}
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
            Sign In Instead &rarr;
          </Link>
        </div>

        {/* Form Main Section */}
        <div className="mx-auto my-auto w-full max-w-md space-y-6 py-6">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-ledger-ink sm:text-3xl">
              {step === 1 ? "Get Started ✨" : "Verify & Complete Setup 🔒"}
            </h2>
            <p className="text-sm text-ledger-subtle">
              {step === 1
                ? "Enter your phone number to receive a verification OTP."
                : `Enter the OTP sent to +91 ${mobileNumber} and set your 4-digit PIN.`}
            </p>
          </div>

          <form
            onSubmit={step === 1 ? handleSendOtp : handleRegister}
            className="space-y-4"
          >
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
                  className="mt-1 text-[11px] font-semibold text-ledger-brass-dark hover:underline"
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
                  <label
                    htmlFor="otp-code"
                    className="mb-1.5 block text-xs font-semibold text-ledger-muted"
                  >
                    6-Digit Verification OTP
                  </label>
                  <div className="relative flex items-center rounded-xl border border-ledger-border bg-ledger-paper-alt px-3.5 transition-all hover:border-ledger-border-hover focus-within:border-ledger-brass focus-within:bg-white focus-within:ring-2 focus-within:ring-ledger-brass/20">
                    <KeyRound size={18} className="shrink-0 text-ledger-placeholder" />
                    <input
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Enter 6-digit OTP"
                      disabled={isLoading}
                      className="w-full bg-transparent py-3 pl-3 pr-2 text-sm font-semibold tracking-[0.2em] text-ledger-ink outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-ledger-placeholder disabled:opacity-60"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className="shrink-0 text-xs font-semibold text-ledger-brass-dark hover:text-ledger-brass-darker disabled:opacity-50"
                    >
                      Resend
                    </button>
                  </div>
                </div>

                {/* New Password / PIN Input */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-1.5 block text-xs font-semibold text-ledger-muted"
                  >
                    New 4-Digit Password (PIN)
                  </label>
                  <div className="relative flex items-center rounded-xl border border-ledger-border bg-ledger-paper-alt px-3.5 transition-all hover:border-ledger-border-hover focus-within:border-ledger-brass focus-within:bg-white focus-within:ring-2 focus-within:ring-ledger-brass/20">
                    <Lock size={18} className="shrink-0 text-ledger-placeholder" />
                    <input
                      id="new-password"
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={4}
                      value={pin}
                      onChange={(e) =>
                        setPin(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Enter 4-digit PIN"
                      disabled={isLoading}
                      className="w-full bg-transparent py-3 pl-3 pr-2 text-sm font-semibold tracking-[0.3em] text-ledger-ink outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-ledger-placeholder disabled:opacity-60"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="p-1 text-ledger-placeholder transition-colors hover:text-ledger-muted"
                      aria-label="Toggle password visibility"
                    >
                      {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password / PIN Input */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-1.5 block text-xs font-semibold text-ledger-muted"
                  >
                    Re-type Password (PIN)
                  </label>
                  <div className="relative flex items-center rounded-xl border border-ledger-border bg-ledger-paper-alt px-3.5 transition-all hover:border-ledger-border-hover focus-within:border-ledger-brass focus-within:bg-white focus-within:ring-2 focus-within:ring-ledger-brass/20">
                    <Lock size={18} className="shrink-0 text-ledger-placeholder" />
                    <input
                      id="confirm-password"
                      type={showConfirmPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) =>
                        setConfirmPin(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Confirm 4-digit PIN"
                      disabled={isLoading}
                      className="w-full bg-transparent py-3 pl-3 pr-2 text-sm font-semibold tracking-[0.3em] text-ledger-ink outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-ledger-placeholder disabled:opacity-60"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="p-1 text-ledger-placeholder transition-colors hover:text-ledger-muted"
                      aria-label="Toggle password visibility"
                    >
                      {showConfirmPin ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
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
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl !bg-ledger-brass py-3 text-sm font-semibold text-white shadow-sm transition-all hover:!bg-ledger-brass-dark active:scale-[0.99] disabled:opacity-50"
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
            <div className="w-full border-t border-ledger-border" />
            <span className="absolute bg-ledger-paper px-3 text-[11px] font-semibold tracking-wider text-ledger-faint">
              Already registered?
            </span>
          </div>

          {/* Back to Sign In */}
          <Link to="/login" className="block w-full">
            <Button
              variant="secondary"
              type="button"
              className="w-full rounded-xl border border-ledger-border bg-ledger-hover py-3 text-xs font-semibold text-ledger-muted hover:bg-ledger-border-soft"
            >
              Sign In to Existing Account
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
