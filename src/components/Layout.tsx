import type { ReactNode } from "react";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

export default function Layout({
  children,
  showTopBar = true,
}: {
  children: ReactNode;
  showTopBar?: boolean;
}) {
  return (
    <div className="min-h-full bg-ink-50">
      <div className="mx-auto min-h-full max-w-md bg-ink-50 pb-24 shadow-[0_0_60px_-15px_rgba(15,42,104,0.25)] sm:my-0">
        {showTopBar && <TopBar />}
        <main className="px-4 pt-4">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
