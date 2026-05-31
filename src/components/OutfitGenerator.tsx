"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { saveOutfit } from "@/app/actions/outfit";

type ClothingItem = {
  id: string;
  name: string;
  category: string;
  tags: string | null;
};

type OutfitGeneratorProps = {
  items: ClothingItem[];
};

const events = ["Casual", "College", "Work", "Date", "Party", "Travel"];
const weatherOptions = ["Hot", "Mild", "Cold", "Rainy"];

const eventKeywords: Record<string, string[]> = {
  Casual: ["casual", "streetwear", "everyday", "denim", "tee", "hoodie"],
  College: ["casual", "streetwear", "comfortable", "sneaker", "denim", "backpack"],
  Work: ["formal", "workwear", "office", "smart", "shirt", "blazer"],
  Date: ["dressy", "cute", "soft", "statement", "classic", "minimal"],
  Party: ["party", "statement", "bright", "silk", "dressy", "y2k"],
  Travel: ["comfortable", "casual", "layering", "sneaker", "neutral", "everyday"],
};

const weatherKeywords: Record<string, string[]> = {
  Hot: ["summer", "linen", "shorts", "tee", "light", "fresh"],
  Mild: ["spring", "fall", "casual", "everyday", "layering"],
  Cold: ["winter", "wool", "knit", "hoodie", "jacket", "coat", "layering"],
  Rainy: ["outerwear", "jacket", "boot", "layering", "waterproof", "dark"],
};

const getText = (item: ClothingItem) =>
  `${item.name} ${item.category} ${item.tags ?? ""}`.toLowerCase();

const scoreItem = (item: ClothingItem, event: string, weather: string) => {
  const text = getText(item);
  const keywords = [...eventKeywords[event], ...weatherKeywords[weather]];

  return keywords.reduce((score, keyword) => {
    return text.includes(keyword) ? score + 2 : score;
  }, Math.random());
};

const pickBest = (
  items: ClothingItem[],
  categoryMatch: (item: ClothingItem) => boolean,
  event: string,
  weather: string
) => {
  return items
    .filter(categoryMatch)
    .sort((a, b) => scoreItem(b, event, weather) - scoreItem(a, event, weather))[0];
};

export default function OutfitGenerator({ items }: OutfitGeneratorProps) {
  const router = useRouter();
  const [event, setEvent] = useState("Casual");
  const [weather, setWeather] = useState("Mild");
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [generatedNames, setGeneratedNames] = useState<string[]>([]);

  const hasEnoughPieces = useMemo(() => {
    const hasTop = items.some((item) => item.category === "Tops" || item.category === "Outerwear");
    const hasBottom = items.some((item) => item.category === "Bottoms");
    const hasShoes = items.some((item) => item.category === "Shoes");

    return hasTop && hasBottom && hasShoes;
  }, [items]);

  const generateOutfit = async () => {
    setMessage(null);
    setGeneratedNames([]);

    if (!hasEnoughPieces) {
      setMessage("Upload at least one top or jacket, one bottom, and one pair of shoes first.");
      return;
    }

    setIsGenerating(true);

    const top = pickBest(
      items,
      (item) => item.category === "Tops" || item.category === "Outerwear",
      event,
      weather
    );
    const bottom = pickBest(items, (item) => item.category === "Bottoms", event, weather);
    const shoes = pickBest(items, (item) => item.category === "Shoes", event, weather);

    if (!top || !bottom || !shoes) {
      setMessage("I need a top or jacket, a bottom, and shoes to generate a complete fit.");
      setIsGenerating(false);
      return;
    }

    const result = await saveOutfit(
      `${weather} ${event} Fit`,
      [top.id, bottom.id, shoes.id]
    );

    if (result.error) {
      setMessage(result.error);
      setIsGenerating(false);
      return;
    }

    setGeneratedNames([top.name, bottom.name, shoes.name]);
    setMessage("Outfit generated and saved to your dashboard.");
    setIsGenerating(false);
    router.refresh();
  };

  return (
    <section className="glass rounded-nebula border border-black/5 p-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tighter text-nebula-on-surface">
            I Don&apos;t Know What To Wear
          </h2>
          <p className="text-xs text-nebula-on-surface/40 font-medium">
            Pick a plan, pick the weather, then let your closet answer.
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-nebula-primary/15 text-nebula-primary flex items-center justify-center">
          <Wand2 size={20} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-nebula-on-surface/40">
            Event
          </span>
          <select
            value={event}
            onChange={(changeEvent) => setEvent(changeEvent.target.value)}
            className="w-full bg-black/5 border border-black/5 rounded-nebula-inner px-4 py-3 outline-none focus:border-nebula-primary/50 text-sm font-bold"
          >
            {events.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-nebula-on-surface/40">
            Weather
          </span>
          <select
            value={weather}
            onChange={(changeEvent) => setWeather(changeEvent.target.value)}
            className="w-full bg-black/5 border border-black/5 rounded-nebula-inner px-4 py-3 outline-none focus:border-nebula-primary/50 text-sm font-bold"
          >
            {weatherOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={generateOutfit}
        disabled={isGenerating}
        className="w-full py-4 bg-nebula-primary text-nebula-bg font-black rounded-full flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-nebula-primary/20 disabled:opacity-50"
      >
        {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={18} />}
        <span className="uppercase tracking-widest text-xs">
          Generate My Outfit
        </span>
      </button>

      {generatedNames.length > 0 && (
        <div className="p-4 bg-nebula-secondary/10 border border-nebula-secondary/20 rounded-nebula-inner text-xs text-nebula-on-surface/60 font-bold space-y-1">
          {generatedNames.map((name) => (
            <p key={name}>{name}</p>
          ))}
        </div>
      )}

      {message && (
        <p className="text-xs font-bold text-nebula-on-surface/50">
          {message}
        </p>
      )}
    </section>
  );
}
