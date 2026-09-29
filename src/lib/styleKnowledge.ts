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
  {
    name: "Old Money",
    keywords: ["old money", "preppy", "heritage", "tailored", "polo", "cashmere"],
    colors: ["navy", "cream", "white", "brown", "burgundy"],
    occasions: ["College", "Work", "Date", "Travel"],
    weather: ["Mild", "Cold"],
    pieces: ["Formal Shirts", "Trousers", "Loafers", "Blazers"],
    explanation:
      "Old-money styling combines polished tailoring, heritage basics, restrained colors, and classic footwear.",
  },
  {
    name: "Quiet Luxury",
    keywords: ["quiet luxury", "minimal", "tailored", "linen", "cashmere", "silk"],
    colors: ["cream", "beige", "brown", "navy", "white"],
    occasions: ["Work", "Date", "Travel"],
    weather: ["Hot", "Mild", "Cold"],
    pieces: ["Formal Shirts", "Trousers", "Loafers", "Smart Casual"],
    explanation:
      "Quiet luxury relies on refined fabrics, clean silhouettes, subtle colors, and minimal branding.",
  },
  {
    name: "Coquette",
    keywords: ["coquette", "bow", "lace", "ribbon", "corset", "pearl"],
    colors: ["pink", "white", "cream", "red"],
    occasions: ["Date", "Party", "Casual"],
    weather: ["Hot", "Mild"],
    pieces: [
      "Cute Feminine Tops",
      "Corset & Going-Out Tops",
      "Mini Skirts",
      "Kitten Heels",
    ],
    explanation:
      "Coquette styling uses delicate details, fitted shapes, soft colors, and romantic accessories.",
  },
  {
    name: "Mob Wife",
    keywords: ["mob wife", "faux fur", "animal print", "leopard", "leather", "gold", "bodycon"],
    colors: ["black", "brown", "red", "burgundy", "gold"],
    occasions: ["Date", "Party"],
    weather: ["Mild", "Cold"],
    pieces: ["Bodycon Dresses", "Knee-High Boots", "Stilettos", "Jewelry"],
    explanation:
      "Mob-wife styling combines dramatic textures, bold accessories, body-conscious shapes, and confident footwear.",
  },
  {
    name: "Scandi Minimalist",
    keywords: ["scandi", "minimal", "oversized", "neutral", "practical", "relaxed"],
    colors: ["white", "cream", "grey", "black", "blue", "brown"],
    occasions: ["Casual", "College", "Work", "Travel"],
    weather: ["Mild", "Cold"],
    pieces: ["Oversized Shirts", "Straight Jeans", "Trousers", "Flats", "Sneakers"],
    explanation:
      "Scandi minimalism balances relaxed silhouettes, practical layers, muted colors, and clean footwear.",
  },
  {
    name: "Dark Academia",
    keywords: ["dark academia", "academic", "plaid", "tweed", "knit", "vintage", "preppy"],
    colors: ["brown", "black", "burgundy", "cream", "grey"],
    occasions: ["College", "Work", "Date"],
    weather: ["Mild", "Cold", "Rainy"],
    pieces: ["Blazers", "Formal Shirts", "Pleated Skirts", "Trousers", "Loafers"],
    explanation:
      "Dark academia uses scholarly tailoring, rich neutral colors, vintage textures, and structured footwear.",
  },
  {
    name: "Light Academia",
    keywords: ["light academia", "academic", "linen", "cardigan", "pleated", "preppy"],
    colors: ["cream", "white", "beige", "brown", "yellow"],
    occasions: ["College", "Work", "Date"],
    weather: ["Hot", "Mild"],
    pieces: ["Formal Shirts", "Pleated Skirts", "Trousers", "Flats", "Loafers"],
    explanation:
      "Light academia combines soft tailoring, airy neutral colors, scholarly details, and polished basics.",
  },
  {
    name: "Boho Chic",
    keywords: ["boho", "bohemian", "crochet", "suede", "flowing", "earthy", "fringe"],
    colors: ["brown", "cream", "white", "green", "yellow"],
    occasions: ["Casual", "Date", "Travel", "Party"],
    weather: ["Hot", "Mild"],
    pieces: ["Maxi Dresses", "Midi Skirts", "Sandals", "Jewelry", "Bags"],
    explanation:
      "Boho-chic styling blends flowing silhouettes, earthy colors, natural textures, and layered accessories.",
  },
];
const colorAliases: Record<string, string[]> = {
  black: ["black", "charcoal"],
  white: ["white", "ivory"],
  cream: ["cream", "beige"],
  brown: ["brown", "espresso", "chocolate", "tan"],
  grey: ["grey", "gray", "silver"],

  navy: ["navy"],
  babyBlue: ["baby blue", "powder blue"],
  denim: ["denim"],
  blue: ["blue"],

  pink: ["pink", "rose", "peony"],
  lavender: ["lavender", "purple", "violet"],

  sage: ["sage"],
  green: ["green", "mint"],

  burgundy: ["burgundy", "maroon", "wine"],
  red: ["red"],

  yellow: ["yellow", "butter", "gold"],
};

