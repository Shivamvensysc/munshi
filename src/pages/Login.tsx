import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import Button from "../components/Button";
import OtpModal from "../components/OtpModal";
import { cognitoAuth } from "../lib/cognito";
import { tokenStore } from "../auth/tokenStore";

// Standard RFC 5322 compliant regex pattern for email format validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // Form State
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");

  // UI Interaction States
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const goToDestination = () => {
    // Redirect to wherever the user was headed (RequireAuth remembers
    // this), falling back to the dashboard.
    const redirectTo =
      (location.state as { from?: { pathname?: string } } | null)?.from
        ?.pathname || "/dashboard";

    setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, 600);
  };

  // Handle Login Form Submission — authenticates against AWS Cognito.
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!pin) {
      toast.error("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const tokens = await cognitoAuth.login(cleanEmail, pin);

      tokenStore.setAccessToken(tokens.accessToken);
      tokenStore.setIdToken(tokens.idToken);
      tokenStore.setRefreshToken(tokens.refreshToken);

      console.log("access token", tokens.idToken);
      toast.success("Login successful!");
      goToDestination();
    } catch (error) {
      const err = error as { code?: string };
      // Cognito blocks sign-in with this specific error when the email was
      // registered but never had its OTP verified. Instead of a dead-end
      // error, resend the code and drop the user straight into the OTP
      // modal so they can finish verification and get signed in.
      if (err?.code === "UserNotConfirmedException") {
        try {
          await cognitoAuth.resendConfirmationCode(cleanEmail);
          toast.error("Your email isn't verified yet — we've sent a new OTP.");
          setIsOtpModalOpen(true);
        } catch (resendError) {
          toast.error(cognitoAuth.getErrorMessage(resendError));
        }
      } else {
        console.error("Login Error:", error);
        toast.error(cognitoAuth.getErrorMessage(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Modal: verify the email OTP, then log the user straight in.
  const handleVerifyOtp = async (code: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await cognitoAuth.confirmSignUp(cleanEmail, code);
    } catch (error) {
      throw new Error(cognitoAuth.getErrorMessage(error));
    }

    setIsOtpModalOpen(false);
    toast.success("Email verified! Signing you in...");

    try {
      const tokens = await cognitoAuth.login(cleanEmail, pin);
      tokenStore.setAccessToken(tokens.accessToken);
      tokenStore.setIdToken(tokens.idToken);
      tokenStore.setRefreshToken(tokens.refreshToken);
      goToDestination();
    } catch (error) {
      toast.error(cognitoAuth.getErrorMessage(error));
    }
  };

  // OTP Modal: resend the email OTP code (also triggered when the timer expires).
  const handleResendOtp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await cognitoAuth.resendConfirmationCode(cleanEmail);
    } catch (error) {
      throw new Error(cognitoAuth.getErrorMessage(error));
    }
    toast.success("A new OTP has been sent to your email.");
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

        {/* REFINED TOP SECTION: Sleek Minimal Logo Header */}
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

        {/* Showcase Content */}
        <div className="relative z-10 my-auto max-w-lg space-y-8 py-6">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-ledger-brass-light/30 bg-ledger-brass-light/10 px-3.5 py-1 text-xs font-semibold text-ledger-gold">
              <Zap size={13} className="fill-ledger-gold/20 text-ledger-gold" />
              Smart Digital Khata
            </span>

            <h1 className="font-serif text-4xl font-semibold leading-[1.15] tracking-tight text-white xl:text-5xl">
              Manage your business accounts{" "}
              <span className="text-ledger-gold">effortlessly.</span>
            </h1>

            <p className="max-w-md text-sm font-normal leading-relaxed text-white/60">
              Track daily expenses, record customer credit/debit balances, and
              generate instant reports anytime, anywhere.
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

      {/* RIGHT SIDE: Login Form Dynamic UI */}
      <div className="flex w-full flex-col justify-between bg-ledger-paper px-6 py-8 sm:px-12 lg:w-1/2 xl:px-20">
        {/* Mobile Header Logo */}
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
            to="/signup"
            className="text-xs font-semibold text-ledger-brass-dark hover:text-ledger-brass-darker"
          >
            Create an Account &rarr;
          </Link>
        </div>

        {/* Center Container */}
        <div className="mx-auto my-auto w-full max-w-md space-y-6 py-6">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-ledger-ink sm:text-3xl">
              Welcome Back 👋
            </h2>
            <p className="text-sm text-ledger-subtle">
              Please enter your registered email and password to sign in.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-xs font-semibold text-ledger-muted"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center rounded-xl border border-ledger-border bg-ledger-paper-alt px-3.5 transition-all duration-200 hover:border-ledger-border-hover focus-within:border-ledger-brass focus-within:bg-white focus-within:ring-2 focus-within:ring-ledger-brass/20">
                <Mail size={18} className="shrink-0 text-ledger-placeholder" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  className="w-full bg-transparent py-3 pl-3 pr-2 text-sm font-semibold text-ledger-ink outline-none placeholder:font-normal placeholder:text-ledger-placeholder disabled:opacity-60"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold text-ledger-muted"
              >
                Password <span className="text-red-500">*</span>
              </label>

              <div className="relative flex items-center rounded-xl border border-ledger-border bg-ledger-paper-alt px-3.5 transition-all duration-200 hover:border-ledger-border-hover focus-within:border-ledger-brass focus-within:bg-white focus-within:ring-2 focus-within:ring-ledger-brass/20">
                <Lock size={18} className="shrink-0 text-ledger-placeholder" />
                <input
                  id="password"
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter Password"
                  disabled={isLoading}
                  className="w-full bg-transparent py-3 pl-3 pr-2 text-sm font-semibold text-ledger-ink outline-none placeholder:font-normal placeholder:text-ledger-placeholder disabled:opacity-60"
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

              {/* Forgot Password Link - Placed below password field */}
              <div className="mt-1.5 flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-ledger-brass-dark hover:text-ledger-brass-darker"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isLoading}
              loadingText="Signing In..."
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl !bg-ledger-brass py-3 text-sm font-semibold text-white shadow-sm transition-all hover:!bg-ledger-brass-dark active:scale-[0.99] disabled:opacity-50"
            >
              <span className="flex items-center gap-1.5">
                Sign In <ArrowRight size={16} />
              </span>
            </Button>
          </form>

          {/* OR Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="w-full border-t border-ledger-border" />
            <span className="absolute bg-ledger-paper px-3 text-[11px] font-semibold tracking-wider text-ledger-faint">
              New to Online Khata?
            </span>
          </div>

          {/* Secondary Action */}
          <Link to="/signup" className="block w-full">
            <Button
              variant="secondary"
              type="button"
              className="w-full rounded-xl border border-ledger-border bg-ledger-hover py-3 text-xs font-semibold text-ledger-muted hover:bg-ledger-border-soft"
            >
              Create an Account
            </Button>
          </Link>
        </div>

        {/* Footer Mobile view */}
        <div className="text-center text-xs text-ledger-faint lg:hidden">
          Online Khata — Daily Expenses Manager App
        </div>
      </div>

      {/* Email OTP Verification Modal */}
      <OtpModal
        open={isOtpModalOpen}
        email={email.trim().toLowerCase()}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onClose={() => setIsOtpModalOpen(false)}
        title="Verify Your Email"
        description="We've sent a 6-digit verification code to"
      />
    </div>
  );
}