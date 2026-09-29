import { Sparkles, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import PackingListGenerator from "@/components/PackingListGenerator";
import SavedFits from "@/components/SavedFits";
import WardrobeStatsPanel from "@/components/WardrobeStatsPanel";
import WardrobeImage from "@/components/WardrobeImage";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as { id: string }).id;

  const [totalDrops, totalOutfits, recentItems, allItems, savedOutfits, latestOutfit] =
    await Promise.all([
      prisma.clothingItem.count({ where: { userId } }),
      prisma.outfit.count({ where: { userId } }),
      prisma.clothingItem.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.clothingItem.findMany({
        where: { userId },
        select: { id: true, name: true, category: true, tags: true },
      }),
      prisma.outfit.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 6,
        include: {
          items: {
            orderBy: { position: "asc" },
            select: { clothingItemId: true },
          },
        },
      }),
      prisma.outfit.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            orderBy: { position: "asc" },
            include: { clothingItem: true },
          },
        },
      }),
    ]);

  const savedOutfitCards = savedOutfits.map((outfit) => ({
    id: outfit.id,
    name: outfit.name,
    itemIds: outfit.items.map((item) => item.clothingItemId),
    createdAt: outfit.createdAt.toISOString(),
  }));

  // Calculate most common tag / color
  const tagCounts: Record<string, number> = {};
  allItems.forEach((item) => {
    if (item.tags) {
      item.tags.split(",").forEach((tag) => {
        const trimmed = tag.trim();
        if (trimmed) {
          tagCounts[trimmed] = (tagCounts[trimmed] || 0) + 1;
        }
      });
    }
  });

  let mostWornColor = totalDrops === 0 ? "No pieces yet" : "No tags yet";
  let maxCount = 0;
  Object.entries(tagCounts).forEach(([tag, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostWornColor = tag;
    }
  });

  // Dynamic Fit Score calculation
  const fitScore = totalDrops === 0
    ? "0.0"
    : Math.min(10, (5 + totalDrops * 0.15 + totalOutfits * 0.4)).toFixed(1);

  const outfitItems =
    latestOutfit?.items.map((outfitItem) => outfitItem.clothingItem) ?? [];

  const getPlaceholderClass = (itemCategory: string) => {
    switch (itemCategory) {
      case "Tops":
        return "bg-pastel-pink/20";
      case "Bottoms":
        return "bg-nebula-primary/20";
      case "Shoes":
        return "bg-pastel-mint/20";
      default:
        return "bg-nebula-secondary/20";
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Outfit of the Day Section */}
        <div className="lg:col-span-2 relative h-[500px] md:h-[400px] rounded-nebula overflow-hidden glass group">
          <div className="absolute inset-0 bg-gradient-to-t from-nebula-on-surface/90 via-nebula-on-surface/30 to-transparent z-10" />

          {latestOutfit && outfitItems.length > 0 ? (
            <>
              {/* Grid of the 3 pieces forming the outfit */}
              <div className="absolute inset-0 grid grid-cols-3 p-3 sm:p-4 gap-2 sm:gap-4 bg-black/10">
                {outfitItems.map((item) => (
                  <div key={item.id} className="relative min-w-0 h-full w-full rounded-nebula-inner overflow-hidden border border-white/10 shadow-lg">
                    <div className={`absolute inset-0 ${getPlaceholderClass(item.category)}`} />
                    <WardrobeImage
                      src={item.imagePath}
                      alt={item.name}
                      sizes="(max-width: 640px) 30vw, 250px"
                      className="object-cover"
                    />
                    <span className="absolute top-2 left-2 right-2 max-w-[calc(100%-1rem)] truncate whitespace-nowrap px-1.5 sm:px-2 py-0.5 bg-black/50 text-[8px] sm:text-[9px] font-bold text-white rounded uppercase tracking-wide backdrop-blur-sm">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-0 inset-x-0 p-4 sm:p-8 z-20 space-y-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-nebula-primary/30 text-nebula-primary rounded-full w-fit backdrop-blur-sm">
                  <Sparkles size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">Active Rotation</span>
                </div>
                <h1 className="text-3xl sm:text-4xl leading-tight font-black tracking-tighter text-white break-words">
                  {latestOutfit.name}
                </h1>
                <p className="text-white/85 max-w-md text-xs font-medium line-clamp-2">
                  Configured from {outfitItems.map((i) => i.name).join(", ")}.
                </p>
                <Link
                  href="/studio"
                  className="inline-flex min-h-11 items-center px-7 py-3 bg-nebula-secondary text-nebula-bg font-bold rounded-full md:hover:scale-105 active:scale-95 transition-all shadow-lg shadow-nebula-secondary/20 text-xs sm:text-sm uppercase tracking-wider"
                >
                  Edit in Studio
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Default Welcome Banner */}
              <div className="absolute inset-0 bg-gradient-to-tr from-pastel-pink/30 via-nebula-secondary/20 to-pastel-blue/30 animate-pulse" />

              <div className="absolute bottom-0 left-0 p-8 z-20 space-y-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-nebula-primary/20 text-nebula-primary rounded-full w-fit backdrop-blur-md">
                  <Sparkles size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">Welcome to your vault</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-nebula-on-surface">No Outfit Configured <br /><span className="text-nebula-secondary">Build Your First Fit</span></h1>
                <p className="text-nebula-on-surface/60 max-w-sm text-xs leading-relaxed font-medium">Head to the Outfit Studio to mix, match, and lock in your style configurations from database pieces.</p>
                <Link
                  href="/studio"
                  className="inline-block px-8 py-3 bg-nebula-primary text-nebula-bg font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-nebula-primary/20 text-xs uppercase tracking-widest"
                >
                  Create Outfits
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Stats Column */}
        <div className="space-y-6">
          <div className="p-6 rounded-nebula glass space-y-4">
            <h3 className="text-xs font-bold text-nebula-on-surface/40 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={16} /> Wardrobe Insights
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end p-4 bg-black/5 rounded-nebula-inner">
                <span className="text-nebula-on-surface/60 text-xs font-bold uppercase tracking-wider">Most Worn Vibe</span>
                <span className="text-xl font-bold text-nebula-tertiary truncate max-w-[150px]">{mostWornColor}</span>
              </div>
              <div className="flex justify-between items-end p-4 bg-black/5 rounded-nebula-inner">
                <span className="text-nebula-on-surface/60 text-xs font-bold uppercase tracking-wider">Total Pieces</span>
                <span className="text-xl font-bold text-nebula-primary">{totalDrops}</span>
              </div>
              <div className="flex justify-between items-end p-4 bg-black/5 rounded-nebula-inner">
                <span className="text-nebula-on-surface/60 text-xs font-bold uppercase tracking-wider">Fit Score</span>
                <span className="text-xl font-bold text-nebula-secondary">{fitScore}</span>
              </div>
            </div>
          </div>

          <Link
            href="/upload"
            className="w-full aspect-[2/1] md:aspect-square lg:aspect-auto lg:h-[160px] rounded-nebula border-2 border-dashed border-black/10 flex flex-col items-center justify-center gap-2 text-nebula-on-surface/40 hover:border-nebula-primary/50 hover:text-nebula-primary hover:bg-nebula-primary/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center group-hover:bg-nebula-primary/20 transition-colors">
              <Plus size={20} />
            </div>
            <span className="font-bold uppercase tracking-widest text-[10px]">Add New Drip</span>
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
        <WardrobeStatsPanel items={allItems} outfitCount={totalOutfits} />
        <PackingListGenerator items={allItems} />
      </div>

      <SavedFits outfits={savedOutfitCards} items={allItems} />

      {/* Recent Drops */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-2xl font-bold tracking-tight">Recent Drops</h2>
          <Link href="/closet" className="text-nebula-primary text-xs font-bold hover:underline underline-offset-4 transition-all uppercase tracking-widest flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {recentItems.length === 0 ? (
          <div className="py-12 text-center glass rounded-nebula border border-black/5 text-xs text-nebula-on-surface/30">
            No wardrobe pieces uploaded yet. Drop some items in the vault!
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {recentItems.map((item) => (
              <Link href="/closet" key={item.id} className="group cursor-pointer space-y-3 block">
                <div className="aspect-[3/4] rounded-nebula bg-black/5 overflow-hidden relative border border-black/5 group-hover:border-nebula-primary/30 transition-all">
                  <div className={`absolute inset-4 rounded-nebula-inner ${getPlaceholderClass(item.category)} filter blur-sm group-hover:scale-110 transition-transform duration-500`} />
                  {item.imagePath && (
                    <div className="absolute inset-0 p-3">
                      <div className="relative w-full h-full rounded-nebula-inner overflow-hidden">
                        <WardrobeImage
                          src={item.imagePath}
                          alt={item.name}
                          sizes="(max-width: 640px) 45vw, 150px"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="px-2 truncate">
                  <p className="text-[10px] font-bold text-nebula-on-surface/40 uppercase tracking-widest">{item.category}</p>
                  <p className="font-bold text-sm text-nebula-on-surface truncate group-hover:text-nebula-primary transition-colors">{item.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
