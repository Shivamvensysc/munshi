import type { ButtonHTMLAttributes, ReactNode } from "react";
import Spinner from "./ui/Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "dangerSolid";
  icon?: ReactNode;
  fullWidth?: boolean;
  /** Shows a spinner in place of `icon`, disables the button, and keeps its width stable. */
  loading?: boolean;
  /** Text/content shown next to the spinner while `loading` is true. Falls back to `children`. */
  loadingText?: ReactNode;
}

const variants: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-violet-800 to-violet-600 text-white shadow-[0_10px_20px_-8px_rgba(74,39,168,0.6)] hover:from-violet-700 hover:to-violet-500 active:scale-[0.99]",
  secondary:
    "bg-white text-brand-800 border border-brand-200 hover:bg-brand-50 active:scale-[0.99]",
  ghost: "bg-transparent text-brand-700 hover:bg-brand-50 active:scale-[0.99]",
  danger:
    "bg-white text-debit-600 border border-debit-500/40 hover:bg-debit-500/5 active:scale-[0.99]",
  dangerSolid:
    "bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-[0_10px_20px_-8px_rgba(225,29,72,0.5)] hover:brightness-105 active:scale-[0.99]",
};

export default function Button({
  variant = "primary",
  icon,
  fullWidth = true,
  loading = false,
  loadingText,
  className = "",
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        fullWidth ? "w-full" : ""
      } ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading ? <Spinner size={16} /> : icon}
      {loading ? loadingText ?? children : children}
    </button>
  );
}
