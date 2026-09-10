import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import StoreHeaderBar from "./StoreHeaderBar";

const Index: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Auto-close the off-canvas sidebar whenever the route changes (mobile/tablet)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-ink-50 font-sans text-ink-900">
      {/* Sidebar: fixed off-canvas drawer on small screens, static column on lg+ */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Right side: header + scrollable content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Fixed Top Header */}
        <div className="sticky top-0 z-30 w-full shrink-0">
          <StoreHeaderBar onMenuClick={() => setIsSidebarOpen((open) => !open)} />
        </div>

        {/* Main Content Area (Scrollable Middle Body) */}
        <main className="flex-1 overflow-y-auto bg-ink-50 p-2 sm:p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
