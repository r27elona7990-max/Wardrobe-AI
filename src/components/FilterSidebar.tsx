import Link from "next/link";
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
    <aside className="w-64 space-y-8 pr-6 border-r border-black/5 h-fit sticky top-24">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-nebula-on-surface/40">
          <Filter size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Filter By</span>
        </div>
        {hasActiveFilters && (
          <Link 
            href="/closet" 
            className="text-[10px] font-bold text-red-500 hover:underline flex items-center gap-1 uppercase tracking-widest"
          >
            <X size={10} /> Clear
          </Link>
        )}
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
  );
}
