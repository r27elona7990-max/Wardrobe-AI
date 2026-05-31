import FilterSidebar from "@/components/FilterSidebar";
import DeleteButton from "@/components/DeleteButton";
import { Plus, SlidersHorizontal, Search, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface ClosetPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    season?: string;
    color?: string;
  }>;
}

export default async function ClosetPage({ searchParams }: ClosetPageProps) {
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const category = resolvedParams.category || "";
  const season = resolvedParams.season || "";
  const color = resolvedParams.color || "";

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as { id: string }).id;

  // Build the Prisma filters
  const where: any = {
    userId,
  };

  if (category) {
    where.category = category;
  }

  const andConditions: any[] = [];

  if (q) {
    andConditions.push({
      OR: [
        { name: { contains: q } },
        { tags: { contains: q } },
      ],
    });
  }

  if (season) {
    andConditions.push({
      tags: { contains: season },
    });
  }

  if (color) {
    andConditions.push({
      tags: { contains: color },
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  // Load items from database
  const items: any[] = await prisma.clothingItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const getDisplayColor = (tags: string | null) => {
    if (!tags) return "Neutral Vibe";
    const tagArray = tags.split(",").map((t) => t.trim());
    // Common colors / tags to show as primary color label
    const activeLabel = tagArray.find((t) =>
      ["Nebula Blue", "Soft Pink", "Lavender", "Mint", "Summer", "Winter", "Spring/Fall"].includes(t)
    );
    return activeLabel || tagArray[0] || "Custom Fit";
  };

  const getPlaceholderClass = (itemCategory: string) => {
    switch (itemCategory) {
      case "Tops":
        return "bg-pastel-pink/20";
      case "Bottoms":
        return "bg-nebula-primary/20";
      case "Outerwear":
        return "bg-nebula-tertiary/20";
      case "Shoes":
        return "bg-pastel-mint/20";
      default:
        return "bg-nebula-secondary/20";
    }
  };

  return (
    <div className="flex flex-col gap-6 md:flex-row md:gap-10">
      {/* Sidebar Filter Component */}
      <FilterSidebar 
        activeCategory={category}
        activeSeason={season}
        activeColor={color}
        searchQuery={q}
      />

      {/* Main Content */}
      <div className="flex-1 space-y-8 min-w-0">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter">My Wardrobe</h1>
            <p className="text-sm text-nebula-on-surface/40">Broadcasting your style identity ({items.length} items)</p>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Dynamic search input via native form */}
             <form action="/closet" method="GET" className="relative group">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nebula-on-surface/30 group-focus-within:text-nebula-primary" />
                <input 
                  type="text" 
                  name="q"
                  defaultValue={q}
                  placeholder="Find a piece..." 
                  className="bg-nebula-surface/50 border border-black/5 rounded-full py-2 pl-9 pr-4 text-xs outline-none focus:border-nebula-primary/50 transition-all w-48 md:w-64"
                />
                {category && <input type="hidden" name="category" value={category} />}
                {season && <input type="hidden" name="season" value={season} />}
                {color && <input type="hidden" name="color" value={color} />}
             </form>
             
             {/* Reset button to clear all parameters */}
             {(q || category || season || color) && (
               <Link 
                 href="/closet" 
                 className="p-2 rounded-full border border-black/5 bg-black/5 text-nebula-on-surface/60 hover:text-red-500 transition-colors"
                 title="Clear Filters"
               >
                 <SlidersHorizontal size={18} />
               </Link>
             )}

             <Link 
               href="/upload" 
               className="flex items-center gap-2 px-5 py-2.5 bg-nebula-primary text-nebula-bg font-bold rounded-full text-xs shadow-lg shadow-nebula-primary/10 hover:scale-105 active:scale-95 transition-all"
             >
                <Plus size={16} />
                <span>Upload</span>
             </Link>
          </div>
        </div>

        {/* Gallery Grid */}
        {items.length === 0 ? (
          <div className="py-20 text-center glass rounded-nebula border border-black/5 space-y-4">
            <p className="text-nebula-on-surface/40 font-bold uppercase tracking-widest text-sm">No items found in your vault</p>
            <p className="text-xs text-nebula-on-surface/30 max-w-sm mx-auto">Upload clothing pieces or clear active filters to discover your style identity.</p>
            <Link 
              href="/upload" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-nebula-secondary text-nebula-bg font-bold rounded-full text-xs hover:scale-105 active:scale-95 transition-all"
            >
              Upload First Piece
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item: any) => (
              <div key={item.id} className="group cursor-pointer">
                <div className="aspect-[3/4] rounded-nebula glass overflow-hidden relative border border-black/5 group-hover:border-nebula-primary/30 transition-all">
                  {/* Background pastel glow */}
                  <div className={`absolute inset-4 rounded-nebula-inner ${getPlaceholderClass(item.category)} filter blur-sm group-hover:scale-110 transition-transform duration-500`} />
                  
                  {/* Dynamic Uploaded Image */}
                  {item.imagePath && (
                    <div className="absolute inset-0 p-4">
                      <div className="relative w-full h-full rounded-nebula-inner overflow-hidden">
                        <Image 
                          src={item.imagePath} 
                          alt={item.name} 
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"

                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Hover Overlay with Delete Action */}
                  <div className="absolute inset-x-4 bottom-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all z-20">
                    <div className="flex-1 py-2 bg-black/40 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-white rounded-full text-center hover:bg-black/60 transition-colors">
                      {item.category}
                    </div>
                    {/* Delete button component to drop files and DB records */}
                    <DeleteButton id={item.id} />
                  </div>
                </div>
                
                <div className="mt-4 px-2 space-y-1">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-bold text-nebula-on-surface/40 uppercase tracking-widest">{item.category}</p>
                    <div className="w-2 h-2 rounded-full border border-black/20 bg-nebula-secondary/30" />
                  </div>
                  <h4 className="font-bold text-sm text-nebula-on-surface group-hover:text-nebula-primary transition-colors truncate">{item.name}</h4>
                  <p className="text-[10px] font-medium text-nebula-on-surface/30 truncate">{getDisplayColor(item.tags)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
