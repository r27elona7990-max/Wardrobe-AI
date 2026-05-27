import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import OutfitStudioClient from "./OutfitStudioClient";

export default async function StudioPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = (session.user as { id: string }).id;

  // Retrieve clothing items belonging to the current user
  const items = await prisma.clothingItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return <OutfitStudioClient initialItems={items} />;
}
