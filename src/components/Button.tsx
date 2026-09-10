import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: ReactNode;
  fullWidth?: boolean;
}

const variants: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-violet-800 to-violet-600 text-white shadow-[0_10px_20px_-8px_rgba(74,39,168,0.6)] hover:from-violet-700 hover:to-violet-500 active:scale-[0.99]",
  secondary:
    "bg-white text-brand-800 border border-brand-200 hover:bg-brand-50 active:scale-[0.99]",
  ghost: "bg-transparent text-brand-700 hover:bg-brand-50 active:scale-[0.99]",
  danger:
    "bg-white text-debit-600 border border-debit-500/40 hover:bg-debit-500/5 active:scale-[0.99]",
};

export default function Button({
  variant = "primary",
  icon,
  fullWidth = true,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        fullWidth ? "w-full" : ""
      } ${variants[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
