// import { useState, type FormEvent } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   Lock,
//   Mail,
//   Eye,
//   EyeOff,
//   ShieldCheck,
//   Zap,
//   ArrowRight,
// } from "lucide-react";
// import { toast } from "react-toastify";
// import PhoneField from "../components/PhoneField";
// import Button from "../components/Button";
// import OtpModal from "../components/OtpModal";
// import { cognitoAuth } from "../lib/cognito";

// const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// export default function SignUp() {
//   const navigate = useNavigate();

//   // Form State
//   const [mobileNumber, setMobileNumber] = useState("");
//   const [email, setEmail] = useState("");
//   const [pin, setPin] = useState("");
//   const [confirmPin, setConfirmPin] = useState("");

//   // UI Interaction States
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPin, setShowPin] = useState(false);
//   const [showConfirmPin, setShowConfirmPin] = useState(false);
//   const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

//   // Create Account: registers the user with Cognito (email as username).
//   // Cognito emails a 6-digit OTP automatically; we open the OTP modal to
//   // collect it and finish verification.
//   const handleSignUp = async (e: FormEvent) => {
//     e.preventDefault();

//     const cleanMobile = mobileNumber.replace(/\D/g, "");
//     const cleanEmail = email.trim().toLowerCase();

//     if (!cleanMobile || cleanMobile.length < 10) {
//       toast.error("Please enter a valid 10-digit mobile number.");
//       return;
//     }

//     if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
//       toast.error("Please enter a valid email address.");
//       return;
//     }

//     if (!pin || pin.length !== 4) {
//       toast.error("Password/PIN must be exactly 4 digits.");
//       return;
//     }

//     if (pin !== confirmPin) {
//       toast.error("Passwords/PINs do not match!");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await cognitoAuth.signUp(cleanEmail, pin);
//       toast.success("OTP sent to your email!");
//       setIsOtpModalOpen(true);
//     } catch (error) {
//       const err = error as { code?: string };
//       if (err?.code === "UsernameExistsException") {
//         // Cognito throws the same error whether the email is already fully
//         // registered, or was registered but never verified. Probe with a
//         // resend: if that succeeds, the account is genuinely unverified —
//         // drop the user straight into the OTP modal instead of a dead end.
//         const isUnverified = await cognitoAuth.isUnverifiedExistingUser(cleanEmail);
//         if (isUnverified) {
//           toast.success("This email is already pending verification — OTP resent!");
//           setIsOtpModalOpen(true);
//         } else {
//           toast.error("This email is already registered. Please sign in instead.");
//         }
//       } else {
//         console.error("Sign Up Error:", error);
//         toast.error(cognitoAuth.getErrorMessage(error));
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // OTP Modal: verify the email OTP code, completing registration.
//   const handleVerifyOtp = async (code: string) => {
//     const cleanEmail = email.trim().toLowerCase();
//     try {
//       await cognitoAuth.confirmSignUp(cleanEmail, code);
//     } catch (error) {
//       throw new Error(cognitoAuth.getErrorMessage(error));
//     }
//     toast.success("Email verified! Your account is ready.");
//     setIsOtpModalOpen(false);
//     setTimeout(() => {
//       navigate("/login");
//     }, 800);
//   };

//   // OTP Modal: resend the email OTP code (also triggered when the timer expires).
//   const handleResendOtp = async () => {
//     const cleanEmail = email.trim().toLowerCase();
//     try {
//       await cognitoAuth.resendConfirmationCode(cleanEmail);
//     } catch (error) {
//       throw new Error(cognitoAuth.getErrorMessage(error));
//     }
//     toast.success("A new OTP has been sent to your email.");
//   };

//   return (
//     <div className="flex min-h-screen w-full bg-ledger-bg font-sans text-ledger-ink">
//       {/* LEFT SIDE: Clean & Premium Showcase */}
//       <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-ledger-ink p-12 lg:flex xl:p-16">
//         {/* Ambient Glows & Ledger Rule Texture */}
//         <div className="pointer-events-none absolute -left-10 -top-10 h-80 w-80 rounded-full bg-ledger-brass-light/15 blur-[120px]" />
//         <div className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-ledger-green/10 blur-[140px]" />
//         <div
//           className="pointer-events-none absolute inset-0"
//           style={{
//             backgroundImage:
//               "repeating-linear-gradient(to bottom, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 34px)",
//           }}
//         />

