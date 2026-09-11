import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  IndianRupee,
  ArrowLeftRight,
  MoreHorizontal,
  BookOpen,
  UserCircle2,
  LogOut,
  X,
} from "lucide-react";
import { authService } from "../services";

// Same 5 destinations the old Sidebar had. The first three get their own
// tab (matching the reference design); Khata Book + Account are tucked
// under "More" purely to fit the 4-icon bottom-bar layout — routes and
// behaviour are unchanged, only where you tap to reach them.
const primaryTabs = [
  { id: "dashboard", label: "Customers", to: "/dashboard", icon: Users },
  { id: "ledger", label: "Transaction", to: "/ledger-entries-page", icon: IndianRupee },
  { id: "cross", label: "Cross Entry", to: "/payment-transfer-form", icon: ArrowLeftRight },
];

const moreLinks = [
  { id: "khata", label: "Khata Book", to: "/khatalist", icon: BookOpen },
  { id: "account", label: "Account & More", to: "/account-profile-page", icon: UserCircle2 },
];

export default function BottomNavBar() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // "More" itself should look active when the user is actually on one of
  // the pages it leads to, same as the old sidebar highlighting Khata Book
  // or Account as the active link.
  const isMoreActive = moreLinks.some((link) => location.pathname.startsWith(link.to));

  const handleLogout = () => {
    setIsMoreOpen(false);
    authService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-between border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {primaryTabs.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold transition-colors ${
                  isActive ? "text-brand-600" : "text-ink-400 hover:text-brand-500"
                }`
              }
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={() => setIsMoreOpen(true)}
          className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold transition-colors ${
            isMoreActive ? "text-brand-600" : "text-ink-400 hover:text-brand-500"
          }`}
        >
          <MoreHorizontal size={22} />
          <span>More</span>
        </button>
      </nav>

      {/* "More" sheet — Khata Book, Account & Logout, same as the old sidebar footer */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 backdrop-blur-sm sm:items-center"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsMoreOpen(false);
          }}
        >
          <div className="w-full overflow-hidden rounded-t-3xl border border-slate-200/70 bg-white shadow-2xl sm:max-w-sm sm:rounded-2xl">
            <div className="relative flex items-center justify-center border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-extrabold text-ink-900">More</h2>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                aria-label="Close"
                className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-slate-100 hover:text-ink-700 active:scale-95"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3">
              {moreLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.to}
                    onClick={() => setIsMoreOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                        isActive ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-slate-50"
                      }`
                    }
                  >
                    <Icon size={19} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              <div className="my-2 h-px bg-slate-100" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
              >
                <LogOut size={19} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
