import React from "react";
import { Outlet } from "react-router-dom";
import BottomNavBar from "./BottomNavBar";
import StoreHeaderBar from "./StoreHeaderBar";
import { KhataProvider } from "../context/KhataContext";

const Index: React.FC = () => {
  return (
    // KhataProvider wraps both the header (which selects the khata) and the
    // Outlet (every page that reads it), so selecting a khata up top is
    // instantly visible to whichever page is currently mounted — no
    // navigation/remount required to pick up the new value.
    <KhataProvider>
      <div className="flex h-screen w-full flex-col overflow-hidden bg-ink-50 font-sans text-ink-900">
        {/* Fixed Top Header — z-40 keeps this (and anything it opens, like
            the khata dropdown) above every page's own sticky header/footer,
            which all use z-20 or lower. See CustomerDetail.tsx for why this
            matters: it has its own sticky in-page header at the same
            z-index tier, and DOM order alone would let it win ties and
            visually cover the khata dropdown otherwise. */}
        <div className="sticky top-0 z-40 w-full shrink-0">
          <StoreHeaderBar />
        </div>

        {/* Main Content Area (Scrollable Middle Body) — bottom padding keeps
            content clear of the fixed bottom nav bar. */}
        <main className="flex-1 overflow-y-auto bg-ink-50 p-2 pb-14 sm:p-4 sm:pb-14">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        {/* Bottom navigation — replaces the old off-canvas sidebar */}
        <BottomNavBar />
      </div>
    </KhataProvider>
  );
};

export default Index;
