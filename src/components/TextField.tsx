import type { InputHTMLAttributes, ReactNode } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  leadingIcon?: ReactNode;
  error?: string;
}

export default function TextField({
  label,
  hint,
  leadingIcon,
  error,
  id,
  maxLength,
  value,
  ...rest
}: TextFieldProps) {
  const inputId = id ?? label.replace(/\s+/g, "-").toLowerCase();
  const length = typeof value === "string" ? value.length : 0;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      <div
        className={`flex items-center gap-2 rounded-xl border bg-ink-50/60 px-3.5 transition focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100 ${
          error ? "border-debit-500" : "border-ink-100"
        }`}
      >
        {leadingIcon && <span className="text-ink-500">{leadingIcon}</span>}
        <input
          id={inputId}
          value={value}
          maxLength={maxLength}
          className="w-full bg-transparent py-3 text-sm text-ink-900 outline-none placeholder:text-ink-300"
          {...rest}
        />
      </div>
      <div className="mt-1 flex items-center justify-between">
        {error ? (
          <p className="text-xs font-medium text-debit-600">{error}</p>
        ) : hint ? (
          <p className="text-xs text-ink-500">{hint}</p>
        ) : (
          <span />
        )}
        {maxLength && (
          <span className="text-[11px] tabular text-ink-300">
            {length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
