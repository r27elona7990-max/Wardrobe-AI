export const clothingCategories = [
  "Tops",
  "Shirts",
  "T-Shirts",
  "Bottoms",
  "Dresses",
  "Skirts",
  "Shoes",
  "Heels",
  "Boots",
  "Formal",
  "Sports",
  "Casual",
  "Accessories",
];

export const isTopCategory = (category: string) =>
  ["Tops", "Shirts", "T-Shirts", "Dresses", "Formal", "Sports", "Casual"].includes(category);

export const isBottomCategory = (category: string) =>
  ["Bottoms", "Skirts"].includes(category);

export const isShoesCategory = (category: string) =>
  ["Shoes", "Heels", "Boots"].includes(category);
