export interface StyleItem {
  id: string;
  name: string;
  category: string;
  tags: string | null;
}

export interface StyleContext {
  occasion: string;
  weather: string;
}

export interface OutfitDraft<T extends StyleItem> {
  top: T;
  bottom: T;
  shoes: T;
  accessories?: T;
}

interface AestheticProfile {
  name: string;
  keywords: string[];
  colors: string[];
  occasions: string[];
  weather: string[];
  pieces: string[];
  explanation: string;
}

const aestheticProfiles: AestheticProfile[] = [
  {
    name: "Y2K",
    keywords: ["y2k", "crop", "baby tee", "fitted", "mini", "denim", "platform", "going-out"],
    colors: ["pink", "silver", "black", "blue", "white"],
    occasions: ["Casual", "College", "Date", "Party"],
    weather: ["Hot", "Mild"],
    pieces: ["Baby Tees & Fitted Tops", "Y2K & Crop Tops", "Mini Skirts", "Denim Skirts", "Platform Heels"],
    explanation: "Y2K energy works best with fitted tops, denim, mini shapes, platforms, and one playful accent.",
  },
  {
    name: "Clean Girl",
    keywords: ["clean", "minimal", "basic", "fitted", "cream", "white", "gold", "classic", "smart casual"],
    colors: ["white", "cream", "beige", "brown", "gold", "black"],
    occasions: ["Casual", "College", "Work", "Date", "Travel"],
    weather: ["Hot", "Mild"],
    pieces: ["Basic Tees", "Formal Shirts", "Straight Jeans", "Flats", "Loafers", "Jewelry", "Bags"],
    explanation: "Clean-girl styling feels polished when soft neutrals, simple silhouettes, and subtle accessories stay balanced.",
  },
  {
    name: "Streetwear",
    keywords: ["streetwear", "oversized", "cargo", "graphic", "sneaker", "hoodie", "denim"],
    colors: ["black", "white", "grey", "red", "blue", "navy"],
    occasions: ["Casual", "College", "Travel"],
    weather: ["Mild", "Cold", "Rainy"],
    pieces: ["Oversized & Streetwear Tops", "Graphic Tees", "Oversized Tees", "Cargo Pants", "Sneakers", "Hats"],
    explanation: "Streetwear looks strongest with volume, sneakers, cargo or denim texture, and a relaxed top.",
  },
  {
    name: "Soft Feminine",
    keywords: ["cute", "soft", "pink", "lavender", "skirt", "dress", "feminine", "corset"],
    colors: ["pink", "lavender", "white", "cream", "blue"],
    occasions: ["Date", "Party", "College", "Casual"],
    weather: ["Hot", "Mild"],
    pieces: ["Cute Feminine Tops", "Corset & Going-Out Tops", "Midi Skirts", "Party Dresses", "Kitten Heels"],
    explanation: "Soft feminine outfits work with delicate colors, fitted tops, skirts or dresses, and a light accessory.",
  },
  {
    name: "Office Siren",
    keywords: ["formal", "office", "work", "shirt", "blazer", "trouser", "loafers", "smart"],
    colors: ["black", "white", "grey", "brown", "cream"],
    occasions: ["Work", "Date"],
    weather: ["Mild", "Cold", "Rainy"],
    pieces: ["Formal Shirts", "Office Wear", "Blazers", "Trousers", "Loafers", "Ankle Boots"],
    explanation: "Office-siren styling is sharper with fitted tailoring, neutral colors, clean footwear, and minimal accents.",
  },
  {
    name: "Athleisure",
    keywords: ["sports", "gym", "active", "athleisure", "tracksuit", "sneaker", "comfortable"],
    colors: ["black", "grey", "white", "blue", "green"],
    occasions: ["Casual", "College", "Travel"],
    weather: ["Hot", "Mild", "Cold"],
    pieces: ["Gym Wear", "Athleisure", "Tracksuits", "Sports Shoes", "Sneakers"],
    explanation: "Athleisure works when comfort pieces look intentional with clean sneakers and simple color matching.",
  },
];

const colorAliases: Record<string, string[]> = {
  black: ["black", "charcoal"],
  white: ["white", "ivory"],
  cream: ["cream", "beige", "tan"],
  brown: ["brown", "espresso", "chocolate"],
  grey: ["grey", "gray", "silver"],
  blue: ["blue", "denim", "navy", "baby blue"],
  pink: ["pink", "rose", "peony"],
  lavender: ["lavender", "purple", "violet"],
  green: ["green", "mint", "sage"],
  red: ["red", "burgundy", "maroon"],
  yellow: ["yellow", "butter", "gold"],
};

const colorMatches: Record<string, string[]> = {
  black: ["white", "grey", "blue", "pink", "red", "cream", "silver"],
  white: ["black", "blue", "pink", "cream", "brown", "green", "red", "yellow"],
  cream: ["white", "brown", "blue", "black", "pink", "yellow"],
  brown: ["cream", "white", "blue", "green", "black"],
  grey: ["black", "white", "blue", "pink", "red"],
  blue: ["white", "cream", "black", "brown", "pink", "grey"],
  pink: ["white", "cream", "blue", "black", "grey", "lavender"],
  lavender: ["white", "cream", "pink", "grey", "black"],
  green: ["white", "cream", "brown", "black", "blue"],
  red: ["black", "white", "grey", "blue"],
  yellow: ["white", "cream", "blue", "brown", "black"],
};

