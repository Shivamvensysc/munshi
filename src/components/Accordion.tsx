import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export default function Accordion({
  icon,
  title,
  trailing,
  children,
}: {
  icon: ReactNode;
  title: string;
  trailing?: ReactNode;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = Boolean(children);

  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
      <button
        onClick={() => hasChildren && setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className="text-brand-700">{icon}</span>
        <span className="flex-1 text-sm font-medium text-ink-900">{title}</span>
        {trailing}
        {hasChildren && (
          <ChevronDown
            size={16}
            className={`text-ink-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>
      {hasChildren && open && (
        <div className="space-y-0.5 border-t border-ink-100 bg-ink-50/60 px-4 py-2">{children}</div>
      )}
    </div>
  );
}
