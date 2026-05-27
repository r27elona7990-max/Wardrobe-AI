import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as { id: string }).id;

  // Retrieve clothing count and outfit count
  const clothingCount = await prisma.clothingItem.count({
    where: { userId },
  });

  const outfitCount = await prisma.outfit.count({
    where: { userId },
  });

  return (
    <ProfileClient 
      initialClothingCount={clothingCount}
      initialOutfitCount={outfitCount}
    />
  );
}
