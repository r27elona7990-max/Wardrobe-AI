import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const latestOutfit = await prisma.outfit.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!latestOutfit) {
    return Response.json({
      title: "Wardrobe AI",
      body: "No saved outfit yet. Generate or save a fit to get daily wear suggestions.",
    });
  }

  const itemIds = latestOutfit.itemIds.split(",").filter(Boolean);
  const items = await prisma.clothingItem.findMany({
    where: {
      id: { in: itemIds },
      userId,
    },
    select: {
      name: true,
      category: true,
    },
  });

  const categoryOrder = ["Tops", "Outerwear", "Bottoms", "Shoes", "Accessories"];
  const itemNames = items
    .sort((a, b) => {
      const indexA = categoryOrder.indexOf(a.category);
      const indexB = categoryOrder.indexOf(b.category);

      return (indexA > -1 ? indexA : 99) - (indexB > -1 ? indexB : 99);
    })
    .map((item) => item.name)
    .join(", ");

  return Response.json({
    title: `Today's fit: ${latestOutfit.name}`,
    body: itemNames ? `Wear it with ${itemNames}.` : "Your saved outfit is ready for today.",
  });
}
