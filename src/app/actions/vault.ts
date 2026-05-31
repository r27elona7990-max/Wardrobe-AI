"use server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import { join } from "path";

const cleanEnvValue = (value: string | undefined) =>
  value?.trim().replace(/^["']|["']$/g, "");

const getSupabaseObjectPath = (imagePath: string) => {
  const supabaseUrl = cleanEnvValue(process.env.SUPABASE_URL)?.replace(/\/$/, "");
  const bucket = cleanEnvValue(process.env.SUPABASE_STORAGE_BUCKET) ?? "clothing-items";

  if (!supabaseUrl || !imagePath.startsWith(supabaseUrl)) {
    return null;
  }

  const publicPrefix = `${supabaseUrl}/storage/v1/object/public/${bucket}/`;
  return imagePath.startsWith(publicPrefix) ? imagePath.slice(publicPrefix.length) : null;
};

const deleteSupabaseObjects = async (imagePaths: string[]) => {
  const supabaseUrl = cleanEnvValue(process.env.SUPABASE_URL)?.replace(/\/$/, "");
  const serviceRoleKey = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const bucket = cleanEnvValue(process.env.SUPABASE_STORAGE_BUCKET) ?? "clothing-items";

  if (!supabaseUrl || !serviceRoleKey) {
    return;
  }

  const objectPaths = imagePaths
    .map(getSupabaseObjectPath)
    .filter((objectPath): objectPath is string => Boolean(objectPath));

  if (objectPaths.length === 0) {
    return;
  }

  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}`, {
    method: "DELETE",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefixes: objectPaths }),
  });

  if (!response.ok) {
    const message = await response.text();
    console.warn("[Vault Action] Failed to delete some Supabase objects:", message);
  }
};

const deleteLocalFiles = async (imagePaths: string[]) => {
  await Promise.all(
    imagePaths
      .filter((imagePath) => imagePath.startsWith("/"))
      .map(async (imagePath) => {
        const relativePath = imagePath.slice(1);
        const filePath = join(process.cwd(), "public", relativePath);

        await unlink(filePath).catch((err) => {
          console.warn(`[Vault Action] Failed to delete file at ${filePath}:`, err.message);
        });
      })
  );
};

export async function deleteVault() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: "You must be logged in to delete your vault." };
  }

  try {
    const userId = (session.user as { id: string }).id;
    const clothingItems = await prisma.clothingItem.findMany({
      where: { userId },
      select: { imagePath: true },
    });
    const imagePaths = clothingItems.map((item) => item.imagePath).filter(Boolean);

    await prisma.$transaction([
      prisma.outfit.deleteMany({ where: { userId } }),
      prisma.clothingItem.deleteMany({ where: { userId } }),
    ]);

    await deleteSupabaseObjects(imagePaths);
    await deleteLocalFiles(imagePaths);

    revalidatePath("/closet");
    revalidatePath("/dashboard");
    revalidatePath("/studio");
    revalidatePath("/profile");

    return {
      success: true,
      deletedItems: clothingItems.length,
    };
  } catch (error) {
    console.error("Delete vault error:", error);
    return { error: "Failed to delete your vault. Please try again." };
  }
}