//         {/* TOP BRAND HEADER */}
//         <div className="relative z-10 flex items-center gap-3.5">
//           <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-ledger-brass-light/30 bg-ledger-brass-light/15 shadow-lg overflow-hidden">
//   <img
//     src="/image.png"
//     alt="Online Khata Logo"
//     className="h-8 w-8 object-contain"
//   />
// </div>
//           <div className="flex flex-col justify-center">
//             <span className="font-serif text-2xl font-semibold leading-none tracking-tight text-white">
//               <span className="text-ledger-gold">Online Khata</span>
//             </span>
//             <span className="mt-1 text-[10px] font-medium tracking-widest text-white/50">
//               Smart Ledger System
//             </span>
//           </div>
//         </div>

//         {/* Hero Showcase Block */}
//         <div className="relative z-10 my-auto max-w-lg space-y-8 py-6">
//           <div className="space-y-4">
//             <span className="inline-flex items-center gap-2 rounded-full border border-ledger-brass-light/30 bg-ledger-brass-light/10 px-3.5 py-1 text-xs font-semibold text-ledger-gold">
//               <Zap size={13} className="fill-ledger-gold/20 text-ledger-gold" />
//               Instant Setup
//             </span>

//             <h1 className="font-serif text-4xl font-semibold leading-[1.15] tracking-tight text-white xl:text-5xl">
//               Start your digital ledger in{" "}
//               <span className="text-ledger-gold">seconds.</span>
//             </h1>

//             <p className="max-w-md text-sm font-normal leading-relaxed text-white/60">
//               Keep full control of customer credits, set up automated reminders,
//               and streamline daily account tracking effortlessly.
//             </p>
//           </div>

//           {/* Feature Badge Card */}
//           <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl">
//             <div className="flex items-center gap-4">
//               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ledger-brass-light/25 bg-ledger-brass-light/10 text-ledger-gold">
//                 <ShieldCheck size={20} />
//               </div>
//               <div>
//                 <h4 className="text-sm font-semibold tracking-wide text-white">
//                   100% Secure &amp; Cloud Synced
//                 </h4>
//                 <p className="mt-0.5 text-xs text-white/55">
//                   Your financial data is encrypted and backed up automatically.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer Info */}
//         <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/50">
//           <span>Online Khata — Daily Expenses Manager App</span>
//           <span>
//             Need Help?{" "}
//             <a
//               href="tel:+918295674272"
//               className="font-medium text-white/70 underline underline-offset-2 transition-colors hover:text-ledger-gold"
//             >
//               +91 82956 74272
//             </a>
//           </span>
//         </div>
//       </div>

//       {/* RIGHT SIDE: SignUp Interactive Form Container */}
//       <div className="flex w-full flex-col justify-between bg-ledger-paper px-6 py-8 sm:px-12 lg:w-1/2 xl:px-20">
//         {/* Navigation Top Header */}
//         <div className="flex items-center justify-between lg:justify-end">
//           <div className="flex items-center gap-2.5 lg:hidden">
//             <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-ledger-brass-light/30 bg-ledger-brass-light/15 shadow-lg overflow-hidden">
//   <img
//     src="/image.png"
//     alt="Online Khata Logo"
//     className="h-8 w-8 object-contain"
//   />
// </div>
//             <span className="font-serif text-xl font-semibold tracking-tight text-ledger-ink">
//               <span className="text-ledger-brass-dark">Online Khata</span>
//             </span>
//           </div>

//           <Link
//             to="/login"
//             className="text-xs font-semibold text-ledger-brass-dark hover:text-ledger-brass-darker"
//           >
//             Sign In Instead &rarr;
//           </Link>
//         </div>

//         {/* Form Main Section */}
//         <div className="mx-auto my-auto w-full max-w-md space-y-6 py-6">
//           <div className="space-y-2">
//             <h2 className="font-serif text-2xl font-semibold tracking-tight text-ledger-ink sm:text-3xl">
//               Get Started ✨
//             </h2>
//             <p className="text-sm text-ledger-subtle">
//               Enter your details to create your account. We'll send a
//               verification OTP to your email.
//             </p>
//           </div>

