"use client";

import { useMemo, useState } from "react";
import { Luggage, Sparkles } from "lucide-react";

type ClothingItem = {
  id: string;
  name: string;
  category: string;
  tags: string | null;
};

type PackingListGeneratorProps = {
  items: ClothingItem[];
};

const tripLengths = [2, 3, 5, 7];
const weatherOptions = ["Hot", "Mild", "Cold", "Rainy"];

const getText = (item: ClothingItem) => `${item.name} ${item.category} ${item.tags ?? ""}`.toLowerCase();

const weatherKeywords: Record<string, string[]> = {
  Hot: ["summer", "linen", "shorts", "tee", "fresh", "light"],
  Mild: ["spring", "fall", "casual", "layering", "everyday"],
  Cold: ["winter", "wool", "knit", "jacket", "coat", "layering"],
  Rainy: ["rain", "jacket", "boot", "outerwear", "dark", "layering"],
};

const pickItems = (items: ClothingItem[], category: string, count: number, weather: string) => {
  const keywords = weatherKeywords[weather];

  return items
    .filter((item) => item.category === category)
    .sort((a, b) => {
      const score = (item: ClothingItem) =>
        keywords.reduce((total, keyword) => total + (getText(item).includes(keyword) ? 1 : 0), 0);

      return score(b) - score(a);
    })
    .slice(0, count);
};

export default function PackingListGenerator({ items }: PackingListGeneratorProps) {
  const [days, setDays] = useState(3);
  const [weather, setWeather] = useState("Mild");

  const packingList = useMemo(() => {
    const tops = pickItems(items, "Tops", days, weather);
    const bottoms = pickItems(items, "Bottoms", Math.max(1, Math.ceil(days / 2)), weather);
    const shoes = pickItems(items, "Shoes", Math.min(2, Math.max(1, Math.ceil(days / 4))), weather);
    const accessories = pickItems(items, "Accessories", Math.min(3, days), weather);
    const outerwearCount = weather === "Hot" ? 0 : weather === "Mild" ? 1 : 2;
    const outerwear = pickItems(items, "Outerwear", outerwearCount, weather);

    return [
      { label: "Tops", items: tops },
      { label: "Bottoms", items: bottoms },
      { label: "Outerwear", items: outerwear },
      { label: "Shoes", items: shoes },
      { label: "Accessories", items: accessories },
    ].filter((group) => group.items.length > 0);
  }, [days, items, weather]);

  return (
    <section className="glass rounded-nebula border border-black/5 p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tighter text-nebula-on-surface">Packing List Generator</h2>
          <p className="text-xs text-nebula-on-surface/40 font-medium">
            Pick a trip length and weather, then pack from your closet.
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-nebula-tertiary/15 text-nebula-tertiary flex items-center justify-center">
          <Luggage size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-nebula-on-surface/40">Trip Length</span>
          <div className="grid grid-cols-4 gap-2">
            {tripLengths.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDays(option)}
                className={`min-h-11 rounded-nebula-inner border text-sm font-bold transition-all ${
                  days === option
                    ? "bg-nebula-tertiary text-nebula-bg border-nebula-tertiary"
                    : "bg-black/5 text-nebula-on-surface/60 border-black/5 hover:text-nebula-tertiary"
                }`}
              >
                {option}d
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-nebula-on-surface/40">Weather</span>
          <div className="grid grid-cols-4 gap-2">
            {weatherOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setWeather(option)}
                className={`min-h-11 rounded-nebula-inner border text-sm font-bold transition-all ${
                  weather === option
                    ? "bg-nebula-secondary text-nebula-bg border-nebula-secondary"
                    : "bg-black/5 text-nebula-on-surface/60 border-black/5 hover:text-nebula-secondary"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-xs font-bold text-nebula-on-surface/40">Upload a few closet pieces to generate packing lists.</p>
      ) : packingList.length === 0 ? (
        <p className="text-xs font-bold text-nebula-on-surface/40">Add more categories to make this packing list useful.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          {packingList.map((group) => (
            <div key={group.label} className="rounded-nebula-inner bg-black/5 p-4 space-y-3">
              <h3 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-nebula-primary">
                <Sparkles size={12} /> {group.label}
              </h3>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <p key={item.id} className="text-xs font-bold text-nebula-on-surface/60 truncate">
                    {item.name}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
