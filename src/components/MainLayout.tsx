"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
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
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        <TopBar />
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
