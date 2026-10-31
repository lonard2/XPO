import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma 7 connects through a driver adapter rather than reading the URL from
 * schema.prisma. The empty-string fallback keeps module evaluation safe during
 * `next build`, where no connection is opened; a missing URL surfaces on the
 * first query instead of at import time.
 */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
