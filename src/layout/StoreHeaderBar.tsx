import React, { useState, useRef, useEffect } from "react";
import { BookOpen, Plus, ChevronDown, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Khata {
  id: string;
  name: string;
}

export default function StoreHeaderBar() {
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
    <header className="w-full bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 px-3 py-2.5 sm:px-6 sm:py-3.5 shadow-md relative z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">
        
        {/* Left Action Button & Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          {khatasList.length === 0 ? (
            /* DEFAULT STATE: No Khata exists -> Shows "Create Khata" */
            <button
              type="button"
              onClick={handleCreateKhataNavigate}
              className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-md border border-white/80 bg-transparent px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95 cursor-pointer shadow-xs"
            >
              <Plus size={16} className="text-white shrink-0 stroke-[2.5]" />
              <span className="whitespace-nowrap">Create Khata</span>
            </button>
          ) : (
            /* STATE: When Khatas exist -> Displays selected Khata with dropdown option */
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-md border border-white/80 bg-transparent px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95 cursor-pointer shadow-xs"
            >
              <BookOpen size={16} className="text-white shrink-0" />
              <span className="truncate max-w-[110px] xs:max-w-[160px] sm:max-w-[220px]">
                {selectedKhata?.name || "Select Khata"}
              </span>
              <ChevronDown
                size={14}
                className={`text-white transition-transform duration-200 shrink-0 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          )}

          {/* Dropdown Menu (Available when Khatas exist) */}
          {isDropdownOpen && khatasList.length > 0 && (
            <div className="absolute left-0 mt-2 w-56 sm:w-64 rounded-lg border border-slate-200 bg-white py-1.5 shadow-xl transition-all z-50">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Your Khatas
              </div>

              {/* List of Khatas */}
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
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
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs sm:text-sm font-medium transition-colors hover:bg-slate-50 cursor-pointer ${
                        isSelected ? "text-blue-600 bg-blue-50/50" : "text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <BookOpen size={14} className={isSelected ? "text-blue-600" : "text-slate-400"} />
                        <span className="truncate">{khata.name}</span>
                      </div>
                      {isSelected && <Check size={14} className="text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Action to create another new Khata inside dropdown */}
              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  type="button"
                  onClick={handleCreateKhataNavigate}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs sm:text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <Plus size={15} className="stroke-[2.5]" />
                  <span>+ Create New Khata</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Action Button (+ Add Customer) */}
        <button
          type="button"
          onClick={handleAddCustomer}
          className="flex items-center justify-center gap-1 sm:gap-1.5 rounded-md border border-white/80 bg-transparent px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95 cursor-pointer shadow-xs shrink-0"
        >
          <Plus size={16} className="text-white shrink-0 stroke-[2.5]" />
          <span className="whitespace-nowrap">Add Customer</span>
        </button>

      </div>
    </header>
  );
}