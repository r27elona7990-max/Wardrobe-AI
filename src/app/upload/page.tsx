"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { uploadClothingItem } from "@/app/actions/upload";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  CloudUpload, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  Image as ImageIcon,
  ChevronDown
} from "lucide-react";
import { clothingCategories } from "@/lib/clothingCategories";

const topStyleOptions = [
  "Tank Tops",
  "Baby Tees & Fitted Tops",
  "Y2K & Crop Tops",
  "Oversized & Streetwear Tops",
  "Cute Feminine Tops",
  "Corset & Going-Out Tops",
];

const categoryStyleOptions: Partial<Record<string, string[]>> = {
  Tops: topStyleOptions,
  Shirts: ["Formal Shirts", "Casual Shirts", "Oversized Shirts", "Printed Shirts"],
  "T-Shirts": ["Basic Tees", "Graphic Tees", "Oversized Tees", "Fitted Tees"],
  Bottoms: ["Bottoms", "Trousers", "Shorts", "Cargo Pants", "Leggings"],
  Dresses: ["Casual Dresses", "Party Dresses", "Bodycon Dresses", "Maxi Dresses"],
  Skirts: ["Mini Skirts", "Midi Skirts", "Denim Skirts", "Pleated Skirts"],
  Shoes: ["Sneakers", "Flats", "Loafers", "Sandals"],
  Heels: ["Block Heels", "Stilettos", "Platform Heels", "Kitten Heels"],
  Boots: ["Ankle Boots", "Knee-High Boots", "Combat Boots", "Chelsea Boots"],
  Formal: ["Office Wear", "Blazers", "Formal Sets", "Smart Casual"],
  Sports: ["Gym Wear", "Athleisure", "Tracksuits", "Sports Shoes"],
  Casual: ["Everyday Basics", "Streetwear", "Lounge Fits", "Weekend Fits"],
  Accessories: ["Bags", "Belts", "Jewelry", "Hats"],
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState("Tops");
  const [categoryStyle, setCategoryStyle] = useState("");
  const [openCategoryMenu, setOpenCategoryMenu] = useState<string | null>(null);
  const [tags, setTags] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false
  });

  useEffect(() => {
    const closeCategoryMenu = (event: PointerEvent) => {
      if (!categoryMenuRef.current?.contains(event.target as Node)) {
        setOpenCategoryMenu(null);
      }
    };

    document.addEventListener("pointerdown", closeCategoryMenu);

    return () => {
      document.removeEventListener("pointerdown", closeCategoryMenu);
    };
  }, []);

  const suggestedTags = useMemo(() => {
    const sourceText = `${category} ${categoryStyle} ${file?.name ?? ""}`.toLowerCase();
    const suggestions = new Set<string>();

    suggestions.add(category);
    if (categoryStyle) suggestions.add(categoryStyle);

    const rules: Array<[string[], string[]]> = [
      [["white", "cream", "ivory"], ["White", "Minimal"]],
      [["black", "charcoal"], ["Black", "Classic"]],
      [["blue", "denim", "navy"], ["Nebula Blue", "Casual"]],
      [["pink", "rose"], ["Soft Pink", "Cute"]],
      [["purple", "lavender", "violet"], ["Lavender", "Soft"]],
      [["green", "mint", "sage"], ["Mint", "Fresh"]],
      [["red", "maroon", "burgundy"], ["Statement"]],
      [["yellow", "gold"], ["Bright"]],
      [["brown", "tan", "beige"], ["Neutral"]],
      [["tee", "tshirt", "t-shirt", "hoodie", "sweatshirt"], ["Streetwear", "Casual"]],
      [["shirt", "blouse"], ["Smart Casual"]],
      [["jean", "denim"], ["Denim", "Everyday"]],
      [["dress", "skirt"], ["Dressy"]],
      [["jacket", "coat", "blazer"], ["Layering", "Winter"]],
      [["sneaker", "shoe", "boot"], ["Footwear", "Streetwear"]],
      [["summer", "linen", "shorts"], ["Summer"]],
      [["winter", "wool", "knit"], ["Winter"]],
      [["party", "sequin", "silk"], ["Party"]],
      [["gym", "sport", "active"], ["Activewear"]],
      [["vintage", "retro"], ["Vintage"]],
      [["y2k"], ["Y2K"]],
      [["formal", "office", "work"], ["Formal", "Workwear"]],
      [["tank"], ["Tank Tops"]],
      [["baby tee", "fitted"], ["Baby Tees & Fitted Tops"]],
      [["crop"], ["Y2K & Crop Tops"]],
      [["oversized"], ["Oversized & Streetwear Tops"]],
      [["corset"], ["Corset & Going-Out Tops"]],
    ];

    rules.forEach(([keywords, tagsToAdd]) => {
      if (keywords.some((keyword) => sourceText.includes(keyword))) {
        tagsToAdd.forEach((tag) => suggestions.add(tag));
      }
    });

    if (["Formal", "Sports", "Casual"].includes(category)) suggestions.add(category);
    if (["Shoes", "Heels", "Boots"].includes(category)) suggestions.add("Footwear");
    if (category === "Accessories") suggestions.add("Accent Piece");

    return Array.from(suggestions).slice(0, 10);
  }, [category, categoryStyle, file?.name]);

  const addSuggestedTag = (tag: string) => {
    const currentTags = tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (currentTags.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      return;
    }

    setTags([...currentTags, tag].join(", "));
  };

  const getTagsWithTopStyle = () => {
    const currentTags = tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (categoryStyle && !currentTags.some((item) => item.toLowerCase() === categoryStyle.toLowerCase())) {
      currentTags.push(categoryStyle);
    }

    return currentTags.join(", ");
  };

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;

    setIsProcessing(true);
    
    const formData = new FormData(event.currentTarget);
    formData.append("file", file);
    formData.set("name", categoryStyle || category);
    formData.set("tags", getTagsWithTopStyle());

    // Simulate "AI Background Removal" delay
    await new Promise(r => setTimeout(r, 2000));

    const result = await uploadClothingItem(formData);

    if (result.error) {
      setError(result.error);
      setIsProcessing(false);
    } else {
      setIsProcessing(false);
      setIsDone(true);
      setTimeout(() => {
        router.push("/closet");
      }, 1500);
    }
  }

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setIsDone(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-10">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-4xl font-black tracking-tighter">Studio Upload</h1>
        <p className="text-nebula-on-surface/40 uppercase tracking-[0.2em] text-xs font-bold">
          Add new drip to your digital vault
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left: Dropzone / Preview */}
        <div className="space-y-6">
          {!preview ? (
            <div 
              {...getRootProps()} 
              className={`aspect-square rounded-nebula border-2 border-dashed flex flex-col items-center justify-center gap-6 p-10 transition-all cursor-pointer group ${
                isDragActive 
                  ? "border-nebula-primary bg-nebula-primary/5 scale-95" 
                  : "border-black/10 glass hover:border-nebula-primary/30 hover:bg-black/5"
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-20 h-20 rounded-full bg-nebula-primary/10 flex items-center justify-center text-nebula-primary group-hover:scale-110 transition-transform">
                <CloudUpload size={40} />
              </div>
              <div className="text-center space-y-2">
                <p className="font-bold text-lg text-nebula-on-surface">Drop your fit here</p>
                <p className="text-xs text-nebula-on-surface/40 font-medium">PNG, JPG or WebP (Max 5MB)</p>
              </div>
            </div>
          ) : (
            <div className="relative aspect-square rounded-nebula overflow-hidden glass group shadow-2xl shadow-nebula-primary/5">
              <Image 
                src={preview} 
                alt="Preview" 
                fill
                unoptimized
                className={`object-cover transition-all duration-700 ${isProcessing ? "blur-md scale-105 opacity-50" : ""}`} 
              />
              
              {isProcessing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-nebula-primary bg-nebula-bg/40 backdrop-blur-sm z-20">
                  <div className="relative w-16 h-16">
                    <Loader2 className="animate-spin absolute inset-0" size={64} />
                    <Sparkles className="absolute inset-0 m-auto animate-pulse" size={24} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest animate-pulse">Removing Background...</p>
                </div>
              )}

              {isDone && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-nebula-primary bg-nebula-bg/60 backdrop-blur-md z-30">
                  <CheckCircle2 size={64} className="scale-110 transition-transform duration-500" />
                  <p className="text-xs font-black uppercase tracking-widest">Added to Closet</p>
                </div>
              )}

              <button 
                onClick={removeFile}
                className="absolute top-4 right-4 p-2 bg-black/50 text-nebula-on-surface rounded-full hover:bg-black/70 transition-colors z-40 backdrop-blur-md"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Right: Form */}
        <div className="glass p-8 rounded-nebula border border-black/5 space-y-8">
           <form onSubmit={handleUpload} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-nebula-inner text-red-500 text-xs font-bold uppercase tracking-widest">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-nebula-on-surface/30 ml-1">Category</label>
                  <input
                    type="hidden"
                    name="category"
                    value={category}
                  />
                  <div ref={categoryMenuRef} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {clothingCategories.map((option) => {
                      const styleOptions = categoryStyleOptions[option] ?? [];
                      const hasStyles = styleOptions.length > 0;
                      const isActive = category === option;
                      const isOpen = openCategoryMenu === option;

                      return (
                        <div key={option} className="relative">
                          <button
                            type="button"
                            disabled={isProcessing || isDone}
                            onClick={() => {
                              setCategory(option);
                              if (hasStyles) {
                                setOpenCategoryMenu((currentOpen) => currentOpen === option ? null : option);
                              } else {
                                setCategoryStyle("");
                                setOpenCategoryMenu(null);
                              }
                            }}
                            className={`min-h-11 w-full rounded-nebula-inner border px-3 text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                              isActive
                                ? "bg-nebula-secondary text-nebula-bg border-nebula-secondary shadow-lg shadow-nebula-secondary/15"
                                : "bg-black/5 text-nebula-on-surface/60 border-black/5 hover:border-nebula-secondary/40 hover:text-nebula-secondary"
                            }`}
                          >
                            <span>{isActive && categoryStyle ? categoryStyle : option}</span>
                            {hasStyles && (
                              <ChevronDown
                                size={16}
                                className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                              />
                            )}
                          </button>

                          {hasStyles && isOpen && (
                            <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 rounded-nebula-inner border border-black/5 bg-nebula-surface shadow-2xl shadow-black/20 p-2 space-y-1">
                              {styleOptions.map((styleOption) => (
                                <button
                                  key={styleOption}
                                  type="button"
                                  disabled={isProcessing || isDone}
                                  onClick={() => {
                                    setCategory(option);
                                    setCategoryStyle(styleOption);
                                    setOpenCategoryMenu(null);
                                  }}
                                  className={`w-full rounded-nebula-inner px-3 py-3 text-left text-xs font-bold transition-all disabled:opacity-50 ${
                                    categoryStyle === styleOption
                                      ? "bg-nebula-primary text-nebula-bg"
                                      : "text-nebula-on-surface/60 hover:bg-black/5 hover:text-nebula-primary"
                                  }`}
                                >
                                  {styleOption}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-nebula-on-surface/30 ml-1">Vibe / Tags</label>
                  <input 
                    name="tags"
                    disabled={isProcessing || isDone}
                    type="text" 
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="e.g. Streetwear, Y2K, Summer"
                    className="w-full bg-black/5 border border-black/5 rounded-nebula-inner px-4 py-3 outline-none focus:border-nebula-primary/50 focus:bg-black/10 transition-all text-sm disabled:opacity-50"
                  />
                  <div className="flex flex-wrap gap-2 pt-1">
                    {suggestedTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        disabled={isProcessing || isDone}
                        onClick={() => addSuggestedTag(tag)}
                        className="px-3 py-1.5 rounded-full bg-nebula-primary/10 border border-nebula-primary/20 text-nebula-primary text-[10px] font-bold uppercase tracking-widest hover:bg-nebula-primary/20 disabled:opacity-50 transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                disabled={!file || isProcessing || isDone}
                type="submit" 
                className="w-full py-4 bg-nebula-primary text-nebula-bg font-black rounded-full flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-nebula-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isProcessing ? <Loader2 size={24} className="animate-spin" /> : (
                  <>
                    <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                    <span className="uppercase tracking-widest text-xs">Process & Save</span>
                  </>
                )}
              </button>
           </form>
           
           <div className="p-4 bg-nebula-secondary/5 rounded-nebula-inner border border-nebula-secondary/10 flex gap-4">
              <div className="p-2 h-fit rounded-full bg-nebula-secondary/20 text-nebula-secondary">
                 <ImageIcon size={16} />
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-nebula-secondary uppercase tracking-widest">Quick Tip</p>
                 <p className="text-[10px] text-nebula-on-surface/40 leading-relaxed font-medium">Use a flat surface or a hanger for the best background removal results. Our AI works best with contrasting colors.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
