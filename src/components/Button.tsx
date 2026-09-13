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
    "bg-ledger-brass text-white shadow-sm hover:bg-ledger-brass-dark active:scale-[0.99]",
  secondary:
    "bg-ledger-paper text-ledger-muted border border-ledger-border hover:bg-ledger-hover active:scale-[0.99]",
  ghost: "bg-transparent text-ledger-brass-dark hover:bg-ledger-hover active:scale-[0.99]",
  danger:
    "bg-ledger-paper text-ledger-red border border-ledger-red/35 hover:bg-ledger-red/5 active:scale-[0.99]",
  dangerSolid:
    "bg-ledger-red text-white shadow-sm hover:bg-ledger-red-dark active:scale-[0.99]",
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
      {loading ? (loadingText ?? children) : children}
    </button>
  );
}
