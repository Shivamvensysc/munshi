import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Receipt,
  ArrowLeftRight,
  UserCircle2,
  X,
  Sparkles,
  LogOut,
} from "lucide-react";
import { authService } from "../services";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { id: "dashboard", label: "Customers", to: "/dashboard", icon: LayoutDashboard },
  { id: "khata", label: "Khata Book", to: "/khatalist", icon: BookOpen },
  { id: "ledger", label: "Transactions", to: "/ledger-entries-page", icon: Receipt },
  { id: "cross", label: "Cross Entry", to: "/payment-transfer-form", icon: ArrowLeftRight },
  { id: "account", label: "Account & More", to: "/account-profile-page", icon: UserCircle2 },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    onClose();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile backdrop overlay — only rendered while the sidebar is open on small screens */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 transform flex-col overflow-hidden bg-gradient-to-b from-[#0a1f52] via-[#101a45] to-[#1e1147] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Ambient glow accents */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-violet-600/20 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-0 -left-10 h-56 w-56 rounded-full bg-indigo-500/20 blur-[90px]" />

        {/* Brand header */}
        <div className="relative z-10 flex items-center justify-between gap-2 px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
              <BookOpen size={19} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight text-white">
                <span className="text-indigo-300">Munshi</span>
              </span>
              <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-slate-400">
                Smart Ledger
              </span>
            </div>
          </div>

          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white active:scale-95 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative z-10 mx-5 h-px bg-white/10" />

        {/* Navigation */}
        <nav className="relative z-10 flex-1 space-y-1.5 overflow-y-auto px-3.5 py-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-white/10 text-white shadow-inner ring-1 ring-white/15"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-violet-400 transition-all duration-150 ${
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                      }`}
                    />
                    <Icon
                      size={19}
                      className={`shrink-0 transition-colors ${
                        isActive ? "text-indigo-300" : "text-slate-400 group-hover:text-indigo-300"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="relative z-10 mx-5 h-px bg-white/10" />

        {/* Footer promo card + Logout */}
        <div className="relative z-10 p-4">
         
         

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-300 transition-all hover:border-rose-500/40 hover:bg-rose-500/20 hover:text-rose-200 active:scale-[0.98]"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>

          <p className="mt-3 text-center text-[10px] font-medium text-slate-500">
            Munshi — Daily Expenses Manager
          </p>
        </div>
      </aside>
    </>
  );
}