//           <form onSubmit={handleSignUp} className="space-y-4">
//             {/* Mobile Number Input */}
//             <div>
//               <PhoneField
//                 value={mobileNumber}
//                 onChange={(val) => setMobileNumber(val)}
//                 disabled={isLoading}
//               />
//             </div>

//             {/* Email Input */}
//             <div>
//               <label
//                 htmlFor="email"
//                 className="mb-1.5 block text-xs font-semibold text-ledger-muted"
//               >
//                 Email Address
//               </label>
//               <div className="relative flex items-center rounded-xl border border-ledger-border bg-ledger-paper-alt px-3.5 transition-all hover:border-ledger-border-hover focus-within:border-ledger-brass focus-within:bg-white focus-within:ring-2 focus-within:ring-ledger-brass/20">
//                 <Mail size={18} className="shrink-0 text-ledger-placeholder" />
//                 <input
//                   id="email"
//                   type="email"
//                   autoComplete="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="you@example.com"
//                   disabled={isLoading}
//                   className="w-full bg-transparent py-3 pl-3 pr-2 text-sm font-semibold text-ledger-ink outline-none placeholder:font-normal placeholder:text-ledger-placeholder disabled:opacity-60"
//                   required
//                 />
//               </div>
//               <p className="mt-1 text-[11px] text-ledger-faint">
//                 We'll send a 6-digit verification OTP to this email.
//               </p>
//             </div>

//             {/* New Password / PIN Input */}
//             <div>
//               <label
//                 htmlFor="new-password"
//                 className="mb-1.5 block text-xs font-semibold text-ledger-muted"
//               >
//                 4-Digit Password (PIN)
//               </label>
//               <div className="relative flex items-center rounded-xl border border-ledger-border bg-ledger-paper-alt px-3.5 transition-all hover:border-ledger-border-hover focus-within:border-ledger-brass focus-within:bg-white focus-within:ring-2 focus-within:ring-ledger-brass/20">
//                 <Lock size={18} className="shrink-0 text-ledger-placeholder" />
//                 <input
//                   id="new-password"
//                   type={showPin ? "text" : "password"}
//                   inputMode="numeric"
//                   maxLength={4}
//                   value={pin}
//                   onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
//                   placeholder="Enter 4-digit PIN"
//                   disabled={isLoading}
//                   className="w-full bg-transparent py-3 pl-3 pr-2 text-sm font-semibold tracking-[0.3em] text-ledger-ink outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-ledger-placeholder disabled:opacity-60"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPin(!showPin)}
//                   className="p-1 text-ledger-placeholder transition-colors hover:text-ledger-muted"
//                   aria-label="Toggle password visibility"
//                 >
//                   {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             {/* Confirm Password / PIN Input */}
//             <div>
//               <label
//                 htmlFor="confirm-password"
//                 className="mb-1.5 block text-xs font-semibold text-ledger-muted"
//               >
//                 Re-type Password (PIN)
//               </label>
//               <div className="relative flex items-center rounded-xl border border-ledger-border bg-ledger-paper-alt px-3.5 transition-all hover:border-ledger-border-hover focus-within:border-ledger-brass focus-within:bg-white focus-within:ring-2 focus-within:ring-ledger-brass/20">
//                 <Lock size={18} className="shrink-0 text-ledger-placeholder" />
//                 <input
//                   id="confirm-password"
//                   type={showConfirmPin ? "text" : "password"}
//                   inputMode="numeric"
//                   maxLength={4}
//                   value={confirmPin}
//                   onChange={(e) =>
//                     setConfirmPin(e.target.value.replace(/\D/g, ""))
//                   }
//                   placeholder="Confirm 4-digit PIN"
//                   disabled={isLoading}
//                   className="w-full bg-transparent py-3 pl-3 pr-2 text-sm font-semibold tracking-[0.3em] text-ledger-ink outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-ledger-placeholder disabled:opacity-60"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowConfirmPin(!showConfirmPin)}
//                   className="p-1 text-ledger-placeholder transition-colors hover:text-ledger-muted"
//                   aria-label="Toggle password visibility"
//                 >
//                   {showConfirmPin ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             {/* Submit Action */}
//             <Button
//               type="submit"
//               loading={isLoading}
//               loadingText="Creating Account..."
//               className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl !bg-ledger-brass py-3 text-sm font-semibold text-white shadow-sm transition-all hover:!bg-ledger-brass-dark active:scale-[0.99] disabled:opacity-50"
//             >
//               <span className="flex items-center gap-1.5">
//                 Create Account <ArrowRight size={16} />
//               </span>
//             </Button>
//           </form>

