"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Puzzle, 
  Sparkles, 
  Lock, 
  RotateCcw, 
  Plus,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  Wand2
} from "lucide-react";
import { saveOutfit } from "@/app/actions/outfit";
import { clothingCategories, isBottomCategory, isShoesCategory, isTopCategory } from "@/lib/clothingCategories";

interface DbClothingItem {
  id: string;
  name: string;
  imagePath: string;
  category: string;
  tags: string | null;
  userId: string;
  createdAt: Date;
}

interface OutfitStudioClientProps {
  initialItems: DbClothingItem[];
}

const occasions = ["Casual", "College", "Work", "Date", "Party", "Travel"];
const weatherOptions = ["Hot", "Mild", "Cold", "Rainy"];

const occasionKeywords: Record<string, string[]> = {
  Casual: ["casual", "streetwear", "everyday", "denim", "tee", "hoodie"],
  College: ["casual", "comfortable", "streetwear", "sneaker", "denim", "backpack"],
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

const getItemText = (item: DbClothingItem) =>
  `${item.name} ${item.category} ${item.tags ?? ""}`.toLowerCase();

export default function OutfitStudioClient({ initialItems }: OutfitStudioClientProps) {
  const router = useRouter();

  // Canvas Slot States
  const [top, setTop] = useState<DbClothingItem | null>(null);
  const [bottom, setBottom] = useState<DbClothingItem | null>(null);
  const [shoes, setShoes] = useState<DbClothingItem | null>(null);

  // Tab Filtering for the Sidebar
  const [activeTab, setActiveTab] = useState<string>("All");
  const [occasion, setOccasion] = useState("Casual");
  const [weather, setWeather] = useState("Mild");
  const [stylistMessage, setStylistMessage] = useState<string | null>(null);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [outfitName, setOutfitName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetCanvas = () => {
    setTop(null);
    setBottom(null);
    setShoes(null);
  };

  const selectItem = (item: DbClothingItem) => {
    // Map categories to appropriate slots
    if (isTopCategory(item.category)) {
      setTop(item);
    } else if (isBottomCategory(item.category)) {
      setBottom(item);
    } else if (isShoesCategory(item.category)) {
      setShoes(item);
    }
  };

  const scoreItem = (item: DbClothingItem) => {
    const text = getItemText(item);
    const keywords = [...occasionKeywords[occasion], ...weatherKeywords[weather]];

    return keywords.reduce((score, keyword) => {
      return text.includes(keyword) ? score + 2 : score;
    }, Math.random());
  };

  const pickBestItem = (categoryMatch: (item: DbClothingItem) => boolean) => {
    return initialItems
      .filter(categoryMatch)
      .sort((a, b) => scoreItem(b) - scoreItem(a))[0];
  };

  const handleAutoStyle = () => {
    const suggestedTop = pickBestItem((item) => isTopCategory(item.category));
    const suggestedBottom = pickBestItem((item) => isBottomCategory(item.category));
    const suggestedShoes = pickBestItem((item) => isShoesCategory(item.category));

    if (!suggestedTop || !suggestedBottom || !suggestedShoes) {
      setStylistMessage("Upload at least one top or style piece, one bottom or skirt, and one pair of shoes so I can build a complete fit.");
      return;
    }

    setTop(suggestedTop);
    setBottom(suggestedBottom);
    setShoes(suggestedShoes);
    setStylistMessage(`Drafted a ${weather.toLowerCase()} ${occasion.toLowerCase()} fit on the canvas. Swap anything you want before saving.`);
  };

  const handleOpenSaveModal = () => {
    if (!top || !bottom || !shoes) {
      alert("Please select at least a Top, a Bottom, and Shoes to lock in your fit!");
      return;
    }
    setError(null);
    setIsSaved(false);
    // Generate a default name
    const defaultName = `Pastel Echo Fit #${Math.floor(Math.random() * 900) + 100}`;
    setOutfitName(defaultName);
    setIsModalOpen(true);
  };

  const handleSaveOutfit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!top || !bottom || !shoes || !outfitName.trim()) return;

    setIsSaving(true);
    setError(null);

    const itemIds = [top.id, bottom.id, shoes.id];
    const result = await saveOutfit(outfitName.trim(), itemIds);

    if (result.error) {
      setError(result.error);
      setIsSaving(false);
    } else {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => {
        setIsModalOpen(false);
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    }
  };

  // Filter sidebar item list by active tab
  const filteredItems = initialItems.filter(item => {
    if (activeTab === "All") return true;
    if (activeTab === "Tops") return isTopCategory(item.category);
    if (activeTab === "Bottoms") return isBottomCategory(item.category);
    if (activeTab === "Shoes") return isShoesCategory(item.category);
    return item.category === activeTab;
  });

  // Dynamic Stylist Tips
  const getStylistTip = () => {
    if (!top && !bottom && !shoes) {
      return "Start picking pieces to assemble your look. Combining pastels with darker tones makes for a stunning aesthetic contrast!";
    }
    if (top && !bottom) {
      return `Nice pick with "${top.name}". Try sliding in some loose baggy denim or cargo bottoms next.`;
    }
    if (top && bottom && !shoes) {
      return `Looking clean! The fit is taking shape. Just pick the perfect pair of shoes to seal this look.`;
    }
    if (top && bottom && shoes) {
      return stylistMessage ?? `This ${weather.toLowerCase()} ${occasion.toLowerCase()} draft is ready. Tweak it if needed, then lock it in.`;
    }
    return stylistMessage ?? "Mix and match to find your identity. Feel free to re-arrange the canvas slots at any time!";
  };

  const getPlaceholderClass = (category: string) => {
    if (category === "Tops") return "bg-pastel-pink/20";
    if (category === "Bottoms") return "bg-nebula-primary/20";
    return "bg-pastel-mint/20";
  };

  return (
    <div className="flex flex-col xl:flex-row xl:h-[calc(100vh-120px)] gap-8 pb-8 xl:pb-0">
      {/* Col 1: Wardrobe Scroller */}
      <aside className="xl:w-80 flex flex-col glass rounded-nebula border border-black/5 overflow-hidden">
        <div className="p-6 border-b border-black/5 bg-black/5 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black uppercase tracking-widest text-nebula-primary">My Pieces</h2>
            <span className="text-[10px] bg-nebula-primary/20 text-nebula-primary px-2 py-0.5 rounded-full font-bold">
              {initialItems.length} items
            </span>
          </div>
          
          {/* Scroll Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide text-[10px] font-bold uppercase tracking-wider">
            {["All", ...clothingCategories].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full transition-all border ${
                  activeTab === tab 
                    ? "bg-nebula-primary border-nebula-primary text-nebula-bg" 
                    : "bg-black/5 border-transparent text-nebula-on-surface/50 hover:bg-black/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-nebula-on-surface/30">
              No items in this category.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = top?.id === item.id || bottom?.id === item.id || shoes?.id === item.id;
              
              return (
                <div 
                  key={item.id} 
                  onClick={() => selectItem(item)}
                  className={`group cursor-pointer flex gap-4 p-3 rounded-nebula-inner transition-all border ${
                    isSelected 
                      ? "bg-nebula-secondary/10 border-nebula-secondary/30" 
                      : "hover:bg-black/5 border-transparent hover:border-nebula-primary/20"
                  }`}
                >
                  <div className={`w-16 h-16 rounded-nebula-inner ${getPlaceholderClass(item.category)} relative overflow-hidden flex-shrink-0`}>
                    {item.imagePath && (
                      <Image 
                        src={item.imagePath} 
                        alt={item.name} 
                        fill
                        sizes="64px"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <div className="flex flex-col justify-center truncate">
                    <span className="text-[10px] font-bold text-nebula-on-surface/40 uppercase tracking-widest">{item.category}</span>
                    <span className="text-sm font-bold text-nebula-on-surface group-hover:text-nebula-primary transition-colors truncate">{item.name}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Col 2: The Canvas */}
      <main className="flex-1 glass rounded-nebula border border-black/5 flex flex-col relative overflow-hidden bg-pastel-mint/5">
         <div className="absolute inset-x-0 top-0 p-6 flex justify-between items-center z-20">
            <h2 className="text-sm font-black uppercase tracking-widest text-nebula-on-surface/60 flex items-center gap-2">
               <Puzzle size={16} /> Outfit Canvas
            </h2>
            <button 
              onClick={resetCanvas}
              title="Reset Canvas"
              className="p-2 rounded-full hover:bg-black/10 text-nebula-on-surface/40 hover:text-red-400 transition-all"
            >
               <RotateCcw size={18} />
            </button>
         </div>

         {/* Canvas Slots */}
         <div className="flex-1 flex flex-col items-center justify-center p-10 space-y-6 relative mt-10">
            {/* Top Slot */}
            <div className={`w-48 h-52 rounded-nebula border-2 border-dashed flex flex-col items-center justify-center transition-all relative overflow-hidden ${top ? "border-nebula-secondary bg-black/5 scale-102" : "border-black/10 bg-transparent hover:border-nebula-secondary/40"}`}>
              {top ? (
                <div className="relative group w-full h-full flex flex-col items-center justify-center p-4">
                  {top.imagePath && (
                    <div className="relative w-full h-full rounded-nebula-inner overflow-hidden">
                      <Image 
                        src={top.imagePath} 
                        alt={top.name} 
                        fill
                        sizes="192px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <button 
                    onClick={() => setTop(null)} 
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Trash2 size={12} />
                  </button>
                  <p className="absolute bottom-2 left-2 right-2 bg-black/50 text-[10px] font-bold uppercase tracking-widest text-white px-2 py-1 rounded backdrop-blur-sm truncate text-center z-10">
                    {top.name}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Plus className="mx-auto text-nebula-on-surface/10 mb-1" size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-nebula-on-surface/30">Top / Jacket</span>
                </div>
              )}
            </div>

            {/* Bottom Slot */}
            <div className={`w-48 h-56 rounded-nebula border-2 border-dashed flex flex-col items-center justify-center transition-all relative overflow-hidden ${bottom ? "border-nebula-primary bg-black/5 scale-102" : "border-black/10 bg-transparent hover:border-nebula-primary/40"}`}>
              {bottom ? (
                <div className="relative group w-full h-full flex flex-col items-center justify-center p-4">
                  {bottom.imagePath && (
                    <div className="relative w-full h-full rounded-nebula-inner overflow-hidden">
                      <Image 
                        src={bottom.imagePath} 
                        alt={bottom.name} 
                        fill
                        sizes="192px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <button 
                    onClick={() => setBottom(null)} 
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Trash2 size={12} />
                  </button>
                  <p className="absolute bottom-2 left-2 right-2 bg-black/50 text-[10px] font-bold uppercase tracking-widest text-white px-2 py-1 rounded backdrop-blur-sm truncate text-center z-10">
                    {bottom.name}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Plus className="mx-auto text-nebula-on-surface/10 mb-1" size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-nebula-on-surface/30">Bottom Piece</span>
                </div>
              )}
            </div>

            {/* Shoes Slot */}
            <div className={`w-40 h-32 rounded-nebula border-2 border-dashed flex flex-col items-center justify-center transition-all relative overflow-hidden ${shoes ? "border-nebula-tertiary bg-black/5 scale-102" : "border-black/10 bg-transparent hover:border-nebula-tertiary/40"}`}>
              {shoes ? (
                <div className="relative group w-full h-full flex flex-col items-center justify-center p-3">
                  {shoes.imagePath && (
                    <div className="relative w-full h-full rounded-nebula-inner overflow-hidden">
                      <Image 
                        src={shoes.imagePath} 
                        alt={shoes.name} 
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <button 
                    onClick={() => setShoes(null)} 
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Trash2 size={12} />
                  </button>
                  <p className="absolute bottom-2 left-2 right-2 bg-black/50 text-[10px] font-bold uppercase tracking-widest text-white px-2 py-1 rounded backdrop-blur-sm truncate text-center z-10">
                    {shoes.name}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Plus className="mx-auto text-nebula-on-surface/10 mb-1" size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-nebula-on-surface/30">Kicks / Shoes</span>
                </div>
              )}
            </div>
         </div>

         {/* Action Lock In */}
         <div className="p-8 border-t border-black/5 flex justify-center bg-black/5">
            <button 
              onClick={handleOpenSaveModal}
              className="flex items-center gap-3 px-10 py-4 bg-nebula-primary text-nebula-bg font-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-nebula-primary/20"
            >
               <Lock size={20} />
               <span className="uppercase tracking-[0.2em] text-xs">Lock in this fit</span>
            </button>
         </div>
      </main>

      {/* Col 3: AI Assistant */}
      <aside className="xl:w-80 xl:max-h-[calc(100vh-120px)] glass rounded-nebula border border-black/5 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-black/5 bg-black/5">
          <h2 className="text-sm font-black uppercase tracking-widest text-nebula-tertiary flex items-center gap-2">
            <Sparkles size={16} /> Stylist Draft
          </h2>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <div className="p-4 bg-nebula-tertiary/10 rounded-nebula-inner border border-nebula-tertiary/20 space-y-3">
             <p className="text-[10px] font-black uppercase tracking-widest text-nebula-tertiary">Canvas Draft</p>
             <p className="text-xs text-nebula-on-surface/60 leading-relaxed italic">
               &quot;{getStylistTip()}&quot;
             </p>
          </div>

          <div className="space-y-3">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-nebula-on-surface/40 px-1">Occasion</h4>
             <div className="grid grid-cols-2 gap-2">
               {occasions.map((option) => (
                 <button
                   key={option}
                   type="button"
                   onClick={() => setOccasion(option)}
                   className={`min-h-10 rounded-nebula-inner border px-3 text-xs font-bold transition-all ${
                     occasion === option
                       ? "bg-nebula-primary text-nebula-bg border-nebula-primary"
                       : "bg-black/5 text-nebula-on-surface/60 border-black/5 hover:text-nebula-primary hover:border-nebula-primary/40"
                   }`}
                 >
                   {option}
                 </button>
               ))}
             </div>
          </div>

          <div className="space-y-3">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-nebula-on-surface/40 px-1">Weather</h4>
             <div className="grid grid-cols-2 gap-2">
               {weatherOptions.map((option) => (
                 <button
                   key={option}
                   type="button"
                   onClick={() => setWeather(option)}
                   className={`min-h-10 rounded-nebula-inner border px-3 text-xs font-bold transition-all ${
                     weather === option
                       ? "bg-nebula-tertiary text-nebula-bg border-nebula-tertiary"
                       : "bg-black/5 text-nebula-on-surface/60 border-black/5 hover:text-nebula-tertiary hover:border-nebula-tertiary/40"
                   }`}
                 >
                   {option}
                 </button>
               ))}
             </div>
          </div>

          <button
            type="button"
            onClick={handleAutoStyle}
            className="w-full py-4 bg-nebula-primary text-nebula-bg font-black rounded-full flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-nebula-primary/20"
          >
            <Wand2 size={18} />
            <span className="uppercase tracking-widest text-xs">Auto-Fill Canvas</span>
          </button>

          <div className="space-y-4">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-nebula-on-surface/40 px-1">Style Guidelines</h4>
             <div className="space-y-3 text-xs text-nebula-on-surface/50 font-medium leading-relaxed">
               <p>✨ Try balancing voluminous bottoms with form-fitting crop tops.</p>
               <p>👟 Clean shoes act as anchor points for pastel color combinations.</p>
               <p>🧢 Finish off outfits with matching accessories to complete the aesthetic identity.</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Save Outfit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass rounded-nebula border border-white/20 p-8 w-full max-w-md shadow-2xl relative animate-scaleUp">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-black/5 rounded-full hover:bg-black/10 text-nebula-on-surface/50 transition-colors"
            >
              <X size={18} />
            </button>

            {isSaved ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center text-nebula-primary">
                <CheckCircle2 size={64} className="animate-bounce" />
                <h3 className="text-xl font-black uppercase tracking-widest">Fit Vaulted!</h3>
                <p className="text-xs text-nebula-on-surface/50 max-w-xs">Your new outfit configuration has been successfully saved to your profile.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveOutfit} className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-black tracking-tighter uppercase text-nebula-on-surface">Lock In Outfit</h3>
                  <p className="text-xs text-nebula-on-surface/40 font-medium">Give this styling identity a name to remember it by.</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest rounded-nebula-inner">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-nebula-on-surface/30 ml-1">Outfit Name</label>
                  <input 
                    type="text"
                    required
                    value={outfitName}
                    onChange={(e) => setOutfitName(e.target.value)}
                    placeholder="e.g. Vintage Spring Vibe"
                    className="w-full bg-black/5 border border-black/5 rounded-nebula-inner px-4 py-3 outline-none focus:border-nebula-primary/50 focus:bg-black/10 transition-all text-sm"
                  />
                </div>

                {/* Outfit preview breakdown */}
                <div className="p-4 bg-black/5 rounded-nebula-inner space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-nebula-on-surface/30">Breakdown</p>
                  <div className="text-xs font-bold text-nebula-on-surface/60 space-y-1">
                    <p>👕 Top: {top?.name}</p>
                    <p>👖 Bottom: {bottom?.name}</p>
                    <p>👟 Shoes: {shoes?.name}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-black/5 hover:bg-black/10 font-bold rounded-full text-xs uppercase tracking-widest text-nebula-on-surface/60 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex-1 py-3 bg-nebula-primary text-nebula-bg font-black rounded-full text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-nebula-primary/20 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save Fit"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
