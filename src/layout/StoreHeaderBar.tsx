import React, { useState, useRef, useEffect } from "react";
import { BookOpen, Plus, ChevronDown, Check, Menu, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Khata {
  id: string;
  name: string;
}

interface StoreHeaderBarProps {
  onMenuClick: () => void;
}

export default function StoreHeaderBar({ onMenuClick }: StoreHeaderBarProps) {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // List of Khatas (empty by default to show "Create Khata")
  const [khatasList, setKhatasList] = useState<Khata[]>([]);

  // Selected Khata ID
  const [selectedKhataId, setSelectedKhataId] = useState<string | null>(null);

  // Dropdown open/close state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateKhataNavigate = () => {
    setIsDropdownOpen(false);
    navigate("/create-khata");
  };

  const handleAddCustomer = () => {
    alert("Add Customer clicked!");
  };

  const selectedKhata = khatasList.find((item) => item.id === selectedKhataId);

  return (
    <header className="relative z-30 w-full border-b border-slate-200/70 bg-white/90 px-3 py-3 shadow-sm backdrop-blur-md sm:px-6">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left cluster: hamburger (mobile) + khata selector */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {/* Hamburger — visible only below the lg breakpoint, where the sidebar is off-canvas */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Toggle menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-brand-900 transition-colors hover:bg-brand-50 active:scale-95 lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Khata Dropdown Container */}
          <div className="relative min-w-0" ref={dropdownRef}>
            {khatasList.length === 0 ? (
              /* DEFAULT STATE: No Khata exists -> Shows "Create Khata" */
              <button
                type="button"
                onClick={handleCreateKhataNavigate}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-700 to-brand-600 px-2.5 py-2 text-xs font-semibold text-white shadow-sm shadow-brand-600/20 transition-all hover:from-brand-600 hover:to-brand-500 active:scale-95 sm:gap-2 sm:px-4 sm:text-sm cursor-pointer"
              >
                <Plus size={16} className="shrink-0 stroke-[2.5]" />
                <span className="whitespace-nowrap">Create Khata</span>
              </button>
            ) : (
              /* STATE: When Khatas exist -> Displays selected Khata with dropdown option */
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-brand-900 shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50 active:scale-95 sm:gap-2 sm:px-4 sm:text-sm cursor-pointer"
              >
                <BookOpen size={16} className="shrink-0 text-brand-600" />
                <span className="truncate max-w-[110px] xs:max-w-[160px] sm:max-w-[220px]">
                  {selectedKhata?.name || "Select Khata"}
                </span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}

            {/* Dropdown Menu (Available when Khatas exist) */}
            {isDropdownOpen && khatasList.length > 0 && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl transition-all z-50 sm:w-64">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Your Khatas
                </div>

                {/* List of Khatas */}
                <div className="max-h-48 divide-y divide-slate-100 overflow-y-auto">
                  {khatasList.map((khata) => {
                    const isSelected = khata.id === selectedKhataId;
                    return (
                      <button
                        key={khata.id}
                        type="button"
                        onClick={() => {
                          setSelectedKhataId(khata.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-slate-50 sm:text-sm cursor-pointer ${
                          isSelected ? "bg-brand-50/60 text-brand-700" : "text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <BookOpen size={14} className={isSelected ? "text-brand-600" : "text-slate-400"} />
                          <span className="truncate">{khata.name}</span>
                        </div>
                        {isSelected && <Check size={14} className="shrink-0 text-brand-600" />}
                      </button>
                    );
                  })}
                </div>

                {/* Action to create another new Khata inside dropdown */}
                <div className="mt-1 border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={handleCreateKhataNavigate}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-50 sm:text-sm cursor-pointer"
                  >
                    <Plus size={15} className="stroke-[2.5]" />
                    <span>+ Create New Khata</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right cluster: add customer + profile avatar */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleAddCustomer}
            className="flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-violet-700 to-violet-600 px-2.5 py-2 text-xs font-semibold text-white shadow-sm shadow-violet-600/25 transition-all hover:from-violet-600 hover:to-violet-500 active:scale-95 sm:gap-1.5 sm:px-4 sm:text-sm cursor-pointer"
          >
            <Plus size={16} className="shrink-0 stroke-[2.5]" />
            <span className="whitespace-nowrap">Add Customer</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/account-profile-page")}
            aria-label="Account"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-brand-700 transition-colors hover:bg-brand-50 sm:flex"
          >
            <UserCircle2 size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
