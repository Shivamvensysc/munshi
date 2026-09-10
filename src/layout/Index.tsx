import React from "react";
import { Outlet } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";
import StoreHeaderBar from "./StoreHeaderBar";

const Index: React.FC = () => {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-100 font-sans text-slate-800">
      {/* Fixed Top Header */}
      <div className="sticky top-0 z-50 w-full shrink-0">
        <StoreHeaderBar />
      </div>

      {/* Main Content Area (Scrollable Middle Body) */}
      <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>

      {/* Fixed Bottom Navigation */}
      <div className="sticky bottom-0 z-50 w-full shrink-0">
        <BottomNavigation />
      </div>
    </div>
  );
};

export default Index;