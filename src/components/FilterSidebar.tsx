"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Filter, X } from "lucide-react";

const categories = ["Tops", "Bottoms", "Outerwear", "Shoes", "Accessories"];
const seasons = ["Summer", "Winter", "Spring/Fall"];
const colors = [
  { name: "Nebula Blue", class: "bg-nebula-primary" },
  { name: "Soft Pink", class: "bg-nebula-secondary" },
  { name: "Lavender", class: "bg-nebula-tertiary" },
  { name: "Mint", class: "bg-pastel-mint" },
];

interface FilterSidebarProps {
  activeCategory?: string;
  activeSeason?: string;
  activeColor?: string;
  searchQuery?: string;
}

export default function FilterSidebar({
  activeCategory = "",
  activeSeason = "",
  activeColor = "",
  searchQuery = "",
}: FilterSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  
  // Helper to build URL preserving other query options
  const buildQueryUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams();
    
    if (activeCategory) params.set("category", activeCategory);
    if (activeSeason) params.set("season", activeSeason);
    if (activeColor) params.set("color", activeColor);
    if (searchQuery) params.set("q", searchQuery);

    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === "All") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    const queryString = params.toString();
    return `/closet${queryString ? `?${queryString}` : ""}`;
  };

  const hasActiveFilters = activeCategory || activeSeason || activeColor;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsMobileOpen(true);
          setIsDesktopOpen((isOpen) => !isOpen);
        }}
        className="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full bg-nebula-surface/70 border border-black/5 text-nebula-on-surface/70 font-bold text-xs uppercase tracking-widest hover:text-nebula-primary transition-colors"
        aria-label="Open closet filters"
      >
        <Filter size={16} />
        Filters
      </button>

      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close closet filters overlay"
        />
      )}

    <aside
      className={`fixed left-0 top-0 z-50 m-4 h-[calc(100vh-2rem)] w-72 max-w-[calc(100vw-2rem)] space-y-8 overflow-y-auto rounded-nebula glass p-6 transition-transform duration-300 ease-out ${
        isMobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]"
      } ${
        isDesktopOpen
          ? "md:sticky md:top-24 md:z-auto md:m-0 md:h-fit md:w-64 md:max-w-none md:translate-x-0 md:overflow-visible md:rounded-none md:border-r md:border-black/5 md:bg-transparent md:p-0 md:pr-6 md:shadow-none md:backdrop-blur-0"
          : "md:hidden"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-nebula-on-surface/40">
          <Filter size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Filter By</span>
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
          <Link 
            href="/closet" 
            onClick={() => setIsMobileOpen(false)}
            className="text-[10px] font-bold text-red-500 hover:underline flex items-center gap-1 uppercase tracking-widest"
          >
            <X size={10} /> Clear
          </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setIsMobileOpen(false);
              setIsDesktopOpen(false);
            }}
            className="p-2 -mr-2 rounded-full hover:bg-black/5 text-nebula-on-surface/60 transition-colors"
            aria-label="Close closet filters"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Category */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-nebula-on-surface">Category</h4>
          <div className="space-y-1">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <Link 
                  key={cat} 
                  href={buildQueryUrl({ category: isActive ? null : cat })}
                  onClick={() => setIsMobileOpen(false)}
                  className={`w-full flex justify-between items-center group/btn py-2 px-3 rounded-nebula-inner transition-all text-sm ${
                    isActive 
                      ? "bg-nebula-primary/10 text-nebula-primary font-bold" 
                      : "text-nebula-on-surface/60 hover:bg-black/5 hover:text-nebula-primary"
                  }`}
                >
                  <span>{cat}</span>
                  <ChevronRight size={14} className={`transition-opacity ${isActive ? "opacity-100 text-nebula-primary" : "opacity-0 group-hover/btn:opacity-100"}`} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Season */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-nebula-on-surface">Season</h4>
          <div className="flex flex-wrap gap-2">
            {seasons.map((season) => {
              const isActive = activeSeason === season;
              return (
                <Link 
                  key={season} 
                  href={buildQueryUrl({ season: isActive ? null : season })}
                  onClick={() => setIsMobileOpen(false)}
                  className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all ${
                    isActive 
                      ? "bg-nebula-primary border-nebula-primary text-nebula-bg" 
                      : "border-black/5 bg-black/5 text-nebula-on-surface/40 hover:border-nebula-primary/50 hover:text-nebula-primary"
                  }`}
                >
                  {season}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-nebula-on-surface">Color Palette</h4>
          <div className="grid grid-cols-2 gap-2">
            {colors.map((color) => {
              const isActive = activeColor === color.name;
              return (
                <Link 
                  key={color.name} 
                  href={buildQueryUrl({ color: isActive ? null : color.name })}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-2 p-2 rounded-nebula-inner border transition-all ${
                    isActive 
                      ? "bg-nebula-secondary/15 border-nebula-secondary/40 font-bold" 
                      : "hover:bg-black/5 border-transparent hover:border-black/10"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${color.class} ${isActive ? "ring-2 ring-nebula-secondary ring-offset-2" : ""}`} />
                  <span className={`text-[10px] ${isActive ? "text-nebula-secondary" : "text-nebula-on-surface/60"}`}>{color.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
