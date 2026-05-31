import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const rawConnectionString =
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL;

if (!rawConnectionString) {
  throw new Error("Missing database connection URL. Set DATABASE_URL or POSTGRES_PRISMA_URL.");
}

const getConnectionString = (url: string) => {
  const parsed = new URL(url);
  if (parsed.searchParams.get("sslmode") === "require") {
    parsed.searchParams.set("uselibpqcompat", "true");
  }
  return parsed.toString();
};

const connectionString = getConnectionString(rawConnectionString);

const adapter = new PrismaPg({ connectionString });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["query", "info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
