-- CreateTable
CREATE TABLE "OutfitItem" (
    "outfitId" TEXT NOT NULL,
    "clothingItemId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "OutfitItem_pkey" PRIMARY KEY ("outfitId", "clothingItemId")
);

-- Preserve existing outfit membership and order.
INSERT INTO "OutfitItem" ("outfitId", "clothingItemId", "position")
SELECT
    outfit."id",
    item."clothingItemId",
    (item.ordinality - 1)::INTEGER
FROM "Outfit" AS outfit
CROSS JOIN LATERAL unnest(string_to_array(outfit."itemIds", ',')) WITH ORDINALITY
    AS item("clothingItemId", ordinality)
INNER JOIN "ClothingItem" AS clothing
    ON clothing."id" = item."clothingItemId"
ON CONFLICT DO NOTHING;

-- Remove the denormalized ID list after backfilling.
ALTER TABLE "Outfit" DROP COLUMN "itemIds";

-- AddForeignKey
ALTER TABLE "OutfitItem"
ADD CONSTRAINT "OutfitItem_outfitId_fkey"
FOREIGN KEY ("outfitId") REFERENCES "Outfit"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutfitItem"
ADD CONSTRAINT "OutfitItem_clothingItemId_fkey"
FOREIGN KEY ("clothingItemId") REFERENCES "ClothingItem"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddIndex
CREATE UNIQUE INDEX "OutfitItem_outfitId_position_key"
ON "OutfitItem"("outfitId", "position");

-- AddIndex
CREATE INDEX "OutfitItem_clothingItemId_idx"
ON "OutfitItem"("clothingItemId");

-- AddIndex
CREATE INDEX "ClothingItem_userId_createdAt_idx"
ON "ClothingItem"("userId", "createdAt");

-- AddIndex
CREATE INDEX "Outfit_userId_createdAt_idx"
ON "Outfit"("userId", "createdAt");

-- Replace restrictive user relations with cascading cleanup.
ALTER TABLE "ClothingItem"
DROP CONSTRAINT "ClothingItem_userId_fkey",
ADD CONSTRAINT "ClothingItem_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Outfit"
DROP CONSTRAINT "Outfit_userId_fkey",
ADD CONSTRAINT "Outfit_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
