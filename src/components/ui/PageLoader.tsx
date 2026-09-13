import { BookOpenCheck } from "lucide-react";
import Spinner from "./Spinner";

export default function PageLoader() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-ledger-bg">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ledger-ink text-white shadow-lift">
        <BookOpenCheck size={26} strokeWidth={2.2} />
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold text-ledger-muted">
        <Spinner size={16} className="text-ledger-brass-dark" />
        <span>Loading…</span>
      </div>
    </div>
  );
}