//           {/* Divider */}
//           <div className="relative my-6 flex items-center justify-center">
//             <div className="w-full border-t border-ledger-border" />
//             <span className="absolute bg-ledger-paper px-3 text-[11px] font-semibold tracking-wider text-ledger-faint">
//               Already registered?
//             </span>
//           </div>

//           {/* Back to Sign In */}
//           <Link to="/login" className="block w-full">
//             <Button
//               variant="secondary"
//               type="button"
//               className="w-full rounded-xl border border-ledger-border bg-ledger-hover py-3 text-xs font-semibold text-ledger-muted hover:bg-ledger-border-soft"
//             >
//               Sign In to Existing Account
//             </Button>
//           </Link>
//         </div>

//         {/* Mobile View Footer */}
//         <div className="text-center text-xs text-ledger-faint lg:hidden">
//           Online Khata — Daily Expenses Manager App
//         </div>
//       </div>

//       {/* Email OTP Verification Modal */}
//       <OtpModal
//         open={isOtpModalOpen}
//         email={email.trim().toLowerCase()}
//         onVerify={handleVerifyOtp}
//         onResend={handleResendOtp}
//         onClose={() => setIsOtpModalOpen(false)}
//         title="Verify Your Email"
//         description="We've sent a 6-digit verification code to"
//       />
//     </div>
//   );
// }


