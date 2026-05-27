import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

try {
  // Dynamically load the adapter to prevent crashing when native LibSql bindings are missing or incompatible
  const { PrismaLibSql } = require("@prisma/adapter-libsql");
  const config = {
    url: process.env.DATABASE_URL || "file:./prisma/dev.db",
  };
  const adapter = new PrismaLibSql(config);
  prismaInstance = new PrismaClient({
    adapter,
    log: ["query", "info", "warn", "error"],
  });
} catch (e) {
  console.warn("[Prisma] Falling back to standard Prisma Client due to LibSql loading error:", e);
  prismaInstance = new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });
}

export const prisma = globalForPrisma.prisma || prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
