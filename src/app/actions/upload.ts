"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { revalidatePath } from "next/cache";

const getSafeFilename = (name: string) =>
  name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const cleanEnvValue = (value: string | undefined) =>
  value?.trim().replace(/^["']|["']$/g, "");

const uploadToSupabaseStorage = async (file: File, userId: string, buffer: Buffer) => {
  const supabaseUrl = cleanEnvValue(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const bucket = cleanEnvValue(process.env.SUPABASE_STORAGE_BUCKET) ?? "clothing-items";

  if (!supabaseUrl || !serviceRoleKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.");
    }

    return null;
  }

  const filename = `${Date.now()}-${getSafeFilename(file.name)}`;
  const objectPath = `${userId}/${filename}`;
  const uploadUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${bucket}/${objectPath}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "false",
    },
    body: new Blob([new Uint8Array(buffer)], {
      type: file.type || "application/octet-stream",
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    console.error("Supabase Storage upload failed:", message);
    throw new Error(`Storage upload failed. Check that the "${bucket}" bucket exists and your Supabase service role key is set.`);
  }

  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucket}/${objectPath}`;
};

const uploadToLocalPublicFolder = async (file: File, buffer: Buffer) => {
  const filename = `${Date.now()}-${getSafeFilename(file.name)}`;
  const uploadDir = join(process.cwd(), "public", "uploads");
  const path = join(uploadDir, filename);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path, buffer);

  return `/uploads/${filename}`;
};

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

  if (!file.type.startsWith("image/")) {
    return { error: "Please upload an image file." };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "Image must be smaller than 5MB." };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const userId = (session.user as { id: string }).id;

    const imagePath =
      (await uploadToSupabaseStorage(file, userId, buffer)) ??
      (await uploadToLocalPublicFolder(file, buffer));

    // Save to database
    const newItem = await prisma.clothingItem.create({
      data: {
        name,
        category,
        tags,
        imagePath,
        userId,
      },
    });

    revalidatePath("/closet");
    revalidatePath("/dashboard");
    revalidatePath("/studio");
    return { success: true, item: newItem };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to upload item.",
    };
  }
}
