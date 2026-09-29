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
    include: {
      items: {
        orderBy: { position: "asc" },
        include: {
          clothingItem: {
            select: {
              name: true,
              category: true,
            },
          },
        },
      },
    },
  });

  if (!latestOutfit) {
    return Response.json({
      title: "Wardrobe AI",
      body: "No saved outfit yet. Generate or save a fit to get daily wear suggestions.",
    });
  }

  const itemNames = latestOutfit.items
    .map((item) => item.clothingItem.name)
    .join(", ");

  return Response.json({
    title: `Today's fit: ${latestOutfit.name}`,
    body: itemNames ? `Wear it with ${itemNames}.` : "Your saved outfit is ready for today.",
  });
}
