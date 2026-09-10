import React, { useState } from "react";
import {
  MoreHorizontal,
  Users,
  IndianRupee,
  ArrowRightLeft,
} from "lucide-react";

export default function BottomNavigation() {
  // 'more' is set as active by default (blue highlighted) as shown in the design image
  const [activeTab, setActiveTab] = useState<string>("more");

  const navItems = [
    {
      id: "more",
      label: "More",
      icon: MoreHorizontal,
    },
    {
      id: "customers",
      label: "Customers",
      icon: Users,
    },
    {
      id: "transaction",
      label: "Transaction",
      icon: IndianRupee,
    },
    {
      id: "cross-entry",
      label: "Cross Entry",
      icon: ArrowRightLeft,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 w-full border-t border-slate-200 bg-white shadow-xs">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-around px-2 sm:px-8">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`group flex flex-1 flex-col items-center justify-center py-1 transition-all duration-150 cursor-pointer ${
                isActive ? "text-blue-600" : "text-slate-900 hover:text-blue-600"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <IconComponent
                  size={24}
                  className={`transition-transform duration-150 group-active:scale-95 ${
                    isActive
                      ? "text-blue-600 stroke-[2.8]"
                      : "text-slate-950 stroke-[2.2] group-hover:text-blue-600"
                  }`}
                />
              </div>

              <span
                className={`mt-1 text-xs sm:text-sm tracking-tight leading-tight transition-colors ${
                  isActive
                    ? "font-semibold text-blue-600"
                    : "font-medium text-slate-800 group-hover:text-blue-600"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}