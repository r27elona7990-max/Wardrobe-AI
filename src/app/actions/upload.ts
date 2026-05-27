"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { revalidatePath } from "next/cache";

export async function uploadClothingItem(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { error: "You must be logged in to upload items." };
  }

  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const tags = formData.get("tags") as string;
  const file = formData.get("file") as File;

  if (!file || !name || !category) {
    return { error: "Missing required fields." };
  }

  try {
    // In a real production app, we would upload to S3/Cloudinary/Supabase Storage.
    // For local dev, we'll save to the public folder.
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const path = join(process.cwd(), "public", "uploads", filename);
    
    await writeFile(path, buffer);
    const imagePath = `/uploads/${filename}`;

    // Save to database
    const newItem = await prisma.clothingItem.create({
      data: {
        name,
        category,
        tags,
        imagePath,
        userId: (session.user as { id: string }).id,
      },
    });

    revalidatePath("/closet");
    return { success: true, item: newItem };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Failed to upload item." };
  }
}
