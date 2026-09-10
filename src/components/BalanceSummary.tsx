import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

function formatINR(value: number) {
  const abs = Math.abs(value);
  return `₹${abs.toLocaleString("en-IN")}`;
}

export default function BalanceSummary({
  youWillGive,
  youWillGet,
}: {
  youWillGive: number;
  youWillGet: number;
}) {
  const net = youWillGet - youWillGive;

  return (
    <div className="-mt-8 rounded-2xl bg-white p-5 shadow-card ring-1 ring-ink-100/70">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Net Balance</p>
      <p
        className={`mt-1 text-3xl font-bold tabular ${
          net === 0 ? "text-ink-900" : net > 0 ? "text-credit-600" : "text-debit-600"
        }`}
      >
        {net < 0 && "-"}
        {formatINR(net)}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-debit-500/8 p-3">
          <div className="flex items-center gap-1.5 text-debit-600">
            <ArrowUpRight size={14} strokeWidth={2.5} />
            <span className="text-xs font-semibold">Dene (You'll Give)</span>
          </div>
          <p className="mt-1 text-lg font-bold tabular text-debit-600">{formatINR(youWillGive)}</p>
        </div>
        <div className="rounded-xl bg-credit-500/8 p-3">
          <div className="flex items-center gap-1.5 text-credit-600">
            <ArrowDownLeft size={14} strokeWidth={2.5} />
            <span className="text-xs font-semibold">Lene (You'll Get)</span>
          </div>
          <p className="mt-1 text-lg font-bold tabular text-credit-600">{formatINR(youWillGet)}</p>
        </div>
      </div>
    </div>
  );
}
