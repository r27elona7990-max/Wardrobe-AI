"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Shirt,
  Upload,
  Palette,
  UserCircle,
  X
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Closet", href: "/closet", icon: Shirt },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Outfit Studio", href: "/studio", icon: Palette },
  { name: "Profile", href: "/profile", icon: UserCircle },
];

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 h-[calc(100vh-2rem)] w-64 glass m-4 rounded-nebula p-6 flex flex-col z-50 transition-transform duration-300 ease-out md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]"
      }`}
    >
      <div className="mb-10 flex items-center justify-between gap-3 px-2">
        <div className="text-nebula-primary font-bold text-2xl tracking-tighter">
          WARDROBE<span className="text-nebula-secondary"> AI</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="md:hidden p-2 rounded-full hover:bg-black/5 text-nebula-on-surface/60 transition-colors"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-nebula-inner transition-all duration-200 group ${isActive
                  ? "bg-nebula-primary/20 text-nebula-primary"
                  : "text-nebula-on-surface/60 hover:bg-black/5 hover:text-nebula-on-surface"
                }`}
            >
              <Icon size={20} className={`${isActive ? "text-nebula-primary" : "text-nebula-secondary group-hover:scale-110 transition-transform"}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-black/10">
        <div className="flex items-center gap-3 p-2 bg-nebula-surface/50 rounded-nebula-inner">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-nebula-primary to-nebula-secondary" />
          <div className="flex flex-col truncate">
            <span className="text-xs font-bold text-nebula-on-surface">Style Icon</span>
            <span className="text-[10px] text-nebula-on-surface/40">Free Spirit</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
