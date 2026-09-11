import { BookOpenCheck } from "lucide-react";
import Spinner from "./Spinner";

export default function PageLoader() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-ink-50">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-violet-700 text-white shadow-lift">
        <BookOpenCheck size={26} strokeWidth={2.2} />
      </div>
      <div className="flex items-center gap-2 text-sm font-semibold text-ink-500">
        <Spinner size={16} className="text-brand-600" />
        <span>Loading…</span>
      </div>
    </div>
  );
}
