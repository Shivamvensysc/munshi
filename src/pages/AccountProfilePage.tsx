import React, { useState } from "react";
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

export default function AccountProfilePage() {
  const [storeName, setStoreName] = useState("Maa Sharda Store");
  const [isEditing, setIsEditing] = useState(false);

  // Accordion Expand/Collapse States (All set to false by default)
  const [openAccount, setOpenAccount] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openOtherApps, setOpenOtherApps] = useState(false);
  const [openHelpSupport, setOpenHelpSupport] = useState(false);
  const [openAboutUs, setOpenAboutUs] = useState(false);

  const handleLogout = () => {
    alert("Logged out successfully");
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 p-2 sm:p-6 font-sans text-slate-800 flex justify-center items-start pt-4 sm:pt-8">
      
      {/* Main Container */}
      <div className="w-full max-w-6xl rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        
        {/* Header Section */}
        <header className="relative flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-black text-sm tracking-wider shadow-2xs">
              MSS
            </div>
          </div>

          <div className="flex-1 text-center px-2">
            {isEditing ? (
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                onBlur={() => setIsEditing(false)}
                autoFocus
                className="text-center font-bold text-slate-700 text-base sm:text-lg border-b border-indigo-500 outline-none"
              />
            ) : (
              <h1 className="text-sm font-bold text-slate-600 sm:text-base tracking-wide">
                {storeName}
              </h1>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 rounded-md bg-[#3c2a93] px-3.5 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#32227d] active:scale-95 shadow-2xs cursor-pointer"
          >
            <Pencil size={13} />
            <span>Edit</span>
          </button>
        </header>

        {/* Content Accordions Stack */}
        <div className="p-3 sm:p-5 space-y-3">

          {/* 1. Account Section */}
          <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setOpenAccount(!openAccount)}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <User size={18} className="text-slate-700" />
                <span className="text-xs font-bold text-slate-700 sm:text-sm">Account</span>
              </div>
              {openAccount ? (
                <ChevronUp size={16} className="text-slate-500" />
              ) : (
                <ChevronDown size={16} className="text-slate-500" />
              )}
            </button>

            {openAccount && (
              <div className="border-t border-slate-100 bg-white">
                <a
                  href="#profile"
                  className="block px-4 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-50 border-b border-slate-100 transition-colors"
                >
                  View Profile
                </a>
                <a
                  href="#password"
                  className="block px-4 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Change Password
                </a>
              </div>
            )}
          </div>

          {/* 2. Settings Section */}
          <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setOpenSettings(!openSettings)}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Settings size={18} className="text-slate-700" />
                <span className="text-xs font-bold text-slate-700 sm:text-sm">Settings</span>
              </div>
              {openSettings ? (
                <ChevronUp size={16} className="text-slate-500" />
              ) : (
                <ChevronDown size={16} className="text-slate-500" />
              )}
            </button>

            {openSettings && (
              <div className="border-t border-slate-100 bg-white">
                <a
                  href="#recycle-bin"
                  className="block px-4 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-50 border-b border-slate-100 transition-colors"
                >
                  Recycle Bin
                </a>
                <a
                  href="#delete-khata"
                  className="block px-4 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Delete Khata
                </a>
              </div>
            )}
          </div>

          {/* 3. Subscription Bar */}
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Star size={18} className="text-slate-700" />
              <span className="text-xs font-bold text-slate-700 sm:text-sm">Subscription</span>
            </div>
            <span className="text-xs font-black text-emerald-600 sm:text-sm">
              Expire in: 27 Free Days
            </span>
          </div>

          {/* 4. Payment History */}
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <History size={18} className="text-slate-700" />
              <span className="text-xs font-bold text-slate-700 sm:text-sm">Payment History</span>
            </div>
          </div>

          {/* 5. Other Apps Accordion */}
          <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setOpenOtherApps(!openOtherApps)}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Grid size={18} className="text-slate-700" />
                <span className="text-xs font-bold text-slate-700 sm:text-sm">Other Apps</span>
              </div>
              {openOtherApps ? (
                <ChevronUp size={16} className="text-slate-500" />
              ) : (
                <ChevronDown size={16} className="text-slate-500" />
              )}
            </button>

            {openOtherApps && (
              <div className="border-t border-slate-100 bg-white space-y-0 divide-y divide-slate-100">
                {/* App Item 1 */}
                <div className="px-4 py-3">
                  <div className="text-[11px] font-bold text-slate-400 mb-1">
                    For EMI collection
                  </div>
                  <a
                    href="https://emichart.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-800 hover:underline"
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
                  <div className="text-[11px] font-bold text-slate-400 mb-1">
                    For Live Notebook
                  </div>
                  <a
                    href="https://notebook77.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-800 hover:underline"
                  >
                    <span className="text-xs">📑</span>
                    <span>notebook77.com</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* App Item 3 */}
                <div className="px-4 py-3">
                  <div className="text-[11px] font-bold text-slate-400 mb-1">
                    For Manage Committee
                  </div>
                  <a
                    href="https://cmt77.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-800 hover:underline"
                  >
                    <span>cmt77.com</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 6. Help & Support Accordion */}
          <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setOpenHelpSupport(!openHelpSupport)}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle size={18} className="text-slate-700" />
                <span className="text-xs font-bold text-slate-700 sm:text-sm">Help & Support</span>
              </div>
              {openHelpSupport ? (
                <ChevronUp size={16} className="text-slate-500" />
              ) : (
                <ChevronDown size={16} className="text-slate-500" />
              )}
            </button>

            {openHelpSupport && (
              <div className="border-t border-slate-100 bg-white px-4 py-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Phone size={14} className="text-slate-500" />
                  <span>+91 8295674272</span>
                </div>
                <div className="text-[11px] font-bold text-slate-400 pl-5">
                  From: 11:00 AM To 04:00 PM
                </div>
              </div>
            )}
          </div>

          {/* 7. About Us Accordion */}
          <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setOpenAboutUs(!openAboutUs)}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Info size={18} className="text-slate-700" />
                <span className="text-xs font-bold text-slate-700 sm:text-sm">About Us</span>
              </div>
              {openAboutUs ? (
                <ChevronUp size={16} className="text-slate-500" />
              ) : (
                <ChevronDown size={16} className="text-slate-500" />
              )}
            </button>

            {openAboutUs && (
              <div className="border-t border-slate-100 bg-white">
                <a
                  href="#about-app"
                  className="block px-4 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-50 border-b border-slate-100 transition-colors"
                >
                  About App
                </a>
                <a
                  href="#privacy-policy"
                  className="block px-4 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-50 border-b border-slate-100 transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#terms-conditions"
                  className="block px-4 py-3 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Terms & Conditions
                </a>
              </div>
            )}
          </div>

          {/* 8. Logout Action Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-purple-900 bg-white py-2.5 mt-4 text-xs font-bold text-purple-900 transition-all hover:bg-purple-50 active:scale-[0.99] cursor-pointer"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>

        </div>

      </div>

    </div>
  );
}