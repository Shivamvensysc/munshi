import { NavLink } from "react-router-dom";
import { Users, ArrowLeftRight, Repeat, MoreHorizontal } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Customers", icon: Users },
  { to: "/transaction", label: "Transaction", icon: ArrowLeftRight },
  { to: "/cross-entry", label: "Cross Entry", icon: Repeat },
  { to: "/more", label: "More", icon: MoreHorizontal },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-ink-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-md grid grid-cols-4">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? "text-brand-700" : "text-ink-500"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                    isActive ? "bg-brand-100" : ""
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
