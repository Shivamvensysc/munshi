import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";
import Button from "../components/Button";
import { cognitoAuth } from "../lib/cognito";

export default function ForgotPassword() {
  // Form State
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // UI Interaction States
  const [step, setStep] = useState<1 | 2>(1); // 1 = request code, 2 = confirm code + new password
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  // Password Policy Regex: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const validatePasswordStrength = (pwd: string) => {
    const minLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  // Step 1: request a password-reset OTP code via email.
  const handleRequestCode = async (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      toast.error("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    try {
      await cognitoAuth.forgotPassword(cleanEmail);
      toast.success("A password reset OTP has been sent to your email.");
      setStep(2);
    } catch (error) {
      console.error("Forgot Password Error:", error);
      toast.error(cognitoAuth.getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: confirm the OTP code + set the new strong password.
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!code || code.length < 4) {
      toast.error("Please enter a valid OTP code.");
      return;
    }

    if (!validatePasswordStrength(newPassword)) {
      toast.error(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      await cognitoAuth.confirmPassword(cleanEmail, code, newPassword);
      toast.success("Password reset successfully! Please sign in.");
      setResetDone(true);
    } catch (error) {
      console.error("Reset Password Error:", error);
      toast.error(cognitoAuth.getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Resend the reset OTP code.
  const handleResendCode = async () => {
    const cleanEmail = email.trim().toLowerCase();
    setIsLoading(true);
    try {
      await cognitoAuth.forgotPassword(cleanEmail);
      toast.success("A new OTP has been sent to your email.");
    } catch (error) {
      toast.error(cognitoAuth.getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

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
              Easily reset your account password in a few steps and regain
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
          {resetDone ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-ledger-brass-light/30 bg-ledger-brass-light/10 text-ledger-brass-dark">
                <ShieldCheck size={26} />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-ledger-ink sm:text-3xl">
                  Password Reset! ✅
                </h2>
                <p className="text-sm text-ledger-subtle">
                  Your password has been reset successfully. You can now sign
                  in with your new password.
                </p>
              </div>
              <Link to="/login" className="block w-full">
                <Button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl !bg-ledger-brass py-3 text-sm font-semibold text-white shadow-sm transition-all hover:!bg-ledger-brass-dark active:scale-[0.99]"
                >
                  <span className="flex items-center gap-1.5">
                    Sign In Now <ArrowRight size={16} />
                  </span>
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-ledger-ink sm:text-3xl">
                  Forgot Password? 🔑
                </h2>
                <p className="text-sm text-ledger-subtle">
                  {step === 1
                    ? "Enter your registered email to receive a password reset OTP."
                    : `Enter the OTP sent to ${email} and set your new password.`}
                </p>
              </div>

              <form
                onSubmit={step === 1 ? handleRequestCode : handleResetPassword}
                className="space-y-4"
              >
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="reset-email"
                    className="mb-1.5 block text-xs font-semibold text-ledger-muted"
                  >
                    Email Address
                  </label>
                  <div className="relative flex items-center rounded-xl border border-ledger-border bg-ledger-paper-alt px-3.5 transition-all hover:border-ledger-border-hover focus-within:border-ledger-brass focus-within:bg-white focus-within:ring-2 focus-within:ring-ledger-brass/20">
                    <Mail size={18} className="shrink-0 text-ledger-placeholder" />
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      disabled={step === 2 || isLoading}
                      className="w-full bg-transparent py-3 pl-3 pr-2 text-sm font-semibold text-ledger-ink outline-none placeholder:font-normal placeholder:text-ledger-placeholder disabled:opacity-60"
                      required
                    />
                  </div>
                  {step === 2 && (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="mt-1 text-[11px] font-semibold text-ledger-brass-dark hover:underline"
                    >
                      Change email address?
                    </button>
                  )}
                </div>

                {/* STEP 2 FIELDS: OTP + New Password */}
                {step === 2 && (
                  <>
                    {/* OTP Code Input */}
                    <div>
                      <label
                        htmlFor="reset-otp"
                        className="mb-1.5 block text-xs font-semibold text-ledger-muted"
                      >
                        6-Digit Verification OTP
                      </label>
                      <div className="relative flex items-center rounded-xl border border-ledger-border bg-ledger-paper-alt px-3.5 transition-all hover:border-ledger-border-hover focus-within:border-ledger-brass focus-within:bg-white focus-within:ring-2 focus-within:ring-ledger-brass/20">
                        <KeyRound size={18} className="shrink-0 text-ledger-placeholder" />
                        <input
                          id="reset-otp"
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="Enter 6-digit OTP"
                          disabled={isLoading}
                          className="w-full bg-transparent py-3 pl-3 pr-2 text-sm font-semibold tracking-[0.2em] text-ledger-ink outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-ledger-placeholder disabled:opacity-60"
                          required
                        />
                        <button
                          type="button"
                          onClick={handleResendCode}
                          disabled={isLoading}
                          className="shrink-0 text-xs font-semibold text-ledger-brass-dark hover:text-ledger-brass-darker disabled:opacity-50"
                        >
                          Resend
                        </button>
                      </div>
                    </div>

                    {/* New Password Input */}
                    <div>
                      <label
                        htmlFor="new-password"
                        className="mb-1.5 block text-xs font-semibold text-ledger-muted"
                      >
                        New Password
                      </label>
                      <div className="relative flex items-center rounded-xl border border-ledger-border bg-ledger-paper-alt px-3.5 transition-all hover:border-ledger-border-hover focus-within:border-ledger-brass focus-within:bg-white focus-within:ring-2 focus-within:ring-ledger-brass/20">
                        <Lock size={18} className="shrink-0 text-ledger-placeholder" />
                        <input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 8 characters (A-Z, a-z, 0-9, @$!)"
                          disabled={isLoading}
                          className="w-full bg-transparent py-3 pl-3 pr-2 text-sm font-semibold text-ledger-ink outline-none placeholder:font-normal placeholder:text-ledger-placeholder disabled:opacity-60"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 text-ledger-placeholder transition-colors hover:text-ledger-muted"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] text-ledger-subtle">
                        Must contain at least 8 characters, uppercase, lowercase, number, and special symbol.
                      </p>
                    </div>

                    {/* Confirm New Password Input */}
                    <div>
                      <label
                        htmlFor="confirm-new-password"
                        className="mb-1.5 block text-xs font-semibold text-ledger-muted"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative flex items-center rounded-xl border border-ledger-border bg-ledger-paper-alt px-3.5 transition-all hover:border-ledger-border-hover focus-within:border-ledger-brass focus-within:bg-white focus-within:ring-2 focus-within:ring-ledger-brass/20">
                        <Lock size={18} className="shrink-0 text-ledger-placeholder" />
                        <input
                          id="confirm-new-password"
                          type={showPassword ? "text" : "password"}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          disabled={isLoading}
                          className="w-full bg-transparent py-3 pl-3 pr-2 text-sm font-semibold text-ledger-ink outline-none placeholder:font-normal placeholder:text-ledger-placeholder disabled:opacity-60"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  loading={isLoading}
                  loadingText="Please wait..."
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl !bg-ledger-brass py-3 text-sm font-semibold text-white shadow-sm transition-all hover:!bg-ledger-brass-dark active:scale-[0.99]"
                >
                  <span className="flex items-center gap-1.5">
                    {step === 1 ? "Send Reset OTP" : "Reset Password"}{" "}
                    <ArrowRight size={16} />
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
            </>
          )}
        </div>

        {/* Mobile View Footer */}
        <div className="text-center text-xs text-ledger-faint lg:hidden">
          Online Khata — Daily Expenses Manager App
        </div>
      </div>
    </div>
  );
}