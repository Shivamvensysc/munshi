import { useNavigate } from "react-router-dom";
import type { Customer } from "../types";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const palette = [
  "bg-brand-100 text-brand-800",
  "bg-violet-500/10 text-violet-700",
  "bg-credit-500/10 text-credit-600",
  "bg-debit-500/10 text-debit-600",
];

export default function CustomerRow({ customer, index }: { customer: Customer; index: number }) {
  const navigate = useNavigate();
  const isZero = customer.balance === 0;
  const isCredit = customer.balance > 0;

  return (
    <button
      onClick={() => navigate(`/customer/${customer.id}`)}
      className="flex w-full items-center gap-3 rounded-xl border border-ink-100 bg-white p-3.5 text-left transition hover:border-brand-200 hover:shadow-card active:scale-[0.99]"
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${palette[index % palette.length]}`}
      >
        {initials(customer.name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink-900">{customer.name}</span>
        <span className="block truncate text-xs text-ink-500">{customer.phone ?? "No contact"}</span>
      </span>
      <span className="shrink-0 text-right">
        <span
          className={`block text-sm font-bold tabular ${
            isZero ? "text-ink-500" : isCredit ? "text-credit-600" : "text-debit-600"
          }`}
        >
          ₹{Math.abs(customer.balance).toLocaleString("en-IN")}
        </span>
        <span className="block text-[11px] font-medium text-ink-500">
          {isZero ? "Settled" : isCredit ? "You'll Get" : "You'll Give"}
        </span>
      </span>
    </button>
  );
}
