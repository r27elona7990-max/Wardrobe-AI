"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const outfitSchema = z.object({
  name: z.string().trim().min(1).max(80),
  itemIds: z.array(z.string().cuid()).min(3).max(4),
});

export async function saveOutfit(name: string, itemIds: string[]) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { error: "You must be logged in to save outfits." };
  }

  const parsedOutfit = outfitSchema.safeParse({
    name,
    itemIds: Array.from(new Set(itemIds)),
  });

  if (!parsedOutfit.success) {
    return { error: "Choose 3–4 unique closet items and a valid outfit name." };
  }

  try {
    const userId = (session.user as { id: string }).id;
    const validatedOutfit = parsedOutfit.data;

    // Verify all item IDs belong to this user
    const dbItemsCount = await prisma.clothingItem.count({
      where: {
        id: { in: validatedOutfit.itemIds },
        userId: userId,
      },
    });

    if (dbItemsCount !== validatedOutfit.itemIds.length) {
      return { error: "One or more selected items could not be found in your closet." };
    }

    const newOutfit = await prisma.outfit.create({
      data: {
        name: validatedOutfit.name,
        userId: userId,
        items: {
          create: validatedOutfit.itemIds.map((clothingItemId, position) => ({
            clothingItemId,
            position,
          })),
        },
      },
      select: { id: true },
    });

    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { success: true, outfitId: newOutfit.id };
  } catch (error) {
    console.error("Save outfit error:", error);
    return { error: "Failed to save outfit." };
  }
}
