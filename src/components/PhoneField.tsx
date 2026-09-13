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
    <div className="w-full">
      <label
        htmlFor="phone"
        className="mb-1.5 block text-sm font-medium text-ledger-muted"
      >
        {label}
      </label>
      <div
        className={`flex w-full items-center gap-2 rounded-xl border bg-ledger-paper-alt px-3.5 transition focus-within:border-ledger-brass focus-within:bg-white focus-within:ring-2 focus-within:ring-ledger-brass/15 ${
          error ? "border-ledger-red" : "border-ledger-border"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap border-r border-ledger-border py-3 pr-3 text-sm font-medium text-ledger-ink">
          <span aria-hidden className="text-base leading-none">
            🇮🇳
          </span>
          +91
        </span>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={value}
          disabled={disabled}
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          placeholder="Enter your phone number"
          className="w-full bg-transparent py-3 text-sm text-ledger-ink outline-none placeholder:text-ledger-placeholder disabled:cursor-not-allowed"
        />
      </div>
      {error && (
        <p className="mt-1 text-xs font-medium text-ledger-red">{error}</p>
      )}
    </div>
  );
}
