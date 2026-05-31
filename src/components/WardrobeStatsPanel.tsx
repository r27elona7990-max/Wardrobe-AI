import { BarChart3 } from "lucide-react";

type ClothingItem = {
  id: string;
  category: string;
  tags: string | null;
};

type WardrobeStatsPanelProps = {
  items: ClothingItem[];
  outfitCount: number;
};

const requiredCategories = ["Tops", "Bottoms", "Shoes"];
const categoryLabels = ["Tops", "Bottoms", "Outerwear", "Shoes", "Accessories"];

export default function WardrobeStatsPanel({ items, outfitCount }: WardrobeStatsPanelProps) {
  const categoryCounts = categoryLabels.map((category) => ({
    category,
    count: items.filter((item) => item.category === category).length,
  }));

  const gaps = requiredCategories.filter(
    (category) => !items.some((item) => item.category === category)
  );

  const uniqueTags = new Set(
    items.flatMap((item) =>
      (item.tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  );

  return (
    <section className="glass rounded-nebula border border-black/5 p-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tighter text-nebula-on-surface">Wardrobe Stats</h2>
          <p className="text-xs text-nebula-on-surface/40 font-medium">Quick health check for your closet.</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-nebula-secondary/15 text-nebula-secondary flex items-center justify-center">
          <BarChart3 size={20} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-nebula-inner bg-black/5 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-nebula-on-surface/40">Pieces</p>
          <p className="text-2xl font-black text-nebula-primary">{items.length}</p>
        </div>
        <div className="rounded-nebula-inner bg-black/5 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-nebula-on-surface/40">Outfits</p>
          <p className="text-2xl font-black text-nebula-secondary">{outfitCount}</p>
        </div>
        <div className="rounded-nebula-inner bg-black/5 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-nebula-on-surface/40">Tags</p>
          <p className="text-2xl font-black text-nebula-tertiary">{uniqueTags.size}</p>
        </div>
        <div className="rounded-nebula-inner bg-black/5 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-nebula-on-surface/40">Gaps</p>
          <p className="text-2xl font-black text-nebula-primary">{gaps.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-nebula-inner bg-black/5 p-4 space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-nebula-on-surface/40">Category Balance</h3>
          {categoryCounts.map(({ category, count }) => (
            <div key={category} className="flex items-center gap-3">
              <span className="w-24 text-xs font-bold text-nebula-on-surface/50">{category}</span>
              <div className="h-2 flex-1 rounded-full bg-black/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-nebula-primary"
                  style={{ width: `${Math.min(100, count * 20)}%` }}
                />
              </div>
              <span className="w-6 text-right text-xs font-black text-nebula-on-surface/50">{count}</span>
            </div>
          ))}
        </div>

        <div className="rounded-nebula-inner bg-black/5 p-4 space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-nebula-on-surface/40">Wardrobe Gaps</h3>
          <p className="text-sm font-bold text-nebula-on-surface/60">
            {gaps.length === 0
              ? "You have the basics for complete outfits."
              : `Add ${gaps.join(", ")} to unlock better outfit suggestions.`}
          </p>
        </div>
      </div>
    </section>
  );
}