const colorMatches: Record<string, string[]> = {
  black: [
    "white",
    "grey",
    "blue",
    "denim",
    "pink",
    "red",
    "burgundy",
    "cream",
  ],
  white: [
    "black",
    "blue",
    "navy",
    "babyBlue",
    "denim",
    "pink",
    "cream",
    "brown",
    "green",
    "sage",
    "red",
    "burgundy",
    "yellow",
  ],
  cream: [
    "white",
    "brown",
    "blue",
    "navy",
    "babyBlue",
    "denim",
    "black",
    "pink",
    "sage",
    "burgundy",
    "yellow",
  ],
  brown: [
    "cream",
    "white",
    "blue",
    "babyBlue",
    "denim",
    "green",
    "sage",
    "black",
  ],
  grey: [
    "black",
    "white",
    "blue",
    "navy",
    "babyBlue",
    "denim",
    "pink",
    "red",
    "burgundy",
  ],
  blue: ["white", "cream", "black", "brown", "pink", "grey"],
  navy: ["white", "cream", "babyBlue", "grey", "brown"],
  babyBlue: ["brown", "white", "cream", "navy", "grey"],
  denim: ["red", "burgundy", "white", "cream", "brown", "black"],
  pink: ["white", "cream", "blue", "denim", "black", "grey", "lavender"],
  lavender: ["white", "cream", "pink", "grey", "black"],
  green: ["white", "cream", "brown", "black", "blue"],
  sage: ["cream", "white", "brown", "navy"],
  red: ["black", "white", "grey", "blue", "denim"],
  burgundy: ["cream", "white", "grey", "denim", "black"],
  yellow: ["white", "cream", "blue", "denim", "brown", "black"],
};

const trendingKeywords = [
  "oversized",
  "wide leg",
  "wide-leg",
  "baggy",
  "cargo",
  "linen",
  "coquette",
  "bow",
  "quiet luxury",
  "old money",
];

export const styleGuidelines = [
  "For work, start with a tailored shirt or blazer, structured trousers, and polished shoes.",
  "For parties, choose one standout piece, then keep the other pieces and colors balanced.",
  "Dress for the weather: lighter fabrics in heat, layers in cold, and practical shoes in rain.",
  "Use color harmony and a balanced silhouette to make separate pieces feel like one outfit.",
];

const normalize = (value: string) => value.toLowerCase();

const getItemText = (item: StyleItem) =>
  normalize(`${item.name} ${item.category} ${item.tags ?? ""}`);

const includesAny = (text: string, keywords: string[]) =>
  keywords.some((keyword) => text.includes(normalize(keyword)));

export const detectItemColors = (item: StyleItem) => {
  const text = getItemText(item);

  const colors = Object.entries(colorAliases)
    .filter(([, aliases]) =>
      aliases.some((alias) => {
        const escapedAlias = alias.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

        return new RegExp(`\\b${escapedAlias}\\b`, "i").test(text);
      })
    )
    .map(([color]) => color);

  if (colors.includes("babyBlue")) {
    return colors.filter((color) => color !== "blue");
  }

  return colors;
};

const getProfileScoreForText = (
  profile: AestheticProfile,
  text: string,
  context: StyleContext
) => {
  const matchesKeyword = includesAny(text, profile.keywords);
  const matchesPiece = includesAny(text, profile.pieces);

  if (!matchesKeyword && !matchesPiece) return 0;

  let score = 0;

  if (matchesKeyword) score += 5;
  if (matchesPiece) score += 5;
  if (includesAny(text, profile.colors)) score += 2;
  if (profile.occasions.includes(context.occasion)) score += 2;
  else score -= 2;
  if (profile.weather.includes(context.weather)) score += 1;

  return score;
};

