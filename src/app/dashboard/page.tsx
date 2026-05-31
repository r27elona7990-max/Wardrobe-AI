import { Sparkles, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as { id: string }).id;

  // Retrieve user metrics
  const totalDrops = await prisma.clothingItem.count({
    where: { userId },
  });

  const totalOutfits = await prisma.outfit.count({
    where: { userId },
  });

  // Fetch recent uploads (take 5)
  const recentItems = await prisma.clothingItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch all user items to aggregate tag insights
  const allItems = await prisma.clothingItem.findMany({
    where: { userId },
    select: { tags: true },
  });

  // Calculate most common tag / color
  const tagCounts: Record<string, number> = {};
  allItems.forEach((item: any) => {
    if (item.tags) {
      item.tags.split(",").forEach((tag: any) => {
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

  // Fetch latest saved outfit
  const latestOutfit = await prisma.outfit.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  let outfitItems: any[] = [];
  if (latestOutfit) {
    const ids = latestOutfit.itemIds.split(",");
    const dbItems = await prisma.clothingItem.findMany({
      where: { id: { in: ids } },
    });

    // Sort items to match original order (Top, Bottom, Shoes)
    const categoryOrder = ["Tops", "Outerwear", "Bottoms", "Shoes"];
    outfitItems = dbItems.sort((a, b) => {
      const idxA = categoryOrder.indexOf(a.category);
      const idxB = categoryOrder.indexOf(b.category);
      return (idxA > -1 ? idxA : 99) - (idxB > -1 ? idxB : 99);
    });
  }

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
        <div className="lg:col-span-2 relative h-[400px] rounded-nebula overflow-hidden glass group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-t from-nebula-on-surface/90 via-nebula-on-surface/30 to-transparent z-10" />

          {latestOutfit && outfitItems.length > 0 ? (
            <>
              {/* Grid of the 3 pieces forming the outfit */}
              <div className="absolute inset-0 grid grid-cols-3 p-4 gap-4 bg-black/10">
                {outfitItems.map((item, idx) => (
                  <div key={item.id} className="relative h-full w-full rounded-nebula-inner overflow-hidden border border-white/10 shadow-lg">
                    <div className={`absolute inset-0 ${getPlaceholderClass(item.category)}`} />
                    {item.imagePath && (
                      <Image
                        src={item.imagePath}
                        alt={item.name}
                        fill
                        sizes="250px"
                        className="object-cover"
                      />
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/40 text-[9px] font-bold text-white rounded uppercase tracking-wider backdrop-blur-sm">
                      {item.category}
                    </span>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-0 left-0 p-8 z-20 space-y-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-nebula-primary/20 text-nebula-primary rounded-full w-fit backdrop-blur-md">
                  <Sparkles size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">Active Rotation</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-white">
                  {latestOutfit.name}
                </h1>
                <p className="text-white/70 max-w-md text-xs font-medium">
                  Configured from {outfitItems.map((i) => i.name).join(", ")}.
                </p>
                <Link
                  href="/studio"
                  className="inline-block px-8 py-3 bg-nebula-secondary text-nebula-bg font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-nebula-secondary/20 text-sm uppercase tracking-wider"
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
            {recentItems.map((item: any) => (
              <Link href="/closet" key={item.id} className="group cursor-pointer space-y-3 block">
                <div className="aspect-[3/4] rounded-nebula bg-black/5 overflow-hidden relative border border-black/5 group-hover:border-nebula-primary/30 transition-all">
                  <div className={`absolute inset-4 rounded-nebula-inner ${getPlaceholderClass(item.category)} filter blur-sm group-hover:scale-110 transition-transform duration-500`} />
                  {item.imagePath && (
                    <div className="absolute inset-0 p-3">
                      <div className="relative w-full h-full rounded-nebula-inner overflow-hidden">
                        <Image
                          src={item.imagePath}
                          alt={item.name}
                          fill
                          sizes="150px"
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
