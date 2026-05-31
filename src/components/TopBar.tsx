"use client";

import { Search, Bell, Sun, Menu } from "lucide-react";

type TopBarProps = {
  onMenuClick: () => void;
};

export default function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header className="h-16 flex items-center justify-between gap-3 px-4 md:px-8 bg-transparent">
      <button
        type="button"
        onClick={onMenuClick}
        className="md:hidden shrink-0 p-2 rounded-full hover:bg-black/5 text-nebula-on-surface/60 transition-colors"
        aria-label="Open sidebar"
      >
        <Menu size={22} />
      </button>

      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nebula-on-surface/30 group-focus-within:text-nebula-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search your drip..." 
            className="w-full bg-nebula-surface/10 border border-black/5 rounded-full py-2 pl-10 pr-4 outline-none focus:border-nebula-primary/50 focus:bg-black/5 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 rounded-full hover:bg-black/5 text-nebula-on-surface/60 transition-colors">
          <Bell size={20} />
        </button>
        
        <div className="hidden sm:block h-4 w-[1px] bg-black/10 mx-2" />
        
        <button className="flex items-center gap-2 p-1 sm:pr-3 rounded-full bg-nebula-primary/10 border border-nebula-primary/20 text-nebula-primary hover:bg-nebula-primary/20 transition-all">
          <div className="w-6 h-6 rounded-full bg-nebula-primary flex items-center justify-center text-nebula-bg">
            <Sun size={14} />
          </div>
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">Light</span>
        </button>
      </div>
    </header>
  );
}