export const scoreItemForStyle = (
  item: StyleItem,
  context: StyleContext
) => {
  const text = getItemText(item);

  const profileScore = aestheticProfiles.reduce(
    (score, profile) =>
      score + getProfileScoreForText(profile, text, context),
    0
  );

  const weatherScore = getWeatherScore(text, context.weather);
  const occasionScore = getOccasionScore(text, context.occasion);
  const weatherPenalty = getWeatherPenalty(text, context.weather);
  const trendScore = includesAny(text, trendingKeywords) ? 3 : 0;

  return (
    profileScore +
    weatherScore +
    occasionScore +
    weatherPenalty +
    trendScore +
    stableTieBreaker(item.id)
  );
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

const getWeatherPenalty = (text: string, weather: string) => {
  const unsuitable: Record<string, string[]> = {
    Hot: ["wool", "knit", "hoodie", "coat", "faux fur", "knee-high boot"],
    Mild: [],
    Cold: ["tank", "shorts", "sandal", "linen", "crop top"],
    Rainy: ["suede", "stiletto", "open toe", "sandal", "silk"],
  };
  return includesAny(text, unsuitable[weather] ?? []) ? -5 : 0;
};

const getOccasionScore = (text: string, occasion: string) => {
  const occasionRules: Record<string, string[]> = {
    Casual: ["casual", "basic", "streetwear", "denim", "tee", "sneaker", "everyday"],
    College: ["casual", "comfortable", "denim", "sneaker", "tee", "streetwear", "bag", "preppy"],
    Work: ["formal", "office", "shirt", "blazer", "trouser", "loafers", "smart", "tailored", "workwear"],
    Date: ["cute", "fitted", "corset", "skirt", "dress", "heels", "classic", "romantic"],
    Party: ["party", "going-out", "corset", "statement", "silk", "heels", "y2k", "sequin", "glam", "stiletto"],
    Travel: ["comfortable", "casual", "sneaker", "cargo", "tracksuit", "basics", "practical"],
  };

  const matched = includesAny(text, occasionRules[occasion] ?? []);
  const formalSignals = ["formal", "office", "blazer", "trouser", "tailored", "workwear"];
  const partySignals = ["party", "going-out", "corset", "statement", "silk", "heels", "sequin", "glam", "stiletto"];
  const casualSignals = ["casual", "basic", "everyday", "sneaker", "tracksuit", "lounge"];
  let score = matched ? 8 : 0;
  if (occasion === "Party" && includesAny(text, formalSignals) && !includesAny(text, partySignals)) score -= 5;
  if (occasion === "Work" && includesAny(text, partySignals) && !includesAny(text, formalSignals)) score -= 5;
  if (["Work", "Party", "Date"].includes(occasion) && includesAny(text, casualSignals)) score -= 2;
  return score;
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

const scoreStyleCoherence = (items: StyleItem[], context: StyleContext) => {
  const profileScores = aestheticProfiles.map((profile) => ({
    score: items.reduce(
      (total, item) => total + getProfileScoreForText(profile, getItemText(item), context),
      0
    ),
  }));
  profileScores.sort((a, b) => b.score - a.score);
  const [best, second] = profileScores;
  if (!best || best.score === 0) return 0;
  return Math.min(8, best.score) - (second?.score ? Math.min(4, second.score / 2) : 0);
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
  const occasionConsistency = items.reduce(
    (total, item) => total + getOccasionScore(getItemText(item), context.occasion),
    0
  );

  return {
    score: itemScore + profileConsistency + occasionConsistency + scoreColorHarmony(items) + scoreStyleCoherence(items, context),
    profile: bestProfile,
  };
};

const getSilhouetteReason = (
  top: StyleItem,
  bottom: StyleItem
) => {
  const topText = getItemText(top);
  const bottomText = getItemText(bottom);

  if (
    includesAny(topText, ["oversized", "relaxed", "loose"]) &&
    includesAny(bottomText, ["fitted", "slim", "skinny"])
  ) {
    return `The relaxed shape of ${top.name} is balanced by the slimmer fit of ${bottom.name}.`;
  }

  if (
    includesAny(topText, ["fitted", "crop", "bodycon"]) &&
    includesAny(bottomText, ["wide leg", "wide-leg", "baggy", "cargo"])
  ) {
    return `The fitted shape of ${top.name} balances the volume of ${bottom.name}.`;
  }

  return `${top.name} and ${bottom.name} create a coordinated foundation.`;
};

const getColorReason = (items: StyleItem[]) => {
  const colors = Array.from(
    new Set(items.flatMap(detectItemColors))
  );

  if (colors.length === 0) {
    return "The pieces share a visually cohesive direction.";
  }

  if (colors.length === 1) {
    return `The ${colors[0]} monochrome palette makes the outfit feel intentional.`;
  }

  const matchingPair = colors
    .flatMap((color, index) =>
      colors.slice(index + 1).map((otherColor) => [
        color,
        otherColor,
      ])
    )
    .find(
      ([color, otherColor]) =>
        colorMatches[color]?.includes(otherColor) ||
        colorMatches[otherColor]?.includes(color)
    );

  if (matchingPair) {
    return `The ${matchingPair[0]} and ${matchingPair[1]} tones complement each other.`;
  }

  return "The color palette stays balanced across the outfit.";
};

export const buildStylistExplanation = <T extends StyleItem>(
  draft: OutfitDraft<T>,
  context: StyleContext
) => {
  const { profile } = scoreOutfitDraft(draft, context);

  const items = [
    draft.top,
    draft.bottom,
    draft.shoes,
    draft.accessories,
  ].filter((item): item is T => Boolean(item));

  const silhouetteReason = getSilhouetteReason(
    draft.top,
    draft.bottom
  );

  const colorReason = getColorReason(items);

  const accessoryReason = draft.accessories
    ? `${draft.accessories.name} adds a deliberate finishing detail.`
    : "";

  return [
    `This outfit follows a ${profile.name} aesthetic.`,
    silhouetteReason,
    colorReason,
    `${draft.shoes.name} keeps the outfit grounded and suitable for ${context.occasion.toLowerCase()} plans in ${context.weather.toLowerCase()} weather.`,
    profile.explanation,
    accessoryReason,
  ]
    .filter(Boolean)
    .join(" ");
};
