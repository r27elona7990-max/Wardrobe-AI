-- AlterTable
ALTER TABLE "ClothingItem" ADD COLUMN     "aesthetics" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "aiMetadata" JSONB,
ADD COLUMN     "colors" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "fits" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "materials" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "seasons" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "styles" TEXT[] DEFAULT ARRAY[]::TEXT[];
