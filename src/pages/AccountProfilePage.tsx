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
    (cachedUser?.name as string | undefined) || "Online Khata",
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
    <div className="w-full min-h-full bg-ledger-bg font-sans text-ledger-ink">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
        {/* PAGE HEADING */}
        <div className="mb-5 flex flex-col gap-1 sm:mb-6">
          <h1 className="font-serif text-xl font-semibold tracking-tight text-ledger-ink sm:text-2xl">
            Account &amp; More
          </h1>
          <p className="text-xs font-medium text-ledger-subtle sm:text-sm">
            Manage your store profile, settings and support options.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 lg:max-w-none lg:grid-cols-3">
          {/* Profile summary card */}
          <div className="relative w-full overflow-hidden rounded-2xl border border-ledger-ink-dark bg-ledger-ink p-6 text-white shadow-sm lg:col-span-1">
            <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-ledger-brass-light/10 blur-2xl" />
            <div className="relative z-10 flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-ledger-brass-light/15 font-serif text-lg font-semibold tracking-wider text-ledger-gold ring-1 ring-ledger-brass-light/30">
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
                    className="w-full border-b border-white/40 bg-transparent font-serif text-base font-semibold text-white outline-none"
                  />
                ) : (
                  <h2 className="truncate font-serif text-base font-semibold text-white">
                    {storeName}
                  </h2>
                )}
                <p className="truncate text-[11px] font-medium text-white/60">
                  {phoneNumber ? `+91 ${phoneNumber}` : "Store Owner Account"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="relative z-10 mt-5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-white/20 active:scale-95"
            >
              <Pencil size={13} />
              <span>Edit Profile</span>
            </button>

            <div className="relative z-10 mt-4 flex items-center justify-between rounded-xl bg-white/5 px-3.5 py-2.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-white/70">
                <Star size={13} /> Subscription
              </span>
              <span className="font-serif text-xs font-semibold text-ledger-mint">
                My application
              </span>
            </div>
          </div>

          {/* Settings accordions */}
          <div className="space-y-3 lg:col-span-2">
            {/* 1. Account Section */}
            <div className="overflow-hidden rounded-xl border border-ledger-border bg-ledger-paper shadow-2xs">
              <button
                type="button"
                onClick={() => setOpenAccount(!openAccount)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-ledger-hover"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ledger-brass/10 text-ledger-brass-dark">
                    <User size={16} />
                  </div>
                  <span className="text-xs font-semibold text-ledger-ink sm:text-sm">
                    Account
                  </span>
                </div>
                {openAccount ? (
                  <ChevronUp size={16} className="text-ledger-faint" />
                ) : (
                  <ChevronDown size={16} className="text-ledger-faint" />
                )}
              </button>

              {openAccount && (
                <div className="border-t border-ledger-border-soft bg-ledger-paper">
                  <div className="flex items-center justify-between border-b border-ledger-border-soft px-4 py-3 text-xs font-medium text-ledger-muted">
                    <span>Mobile Number</span>
                    <span className="font-semibold text-ledger-ink">
                      {phoneNumber ? `+91 ${phoneNumber}` : "—"}
                    </span>
                  </div>
                  <a
                    href="#profile"
                    className="block border-b border-ledger-border-soft px-4 py-3 text-xs font-medium text-ledger-muted transition-colors hover:bg-ledger-hover"
                  >
                    View Profile
                  </a>
                  <a
                    href="#password"
                    className="block px-4 py-3 text-xs font-medium text-ledger-muted transition-colors hover:bg-ledger-hover"
                  >
                    Change Password
                  </a>
                </div>
              )}
            </div>

            {/* 2. Settings Section */}
            <div className="overflow-hidden rounded-xl border border-ledger-border bg-ledger-paper shadow-2xs">
              <button
                type="button"
                onClick={() => setOpenSettings(!openSettings)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-ledger-hover"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ledger-ink/5 text-ledger-ink">
                    <Settings size={16} />
                  </div>
                  <span className="text-xs font-semibold text-ledger-ink sm:text-sm">
                    Settings
                  </span>
                </div>
                {openSettings ? (
                  <ChevronUp size={16} className="text-ledger-faint" />
                ) : (
                  <ChevronDown size={16} className="text-ledger-faint" />
                )}
              </button>

              {openSettings && (
                <div className="border-t border-ledger-border-soft bg-ledger-paper">
                  <button
                    type="button"
                    onClick={() => navigate("/recycle-bin")}
                    className="block w-full border-b border-ledger-border-soft px-4 py-3 text-left text-xs font-medium text-ledger-muted transition-colors hover:bg-ledger-hover"
                  >
                    Recycle Bin
                  </button>
                  <a
                    href="#delete-khata"
                    className="block px-4 py-3 text-xs font-medium text-ledger-muted transition-colors hover:bg-ledger-hover"
                  >
                    Delete Khata
                  </a>
                </div>
              )}
            </div>

            {/* 3 & 4. Quick info row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-ledger-border bg-ledger-paper px-4 py-3.5 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ledger-brass/10 text-ledger-brass-dark">
                    <Star size={16} />
                  </div>
                  <span className="text-xs font-semibold text-ledger-ink sm:text-sm">
                    Subscription
                  </span>
                </div>
                <span className="font-serif text-xs font-semibold text-ledger-green sm:text-sm">
                
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-ledger-border bg-ledger-paper px-4 py-3.5 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ledger-border-soft text-ledger-muted">
                    <History size={16} />
                  </div>
                  <span className="text-xs font-semibold text-ledger-ink sm:text-sm">
                    Payment History
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Other Apps Accordion */}
            <div className="overflow-hidden rounded-xl border border-ledger-border bg-ledger-paper shadow-2xs">
              <button
                type="button"
                onClick={() => setOpenOtherApps(!openOtherApps)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-ledger-hover"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ledger-ink/5 text-ledger-ink">
                    <Grid size={16} />
                  </div>
                  <span className="text-xs font-semibold text-ledger-ink sm:text-sm">
                    Other Apps
                  </span>
                </div>
                {openOtherApps ? (
                  <ChevronUp size={16} className="text-ledger-faint" />
                ) : (
                  <ChevronDown size={16} className="text-ledger-faint" />
                )}
              </button>

              {openOtherApps && (
                <div className="divide-y divide-ledger-border-soft border-t border-ledger-border-soft bg-ledger-paper">
                  {/* App Item 1 */}
                  <div className="px-4 py-3">
                    <div className="mb-1 text-[11px] font-semibold text-ledger-faint">
                      For EMI collection
                    </div>
                    <a
                      href="https://emichart.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-ledger-brass-dark hover:underline"
                    >
                      <span className="flex h-4 w-4 items-center justify-center rounded-xs bg-ledger-brass-light text-[8px] font-bold text-ledger-ink">
                        EMI
                      </span>
                      <span>emichart.com</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* App Item 2 */}
                  <div className="px-4 py-3">
                    <div className="mb-1 text-[11px] font-semibold text-ledger-faint">
                      For Live Notebook
                    </div>
                    <a
                      href="https://notebook77.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-ledger-brass-dark hover:underline"
                    >
                      <span className="text-xs">📑</span>
                      <span>notebook77.com</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* App Item 3 */}
                  <div className="px-4 py-3">
                    <div className="mb-1 text-[11px] font-semibold text-ledger-faint">
                      For Manage Committee
                    </div>
                    <a
                      href="https://cmt77.com"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-ledger-brass-dark hover:underline"
                    >
                      <span>cmt77.com</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Help & Support Accordion */}
            <div className="overflow-hidden rounded-xl border border-ledger-border bg-ledger-paper shadow-2xs">
              <button
                type="button"
                onClick={() => setOpenHelpSupport(!openHelpSupport)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-ledger-hover"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ledger-green/10 text-ledger-green">
                    <HelpCircle size={16} />
                  </div>
                  <span className="text-xs font-semibold text-ledger-ink sm:text-sm">
                    Help &amp; Support
                  </span>
                </div>
                {openHelpSupport ? (
                  <ChevronUp size={16} className="text-ledger-faint" />
                ) : (
                  <ChevronDown size={16} className="text-ledger-faint" />
                )}
              </button>

              {openHelpSupport && (
                <div className="space-y-1.5 border-t border-ledger-border-soft bg-ledger-paper px-4 py-3.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-ledger-ink">
                    <Phone size={14} className="text-ledger-muted" />
                    <span>+91 8295674272</span>
                  </div>
                  <div className="pl-5 text-[11px] font-semibold text-ledger-faint">
                    From: 11:00 AM To 04:00 PM
                  </div>
                </div>
              )}
            </div>

            {/* 7. About Us Accordion */}
            <div className="overflow-hidden rounded-xl border border-ledger-border bg-ledger-paper shadow-2xs">
              <button
                type="button"
                onClick={() => setOpenAboutUs(!openAboutUs)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-ledger-hover"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ledger-border-soft text-ledger-muted">
                    <Info size={16} />
                  </div>
                  <span className="text-xs font-semibold text-ledger-ink sm:text-sm">
                    About Us
                  </span>
                </div>
                {openAboutUs ? (
                  <ChevronUp size={16} className="text-ledger-faint" />
                ) : (
                  <ChevronDown size={16} className="text-ledger-faint" />
                )}
              </button>

              {openAboutUs && (
                <div className="border-t border-ledger-border-soft bg-ledger-paper">
                  <a
                    href="#about-app"
                    className="block border-b border-ledger-border-soft px-4 py-3 text-xs font-medium text-ledger-muted transition-colors hover:bg-ledger-hover"
                  >
                    About App
                  </a>
                  <a
                    href="#privacy-policy"
                    className="block border-b border-ledger-border-soft px-4 py-3 text-xs font-medium text-ledger-muted transition-colors hover:bg-ledger-hover"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#terms-conditions"
                    className="block px-4 py-3 text-xs font-medium text-ledger-muted transition-colors hover:bg-ledger-hover"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-ledger-red/30 bg-ledger-paper py-3 text-xs font-semibold text-ledger-red transition-all hover:bg-ledger-red/5 active:scale-[0.99]"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
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
          <p className="text-center text-sm font-medium text-slate-600">
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