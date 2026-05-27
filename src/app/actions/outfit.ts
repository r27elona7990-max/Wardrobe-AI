"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveOutfit(name: string, itemIds: string[]) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { error: "You must be logged in to save outfits." };
  }

  if (!name || !itemIds || itemIds.length === 0) {
    return { error: "Missing outfit name or clothing items." };
  }

  try {
    const userId = (session.user as { id: string }).id;

    // Verify all item IDs belong to this user
    const dbItemsCount = await prisma.clothingItem.count({
      where: {
        id: { in: itemIds },
        userId: userId,
      },
    });

    if (dbItemsCount !== itemIds.length) {
      return { error: "One or more selected items could not be found in your closet." };
    }

    const newOutfit = await prisma.outfit.create({
      data: {
        name,
        itemIds: itemIds.join(","),
        userId: userId,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { success: true, outfit: newOutfit };
  } catch (error) {
    console.error("Save outfit error:", error);
    return { error: "Failed to save outfit." };
  }
}
