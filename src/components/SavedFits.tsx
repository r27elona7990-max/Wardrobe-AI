"use client";

import { useState } from "react";
import { Heart, Share2 } from "lucide-react";

type ClothingItem = {
  id: string;
  name: string;
  category: string;
};

type SavedOutfit = {
  id: string;
  name: string;
  itemIds: string;
  createdAt: string;
};

type SavedFitsProps = {
  outfits: SavedOutfit[];
  items: ClothingItem[];
};

export default function SavedFits({ outfits, items }: SavedFitsProps) {
  const [sharedId, setSharedId] = useState<string | null>(null);
  const itemById = new Map(items.map((item) => [item.id, item]));

  const getOutfitItems = (outfit: SavedOutfit) =>
    outfit.itemIds
      .split(",")
      .map((id) => itemById.get(id))
      .filter((item): item is ClothingItem => Boolean(item));

  const shareOutfit = async (outfit: SavedOutfit) => {
    const names = getOutfitItems(outfit).map((item) => item.name).join(", ");
    const text = `${outfit.name}${names ? `: ${names}` : ""}`;

    if (navigator.share) {
      await navigator.share({
        title: "Wardrobe AI fit",
        text,
      });
    } else {
      await navigator.clipboard.writeText(text);
      setSharedId(outfit.id);
      window.setTimeout(() => setSharedId(null), 1800);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold tracking-tight">Saved Fits</h2>
        <div className="flex items-center gap-2 text-nebula-primary">
          <Heart size={16} />
          <span className="text-xs font-black uppercase tracking-widest">{outfits.length} saved</span>
        </div>
      </div>

      {outfits.length === 0 ? (
        <div className="glass rounded-nebula border border-black/5 p-8 text-center text-xs font-bold text-nebula-on-surface/40">
          Generate or lock in an outfit to build your saved fits.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {outfits.map((outfit) => {
            const outfitItems = getOutfitItems(outfit);

            return (
              <article key={outfit.id} className="glass rounded-nebula border border-black/5 p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-nebula-on-surface/30">
                      {new Date(outfit.createdAt).toLocaleDateString()}
                    </p>
                    <h3 className="font-black text-nebula-on-surface truncate">{outfit.name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => void shareOutfit(outfit)}
                    className="p-2 rounded-full bg-nebula-primary/10 text-nebula-primary hover:bg-nebula-primary/20 transition-colors"
                    aria-label={`Share ${outfit.name}`}
                  >
                    <Share2 size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  {outfitItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-nebula-inner bg-black/5 px-3 py-2">
                      <span className="text-xs font-bold text-nebula-on-surface/70 truncate">{item.name}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-nebula-on-surface/30">
                        {item.category}
                      </span>
                    </div>
                  ))}
                </div>

                {sharedId === outfit.id && (
                  <p className="text-xs font-bold text-nebula-secondary">Copied outfit details.</p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