import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import PhoneField from "../components/PhoneField";
import Button from "../components/Button";
import OtpModal from "../components/OtpModal";
import { cognitoAuth } from "../lib/cognito";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUp() {
  const navigate = useNavigate();

  // Form State
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  // UI Interaction States
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  // Create Account: registers the user with Cognito (email as username).
  // Cognito emails a 6-digit OTP automatically; we open the OTP modal to
  // collect it and finish verification.
//   const handleSignUp = async (e: FormEvent) => {
//     e.preventDefault();

//     const cleanMobile = mobileNumber.replace(/\D/g, "");
//     const cleanEmail = email.trim().toLowerCase();

//     if (!cleanMobile || cleanMobile.length < 10) {
//       toast.error("Please enter a valid 10-digit mobile number.");
//       return;
//     }

//     if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
//       toast.error("Please enter a valid email address.");
//       return;
//     }

//     if (!pin) {
//       toast.error("Password/PIN cannot be empty.");
//       return;
//     }

//     if (pin !== confirmPin) {
//       toast.error("Passwords/PINs do not match!");
//       return;
//     }

//     // Format to international E.164 standard (+91 for 10-digit numbers)
//     const formattedPhone = cleanMobile.startsWith("91") && cleanMobile.length === 12
//       ? `+${cleanMobile}`
//       : `+91${cleanMobile.slice(-10)}`;

//     setIsLoading(true);
//     try {
//       await cognitoAuth.signUp(cleanEmail, pin, {
//   "custom:phoneNumbers": formattedPhone,
//   phone_number: formattedPhone,
// });
//       toast.success("OTP sent to your email!");
//       setIsOtpModalOpen(true);
//     } catch (error) {
//       const err = error as { code?: string };
//       if (err?.code === "UsernameExistsException") {
//         // Cognito throws the same error whether the email is already fully
//         // registered, or was registered but never verified. Probe with a
//         // resend: if that succeeds, the account is genuinely unverified —
//         // drop the user straight into the OTP modal instead of a dead end.
//         const isUnverified = await cognitoAuth.isUnverifiedExistingUser(cleanEmail);
//         if (isUnverified) {
//           toast.success("This email is already pending verification — OTP resent!");
//           setIsOtpModalOpen(true);
//         } else {
//           toast.error("This email is already registered. Please sign in instead.");
//         }
//       } else {
//         console.error("Sign Up Error:", error);
//         toast.error(cognitoAuth.getErrorMessage(error));
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();

    const cleanMobile = mobileNumber.replace(/\D/g, "");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanMobile || cleanMobile.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!pin) {
      toast.error("Password/PIN cannot be empty.");
      return;
    }

    if (pin !== confirmPin) {
      toast.error("Passwords/PINs do not match!");
      return;
    }

    // Format to international E.164 standard (+91 for 10-digit numbers)
    const formattedPhone =
      cleanMobile.startsWith("91") && cleanMobile.length === 12
        ? `+${cleanMobile}`
        : `+91${cleanMobile.slice(-10)}`;

    setIsLoading(true);
    try {
      await cognitoAuth.signUp(cleanEmail, pin, {
        phone_number: formattedPhone,
      });
      toast.success("OTP sent to your email!");
      setIsOtpModalOpen(true);
    } catch (error) {
      const err = error as { code?: string };
      if (err?.code === "UsernameExistsException") {
        // Cognito throws the same error whether the email is already fully
        // registered, or was registered but never verified. Probe with a
        // resend: if that succeeds, the account is genuinely unverified —
        // drop the user straight into the OTP modal instead of a dead end.
        const isUnverified = await cognitoAuth.isUnverifiedExistingUser(cleanEmail);
        if (isUnverified) {
          toast.success("This email is already pending verification — OTP resent!");
          setIsOtpModalOpen(true);
        } else {
          toast.error("This email is already registered. Please sign in instead.");
        }
      } else {
        console.error("Sign Up Error:", error);
        toast.error(cognitoAuth.getErrorMessage(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Modal: verify the email OTP code, completing registration.
  const handleVerifyOtp = async (code: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await cognitoAuth.confirmSignUp(cleanEmail, code);
    } catch (error) {
      throw new Error(cognitoAuth.getErrorMessage(error));
    }
    toast.success("Email verified! Your account is ready.");
    setIsOtpModalOpen(false);
    setTimeout(() => {
      navigate("/login");
    }, 800);
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
              Get Started ✨
            </h2>
            <p className="text-sm text-ledger-subtle">
              Enter your details to create your account. We'll send a
              verification OTP to your email.
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Mobile Number Input */}
            <div>
              <PhoneField
                value={mobileNumber}
                onChange={(val) => setMobileNumber(val)}
                disabled={isLoading}
              />
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold text-ledger-muted"
              >
                Email Address
              </label>
              <div className="relative flex items-center rounded-xl border border-ledger-border bg-ledger-paper-alt px-3.5 transition-all hover:border-ledger-border-hover focus-within:border-ledger-brass focus-within:bg-white focus-within:ring-2 focus-within:ring-ledger-brass/20">
                <Mail size={18} className="shrink-0 text-ledger-placeholder" />
                <input
                  id="email"
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
              <p className="mt-1 text-[11px] text-ledger-faint">
                We'll send a 6-digit verification OTP to this email.
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="new-password"
                className="mb-1.5 block text-xs font-semibold text-ledger-muted"
              >
                Password
              </label>
              <div className="relative flex items-center rounded-xl border border-ledger-border bg-ledger-paper-alt px-3.5 transition-all hover:border-ledger-border-hover focus-within:border-ledger-brass focus-within:bg-white focus-within:ring-2 focus-within:ring-ledger-brass/20">
                <Lock size={18} className="shrink-0 text-ledger-placeholder" />
                <input
                  id="new-password"
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
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1.5 block text-xs font-semibold text-ledger-muted"
              >
                Re-type Password
              </label>
              <div className="relative flex items-center rounded-xl border border-ledger-border bg-ledger-paper-alt px-3.5 transition-all hover:border-ledger-border-hover focus-within:border-ledger-brass focus-within:bg-white focus-within:ring-2 focus-within:ring-ledger-brass/20">
                <Lock size={18} className="shrink-0 text-ledger-placeholder" />
                <input
                  id="confirm-password"
                  type={showConfirmPin ? "text" : "password"}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirm Password"
                  disabled={isLoading}
                  className="w-full bg-transparent py-3 pl-3 pr-2 text-sm font-semibold text-ledger-ink outline-none placeholder:font-normal placeholder:text-ledger-placeholder disabled:opacity-60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="p-1 text-ledger-placeholder transition-colors hover:text-ledger-muted"
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPin ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <Button
              type="submit"
              loading={isLoading}
              loadingText="Creating Account..."
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl !bg-ledger-brass py-3 text-sm font-semibold text-white shadow-sm transition-all hover:!bg-ledger-brass-dark active:scale-[0.99] disabled:opacity-50"
            >
              <span className="flex items-center gap-1.5">
                Create Account <ArrowRight size={16} />
              </span>
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