"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  
  // Identify if we are on an auth page
  const isAuthPage = ["/login", "/register", "/forgot-password", "/reset-password"].some(
    (path) => pathname === path || pathname?.startsWith(path + "/")
  );

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div
      className="flex min-h-screen bg-nebula-bg text-nebula-on-surface"
      onClick={() => {
        setIsMobileSidebarOpen(false);
        setIsDesktopSidebarOpen(false);
      }}
    >
      {/* Sidebar Padding for Fixed Sidebar */}
      <div className={`hidden md:block transition-[width] duration-300 ${isDesktopSidebarOpen ? "w-80" : "w-0"}`} />
      <div onClick={(event) => event.stopPropagation()}>
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          isDesktopOpen={isDesktopSidebarOpen}
          onClose={() => {
            setIsMobileSidebarOpen(false);
            setIsDesktopSidebarOpen(false);
          }}
          onNavigate={() => {
            setIsMobileSidebarOpen(false);
            setIsDesktopSidebarOpen(false);
          }}
        />
      </div>
      {isMobileSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
      
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar
          onMenuClick={(event) => {
            event.stopPropagation();
            setIsMobileSidebarOpen(true);
            setIsDesktopSidebarOpen((isOpen) => !isOpen);
          }}
        />
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
