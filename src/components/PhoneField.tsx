interface PhoneFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function PhoneField({
  label = "Mobile Number",
  value,
  onChange,
  error,
  disabled = false,
}: PhoneFieldProps) {
  return (
    <div>
      <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink-700">
        {label}
      </label>
      <div
        className={`flex items-center gap-2 rounded-xl border bg-ink-50/60 px-3.5 transition focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100 ${
          error ? "border-debit-500" : "border-ink-100"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap border-r border-ink-100 py-3 pr-3 text-sm font-medium text-ink-700">
          <span aria-hidden className="text-base leading-none">🇮🇳</span>
          +91
        </span>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="Enter your phone number"
          className="w-full bg-transparent py-3 text-sm text-ink-900 outline-none placeholder:text-ink-300 disabled:cursor-not-allowed"
        />
      </div>
      {error && <p className="mt-1 text-xs font-medium text-debit-600">{error}</p>}
    </div>
  );
}
