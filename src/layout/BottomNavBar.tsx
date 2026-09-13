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
  {
    id: "ledger",
    label: "Transaction",
    to: "/ledger-entries-page",
    icon: IndianRupee,
  },
  {
    id: "cross",
    label: "Cross Entry",
    to: "/payment-transfer-form",
    icon: ArrowLeftRight,
  },
];

const moreLinks = [
  { id: "khata", label: "Khata Book", to: "/khatalist", icon: BookOpen },
  {
    id: "account",
    label: "Account & More",
    to: "/account-profile-page",
    icon: UserCircle2,
  },
];

export default function BottomNavBar() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // "More" itself should look active when the user is actually on one of
  // the pages it leads to, same as the old sidebar highlighting Khata Book
  // or Account as the active link.
  const isMoreActive = moreLinks.some((link) =>
    location.pathname.startsWith(link.to),
  );

  const handleLogout = () => {
    setIsMoreOpen(false);
    authService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex w-full items-stretch justify-between border-t border-ledger-border bg-ledger-paper/95 px-2 backdrop-blur-md"
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
                  isActive
                    ? "text-ledger-brass-dark"
                    : "text-ledger-faint hover:text-ledger-brass-dark"
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
            isMoreActive
              ? "text-ledger-brass-dark"
              : "text-ledger-faint hover:text-ledger-brass-dark"
          }`}
        >
          <MoreHorizontal size={22} />
          <span>More</span>
        </button>
      </nav>

      {/* "More" sheet — Khata Book, Account & Logout, same as the old sidebar footer */}
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ledger-backdrop/60 backdrop-blur-sm sm:items-center"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsMoreOpen(false);
          }}
        >
          <div className="w-full overflow-hidden rounded-t-3xl border border-ledger-border bg-ledger-paper shadow-2xl sm:max-w-sm sm:rounded-2xl">
            <div className="h-1 w-full bg-ledger-brass" />

            <div className="relative flex items-center justify-center border-b border-ledger-border-soft px-5 py-4">
              <h2 className="font-serif text-base font-semibold text-ledger-ink">
                More
              </h2>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                aria-label="Close"
                className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-full text-ledger-faint transition-colors hover:bg-ledger-hover hover:text-ledger-ink active:scale-95"
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
                        isActive
                          ? "bg-ledger-brass/10 text-ledger-brass-dark"
                          : "text-ledger-ink hover:bg-ledger-hover"
                      }`
                    }
                  >
                    <Icon size={19} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              <div className="my-2 h-px bg-ledger-border-soft" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-ledger-red transition-colors hover:bg-ledger-red/5"
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
