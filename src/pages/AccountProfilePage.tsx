import { useState } from "react";
import {
  User,
  Settings,
  Star,
  History,
  Grid,
  HelpCircle,
  Info,
  LogOut,
  Pencil,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../components/ui/Modal";
import Button from "../components/Button";
import { authService } from "../services";
import { tokenStore } from "../auth/tokenStore";

export default function AccountProfilePage() {
  const navigate = useNavigate();

  // Real logged-in user, cached at login time — replaces the hardcoded
  // "Maa Sharda Store" placeholder that never reflected who was signed in.
  const cachedUser = authService.getCachedUser();

  const [storeName, setStoreName] = useState(
    (cachedUser?.name as string | undefined) || "My Store"
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const phoneNumber = (cachedUser?.phone as string | undefined) || null;

  // Accordion Expand/Collapse States (All set to false by default)
  const [openAccount, setOpenAccount] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openOtherApps, setOpenOtherApps] = useState(false);
  const [openHelpSupport, setOpenHelpSupport] = useState(false);
  const [openAboutUs, setOpenAboutUs] = useState(false);

  const handleSaveName = () => {
    setIsEditing(false);
    // Persist locally so the new name survives navigation within this
    // session. There is no PATCH /auth/profile endpoint on the backend yet
    // to persist it server-side — wire that up here once it exists.
    tokenStore.setUser({ ...(cachedUser || {}), name: storeName });
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      authService.logout();
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const initials = storeName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  return (
    <div className="w-full font-sans text-ink-900">
      {/* PAGE HEADING */}
      <div className="mb-5 flex flex-col gap-1 sm:mb-6">
        <h1 className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
          Account &amp; More
        </h1>
        <p className="text-xs font-medium text-ink-500 sm:text-sm">
          Manage your store profile, settings and support options.
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 lg:max-w-none lg:grid-cols-3">
        {/* Profile summary card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 p-6 text-white shadow-lift lg:col-span-1">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-black tracking-wider ring-1 ring-white/20">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  onBlur={handleSaveName}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  autoFocus
                  className="w-full border-b border-white/40 bg-transparent text-base font-bold text-white outline-none"
                />
              ) : (
                <h2 className="truncate text-base font-bold text-white">{storeName}</h2>
              )}
              <p className="truncate text-[11px] font-medium text-white/70">
                {phoneNumber ? `+91 ${phoneNumber}` : "Store Owner Account"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/15 py-2.5 text-xs font-bold text-white shadow-2xs transition-all hover:bg-white/25 active:scale-95"
          >
            <Pencil size={13} />
            <span>Edit Profile</span>
          </button>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-white/10 px-3.5 py-2.5">
            <span className="flex items-center gap-1.5 text-xs font-bold text-white/80">
              <Star size={13} /> Subscription
            </span>
            <span className="text-xs font-black text-emerald-300">27 Free Days</span>
          </div>
        </div>

        {/* Settings accordions */}
        <div className="space-y-3 lg:col-span-2">
          {/* 1. Account Section */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => setOpenAccount(!openAccount)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <User size={16} />
                </div>
                <span className="text-xs font-bold text-ink-800 sm:text-sm">Account</span>
              </div>
              {openAccount ? (
                <ChevronUp size={16} className="text-ink-400" />
              ) : (
                <ChevronDown size={16} className="text-ink-400" />
              )}
            </button>

            {openAccount && (
              <div className="border-t border-slate-100 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-xs font-semibold text-ink-500">
                  <span>Mobile Number</span>
                  <span className="font-bold text-ink-800">
                    {phoneNumber ? `+91 ${phoneNumber}` : "—"}
                  </span>
                </div>
                <a
                  href="#profile"
                  className="block border-b border-slate-100 px-4 py-3 text-xs font-semibold text-ink-500 transition-colors hover:bg-slate-50"
                >
                  View Profile
                </a>
                <a
                  href="#password"
                  className="block px-4 py-3 text-xs font-semibold text-ink-500 transition-colors hover:bg-slate-50"
                >
                  Change Password
                </a>
              </div>
            )}
          </div>

          {/* 2. Settings Section */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => setOpenSettings(!openSettings)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                  <Settings size={16} />
                </div>
                <span className="text-xs font-bold text-ink-800 sm:text-sm">Settings</span>
              </div>
              {openSettings ? (
                <ChevronUp size={16} className="text-ink-400" />
              ) : (
                <ChevronDown size={16} className="text-ink-400" />
              )}
            </button>

            {openSettings && (
              <div className="border-t border-slate-100 bg-white">
                <a
                  href="#recycle-bin"
                  className="block border-b border-slate-100 px-4 py-3 text-xs font-semibold text-ink-500 transition-colors hover:bg-slate-50"
                >
                  Recycle Bin
                </a>
                <a
                  href="#delete-khata"
                  className="block px-4 py-3 text-xs font-semibold text-ink-500 transition-colors hover:bg-slate-50"
                >
                  Delete Khata
                </a>
              </div>
            )}
          </div>

          {/* 3 & 4. Quick info row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Star size={16} />
                </div>
                <span className="text-xs font-bold text-ink-800 sm:text-sm">Subscription</span>
              </div>
              <span className="text-xs font-black text-credit-600 sm:text-sm">27 Days</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-ink-700">
                  <History size={16} />
                </div>
                <span className="text-xs font-bold text-ink-800 sm:text-sm">Payment History</span>
              </div>
            </div>
          </div>

          {/* 5. Other Apps Accordion */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => setOpenOtherApps(!openOtherApps)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <Grid size={16} />
                </div>
                <span className="text-xs font-bold text-ink-800 sm:text-sm">Other Apps</span>
              </div>
              {openOtherApps ? (
                <ChevronUp size={16} className="text-ink-400" />
              ) : (
                <ChevronDown size={16} className="text-ink-400" />
              )}
            </button>

            {openOtherApps && (
              <div className="divide-y divide-slate-100 border-t border-slate-100 bg-white">
                {/* App Item 1 */}
                <div className="px-4 py-3">
                  <div className="mb-1 text-[11px] font-bold text-ink-300">For EMI collection</div>
                  <a
                    href="https://emichart.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-700 hover:underline"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-xs bg-amber-400 text-[8px] font-black text-slate-900">
                      EMI
                    </span>
                    <span>emichart.com</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* App Item 2 */}
                <div className="px-4 py-3">
                  <div className="mb-1 text-[11px] font-bold text-ink-300">For Live Notebook</div>
                  <a
                    href="https://notebook77.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-700 hover:underline"
                  >
                    <span className="text-xs">📑</span>
                    <span>notebook77.com</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* App Item 3 */}
                <div className="px-4 py-3">
                  <div className="mb-1 text-[11px] font-bold text-ink-300">For Manage Committee</div>
                  <a
                    href="https://cmt77.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-700 hover:underline"
                  >
                    <span>cmt77.com</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 6. Help & Support Accordion */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => setOpenHelpSupport(!openHelpSupport)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <HelpCircle size={16} />
                </div>
                <span className="text-xs font-bold text-ink-800 sm:text-sm">Help &amp; Support</span>
              </div>
              {openHelpSupport ? (
                <ChevronUp size={16} className="text-ink-400" />
              ) : (
                <ChevronDown size={16} className="text-ink-400" />
              )}
            </button>

            {openHelpSupport && (
              <div className="space-y-1.5 border-t border-slate-100 bg-white px-4 py-3.5">
                <div className="flex items-center gap-2 text-xs font-bold text-ink-700">
                  <Phone size={14} className="text-ink-500" />
                  <span>+91 8295674272</span>
                </div>
                <div className="pl-5 text-[11px] font-bold text-ink-300">
                  From: 11:00 AM To 04:00 PM
                </div>
              </div>
            )}
          </div>

          {/* 7. About Us Accordion */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
            <button
              type="button"
              onClick={() => setOpenAboutUs(!openAboutUs)}
              className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-ink-700">
                  <Info size={16} />
                </div>
                <span className="text-xs font-bold text-ink-800 sm:text-sm">About Us</span>
              </div>
              {openAboutUs ? (
                <ChevronUp size={16} className="text-ink-400" />
              ) : (
                <ChevronDown size={16} className="text-ink-400" />
              )}
            </button>

            {openAboutUs && (
              <div className="border-t border-slate-100 bg-white">
                <a
                  href="#about-app"
                  className="block border-b border-slate-100 px-4 py-3 text-xs font-semibold text-ink-500 transition-colors hover:bg-slate-50"
                >
                  About App
                </a>
                <a
                  href="#privacy-policy"
                  className="block border-b border-slate-100 px-4 py-3 text-xs font-semibold text-ink-500 transition-colors hover:bg-slate-50"
                >
                  Privacy Policy
                </a>
                <a
                  href="#terms-conditions"
                  className="block px-4 py-3 text-xs font-semibold text-ink-500 transition-colors hover:bg-slate-50"
                >
                  Terms &amp; Conditions
                </a>
              </div>
            )}
          </div>

          {/* 8. Logout Action Button */}
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-800/30 bg-white py-3 text-xs font-bold text-violet-800 transition-all hover:bg-violet-50 active:scale-[0.99]"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      <Modal
        open={isLogoutModalOpen}
        onClose={() => !isLoggingOut && setIsLogoutModalOpen(false)}
        title="Log out?"
        preventClose={isLoggingOut}
        size="sm"
        tone="danger"
      >
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <p className="text-center text-sm font-medium text-ink-500">
            You'll need your mobile number and PIN to sign back in.
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row-reverse">
            <Button
              variant="danger"
              loading={isLoggingOut}
              loadingText="Logging out..."
              onClick={handleLogout}
            >
              Yes, Log Out
            </Button>
            <Button
              variant="secondary"
              disabled={isLoggingOut}
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
