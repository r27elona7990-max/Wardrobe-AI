"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Identify if we are on an auth page
  const isAuthPage = ["/login", "/register", "/forgot-password", "/reset-password"].some(
    (path) => pathname === path || pathname?.startsWith(path + "/")
  );

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-nebula-bg text-nebula-on-surface">
      {/* Sidebar Padding for Fixed Sidebar */}
      <div className="w-80 hidden md:block" />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}
      
      <main className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
