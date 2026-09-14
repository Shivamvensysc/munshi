import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { MailCheck, RefreshCw, ShieldCheck } from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./Button";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

interface OtpModalProps {
  open: boolean;
  email: string;
  /** Called with the joined OTP code. Throw/reject to keep the modal open with an error. */
  onVerify: (code: string) => Promise<void>;
  /** Re-sends a fresh OTP code. Throw/reject to surface an error instead of resetting the timer. */
  onResend: () => Promise<void>;
  onClose: () => void;
  title?: string;
  /** Shown above the digit boxes, e.g. "Enter the 6-digit code sent to". */
  description?: string;
}

/**
 * Shared, "beautiful" OTP verification modal used for signup email
 * verification and (optionally) forgot-password. Six auto-advancing digit
 * boxes, a live countdown, and a Resend button that only unlocks once the
 * countdown hits zero.
 */
export default function OtpModal({
  open,
  email,
  onVerify,
  onResend,
  onClose,
  title = "Verify Your Email",
  description = "We've sent a 6-digit verification code to",
}: OtpModalProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Reset everything whenever the modal opens (fresh code just sent).
  useEffect(() => {
    if (!open) return;
    setDigits(Array(OTP_LENGTH).fill(""));
    setSecondsLeft(RESEND_SECONDS);
    setError(null);
    setIsVerifying(false);
    setIsResending(false);
    const t = setTimeout(() => inputRefs.current[0]?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  // Countdown timer — ticks every second while the modal is open.
  useEffect(() => {
    if (!open || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [open, secondsLeft]);

  if (!open) return null;

  const code = digits.join("");
  const isComplete = code.length === OTP_LENGTH;
  const timerLabel = `0:${secondsLeft.toString().padStart(2, "0")}`;

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  };

  const handleChange = (index: number, rawValue: string) => {
    const value = rawValue.replace(/\D/g, "");
    if (!value) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    // Handles fast typing / autofill dropping more than one char at once.
    const chars = value.split("");
    setDigits((prev) => {
      const next = [...prev];
      chars.forEach((char, offset) => {
        if (index + offset < OTP_LENGTH) next[index + offset] = char;
      });
      return next;
    });
    setError(null);

    const nextIndex = Math.min(index + chars.length, OTP_LENGTH - 1);
    focusInput(nextIndex);
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    handleChange(0, pasted);
  };

  const handleVerify = async () => {
    if (!isComplete || isVerifying) return;
    setIsVerifying(true);
    setError(null);
    try {
      await onVerify(code);
    } catch (err) {
      setError((err as Error)?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending) return;
    setIsResending(true);
    setError(null);
    try {
      await onResend();
      setDigits(Array(OTP_LENGTH).fill(""));
      setSecondsLeft(RESEND_SECONDS);
      focusInput(0);
    } catch (err) {
      setError((err as Error)?.message || "Couldn't resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center gap-5 px-6 py-7">
        {/* Icon badge */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-ledger-brass-light/30 bg-ledger-brass-light/10 text-ledger-brass-dark shadow-sm">
          <MailCheck size={26} />
        </div>

        <div className="space-y-1 text-center">
          <p className="text-sm text-ledger-subtle">{description}</p>
          <p className="text-sm font-semibold text-ledger-ink">{email}</p>
        </div>

        {/* OTP Digit Boxes */}
        <div className="flex items-center justify-center gap-2 sm:gap-2.5">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={OTP_LENGTH}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isVerifying}
              className={`h-12 w-10 rounded-xl border bg-ledger-paper-alt text-center text-lg font-bold text-ledger-ink outline-none transition-all sm:h-14 sm:w-12 ${
                error
                  ? "border-ledger-red focus:ring-2 focus:ring-ledger-red/20"
                  : "border-ledger-border focus:border-ledger-brass focus:bg-white focus:ring-2 focus:ring-ledger-brass/20"
              } disabled:opacity-60`}
            />
          ))}
        </div>

        {error && (
          <p className="-mt-2 text-center text-xs font-medium text-ledger-red">{error}</p>
        )}

        {/* Verify Button */}
        <Button
          type="button"
          onClick={handleVerify}
          loading={isVerifying}
          loadingText="Verifying..."
          disabled={!isComplete}
          className="flex w-full items-center justify-center gap-2 rounded-xl !bg-ledger-brass py-3 text-sm font-semibold text-white shadow-sm transition-all hover:!bg-ledger-brass-dark active:scale-[0.99] disabled:opacity-50"
        >
          <span className="flex items-center gap-1.5">
            Verify Email <ShieldCheck size={16} />
          </span>
        </Button>

        {/* Resend / Timer */}
        <div className="flex items-center gap-1.5 text-xs text-ledger-subtle">
          {secondsLeft > 0 ? (
            <span>
              Resend OTP in{" "}
              <span className="font-semibold text-ledger-ink">{timerLabel}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="flex items-center gap-1.5 font-semibold text-ledger-brass-dark hover:text-ledger-brass-darker disabled:opacity-60"
            >
              <RefreshCw size={13} className={isResending ? "animate-spin" : ""} />
              {isResending ? "Resending..." : "Resend OTP"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
