"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import { join } from "path";

const deleteFromSupabaseStorage = async (imagePath: string) => {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "clothing-items";

  if (!supabaseUrl || !serviceRoleKey || !imagePath.startsWith(supabaseUrl)) {
    return false;
  }

  const publicPrefix = `${supabaseUrl}/storage/v1/object/public/${bucket}/`;
  const objectPath = imagePath.startsWith(publicPrefix)
    ? imagePath.slice(publicPrefix.length)
    : "";

  if (!objectPath) {
    return false;
  }

  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`, {
    method: "DELETE",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    console.warn(`[Clothing Action] Failed to delete Supabase object ${objectPath}:`, message);
  }

  return true;
};

export async function deleteClothingItem(id: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { error: "You must be logged in to delete clothing items." };
  }

  try {
    const userId = (session.user as { id: string }).id;

    // Fetch item to verify ownership and get image path
    const item = await prisma.clothingItem.findUnique({
      where: { id },
    });

    if (!item) {
      return { error: "Clothing item not found." };
    }

    if (item.userId !== userId) {
      return { error: "You do not have permission to delete this item." };
    }

    // Delete record from database
    await prisma.clothingItem.delete({
      where: { id },
    });

    if (item.imagePath) {
      const deletedCloudFile = await deleteFromSupabaseStorage(item.imagePath);

      if (deletedCloudFile) {
        revalidatePath("/closet");
        revalidatePath("/dashboard");
        revalidatePath("/studio");
        revalidatePath("/profile");

        return { success: true };
      }

      // Delete local development file from public folder.
      // Remove leading slash if present to join correctly with "public"
      const relativePath = item.imagePath.startsWith("/") 
        ? item.imagePath.slice(1) 
        : item.imagePath;
      
      const filePath = join(process.cwd(), "public", relativePath);
      
      await unlink(filePath).catch((err) => {
        console.warn(`[Clothing Action] Failed to delete file at ${filePath}:`, err.message);
      });
    }

    revalidatePath("/closet");
    revalidatePath("/dashboard");
    revalidatePath("/studio");
    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Delete clothing item error:", error);
    return { error: "Failed to delete clothing item." };
  }
}
