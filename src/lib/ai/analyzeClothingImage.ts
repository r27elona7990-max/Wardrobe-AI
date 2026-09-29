import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI();

export const ClothingAnalysisSchema = z.object({
  category: z.enum([
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
  ]),
  colors: z.array(z.string()),
  styles: z.array(z.string()),
  fits: z.array(z.string()),
  aesthetics: z.array(z.string()),
  seasons: z.array(z.string()),
  materials: z.array(z.string()),
});

export type ClothingAnalysis = z.infer<
  typeof ClothingAnalysisSchema
>;

export async function analyzeClothingImage(
  buffer: Buffer,
  mimeType: string
): Promise<ClothingAnalysis> {
  const base64Image = buffer.toString("base64");

  const response = await openai.responses.parse({
    model: "gpt-5.5",
    input: [
      {
        role: "system",
        content:
          "Analyze clothing images for a wardrobe styling application. Only describe visible clothing attributes. Use short lowercase labels.",
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `
Identify the clothing item's:
- category, using exactly one of: Tops, Shirts, T-Shirts,
  Bottoms, Dresses, Skirts, Shoes, Heels, Boots,
  Formal, Sports, Casual, Accessories
- main colors
- clothing styles
- fit or silhouette
- fashion aesthetics
- suitable seasons
- visible materials

Examples include oversized, fitted, wide leg, streetwear,
old money, quiet luxury, coquette, linen, denim, summer, winter.
            `.trim(),
          },
          {
            type: "input_image",
            image_url: `data:${mimeType};base64,${base64Image}`,
            detail: "low",
          },
        ],
      },
    ],
    text: {
      format: zodTextFormat(
        ClothingAnalysisSchema,
        "clothing_analysis"
      ),
    },
  });

  if (!response.output_parsed) {
    throw new Error("The clothing image could not be analyzed.");
  }

  return response.output_parsed;
}
