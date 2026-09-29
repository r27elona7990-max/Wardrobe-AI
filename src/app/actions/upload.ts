"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { revalidatePath } from "next/cache";
import {
  analyzeClothingImage,
  ClothingAnalysisSchema,
  type ClothingAnalysis,
} from "@/lib/ai/analyzeClothingImage";
import { clothingCategories } from "@/lib/clothingCategories";
import { validateImageBuffer } from "@/lib/imageValidation";
import { enforceRateLimit } from "@/lib/rateLimit";
import { z } from "zod";

const getSafeFilename = (name: string) =>
  (name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "clothing-item")
    .slice(0, 120);

const clothingItemSchema = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.enum(clothingCategories),
  tags: z.string().trim().max(1_000).default(""),
});

const cleanEnvValue = (value: string | undefined) =>
  value?.trim().replace(/^["']|["']$/g, "");

const mergeTags = (
  currentTags: string,
  generatedTags: string[]
) => {
  const uniqueTags = new Map<string, string>();

  currentTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .forEach((tag) =>
      uniqueTags.set(tag.toLowerCase(), tag)
    );

  generatedTags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .forEach((tag) =>
      uniqueTags.set(tag.toLowerCase(), tag)
    );

  return Array.from(uniqueTags.values()).join(", ");
};

const uploadToSupabaseStorage = async (
  file: File,
  userId: string,
  buffer: Buffer,
  mimeType: string
) => {
  const supabaseUrl = cleanEnvValue(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const bucket = cleanEnvValue(process.env.SUPABASE_STORAGE_BUCKET) ?? "clothing-items";

  if (!supabaseUrl || !serviceRoleKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.");
    }

    return null;
  }

  const filename = `${Date.now()}-${crypto.randomUUID()}-${getSafeFilename(file.name)}`;
  const objectPath = `${userId}/${filename}`;
  const uploadUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${bucket}/${objectPath}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": mimeType,
      "x-upsert": "false",
    },
    body: new Blob([new Uint8Array(buffer)], {
      type: mimeType,
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
  const filename = `${Date.now()}-${crypto.randomUUID()}-${getSafeFilename(file.name)}`;
  const uploadDir = join(process.cwd(), "public", "uploads");
  const path = join(uploadDir, filename);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path, buffer);

  return `/uploads/${filename}`;
};

const removeStoredImage = async (imagePath: string) => {
  const supabaseUrl = cleanEnvValue(
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  )?.replace(/\/$/, "");
  const serviceRoleKey = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const bucket = cleanEnvValue(process.env.SUPABASE_STORAGE_BUCKET) ?? "clothing-items";
  const publicPrefix = supabaseUrl
    ? `${supabaseUrl}/storage/v1/object/public/${bucket}/`
    : "";

  if (
    supabaseUrl &&
    serviceRoleKey &&
    publicPrefix &&
    imagePath.startsWith(publicPrefix)
  ) {
    const objectPath = imagePath.slice(publicPrefix.length);
    await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`, {
      method: "DELETE",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });
    return;
  }

  if (imagePath.startsWith("/uploads/")) {
    const localPath = join(process.cwd(), "public", imagePath.slice(1));
    await unlink(localPath).catch(() => undefined);
  }
};

type AnalyzeClothingResult =
  | {
      success: true;
      analysis: ClothingAnalysis;
      error?: never;
    }
  | {
      success?: never;
      analysis?: never;
      error: string;
    };

export async function analyzeClothingUpload(
  formData: FormData
): Promise<AnalyzeClothingResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: "You must be logged in to analyze items." };
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { error: "Please select an image." };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const validation = validateImageBuffer(buffer, file.type, file.size);

    if (!validation.valid) {
      return { error: validation.error };
    }

    const userId = (session.user as { id: string }).id;
    const rateLimit = await enforceRateLimit("analyze-clothing", userId, {
      limit: 15,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return { error: "AI analysis limit reached. Please try again later." };
    }

    const analysis = await analyzeClothingImage(buffer, validation.type);

    return {
      success: true,
      analysis,
    };
  } catch (error) {
    console.error("AI clothing preview failed:", error);

    return {
      error: "The image could not be analyzed. You can still enter tags manually.",
    };
  }
}

export async function uploadClothingItem(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return { error: "You must be logged in to upload items." };
  }

  const parsedItem = clothingItemSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    tags: formData.get("tags") ?? "",
  });
  const aiAnalysisJson = formData.get("aiAnalysis");
  const file = formData.get("file");

  let submittedAnalysis: ClothingAnalysis | null = null;

  if (typeof aiAnalysisJson === "string" && aiAnalysisJson) {
    try {
      const parsedAnalysis = ClothingAnalysisSchema.safeParse(
        JSON.parse(aiAnalysisJson)
      );
      submittedAnalysis = parsedAnalysis.success ? parsedAnalysis.data : null;
    } catch {
      submittedAnalysis = null;
    }
  }

  if (!parsedItem.success || !(file instanceof File)) {
    return { error: "Enter a valid name, category, tags, and image." };
  }

  const { name, category, tags } = parsedItem.data;
  let imagePath: string | null = null;

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const validation = validateImageBuffer(buffer, file.type, file.size);

    if (!validation.valid) {
      return { error: validation.error };
    }

    const userId = (session.user as { id: string }).id;
    const rateLimit = await enforceRateLimit("upload-clothing", userId, {
      limit: 30,
      windowMs: 60 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return { error: "Upload limit reached. Please try again later." };
    }

    let finalTags = tags;
    let finalAnalysis = submittedAnalysis;

    if (!finalAnalysis) {
      try {
        finalAnalysis = await analyzeClothingImage(
          buffer,
          validation.type
        );
      } catch (analysisError) {
        console.error(
          "AI clothing analysis failed:",
          analysisError
        );
      }
    }

    if (finalAnalysis) {
      const generatedTags = [
        ...finalAnalysis.colors,
        ...finalAnalysis.styles,
        ...finalAnalysis.fits,
        ...finalAnalysis.aesthetics,
        ...finalAnalysis.seasons,
        ...finalAnalysis.materials,
      ];

      finalTags = mergeTags(tags, generatedTags);
    }

    imagePath =
      (await uploadToSupabaseStorage(file, userId, buffer, validation.type)) ??
      (await uploadToLocalPublicFolder(file, buffer));

    // Save to database
    const newItem = await prisma.clothingItem.create({
      data: {
        name,
        category,
        tags: finalTags,
        colors: finalAnalysis?.colors ?? [],
        styles: finalAnalysis?.styles ?? [],
        fits: finalAnalysis?.fits ?? [],
        aesthetics: finalAnalysis?.aesthetics ?? [],
        seasons: finalAnalysis?.seasons ?? [],
        materials: finalAnalysis?.materials ?? [],
        aiMetadata: finalAnalysis ?? undefined,
        imagePath,
        userId,
      },
    });

    revalidatePath("/closet");
    revalidatePath("/dashboard");
    revalidatePath("/studio");
    return { success: true, itemId: newItem.id };
  } catch (error) {
    if (imagePath) {
      await removeStoredImage(imagePath).catch((cleanupError) => {
        console.error("Failed to clean up an incomplete upload:", cleanupError);
      });
    }

    console.error("Upload error:", error);
    return {
      error: "Failed to upload item. Please try again.",
    };
  }
}