export const styleGuidelines = [
  "Balance one statement piece with cleaner basics.",
  "Use black, white, cream, denim, or brown when you need a safe anchor color.",
  "Match the vibe first, then use footwear and accessories to make the outfit feel intentional.",
];

const normalize = (value: string) => value.toLowerCase();

const getItemText = (item: StyleItem) =>
  normalize(`${item.name} ${item.category} ${item.tags ?? ""}`);

const includesAny = (text: string, keywords: string[]) =>
  keywords.some((keyword) => text.includes(normalize(keyword)));

export const detectItemColors = (item: StyleItem) => {
  const text = getItemText(item);

  return Object.entries(colorAliases)
    .filter(([, aliases]) => aliases.some((alias) => text.includes(alias)))
    .map(([color]) => color);
};

const getProfileScoreForText = (profile: AestheticProfile, text: string, context: StyleContext) => {
  let score = 0;

  if (includesAny(text, profile.keywords)) score += 5;
  if (includesAny(text, profile.pieces)) score += 5;
  if (profile.occasions.includes(context.occasion)) score += 2;
  if (profile.weather.includes(context.weather)) score += 1;

  return score;
};

export const scoreItemForStyle = (item: StyleItem, context: StyleContext) => {
  const text = getItemText(item);
  const profileScore = aestheticProfiles.reduce(
    (score, profile) => score + getProfileScoreForText(profile, text, context),
    0
  );
  const weatherScore = getWeatherScore(text, context.weather);
  const occasionScore = getOccasionScore(text, context.occasion);

  return profileScore + weatherScore + occasionScore + stableTieBreaker(item.id);
};

const getWeatherScore = (text: string, weather: string) => {
  const weatherRules: Record<string, string[]> = {
    Hot: ["summer", "linen", "shorts", "tank", "tee", "crop", "light", "sandal"],
    Mild: ["denim", "shirt", "casual", "layering", "sneaker", "skirt"],
    Cold: ["winter", "wool", "knit", "hoodie", "jacket", "coat", "boot"],
    Rainy: ["boot", "dark", "jacket", "coat", "waterproof", "layering"],
  };

  return includesAny(text, weatherRules[weather] ?? []) ? 4 : 0;
};

const getOccasionScore = (text: string, occasion: string) => {
  const occasionRules: Record<string, string[]> = {
    Casual: ["casual", "basic", "streetwear", "denim", "tee", "sneaker", "everyday"],
    College: ["casual", "comfortable", "denim", "sneaker", "tee", "streetwear", "bag"],
    Work: ["formal", "office", "shirt", "blazer", "trouser", "loafers", "smart"],
    Date: ["cute", "fitted", "corset", "skirt", "dress", "heels", "classic"],
    Party: ["party", "going-out", "corset", "statement", "silk", "heels", "y2k"],
    Travel: ["comfortable", "casual", "sneaker", "cargo", "tracksuit", "basics"],
  };

  return includesAny(text, occasionRules[occasion] ?? []) ? 5 : 0;
};

const stableTieBreaker = (id: string) => {
  const total = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (total % 100) / 1000;
};

const scoreColorHarmony = (items: StyleItem[]) => {
  const colors = items.flatMap(detectItemColors);
  const uniqueColors = Array.from(new Set(colors));

  if (uniqueColors.length === 0) return 1;
  if (uniqueColors.length === 1) return 4;
  if (uniqueColors.length > 4) return -4;

  let score = 0;
  uniqueColors.forEach((color, index) => {
    uniqueColors.slice(index + 1).forEach((otherColor) => {
      if (colorMatches[color]?.includes(otherColor) || colorMatches[otherColor]?.includes(color)) {
        score += 3;
      }
    });
  });

  if (uniqueColors.some((color) => ["black", "white", "cream", "blue", "brown"].includes(color))) {
    score += 3;
  }

  return score;
};

const findBestProfile = (items: StyleItem[], context: StyleContext) => {
  const text = items.map(getItemText).join(" ");
  return aestheticProfiles
    .map((profile) => ({
      profile,
      score: getProfileScoreForText(profile, text, context),
    }))
    .sort((a, b) => b.score - a.score)[0].profile;
};

export const scoreOutfitDraft = <T extends StyleItem>(
  draft: OutfitDraft<T>,
  context: StyleContext
) => {
  const items = [draft.top, draft.bottom, draft.shoes, draft.accessories].filter(
    (item): item is T => Boolean(item)
  );
  const bestProfile = findBestProfile(items, context);
  const itemScore = items.reduce((score, item) => score + scoreItemForStyle(item, context), 0);
  const profileConsistency = items.filter((item) =>
    includesAny(getItemText(item), [...bestProfile.keywords, ...bestProfile.pieces])
  ).length * 4;

  return {
    score: itemScore + profileConsistency + scoreColorHarmony(items),
    profile: bestProfile,
  };
};

export const buildStylistExplanation = <T extends StyleItem>(
  draft: OutfitDraft<T>,
  context: StyleContext
) => {
  const { profile } = scoreOutfitDraft(draft, context);
  const accessoryText = draft.accessories
    ? ` The ${draft.accessories.name} adds a finishing accent without making the fit feel busy.`
    : "";

  return `Drafted a ${context.weather.toLowerCase()} ${context.occasion.toLowerCase()} fit with a ${profile.name} direction. ${profile.explanation} ${draft.top.name} and ${draft.bottom.name} set the base, while ${draft.shoes.name} keeps the look grounded.${accessoryText}`;
};

